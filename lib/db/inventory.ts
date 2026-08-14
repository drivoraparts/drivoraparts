import { products } from "@/lib/inventory/products";
import { EMPTY_INVENTORY_STATS } from "@/lib/admin/fallbacks";
import { guardedSupabaseRead } from "@/lib/db/read-guard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type InventoryRecord = {
  product_id: number;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string;
};

export type InventoryAlert = {
  productId: number;
  productName: string;
  quantity: number;
  threshold: number;
  severity: "low" | "out";
};

const DEFAULT_THRESHOLD = 3;

function getCatalogStock(productId: number): number {
  const product = products.find((p) => p.id === productId);
  if (!product || product.stock === false) return 0;
  return product.stockQty ?? 10;
}

function catalogStockRow(product: (typeof products)[number]) {
  return {
    product_id: product.id,
    quantity: product.stockQty ?? (product.stock === false ? 0 : 10),
    low_stock_threshold: DEFAULT_THRESHOLD,
  };
}

export async function seedInventoryIfEmpty(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("inventory")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  if ((count ?? 0) > 0) return;

  const rows = products.map(catalogStockRow);
  const { error: insertError } = await supabase
    .from("inventory")
    .upsert(rows, { onConflict: "product_id", ignoreDuplicates: true });
  if (insertError) throw insertError;
}

/** Backfill SKUs added to the catalog after the initial inventory seed. */
export async function syncMissingInventoryFromCatalog(): Promise<void> {
  await seedInventoryIfEmpty();

  const supabase = getSupabaseAdmin();
  const { data: existing, error } = await supabase
    .from("inventory")
    .select("product_id");

  if (error) throw error;

  const existingIds = new Set((existing ?? []).map((row) => row.product_id));
  const missing = products.filter((product) => !existingIds.has(product.id));
  if (!missing.length) return;

  const { error: insertError } = await supabase
    .from("inventory")
    .upsert(missing.map(catalogStockRow), {
      onConflict: "product_id",
      ignoreDuplicates: true,
    });

  if (insertError) throw insertError;
}

export async function getInventory(productId: number): Promise<number> {
  try {
    await syncMissingInventoryFromCatalog();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("inventory")
      .select("quantity")
      .eq("product_id", productId)
      .maybeSingle();

    if (error) throw error;
    if (data == null) return getCatalogStock(productId);
    return data.quantity;
  } catch (error) {
    console.error("[getInventory]", error);
    return getCatalogStock(productId);
  }
}

export async function hasInventory(
  productId: number,
  quantity = 1
): Promise<boolean> {
  const available = await getInventory(productId);
  return available >= quantity;
}

const MAX_CAS_ATTEMPTS = 5;

/**
 * Read-modify-write with a compare-and-swap guard: the update only takes
 * effect if `quantity` still matches what we just read, so two concurrent
 * orders touching the same product can't silently lose one of their
 * updates. Retries a few times on contention rather than failing outright.
 */
async function compareAndSwapQuantity(
  productId: number,
  computeNext: (available: number) => number | null
): Promise<number | null> {
  const supabase = getSupabaseAdmin();

  for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += 1) {
    const { data: current, error: readError } = await supabase
      .from("inventory")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

    if (readError) throw readError;

    const available = current?.quantity ?? getCatalogStock(productId);
    const next = computeNext(available);
    if (next === null) return null;

    const { data: updated, error: updateError } = await supabase
      .from("inventory")
      .update({ quantity: next, updated_at: new Date().toISOString() })
      .eq("product_id", productId)
      .eq("quantity", available)
      .select("product_id");

    if (updateError) throw updateError;
    if (updated && updated.length > 0) return next;
    // Row changed between our read and write (concurrent order) — retry.
  }

  throw new Error(
    `Too much concurrent contention updating inventory for product ${productId}`
  );
}

export async function reduceInventory(
  productId: number,
  quantity: number
): Promise<boolean> {
  await syncMissingInventoryFromCatalog();

  const result = await compareAndSwapQuantity(productId, (available) =>
    available < quantity ? null : available - quantity
  );

  return result !== null;
}

export async function restoreInventory(
  productId: number,
  quantity: number
): Promise<void> {
  await syncMissingInventoryFromCatalog();

  await compareAndSwapQuantity(productId, (available) => available + quantity);
}

export async function setInventory(
  productId: number,
  quantity: number,
  lowStockThreshold?: number
): Promise<void> {
  await seedInventoryIfEmpty();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("inventory").upsert(
    {
      product_id: productId,
      quantity: Math.max(0, quantity),
      low_stock_threshold: lowStockThreshold ?? DEFAULT_THRESHOLD,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id" }
  );

  if (error) throw error;
}

/** Batch stock lookup — avoids one sync+select round trip per product. */
export async function getInventoryMap(): Promise<Map<number, number>> {
  const map = new Map<number, number>();

  try {
    await syncMissingInventoryFromCatalog();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("inventory")
      .select("product_id, quantity")
      .limit(products.length + 100);

    if (error) throw error;
    for (const row of data ?? []) {
      map.set(row.product_id, row.quantity);
    }
  } catch (error) {
    console.error("[getInventoryMap]", error);
  }

  return map;
}

export async function listInventory(limit = 500): Promise<InventoryRecord[]> {
  return guardedSupabaseRead("listInventory", [], async () => {
    try {
      await seedInventoryIfEmpty();
    } catch (error) {
      console.error("[db:seedInventoryIfEmpty]", error);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("quantity", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as InventoryRecord[];
  });
}

/**
 * Every inventory row, paged past PostgREST's per-request ceiling.
 *
 * Stats and alerts must not be derived from listInventory(): it caps at 500
 * rows ordered by quantity ascending, so totals computed from it described
 * only the 500 emptiest SKUs — "Total SKUs 500" against a table of 1,884, a
 * unit count summing the smallest stock levels in the catalog, and a low-stock
 * figure drawn from a sample selected for being low.
 */
async function fetchAllInventoryRows(): Promise<InventoryRecord[]> {
  const supabase = getSupabaseAdmin();
  const pageSize = 1000;
  const rows: InventoryRecord[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("product_id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const batch = (data ?? []) as InventoryRecord[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
  }

  return rows;
}

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  return guardedSupabaseRead("getInventoryAlerts", [], async () => {
    const inventory = await fetchAllInventoryRows();
    const productMap = new Map(products.map((p) => [p.id, p.name]));
    const alerts: InventoryAlert[] = [];

    for (const row of inventory) {
      const name = productMap.get(row.product_id) ?? `Product #${row.product_id}`;

      if (row.quantity <= 0) {
        alerts.push({
          productId: row.product_id,
          productName: name,
          quantity: row.quantity,
          threshold: row.low_stock_threshold,
          severity: "out",
        });
      } else if (row.quantity <= row.low_stock_threshold) {
        alerts.push({
          productId: row.product_id,
          productName: name,
          quantity: row.quantity,
          threshold: row.low_stock_threshold,
          severity: "low",
        });
      }
    }

    return alerts.sort((a, b) => a.quantity - b.quantity);
  });
}

export async function getInventoryStats() {
  return guardedSupabaseRead("getInventoryStats", EMPTY_INVENTORY_STATS, async () => {
    const inventory = await fetchAllInventoryRows();
    const totalSkus = inventory.length;
    const outOfStock = inventory.filter((row) => row.quantity <= 0).length;
    const lowStock = inventory.filter(
      (row) => row.quantity > 0 && row.quantity <= row.low_stock_threshold
    ).length;
    const totalUnits = inventory.reduce((sum, row) => sum + row.quantity, 0);

    return { totalSkus, outOfStock, lowStock, totalUnits };
  });
}
