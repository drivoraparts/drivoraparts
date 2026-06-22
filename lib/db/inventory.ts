import { products } from "@/lib/inventory/products";
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

export async function seedInventoryIfEmpty(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("inventory")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  if ((count ?? 0) > 0) return;

  const rows = products.map((product) => ({
    product_id: product.id,
    quantity:
      product.stockQty ?? (product.stock === false ? 0 : 10),
    low_stock_threshold: DEFAULT_THRESHOLD,
  }));

  const { error: insertError } = await supabase.from("inventory").insert(rows);
  if (insertError) throw insertError;
}

export async function getInventory(productId: number): Promise<number> {
  await seedInventoryIfEmpty();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("inventory")
    .select("quantity")
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  return data?.quantity ?? 0;
}

export async function hasInventory(
  productId: number,
  quantity = 1
): Promise<boolean> {
  const available = await getInventory(productId);
  return available >= quantity;
}

export async function reduceInventory(
  productId: number,
  quantity: number
): Promise<boolean> {
  await seedInventoryIfEmpty();
  const supabase = getSupabaseAdmin();

  const { data: current, error: readError } = await supabase
    .from("inventory")
    .select("*")
    .eq("product_id", productId)
    .maybeSingle();

  if (readError) throw readError;

  const available = current?.quantity ?? 0;
  if (available < quantity) return false;

  const { error: updateError } = await supabase
    .from("inventory")
    .update({
      quantity: available - quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("product_id", productId);

  if (updateError) throw updateError;
  return true;
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

export async function listInventory(limit = 500): Promise<InventoryRecord[]> {
  await seedInventoryIfEmpty();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("quantity", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as InventoryRecord[];
}

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  const inventory = await listInventory();
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
}

export async function getInventoryStats() {
  const inventory = await listInventory();
  const totalSkus = inventory.length;
  const outOfStock = inventory.filter((row) => row.quantity <= 0).length;
  const lowStock = inventory.filter(
    (row) => row.quantity > 0 && row.quantity <= row.low_stock_threshold
  ).length;
  const totalUnits = inventory.reduce((sum, row) => sum + row.quantity, 0);

  return { totalSkus, outOfStock, lowStock, totalUnits };
}
