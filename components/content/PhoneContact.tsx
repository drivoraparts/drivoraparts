import {
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_SMS_HREF,
  COMPANY_PHONE_TEL_HREF,
} from "@/lib/content/company";

/**
 * The DrivoraParts business number, as tappable links: tel: to call, sms: to
 * text. Call or text only -- the number is not registered with WhatsApp, so
 * nothing here may mention it. No hours or response times are stated because
 * none are documented.
 *
 *  - "lines": two short rows, "Phone" and "Text", each number linked.
 *  - "inline": for the end of a sentence -- "call 626… or text".
 */
export default function PhoneContact({
  variant = "lines",
  className = "",
  linkClassName = "text-accent transition-colors hover:text-accent-hover",
}: {
  variant?: "lines" | "inline";
  className?: string;
  linkClassName?: string;
}) {
  if (variant === "inline") {
    return (
      <span className={className}>
        call{" "}
        <a href={COMPANY_PHONE_TEL_HREF} className={linkClassName}>
          {COMPANY_PHONE_DISPLAY}
        </a>{" "}
        or{" "}
        <a href={COMPANY_PHONE_SMS_HREF} className={linkClassName}>
          text us
        </a>
      </span>
    );
  }

  return (
    <span className={`block space-y-0.5 ${className}`.trim()}>
      <span className="block">
        Phone:{" "}
        <a href={COMPANY_PHONE_TEL_HREF} className={`inline-block py-1 ${linkClassName}`}>
          {COMPANY_PHONE_DISPLAY}
        </a>
      </span>
      <span className="block">
        Text:{" "}
        <a href={COMPANY_PHONE_SMS_HREF} className={`inline-block py-1 ${linkClassName}`}>
          {COMPANY_PHONE_DISPLAY}
        </a>
      </span>
    </span>
  );
}
