import { getOrderById } from "@/lib/db/orders";
import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";
import { reduceInventory, restoreInventory } from "@/lib/db/inventory";
import { logActivity } from "@/lib/monitoring/activity";

type InventoryPaymentMetadata = {
  inventory_deducted?: boolean;
  inventory_restored?: boolean;
};

export async function commitOrderInventory(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order?.items.length) return;

  const payment = await findPaymentByOrderId(orderId);
  const metadata = (payment?.metadata ?? {}) as InventoryPaymentMetadata;

  if (metadata.inventory_deducted) {
    return;
  }

  for (const item of order.items) {
    const committed = await reduceInventory(item.product_id, item.quantity);
    if (!committed) {
      await logActivity("warn", "inventory.commit_failed", {
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

  const shouldRestore =
    metadata.inventory_deducted === true ||
    (order.status !== "paid" &&
      order.status !== "shipped" &&
      order.status !== "delivered");

  if (!shouldRestore) {
    return;
  }

  for (const item of order.items) {
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
