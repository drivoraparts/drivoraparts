"use client";

import { useEffect, useState } from "react";

type TrustBadge = {
  id: string;
  label: string;
  subtext: string;
  accent: string;
  accentSoft: string;
  gradient: string;
  Icon: () => JSX.Element;
};

function SecureCheckoutIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="trust-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        fill="url(#trust-blue)"
        d="M12 2l9 4v6c0 5.2-3.6 9.1-9 10-5.4-.9-9-4.8-9-10V6l9-4z"
      />
      <path
        fill="#fff"
        d="M10.2 12.1l1.6 1.6 3.8-3.9 1.2 1.2-5 5.1-2.8-2.8 1.2-1.2z"
      />
    </svg>
  );
}

function EncryptedPaymentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="trust-purple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2.5"
        fill="url(#trust-purple)"
      />
      <path
        fill="url(#trust-purple)"
        d="M8 10V8.5A4 4 0 0116 8.5V10"
        stroke="#c4b5fd"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="15.5" r="1.5" fill="#fff" />
    </svg>
  );
}

function VerifiedSellerIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="trust-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <path
        fill="url(#trust-green)"
        d="M12 2.2l2.2 4.5 5 .7-3.6 3.5.9 5.2L12 13.8 7.5 16.1l.9-5.2-3.6-3.5 5-.7L12 2.2z"
      />
      <path
        fill="#fff"
        d="M10.4 12.3l1.3 1.3 3-3.1 1 1-4 4.1-2.3-2.3 1-1z"
      />
    </svg>
  );
}

function FastShippingIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="trust-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <path fill="url(#trust-orange)" d="M2 8h11v8H2V8z" />
      <path fill="url(#trust-orange)" d="M13 10h4l3 3v3h-7v-6z" />
      <circle cx="7" cy="18" r="2" fill="#fff" />
      <circle cx="17" cy="18" r="2" fill="#fff" />
      <circle cx="7" cy="18" r="1" fill="#ea580c" />
      <circle cx="17" cy="18" r="1" fill="#ea580c" />
    </svg>
  );
}

function BuyerProtectionIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="trust-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        fill="url(#trust-gold)"
        d="M12 2l8 3v6c0 4.8-3.4 8.4-8 9.5-4.6-1.1-8-4.7-8-9.5V5l8-3z"
      />
      <path
        fill="#fff"
        d="M12 7.5c-1.8 1.2-3 2.8-3.6 4.8-.3 1-.4 2-.3 3 .8-.9 1.8-1.5 2.9-1.8 1.5-.4 3-.1 4.2.8-1.2-2.4-2.1-4.4-3.2-6.8z"
      />
    </svg>
  );
}

const BADGES: TrustBadge[] = [
  {
    id: "secure",
    label: "Secure Checkout",
    subtext: "Protected SSL transaction",
    accent: "#2563eb",
    accentSoft: "rgba(37, 99, 235, 0.14)",
    gradient: "linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(59,130,246,0.08) 100%)",
    Icon: SecureCheckoutIcon,
  },
  {
    id: "payment",
    label: "Encrypted Payment",
    subtext: "End-to-end encrypted",
    accent: "#7c3aed",
    accentSoft: "rgba(124, 58, 237, 0.14)",
    gradient: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(139,92,246,0.08) 100%)",
    Icon: EncryptedPaymentIcon,
  },
  {
    id: "verified",
    label: "Verified Seller",
    subtext: "Trusted marketplace partner",
    accent: "#16a34a",
    accentSoft: "rgba(22, 163, 74, 0.14)",
    gradient: "linear-gradient(135deg, rgba(22,163,74,0.18) 0%, rgba(34,197,94,0.08) 100%)",
    Icon: VerifiedSellerIcon,
  },
  {
    id: "shipping",
    label: "Fast Shipping",
    subtext: "Global logistics network",
    accent: "#ea580c",
    accentSoft: "rgba(234, 88, 12, 0.14)",
    gradient: "linear-gradient(135deg, rgba(234,88,12,0.18) 0%, rgba(249,115,22,0.08) 100%)",
    Icon: FastShippingIcon,
  },
  {
    id: "protection",
    label: "Buyer Protection",
    subtext: "Money-back guarantee eligible",
    accent: "#d97706",
    accentSoft: "rgba(217, 119, 6, 0.16)",
    gradient: "linear-gradient(135deg, rgba(217,119,6,0.2) 0%, rgba(251,191,36,0.1) 100%)",
    Icon: BuyerProtectionIcon,
  },
];

function TrustBadgeCard({
  badge,
  index,
  visible,
}: {
  badge: TrustBadge;
  index: number;
  visible: boolean;
}) {
  const { Icon, label, subtext, accent, accentSoft, gradient } = badge;

  return (
    <div
      className={`trust-strip-card ${visible ? "trust-strip-visible" : ""}`}
      style={{
        animationDelay: `${index * 100}ms`,
        ["--trust-accent" as string]: accent,
        ["--trust-accent-soft" as string]: accentSoft,
        ["--trust-gradient" as string]: gradient,
      }}
    >
      <div className="trust-strip-icon-wrap">
        <Icon />
      </div>
      <p className="trust-strip-label">{label}</p>
      <p className="trust-strip-subtext">{subtext}</p>
    </div>
  );
}

export default function TrustBadgeStrip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="trust-strip" aria-label="Purchase trust assurances">
      <div className="trust-strip-header">
        <span className="trust-strip-badge">Verified Purchase Protection</span>
        <h3 className="trust-strip-title">Shop With Confidence</h3>
      </div>

      <div className="trust-strip-grid">
        {BADGES.map((badge, index) => (
          <TrustBadgeCard
            key={badge.id}
            badge={badge}
            index={index}
            visible={visible}
          />
        ))}
      </div>

      <style jsx>{`
        .trust-strip {
          margin-top: 16px;
          padding: 16px;
          border-radius: 14px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.04) 45%,
            rgba(230, 0, 0, 0.06) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .trust-strip-header {
          margin-bottom: 14px;
          text-align: center;
        }

        .trust-strip-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fecaca;
          background: rgba(230, 0, 0, 0.2);
          border: 1px solid rgba(230, 0, 0, 0.35);
        }

        .trust-strip-title {
          margin: 8px 0 0;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }

        .trust-strip-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @media (min-width: 768px) {
          .trust-strip-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .trust-strip-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        .trust-strip-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          padding: 14px 10px;
          border-radius: 12px;
          background: var(--trust-gradient);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          opacity: 0;
          transform: translateY(10px) scale(0.98);
          transition: opacity 0.45s ease, transform 0.35s ease,
            box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .trust-strip-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .trust-strip-card:hover {
          transform: translateY(-2px) scale(1.05);
          border-color: var(--trust-accent);
          box-shadow: 0 0 24px var(--trust-accent-soft),
            0 8px 24px rgba(0, 0, 0, 0.28);
        }

        .trust-strip-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
          animation: trustIconPulse 2.8s ease-in-out infinite;
        }

        .trust-strip-card:hover .trust-strip-icon-wrap {
          animation: trustIconShine 1.2s ease-in-out infinite;
        }

        .trust-strip-label {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
        }

        .trust-strip-subtext {
          margin: 0;
          font-size: 10px;
          line-height: 1.35;
          color: rgba(255, 255, 255, 0.62);
        }

        @keyframes trustIconPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2),
              0 0 0 rgba(255, 255, 255, 0);
          }
          50% {
            transform: scale(1.04);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25),
              0 0 14px var(--trust-accent-soft);
          }
        }

        @keyframes trustIconShine {
          0%,
          100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.15);
          }
        }
      `}</style>
    </section>
  );
}
