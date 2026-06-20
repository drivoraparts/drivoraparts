"use client";

import { useEffect, useState } from "react";

type TrustBadge = {
  id: string;
  label: string;
  subtext: string;
  accent: string;
  accentSoft: string;
  Icon: ({ color }: { color: string }) => JSX.Element;
};

const STROKE = 1.75;

function ShieldCheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 3v5.5c0 4.6-3.2 8.1-8 9-4.8-.9-8-4.4-8-9V6l8-3z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 3v5.5c0 4.6-3.2 8.1-8 9-4.8-.9-8-4.4-8-9V6l8-3z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M12 11v4M10 13h4"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </svg>
  );
}

function BadgeCheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.2 4.4 4.9.7-3.5 3.4.8 4.9L12 13.6 7.6 15.4l.8-4.9-3.5-3.4 4.9-.7L12 2z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12l1.6 1.6 3.2-3.3"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TruckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 8h11v7H3V8zM14 10h3.5L20 13v2h-6v-5z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <circle cx="7" cy="17" r="1.75" stroke={color} strokeWidth={STROKE} />
      <circle cx="17" cy="17" r="1.75" stroke={color} strokeWidth={STROKE} />
    </svg>
  );
}

function LockIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke={color}
        strokeWidth={STROKE}
      />
      <path
        d="M8 11V9a4 4 0 018 0v2"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.5" r="1" fill={color} />
    </svg>
  );
}

const BADGES: TrustBadge[] = [
  {
    id: "secure",
    label: "Secure Checkout",
    subtext: "SSL protected transaction",
    accent: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.12)",
    Icon: ShieldCheckIcon,
  },
  {
    id: "protection",
    label: "Buyer Protection",
    subtext: "Refund eligible orders",
    accent: "#16a34a",
    accentSoft: "rgba(22, 163, 74, 0.12)",
    Icon: ShieldIcon,
  },
  {
    id: "verified",
    label: "Verified Seller",
    subtext: "Authenticated marketplace partner",
    accent: "#4ade80",
    accentSoft: "rgba(74, 222, 128, 0.12)",
    Icon: BadgeCheckIcon,
  },
  {
    id: "shipping",
    label: "Fast Shipping",
    subtext: "Global logistics network",
    accent: "#3b82f6",
    accentSoft: "rgba(59, 130, 246, 0.12)",
    Icon: TruckIcon,
  },
  {
    id: "payment",
    label: "Encrypted Payment",
    subtext: "Secure payment channel",
    accent: "#14b8a6",
    accentSoft: "rgba(20, 184, 166, 0.12)",
    Icon: LockIcon,
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
  const { Icon, label, subtext, accent, accentSoft } = badge;

  return (
    <div
      className={`trust-pill ${visible ? "trust-pill-visible" : ""}`}
      style={{
        transitionDelay: `${index * 100}ms`,
        ["--trust-accent" as string]: accent,
        ["--trust-accent-soft" as string]: accentSoft,
      }}
    >
      <div className="trust-pill-icon">
        <Icon color={accent} />
      </div>
      <div className="trust-pill-copy">
        <p className="trust-pill-label">{label}</p>
        <p className="trust-pill-subtext">{subtext}</p>
      </div>
    </div>
  );
}

export default function TrustBadgeStrip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="trust-strip" aria-label="Purchase trust assurances">
      <div className="trust-strip-header">
        <span className="trust-strip-eyebrow">Transaction Security</span>
        <h3 className="trust-strip-title">Verified marketplace protections</h3>
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
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .trust-strip-header {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .trust-strip-eyebrow {
          display: block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(74, 222, 128, 0.85);
        }

        .trust-strip-title {
          margin: 4px 0 0;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.88);
        }

        .trust-strip-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        @media (min-width: 1024px) {
          .trust-strip-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 6px;
          }
        }

        .trust-pill {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 0.55s ease, transform 0.55s ease,
            box-shadow 0.3s ease, border-color 0.3s ease,
            background 0.3s ease;
        }

        @media (min-width: 1024px) {
          .trust-pill {
            flex-direction: column;
            align-items: center;
            text-align: center;
            border-radius: 14px;
            padding: 10px 8px;
          }
        }

        .trust-pill-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .trust-pill:hover {
          transform: translateY(0) scale(1.02);
          border-color: var(--trust-accent);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 0 0 1px var(--trust-accent-soft),
            0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .trust-pill-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .trust-pill-copy {
          min-width: 0;
        }

        @media (min-width: 1024px) {
          .trust-pill-copy {
            width: 100%;
          }
        }

        .trust-pill-label {
          margin: 0;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.3;
        }

        .trust-pill-subtext {
          margin: 2px 0 0;
          font-size: 9px;
          line-height: 1.35;
          color: rgba(255, 255, 255, 0.48);
        }
      `}</style>
    </section>
  );
}
