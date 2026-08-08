"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminUi } from "./admin-ui";
import type {
  OrderLifecycleStatus,
  ShippingInfoInput,
  ShippingStatus,
} from "@/lib/db/orders";
import type { PaymentStatus } from "@/lib/db/payments";

const ORDER_STATUS_LABELS: Record<OrderLifecycleStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  on_hold: "On Hold",
  ready_for_shipment: "Ready for Shipment",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  not_shipped: "Not Shipped",
  preparing_shipment: "Preparing Shipment",
  shipped: "Shipped",
  in_transit: "In Transit",
  customs_clearance: "Customs Clearance",
  arrived_at_destination: "Arrived at Destination",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  delivery_exception: "Delivery Exception",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

const NOTIFIABLE_SHIPPING_STATUSES: ShippingStatus[] = ["shipped", "out_for_delivery", "delivered"];

async function patchLifecycle(orderId: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/orders/${orderId}/lifecycle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    throw new Error(data?.error ?? "Update failed");
  }
  return data;
}

function StatusCard({
  title,
  currentValue,
  labels,
  onSave,
  extra,
}: {
  title: string;
  currentValue: string;
  labels: Record<string, string>;
  onSave: (value: string, note: string) => Promise<void>;
  extra?: React.ReactNode;
}) {
  const [value, setValue] = useState(currentValue);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      await onSave(value, note);
      setMessage("Saved");
      setNote("");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={adminUi.cardCompact}>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <select
        value={value}
        disabled={loading}
        onChange={(e) => setValue(e.target.value)}
        className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
      >
        {Object.entries(labels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        disabled={loading}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional internal note"
        rows={2}
        className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs"
      />
      {extra}
      <button
        type="button"
        onClick={handleSave}
        disabled={loading || value === currentValue}
        className={`${adminUi.buttonPrimary} mt-3 w-full !py-2 text-xs`}
      >
        {loading ? "Saving…" : "Save"}
      </button>
      {message ? (
        <p className={`mt-2 text-xs ${error ? "text-red-600" : "text-emerald-700"}`}>{message}</p>
      ) : null}
    </div>
  );
}

export default function OrderLifecycleControls({
  orderId,
  paymentStatus,
  orderStatus,
  shippingStatus,
  shippingInfo,
}: {
  orderId: string;
  paymentStatus: PaymentStatus | null;
  orderStatus: OrderLifecycleStatus;
  shippingStatus: ShippingStatus;
  shippingInfo: {
    carrier: string | null;
    trackingNumber: string | null;
    shipmentOrigin: string | null;
    shipmentDestination: string | null;
    shipmentReference: string | null;
    shipmentNotes: string | null;
    estimatedDeliveryStart: string | null;
    estimatedDeliveryEnd: string | null;
  };
}) {
  const router = useRouter();
  const [notify, setNotify] = useState(true);

  const [form, setForm] = useState<ShippingInfoInput>({
    carrier: shippingInfo.carrier ?? "",
    trackingNumber: shippingInfo.trackingNumber ?? "",
    shipmentOrigin: shippingInfo.shipmentOrigin ?? "",
    shipmentDestination: shippingInfo.shipmentDestination ?? "",
    shipmentReference: shippingInfo.shipmentReference ?? "",
    shipmentNotes: shippingInfo.shipmentNotes ?? "",
    estimatedDeliveryStart: shippingInfo.estimatedDeliveryStart ?? "",
    estimatedDeliveryEnd: shippingInfo.estimatedDeliveryEnd ?? "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState(false);

  const saveShippingInfo = async () => {
    setFormLoading(true);
    setFormMessage("");
    setFormError(false);
    try {
      const cleaned: ShippingInfoInput = Object.fromEntries(
        Object.entries(form).map(([key, val]) => [key, val || null])
      );
      await patchLifecycle(orderId, { target: "shipping_info", shippingInfo: cleaned });
      setFormMessage("Shipping info saved");
      router.refresh();
    } catch (err) {
      setFormError(true);
      setFormMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          title="Payment Status"
          currentValue={paymentStatus ?? "pending"}
          labels={PAYMENT_STATUS_LABELS}
          onSave={async (value, note) => {
            await patchLifecycle(orderId, { target: "payment_status", value, note });
            router.refresh();
          }}
        />
        <StatusCard
          title="Order Status"
          currentValue={orderStatus}
          labels={ORDER_STATUS_LABELS}
          onSave={async (value, note) => {
            await patchLifecycle(orderId, { target: "order_status", value, note });
            router.refresh();
          }}
        />
        <StatusCard
          title="Shipping Status"
          currentValue={shippingStatus}
          labels={SHIPPING_STATUS_LABELS}
          onSave={async (value, note) => {
            await patchLifecycle(orderId, {
              target: "shipping_status",
              value,
              note,
              notifyCustomer: notify && NOTIFIABLE_SHIPPING_STATUSES.includes(value as ShippingStatus),
            });
            router.refresh();
          }}
          extra={
            <label className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              Email customer on Shipped / Out for Delivery / Delivered
            </label>
          }
        />
      </div>

      <div className={adminUi.card}>
        <p className="text-sm font-semibold text-zinc-900">Shipping Information</p>
        <p className="mt-1 text-xs text-zinc-500">
          Manual entry for now — designed so these fields can later be populated automatically through a carrier API.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-zinc-600">
            Carrier
            <input
              value={form.carrier ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              placeholder="e.g. DHL, FedEx, UPS"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Tracking number
            <input
              value={form.trackingNumber ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Origin
            <input
              value={form.shipmentOrigin ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentOrigin: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Destination
            <input
              value={form.shipmentDestination ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentDestination: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Reference number
            <input
              value={form.shipmentReference ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentReference: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Estimated delivery start
            <input
              type="date"
              value={form.estimatedDeliveryStart ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDeliveryStart: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Estimated delivery end
            <input
              type="date"
              value={form.estimatedDeliveryEnd ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDeliveryEnd: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600 sm:col-span-2">
            Internal shipment notes (never shown to customer)
            <textarea
              value={form.shipmentNotes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentNotes: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={saveShippingInfo}
          disabled={formLoading}
          className={`${adminUi.buttonPrimary} mt-4 !py-2 text-xs`}
        >
          {formLoading ? "Saving…" : "Save shipping information"}
        </button>
        {formMessage ? (
          <p className={`mt-2 text-xs ${formError ? "text-red-600" : "text-emerald-700"}`}>{formMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
