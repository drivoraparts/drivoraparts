type SealKind =
  | "ssl"
  | "payments"
  | "company"
  | "freight"
  | "inventory"
  | "shipping"
  | "guarantee";

/**
 * Refined line-icon seals — a plain ring + single-color glyph.
 * No baked-in caption text: the title/detail copy is always rendered
 * alongside these by the caller, so duplicating it here just reads
 * as cheap clip-art rather than a premium mark.
 */
export function TrustSealGraphic({
  kind,
  className = "",
}: {
  kind: SealKind;
  className?: string;
}) {
  // Green stays fixed (matches the "verified/secure" semantic on both light
  // and dark backgrounds). Everything else inherits `color` from the parent
  // via currentColor, since this graphic renders on both dark (HomeTrustBadges,
  // TrustBadgeStrip dark variant) and light (TrustBadgeStrip pro variant) surfaces.
  const ring = kind === "ssl" ? "var(--success)" : "currentColor";
  const iconColor = kind === "ssl" ? "var(--success)" : "currentColor";
  const ringOpacity = kind === "ssl" ? 1 : 0.25;

  const glyph = (() => {
    switch (kind) {
      case "ssl":
        return (
          <>
            <path d="M32 16l12 4.5v7.3c0 7.3-5.1 12.9-12 14.5-6.9-1.6-12-7.2-12-14.5v-7.3L32 16z" />
            <path d="M25.5 32l4.5 4.5 9-9" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case "payments":
        return (
          <>
            <rect x="15" y="21" width="34" height="22" rx="3" />
            <path d="M15 27h34" strokeLinecap="round" />
            <circle cx="22" cy="35.5" r="2.2" fill={iconColor} stroke="none" />
          </>
        );
      case "company":
        return (
          <>
            <rect x="19" y="16" width="26" height="30" rx="1.5" />
            <path d="M25 23h4M35 23h4M25 30h4M35 30h4M25 37h4M35 37h4" strokeLinecap="round" />
          </>
        );
      case "freight":
        return (
          <>
            <rect x="12" y="24" width="24" height="14" rx="1.5" />
            <path d="M36 28h7l6 6v4h-13v-10z" />
            <circle cx="21" cy="42" r="3" />
            <circle cx="43" cy="42" r="3" />
          </>
        );
      case "inventory":
        return (
          <>
            <rect x="15" y="18" width="34" height="26" rx="2" />
            <circle cx="23" cy="27" r="3.2" />
            <path d="M15 39l9-9 6 6 9-11 10 11" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case "shipping":
        return (
          <>
            <rect x="14" y="24" width="36" height="26" rx="1.5" />
            <path d="M14 32h36M32 24v26" strokeLinecap="round" />
            <path d="M22 24l6-8h8l6 8" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case "guarantee":
        return (
          <>
            <circle cx="32" cy="26" r="14" />
            <path d="M25.5 26l4.5 4.5 9-9" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M23 38l-5 12 8-3 4 7 5-13M41 38l5 12-8-3-4 7-5-13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );
    }
  })();

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <circle cx="32" cy="32" r="30" stroke={ring} strokeOpacity={ringOpacity} strokeWidth="1.5" />
      <g stroke={iconColor} strokeWidth="1.8" strokeLinejoin="round">
        {glyph}
      </g>
    </svg>
  );
}

export default TrustSealGraphic;
