import {
  COMPANY_DISPLAY_NAME,
  COMPANY_PHONE_DISPLAY,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/content/company";

/*
 * The post-delivery review request.
 *
 * Deliberately plain: no incentive, no "5 stars helps us", nothing that steers
 * the rating. Every link opens the same form whatever the customer thinks of
 * the part, and the email says so.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildReviewRequestEmail(input: {
  firstName: string;
  orderNumber: string;
  items: { name: string; url: string }[];
  optOutUrl: string;
}): { subject: string; html: string } {
  const many = input.items.length > 1;
  const subject = many
    ? `How did your parts work out? (Order ${input.orderNumber})`
    : `How did your ${input.items[0].name} work out?`;

  const rows = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-top:1px solid #E5E7EB;font-size:15px;color:#17191C;">${escapeHtml(item.name)}</td>
          <td style="padding:14px 0 14px 16px;border-top:1px solid #E5E7EB;text-align:right;white-space:nowrap;">
            <a href="${escapeHtml(item.url)}" style="display:inline-block;background:#17191C;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;padding:10px 16px;border-radius:6px;">Review this part</a>
          </td>
        </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;background:#F5F6F7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F6F7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;">
        <tr><td style="padding:24px 28px 8px;font-size:16px;font-weight:800;letter-spacing:2px;color:#17191C;">DRIVORA<span style="color:#EB0A1E;">PARTS</span></td></tr>
        <tr><td style="padding:8px 28px 0;font-size:15px;line-height:1.6;color:#17191C;">
          <p style="margin:0 0 12px;">Hi ${escapeHtml(input.firstName || "there")},</p>
          <p style="margin:0 0 12px;">Your order ${escapeHtml(input.orderNumber)} was delivered a little while ago. If you've had a chance to fit ${many ? "these parts" : "it"}, would you tell other Toyota owners how it went? Did it fit, what did it take, and was it as described?</p>
          <p style="margin:0 0 4px;color:#69717C;font-size:13px;">Good or bad, every review is published the same way, marked as from a verified buyer. We don't offer anything in exchange for reviews.</p>
        </td></tr>
        <tr><td style="padding:8px 28px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
        <tr><td style="padding:8px 28px 24px;font-size:13px;line-height:1.6;color:#69717C;">
          Each link is for you only and works once. Questions about the part? Reply to this email or call ${escapeHtml(COMPANY_PHONE_DISPLAY)}.
        </td></tr>
      </table>
      <p style="max-width:560px;margin:14px auto 0;font-size:11px;line-height:1.5;color:#69717C;">
        ${escapeHtml(COMPANY_DISPLAY_NAME)} · ${escapeHtml(COMPANY_SUPPORT_EMAIL)} · You're receiving this because you bought from us.
        <a href="${escapeHtml(input.optOutUrl)}" style="color:#69717C;">Don't ask me for reviews</a>.
      </p>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}
