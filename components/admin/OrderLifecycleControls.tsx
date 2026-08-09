"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminUi } from "./admin-ui";
import StatusPill, { SpinnerIcon } from "./StatusPill";
import {
  SHIPPING_HOLD_REASON_LABELS,
  type OrderLifecycleStatus,
  type ShippingHoldReason,
  type ShippingInfoInput,
  type ShippingStatus,
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

/** Converts a `datetime-local` input value (parsed as the browser's local
 * time) to an ISO string for the API, or undefined when left blank. */
function toIso(occurredAt: string): string | undefined {
  if (!occurredAt) return undefined;
  const parsed = new Date(occurredAt);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

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
  onSave: (value: string, note: string, occurredAt: string) => Promise<void>;
  extra?: React.ReactNode;
}) {
  const [value, setValue] = useState(currentValue);
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      await onSave(value, note, occurredAt);
      setMessage("Saved");
      setNote("");
      setOccurredAt("");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{title}</p>
        <StatusPill value={currentValue} label={labels[currentValue]?.toLowerCase()} size="xs" />
      </div>
      <select
        value={value}
        disabled={loading}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-900"
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
        rows={1}
        className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs"
      />
      <label className="mt-1.5 block text-[10px] text-zinc-500">
        Backdate (optional — leave blank to use now)
        <input
          type="datetime-local"
          value={occurredAt}
          disabled={loading}
          max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
          onChange={(e) => setOccurredAt(e.target.value)}
          className="mt-0.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs"
        />
      </label>
      {extra}
      <button
        type="button"
        onClick={handleSave}
        disabled={loading || value === currentValue}
        className={`${adminUi.buttonPrimary} mt-2 w-full !py-1.5 text-xs`}
      >
        {loading ? "Saving…" : "Save"}
      </button>
      {message ? (
        <p className={`mt-1.5 text-xs ${error ? "text-red-600" : "text-emerald-700"}`}>{message}</p>
      ) : null}
    </div>
  );
}

function ShipmentHoldControl({
  orderId,
  active,
  reason,
  note,
  updatedAt,
  onChange,
}: {
  orderId: string;
  active: boolean;
  reason: ShippingHoldReason | null;
  note: string | null;
  updatedAt: string | null;
  onChange: () => void;
}) {
  const [holdReason, setHoldReason] = useState<ShippingHoldReason>(reason ?? "customs_clearance");
  const [customerNote, setCustomerNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [resumeNote, setResumeNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const startHold = async () => {
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      await patchLifecycle(orderId, {
        target: "shipping_hold_start",
        holdReason,
        customerNote,
        note: internalNote,
      });
      setMessage("Shipment placed on hold");
      onChange();
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const resumeHold = async () => {
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      await patchLifecycle(orderId, { target: "shipping_hold_resume", note: resumeNote });
      setMessage("Shipment resumed");
      onChange();
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">Shipment Hold</p>
        {active ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
            <SpinnerIcon />
            On Hold
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            Not on hold
          </span>
        )}
      </div>

      {active ? (
        <>
          <p className="mt-2 text-xs text-zinc-600">
            Reason: <span className="font-medium text-zinc-900">{reason ? SHIPPING_HOLD_REASON_LABELS[reason] : "—"}</span>
          </p>
          {note && <p className="mt-1 text-xs text-zinc-600">Customer sees: “{note}”</p>}
          {updatedAt && (
            <p className="mt-1 text-[11px] text-zinc-400">Last updated {new Date(updatedAt).toLocaleString()}</p>
          )}
          <textarea
            value={resumeNote}
            disabled={loading}
            onChange={(e) => setResumeNote(e.target.value)}
            placeholder="Optional resume note (internal)"
            rows={1}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={resumeHold}
            disabled={loading}
            className={`${adminUi.buttonPrimary} mt-2 w-full !bg-emerald-600 !py-1.5 text-xs hover:!bg-emerald-500`}
          >
            {loading ? "Saving…" : "Resume Shipment"}
          </button>
        </>
      ) : (
        <>
          <select
            value={holdReason}
            disabled={loading}
            onChange={(e) => setHoldReason(e.target.value as ShippingHoldReason)}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
          >
            {Object.entries(SHIPPING_HOLD_REASON_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <textarea
            value={customerNote}
            disabled={loading}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Clearance information (visible to customer)"
            rows={2}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs"
          />
          <textarea
            value={internalNote}
            disabled={loading}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="Internal note (admin only)"
            rows={1}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={startHold}
            disabled={loading}
            className={`${adminUi.buttonPrimary} mt-2 w-full !bg-amber-600 !py-1.5 text-xs hover:!bg-amber-500`}
          >
            {loading ? "Saving…" : "Hold Shipment"}
          </button>
        </>
      )}
      {message ? (
        <p className={`mt-1.5 text-xs ${error ? "text-red-600" : "text-emerald-700"}`}>{message}</p>
      ) : null}
    </div>
  );
}

export default function OrderLifecycleControls({
  orderId,
  paymentStatus,
  orderStatus,
  shippingStatus,
  customerMessage,
  shippingInfo,
  shippingHold,
}: {
  orderId: string;
  paymentStatus: PaymentStatus | null;
  orderStatus: OrderLifecycleStatus;
  shippingStatus: ShippingStatus;
  customerMessage: string | null;
  shippingInfo: {
    carrier: string | null;
    trackingNumber: string | null;
    shipmentOrigin: string | null;
    shipmentDestination: string | null;
    shipmentReference: string | null;
    shipmentNotes: string | null;
    shipmentType: string | null;
    currentLocation: string | null;
    estimatedDeliveryStart: string | null;
    estimatedDeliveryEnd: string | null;
  };
  shippingHold: {
    active: boolean;
    reason: ShippingHoldReason | null;
    note: string | null;
    updatedAt: string | null;
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
    shipmentType: shippingInfo.shipmentType ?? "",
    currentLocation: shippingInfo.currentLocation ?? "",
    estimatedDeliveryStart: shippingInfo.estimatedDeliveryStart ?? "",
    estimatedDeliveryEnd: shippingInfo.estimatedDeliveryEnd ?? "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState(false);

  const [messageDraft, setMessageDraft] = useState(customerMessage ?? "");
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageStatus, setMessageStatus] = useState("");
  const [messageError, setMessageError] = useState(false);

  const saveCustomerMessage = async () => {
    setMessageLoading(true);
    setMessageStatus("");
    setMessageError(false);
    try {
      await patchLifecycle(orderId, { target: "customer_message", value: messageDraft });
      setMessageStatus("Saved");
      router.refresh();
    } catch (err) {
      setMessageError(true);
      setMessageStatus(err instanceof Error ? err.message : "Update failed");
    } finally {
      setMessageLoading(false);
    }
  };

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
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatusCard
          title="Payment Status"
          currentValue={paymentStatus ?? "pending"}
          labels={PAYMENT_STATUS_LABELS}
          onSave={async (value, note, occurredAt) => {
            await patchLifecycle(orderId, {
              target: "payment_status",
              value,
              note,
              occurredAt: toIso(occurredAt),
            });
            router.refresh();
          }}
        />
        <StatusCard
          title="Order Status"
          currentValue={orderStatus}
          labels={ORDER_STATUS_LABELS}
          onSave={async (value, note, occurredAt) => {
            await patchLifecycle(orderId, {
              target: "order_status",
              value,
              note,
              occurredAt: toIso(occurredAt),
            });
            router.refresh();
          }}
        />
        <StatusCard
          title="Shipping Status"
          currentValue={shippingStatus}
          labels={SHIPPING_STATUS_LABELS}
          onSave={async (value, note, occurredAt) => {
            await patchLifecycle(orderId, {
              target: "shipping_status",
              value,
              note,
              occurredAt: toIso(occurredAt),
              notifyCustomer: notify && NOTIFIABLE_SHIPPING_STATUSES.includes(value as ShippingStatus),
            });
            router.refresh();
          }}
          extra={
            <label className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-600">
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

      <ShipmentHoldControl
        orderId={orderId}
        active={shippingHold.active}
        reason={shippingHold.reason}
        note={shippingHold.note}
        updatedAt={shippingHold.updatedAt}
        onChange={() => router.refresh()}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Customer Message</p>
          <p className="mt-1 text-xs text-zinc-500">
            Shown on the Track Order page, separate from the status timeline. Leave blank to hide it.
          </p>
          <textarea
            value={messageDraft}
            disabled={messageLoading}
            onChange={(e) => setMessageDraft(e.target.value)}
            placeholder="e.g. Your order is currently in transit and expected to arrive soon."
            rows={2}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={saveCustomerMessage}
            disabled={messageLoading}
            className={`${adminUi.buttonPrimary} mt-2 !py-1.5 text-xs`}
          >
            {messageLoading ? "Saving…" : "Save customer message"}
          </button>
          {messageStatus ? (
            <p className={`mt-1.5 text-xs ${messageError ? "text-red-600" : "text-emerald-700"}`}>{messageStatus}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Shipping Information</p>
          <p className="mt-1 text-xs text-zinc-500">
            Manual entry — designed so these fields can later be populated automatically through a carrier API.
          </p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          <label className="text-xs text-zinc-600">
            Carrier
            <input
              value={form.carrier ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
              placeholder="e.g. DHL, FedEx, UPS"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Tracking number
            <input
              value={form.trackingNumber ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Origin
            <input
              value={form.shipmentOrigin ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentOrigin: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Destination
            <input
              value={form.shipmentDestination ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentDestination: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Reference number
            <input
              value={form.shipmentReference ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentReference: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Shipment type
            <input
              value={form.shipmentType ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentType: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
              placeholder="e.g. Standard Parcel, LTL Freight"
            />
          </label>
          <label className="text-xs text-zinc-600 sm:col-span-2">
            Current location
            <input
              value={form.currentLocation ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, currentLocation: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
              placeholder="e.g. Los Angeles, CA — manually set, not live GPS"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Estimated delivery start
            <input
              type="date"
              value={form.estimatedDeliveryStart ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDeliveryStart: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600">
            Estimated delivery end
            <input
              type="date"
              value={form.estimatedDeliveryEnd ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, estimatedDeliveryEnd: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-zinc-600 sm:col-span-2">
            Internal shipment notes (never shown to customer)
            <textarea
              value={form.shipmentNotes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shipmentNotes: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm"
            />
          </label>
          </div>
          <button
            type="button"
            onClick={saveShippingInfo}
            disabled={formLoading}
            className={`${adminUi.buttonPrimary} mt-3 !py-1.5 text-xs`}
          >
            {formLoading ? "Saving…" : "Save shipping information"}
          </button>
          {formMessage ? (
            <p className={`mt-1.5 text-xs ${formError ? "text-red-600" : "text-emerald-700"}`}>{formMessage}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
