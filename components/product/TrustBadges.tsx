"use client";

import { useEffect, useState } from "react";

type BadgeDef = {
  id: string;
  label: string;
  hint: string;
  Icon: ({ active }: { active: boolean }) => JSX.Element;
};

function ShieldIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className={`trust-icon ${active ? "trust-icon-active" : ""}`}
    >
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProtectionIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className={`trust-icon ${active ? "trust-icon-active" : ""}`}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l2.5 2.5" strokeLinecap="round" />
      <path d="M8 16h8" strokeLinecap="round" />
    </svg>
  );
}

function VerifiedIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className={`trust-icon ${active ? "trust-icon-active" : ""}`}
    >
      <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.6L12 15.8 7.1 17.5 8 11.9 4 8l5.6-1.2L12 2z" />
      <path d="M9.5 12l1.8 1.8 3.5-3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className={`trust-icon ${active ? "trust-icon-active" : ""}`}
    >
      <path d="M3 7h11v8H3z" />
      <path d="M14 10h4l3 3v2h-7v-5z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function LockIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className={`trust-icon ${active ? "trust-icon-active" : ""}`}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const BADGES: BadgeDef[] = [
  {
    id: "secure",
    label: "Secure Checkout",
    hint: "SSL-encrypted checkout flow",
    Icon: ShieldIcon,
  },
  {
    id: "protection",
    label: "Buyer Protection",
    hint: "Coverage on eligible marketplace orders",
    Icon: ProtectionIcon,
  },
  {
    id: "verified",
    label: "Verified Seller",
    hint: "Identity-verified DrivoraParts seller",
    Icon: VerifiedIcon,
  },
  {
    id: "shipping",
    label: "Fast Shipping",
    hint: "Tracked worldwide fulfillment network",
    Icon: TruckIcon,
  },
  {
    id: "payment",
    label: "Encrypted Payment",
    hint: "End-to-end encrypted payment processing",
    Icon: LockIcon,
  },
];

function TrustBadgeItem({
  badge,
  index,
  visible,
}: {
  badge: BadgeDef;
  index: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { Icon, label, hint } = badge;

  return (
    <div
      className={`trust-badge-item ${visible ? "trust-badge-visible" : ""}`}
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={hint}
    >
      <div className="trust-badge-icon-wrap">
        <Icon active={hovered} />
      </div>
      <div className="trust-badge-copy">
        <span className="trust-badge-label">{label}</span>
        <span className={`trust-badge-hint ${hovered ? "trust-badge-hint-show" : ""}`}>
          {hint}
        </span>
      </div>
    </div>
  );
}

export default function TrustBadges() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="trust-module">
      <div className="trust-module-header">
        <span className="trust-module-dot" aria-hidden />
        <span className="trust-module-title">Marketplace Trust & Security</span>
      </div>

      <div className="trust-badge-grid">
        {BADGES.map((badge, index) => (
          <TrustBadgeItem
            key={badge.id}
            badge={badge}
            index={index}
            visible={visible}
          />
        ))}
      </div>

      <style jsx>{`
        .trust-module {
          margin-top: 16px;
          padding: 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .trust-module:hover {
          border-color: rgba(230, 0, 0, 0.35);
          box-shadow: 0 4px 28px rgba(230, 0, 0, 0.12),
            0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .trust-module-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .trust-module-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e60000;
          box-shadow: 0 0 10px rgba(230, 0, 0, 0.6);
          animation: trustPulse 2s ease-in-out infinite;
        }

        .trust-module-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
        }

        .trust-badge-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        @media (min-width: 640px) {
          .trust-badge-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .trust-badge-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(0, 0, 0, 0.2);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.45s ease, transform 0.45s ease,
            box-shadow 0.25s ease, border-color 0.25s ease,
            background 0.25s ease;
          cursor: default;
        }

        .trust-badge-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .trust-badge-item:hover {
          transform: scale(1.03);
          border-color: rgba(230, 0, 0, 0.4);
          background: rgba(230, 0, 0, 0.08);
          box-shadow: 0 0 20px rgba(230, 0, 0, 0.15);
        }

        .trust-badge-icon-wrap {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.55);
          transition: color 0.25s ease, border-color 0.25s ease,
            background 0.25s ease, transform 0.25s ease;
          animation: trustFloat 3s ease-in-out infinite;
        }

        .trust-badge-item:hover .trust-badge-icon-wrap {
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.35);
          background: rgba(34, 197, 94, 0.1);
          transform: translateY(-2px);
        }

        .trust-badge-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .trust-badge-label {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
        }

        .trust-badge-hint {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.35;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.25s ease, opacity 0.25s ease,
            color 0.25s ease;
        }

        .trust-badge-hint-show {
          max-height: 2.5em;
          opacity: 1;
          color: rgba(255, 255, 255, 0.65);
        }

        :global(.trust-icon) {
          transition: transform 0.3s ease;
        }

        :global(.trust-icon-active) {
          transform: scale(1.08);
        }

        @keyframes trustFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes trustPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
