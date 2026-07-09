import { getOrderById } from "@/lib/db/orders";
import { findPaymentByOrderId, updatePaymentRecord } from "@/lib/db/payments";
import { reduceInventory, restoreInventory } from "@/lib/db/inventory";
import { logActivity } from "@/lib/monitoring/activity";

type InventoryPaymentMetadata = {
  inventory_deducted?: boolean;
  inventory_restored?: boolean;
};

type RestoreOrderInventoryOptions = {
  /**
   * Some legacy orders may have deducted inventory before metadata flags existed.
   * Callers can opt in when they know the order was previously in a paid/fulfilled state.
   */
  assumeInventoryDeducted?: boolean;
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

export async function restoreOrderInventory(
  orderId: string,
  options: RestoreOrderInventoryOptions = {}
): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order?.items.length) return;

  const payment = await findPaymentByOrderId(orderId);
  const metadata = (payment?.metadata ?? {}) as InventoryPaymentMetadata;

  if (metadata.inventory_restored) {
    return;
  }

  const inventoryWasDeducted =
    metadata.inventory_deducted === true ||
    options.assumeInventoryDeducted === true;

  if (!inventoryWasDeducted) {
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
