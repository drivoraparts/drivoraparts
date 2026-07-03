type SealKind = "ssl" | "payments" | "company" | "freight" | "inventory";

export function TrustSealGraphic({
  kind,
  className = "",
}: {
  kind: SealKind;
  className?: string;
}) {
  switch (kind) {
    case "ssl":
      return (
        <svg
          viewBox="0 0 64 64"
          className={className}
          aria-hidden
          fill="none"
        >
          <circle cx="32" cy="32" r="31" fill="#ecfdf5" stroke="#059669" strokeWidth="2" />
          <path
            d="M32 14l14 5.5v8.2c0 8.2-5.8 14.5-14 16.3-8.2-1.8-14-8.1-14-16.3v-8.2L32 14z"
            fill="#059669"
          />
          <path
            d="M24 32l5 5 11-12"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="32"
            y="54"
            textAnchor="middle"
            fill="#065f46"
            fontSize="7"
            fontWeight="700"
            fontFamily="Arial, sans-serif"
          >
            256-BIT SSL
          </text>
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
          <rect x="1" y="1" width="62" height="62" rx="14" fill="#111827" stroke="#374151" strokeWidth="2" />
          <circle cx="22" cy="32" r="8" fill="#f7931a" />
          <text x="22" y="35" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800" fontFamily="Arial">₿</text>
          <circle cx="42" cy="32" r="8" fill="#627eea" />
          <text x="42" y="35" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800" fontFamily="Arial">Ξ</text>
          <text x="32" y="52" textAnchor="middle" fill="#e5e7eb" fontSize="6.5" fontWeight="700" fontFamily="Arial">CRYPTO CHECKOUT</text>
        </svg>
      );
    case "company":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
          <circle cx="32" cy="32" r="31" fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
          <rect x="18" y="22" width="28" height="22" rx="2" fill="#2563eb" />
          <rect x="22" y="26" width="5" height="5" fill="#bfdbfe" />
          <rect x="29" y="26" width="5" height="5" fill="#bfdbfe" />
          <rect x="36" y="26" width="5" height="5" fill="#bfdbfe" />
          <rect x="29" y="35" width="8" height="9" fill="#93c5fd" />
          <text x="32" y="54" textAnchor="middle" fill="#1e40af" fontSize="6.5" fontWeight="700" fontFamily="Arial">US REGISTERED</text>
        </svg>
      );
    case "freight":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
          <circle cx="32" cy="32" r="31" fill="#fff7ed" stroke="#ea580c" strokeWidth="2" />
          <path d="M12 34h24v8H12v-8zM36 36h8l6 6v4H36v-10z" fill="#ea580c" />
          <circle cx="20" cy="44" r="3.5" fill="#fff" stroke="#9a3412" strokeWidth="2" />
          <circle cx="44" cy="44" r="3.5" fill="#fff" stroke="#9a3412" strokeWidth="2" />
          <text x="32" y="56" textAnchor="middle" fill="#9a3412" fontSize="6.5" fontWeight="700" fontFamily="Arial">LTL FREIGHT</text>
        </svg>
      );
    case "inventory":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
          <circle cx="32" cy="32" r="31" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
          <rect x="16" y="18" width="32" height="24" rx="3" fill="#fff" stroke="#dc2626" strokeWidth="2" />
          <circle cx="24" cy="28" r="4" fill="#fecaca" />
          <path d="M30 36h14M30 32h10" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 22l4 4-8 8-5-5 4-4 5 5z" fill="#dc2626" />
          <text x="32" y="54" textAnchor="middle" fill="#991b1b" fontSize="6.5" fontWeight="700" fontFamily="Arial">REAL PHOTOS</text>
        </svg>
      );
  }
}

export default TrustSealGraphic;
