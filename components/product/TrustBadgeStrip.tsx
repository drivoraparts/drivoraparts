"use client";

import { useEffect, useState } from "react";
import TrustSealGraphic from "@/components/trust/TrustSealGraphic";
import { TRUST_SECTION, TRUST_SIGNALS } from "@/lib/content/trust-signals";

function TrustBadgeCard({
  signal,
  index,
  visible,
  variant = "dark",
}: {
  signal: (typeof TRUST_SIGNALS)[number];
  index: number;
  visible: boolean;
  variant?: "dark" | "pro";
}) {
  const isPro = variant === "pro";

  return (
    <div
      className={`trust-pill ${visible ? "trust-pill-visible" : ""} ${isPro ? "trust-pill-pro" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="trust-pill-icon">
        <TrustSealGraphic kind={signal.seal} className="h-8 w-8" />
      </div>
      <div className="trust-pill-copy">
        <p className="trust-pill-label">{signal.title}</p>
        <p className="trust-pill-subtext">{signal.detail}</p>
      </div>
    </div>
  );
}

export default function TrustBadgeStrip({
  variant = "dark",
}: {
  variant?: "dark" | "pro";
}) {
  const [visible, setVisible] = useState(false);
  const isPro = variant === "pro";

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      className={isPro ? "trust-strip trust-strip-pro" : "trust-strip"}
      aria-label="Purchase trust assurances"
    >
      <div className={isPro ? "trust-strip-header trust-strip-header-pro" : "trust-strip-header"}>
        <span className={isPro ? "trust-strip-eyebrow trust-strip-eyebrow-pro" : "trust-strip-eyebrow"}>
          {TRUST_SECTION.eyebrow}
        </span>
        <h3 className={isPro ? "trust-strip-title trust-strip-title-pro" : "trust-strip-title"}>
          {TRUST_SECTION.headline}
        </h3>
      </div>

      <div className={isPro ? "trust-strip-grid trust-strip-grid-pro" : "trust-strip-grid"}>
        {TRUST_SIGNALS.map((signal, index) => (
          <TrustBadgeCard
            key={signal.id}
            signal={signal}
            index={index}
            visible={visible}
            variant={variant}
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

        .trust-strip-pro {
          margin-top: 0;
          padding: 0;
          border-radius: 0;
          background: transparent;
          border: none;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          box-shadow: none;
        }

        .trust-strip-header {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .trust-strip-header-pro {
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .trust-strip-eyebrow {
          display: block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(248, 113, 113, 0.9);
        }

        .trust-strip-eyebrow-pro {
          color: var(--error);
        }

        .trust-strip-title {
          margin: 4px 0 0;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.35;
        }

        .trust-strip-title-pro {
          color: var(--foreground);
          font-size: 15px;
          font-weight: 700;
        }

        .trust-strip-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .trust-strip-grid-pro {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @media (min-width: 640px) {
          .trust-strip-grid-pro {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .trust-strip-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 6px;
          }

          .trust-strip-grid-pro {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 8px;
          }
        }

        .trust-pill {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px;
          border-radius: 12px;
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
            padding: 10px 8px;
          }
        }

        .trust-pill-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .trust-pill:hover {
          transform: translateY(0) scale(1.01);
          border-color: rgba(248, 113, 113, 0.45);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .trust-pill-pro {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: none;
          opacity: 1;
          transform: none;
        }

        .trust-pill-pro:hover {
          border-color: var(--error-subtle);
          background: var(--surface-muted);
          box-shadow: 0 0 0 1px rgba(252, 165, 165, 0.35);
          transform: translateY(-1px);
        }

        .trust-pill-pro .trust-pill-label {
          color: var(--foreground);
        }

        .trust-pill-pro .trust-pill-subtext {
          color: var(--muted);
        }

        .trust-pill-pro .trust-pill-icon {
          background: var(--surface-muted);
          border-color: var(--border);
          color: var(--muted);
        }

        .trust-pill-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.75);
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
