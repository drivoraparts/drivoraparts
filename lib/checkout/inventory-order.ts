import { getOrderById } from "@/lib/db/orders";
import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";
import { reduceInventory, restoreInventory } from "@/lib/db/inventory";
import { logActivity } from "@/lib/monitoring/activity";

type InventoryPaymentMetadata = {
  inventory_deducted?: boolean;
  inventory_restored?: boolean;
  /** product_ids actually reduced — restoreOrderInventory must only give
   *  these back, not every item on the order (some may have failed). */
  inventory_committed_product_ids?: number[];
  /** Items that couldn't be reduced (stock ran out) — surfaced on the
   *  order/payment itself so admins reviewing this order see it, instead
   *  of it being buried in a global activity-log stream. */
  oversold_items?: Array<{ productId: number; quantity: number }>;
};

export async function commitOrderInventory(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order?.items.length) return;

  const payment = await findPaymentByOrderId(orderId);
  const metadata = (payment?.metadata ?? {}) as InventoryPaymentMetadata;

  if (metadata.inventory_deducted) {
    return;
  }

  const committedProductIds: number[] = [];
  const oversoldItems: Array<{ productId: number; quantity: number }> = [];

  for (const item of order.items) {
    const committed = await reduceInventory(item.product_id, item.quantity);
    if (committed) {
      committedProductIds.push(item.product_id);
    } else {
      oversoldItems.push({ productId: item.product_id, quantity: item.quantity });
      await logActivity("error", "inventory.oversold", {
        orderId,
        productId: item.product_id,
        quantity: item.quantity,
      });
    }
  }

  if (payment) {
    await updatePaymentRecord(payment.id, {
      metadata: {
        ...metadata,
        inventory_deducted: true,
        inventory_deducted_at: new Date().toISOString(),
        inventory_committed_product_ids: committedProductIds,
        ...(oversoldItems.length > 0 ? { oversold_items: oversoldItems } : {}),
      },
    });
  }
}

export async function restoreOrderInventory(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order?.items.length) return;

  const payment = await findPaymentByOrderId(orderId);
  const metadata = (payment?.metadata ?? {}) as InventoryPaymentMetadata;

  if (metadata.inventory_restored) {
    return;
  }

  // Only ever restore stock that commitOrderInventory actually deducted —
  // order status alone isn't proof of that (a pending/failed/cancelled
  // order that never reached "paid" never had its inventory committed).
  if (metadata.inventory_deducted !== true) {
    return;
  }

  // Restrict to product_ids that were actually reduced — some items may
  // have failed to commit (oversold) and must not be "restored" back in.
  const committedIds = new Set(metadata.inventory_committed_product_ids ?? []);
  const itemsToRestore = metadata.inventory_committed_product_ids
    ? order.items.filter((item) => committedIds.has(item.product_id))
    : order.items; // legacy orders committed before this field existed

  for (const item of itemsToRestore) {
    await restoreInventory(item.product_id, item.quantity);
  }

  if (payment) {
    await updatePaymentRecord(payment.id, {
      metadata: {
        ...metadata,
        inventory_restored: true,
        inventory_restored_at: new Date().toISOString(),
      },
    });
  }

  await logActivity("info", "inventory.restored_for_order", { orderId });
}
