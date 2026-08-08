import { getStatusTone, statusBadgeClass } from "./order-status-style";

function SpinnerIcon() {
  return (
    <svg className="h-2.5 w-2.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4L8.5 12l6.8-6.8a1 1 0 0 1 1.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * A status badge that reads like a CI check: spins while the underlying
 * status is a "pending"-type state, and settles into a static checkmark
 * once it resolves to a positive one -- purely driven by the status value
 * itself, no separate "reviewed" tracking.
 */
export default function StatusPill({
  value,
  label,
  size = "sm",
}: {
  value: string;
  label?: string;
  size?: "xs" | "sm";
}) {
  const tone = getStatusTone(value);
  const text = label ?? value.replace(/_/g, " ");
  const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${textSize} font-medium capitalize ${statusBadgeClass(value)}`}
    >
      {tone === "warning" && <SpinnerIcon />}
      {tone === "positive" && <CheckIcon />}
      {text}
    </span>
  );
}
