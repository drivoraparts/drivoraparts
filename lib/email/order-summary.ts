/* =========================================================
   EMAIL ORDER SUMMARY — shared, email-safe HTML builder
   ---------------------------------------------------------
   The single source of order-presentation markup for every
   order-related email (customer + admin). Mirrors the same
   information hierarchy as the checkout Order Summary
   (components/checkout/OrderTotalsSummary.tsx): line items ->
   subtotal -> discounts -> shipping -> total.

   Table-based, inline-styled, no JS, no external fonts --
   built for Gmail/Apple Mail/Outlook/Yahoo/mobile clients.

   Pricing is never recalculated independently: the discount
   breakdown is derived by re-running the exact same
   calculateCartDiscounts() function checkout itself uses,
   fed with the order's own stored line items -- so the numbers
   cannot drift from what checkout showed. The bottom-line total
   always comes from the order record itself (`order.total`),
   which is what was actually charged.
========================================================= */

import { calculateCartDiscounts } from "@/lib/inventory/discounts";
import { getBrandBySlug, getProductById } from "@/lib/inventory";
import { getSiteUrl } from "@/lib/env";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatOrderRef(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}

export function formatEmailDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

function resolveEmailImageUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const siteUrl = getSiteUrl();
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${siteUrl}${path}`;
}

export type EmailOrderItem = {
  productId: number;
  name: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  category?: string | null;
  brand?: string | null;
  partNumber?: string | null;
  fitment?: string | null;
};

/**
 * Order items are stored on the order record with the pricing-critical
 * fields already snapshotted (name/price/image/category/brand). SKU and
 * fitment aren't part of that snapshot, so this enriches display-only
 * fields from the live catalog by product_id -- never touches price/qty,
 * which stay exactly as charged.
 */
export function enrichOrderItemsForEmail(
  items: {
    product_id: number;
    name: string;
    price: number;
    image: string | null;
    category: string | null;
    brand: string | null;
    quantity: number;
  }[]
): EmailOrderItem[] {
  return items.map((item) => {
    const product = getProductById(item.product_id);
    // `brand` is stored as a slug (e.g. "fuel-off-road") -- resolve to its
    // real display name ("Fuel Off-Road") for the email; fall back to the
    // raw value if it's not a recognized slug (already a display name, etc).
    const brandDisplayName = item.brand
      ? (getBrandBySlug(item.brand)?.name ?? item.brand)
      : null;

    return {
      productId: item.product_id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.price,
      category: item.category,
      brand: brandDisplayName,
      partNumber: product?.partNumber ?? null,
      fitment: product?.fitment ?? null,
    };
  });
}

export type EmailOrderTotals = {
  shipping: number;
  /** Authoritative -- always sourced from the order record, never recomputed. */
  total: number;
};

export type EmailShippingInfo = {
  customerName: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type EmailPaymentInfo = {
  methodLabel: string;
  statusLabel: string;
  statusColor?: string;
  transactionId?: string | null;
};

export type EmailOrderMeta = {
  orderId: string;
  orderDate: string;
  statusLabel: string;
  statusColor?: string;
};

const COLORS = {
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  surfaceMuted: "#f9fafb",
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
};

/** Order Information block -- brand ref, order #, date, status. */
export function renderOrderInfoBlock(meta: EmailOrderMeta): string {
  const orderRef = formatOrderRef(meta.orderId);
  const statusColor = meta.statusColor ?? COLORS.blue;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:${COLORS.surfaceMuted};border:1px solid ${COLORS.border};border-radius:8px;">
      <tr>
        <td style="padding:18px 20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-bottom:4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">Order</td>
              <td align="right" style="padding-bottom:4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">Status</td>
            </tr>
            <tr>
              <td style="font-size:18px;font-weight:700;color:${COLORS.text};font-family:Arial,Helvetica,sans-serif;">#${orderRef}</td>
              <td align="right" style="font-size:14px;font-weight:700;color:${statusColor};font-family:Arial,Helvetica,sans-serif;">${escapeHtml(meta.statusLabel)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:8px;font-size:13px;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">Placed ${escapeHtml(meta.orderDate)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

/** Product line items -- image, name, brand/SKU/fitment, qty, unit price, line total. */
export function renderProductRows(items: EmailOrderItem[]): string {
  const rows = items
    .map((item) => {
      const imgUrl = resolveEmailImageUrl(item.image);
      const lineTotal = item.unitPrice * item.quantity;

      const identifiers: string[] = [];
      if (item.brand) identifiers.push(escapeHtml(item.brand));
      if (item.partNumber) identifiers.push(`Part #${escapeHtml(item.partNumber)}`);
      const identifierLine = identifiers.length
        ? `<p style="margin:2px 0 0;font-size:12px;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">${identifiers.join(" · ")}</p>`
        : "";
      const fitmentLine = item.fitment
        ? `<p style="margin:2px 0 0;font-size:12px;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">Fits: ${escapeHtml(item.fitment)}</p>`
        : "";

      const imageCell = imgUrl
        ? `<img src="${imgUrl}" width="64" height="64" alt="${escapeHtml(item.name)}" style="display:block;width:64px;height:64px;border-radius:6px;border:1px solid ${COLORS.border};object-fit:cover;" />`
        : `<div style="width:64px;height:64px;border-radius:6px;border:1px solid ${COLORS.border};background:${COLORS.surfaceMuted};"></div>`;

      return `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid ${COLORS.border};width:64px;vertical-align:top;">
              ${imageCell}
            </td>
            <td style="padding:14px 0 14px 14px;border-bottom:1px solid ${COLORS.border};vertical-align:top;">
              <p style="margin:0;font-size:14px;font-weight:600;color:${COLORS.text};font-family:Arial,Helvetica,sans-serif;">${escapeHtml(item.name)}</p>
              ${identifierLine}
              ${fitmentLine}
              <p style="margin:6px 0 0;font-size:12px;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">Qty ${item.quantity} × ${money(item.unitPrice)}</p>
            </td>
            <td align="right" style="padding:14px 0;border-bottom:1px solid ${COLORS.border};vertical-align:top;font-size:14px;font-weight:700;color:${COLORS.text};font-family:Arial,Helvetica,sans-serif;white-space:nowrap;">
              ${money(lineTotal)}
            </td>
          </tr>`;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 4px;">
      ${rows}
    </table>`;
}

/** Subtotal / discounts / shipping / total -- same order and labels as OrderTotalsSummary.tsx. */
export function renderPricingSummary(items: EmailOrderItem[], totals: EmailOrderTotals): string {
  const breakdown = calculateCartDiscounts(
    items.map((item) => ({
      id: item.productId,
      price: item.unitPrice,
      quantity: item.quantity,
      category: item.category ?? undefined,
    })),
    totals.shipping
  );

  const rows: string[] = [
    row("Subtotal", money(breakdown.grossSubtotal), COLORS.text),
  ];

  if (breakdown.bulkDiscount > 0) {
    rows.push(row("Bulk discount (20%)", `−${money(breakdown.bulkDiscount)}`, COLORS.green));
  }
  if (breakdown.orderDiscount > 0) {
    rows.push(row("Order discount (5%)", `−${money(breakdown.orderDiscount)}`, "#b45309"));
  }
  if (breakdown.couponDiscount > 0) {
    rows.push(row(breakdown.couponLabel ?? "Coupon", `−${money(breakdown.couponDiscount)}`, COLORS.green));
  }

  rows.push(row("Shipping", totals.shipping === 0 ? "Free" : money(totals.shipping), COLORS.text));

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0 0;">
      ${rows.join("")}
      <tr>
        <td style="padding-top:14px;border-top:2px solid ${COLORS.text};font-size:16px;font-weight:700;color:${COLORS.text};font-family:Arial,Helvetica,sans-serif;">Total</td>
        <td align="right" style="padding-top:14px;border-top:2px solid ${COLORS.text};font-size:16px;font-weight:700;color:${COLORS.text};font-family:Arial,Helvetica,sans-serif;">${money(totals.total)} USD</td>
      </tr>
    </table>`;

  function row(label: string, value: string, color: string): string {
    return `
      <tr>
        <td style="padding:5px 0;font-size:13px;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">${escapeHtml(label)}</td>
        <td align="right" style="padding:5px 0;font-size:13px;color:${color};font-family:Arial,Helvetica,sans-serif;">${value}</td>
      </tr>`;
  }
}

/** Shipping Address block. */
export function renderShippingSection(shipping: EmailShippingInfo): string {
  const lines = [
    escapeHtml(shipping.customerName),
    shipping.address ? escapeHtml(shipping.address).replace(/\n/g, "<br/>") : null,
  ].filter(Boolean);

  const contactLines = [
    shipping.email ? `Email: ${escapeHtml(shipping.email)}` : null,
    shipping.phone ? `Phone: ${escapeHtml(shipping.phone)}` : null,
  ].filter(Boolean);

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 0;">
      <tr><td style="padding-bottom:6px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">Shipping Address</td></tr>
      <tr><td style="font-size:13px;line-height:1.6;color:${COLORS.text};font-family:Arial,Helvetica,sans-serif;">${lines.join("<br/>")}</td></tr>
      ${
        contactLines.length
          ? `<tr><td style="padding-top:6px;font-size:12px;line-height:1.6;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">${contactLines.join("<br/>")}</td></tr>`
          : ""
      }
    </table>`;
}

/** Payment method + status + transaction ID (copy-friendly monospace block). */
export function renderPaymentSection(payment: EmailPaymentInfo): string {
  const statusColor = payment.statusColor ?? COLORS.muted;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0 0;">
      <tr><td style="padding-bottom:6px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">Payment</td></tr>
      <tr>
        <td style="font-size:13px;line-height:1.6;color:${COLORS.text};font-family:Arial,Helvetica,sans-serif;">
          ${escapeHtml(payment.methodLabel)} · <span style="color:${statusColor};font-weight:600;">${escapeHtml(payment.statusLabel)}</span>
        </td>
      </tr>
      ${
        payment.transactionId
          ? `<tr><td style="padding-top:6px;font-size:12px;color:${COLORS.muted};font-family:Arial,Helvetica,sans-serif;">Transaction ID</td></tr>
             <tr><td style="padding-top:2px;font-size:12px;color:${COLORS.text};font-family:'Courier New',Courier,monospace;background:${COLORS.surfaceMuted};border:1px solid ${COLORS.border};border-radius:4px;padding:8px 10px;">${escapeHtml(payment.transactionId)}</td></tr>`
          : ""
      }
    </table>`;
}

/** The full order summary -- everything above, assembled in one block. */
export function renderOrderSummary(input: {
  meta: EmailOrderMeta;
  items: EmailOrderItem[];
  totals: EmailOrderTotals;
  shipping?: EmailShippingInfo;
  payment?: EmailPaymentInfo;
}): string {
  return `
    ${renderOrderInfoBlock(input.meta)}
    ${renderProductRows(input.items)}
    ${renderPricingSummary(input.items, input.totals)}
    ${input.shipping ? renderShippingSection(input.shipping) : ""}
    ${input.payment ? renderPaymentSection(input.payment) : ""}
  `;
}
