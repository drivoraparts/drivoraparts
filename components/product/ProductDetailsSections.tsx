"use client";

import { useState, type ReactNode } from "react";
import CustomerReviewsSection from "./CustomerReviewsSection";
import TranslatedText from "@/components/i18n/TranslatedText";
import type { ProductLogistics } from "@/lib/inventory/productEnhancements";
import { hasLogistics } from "@/lib/inventory/productEnhancements";
import { useTranslation } from "@/hooks/useTranslation";
import { glassCard } from "./styles";

type ProductDetailsSectionsProps = {
  productId: number;
  rating: number;
  descriptionBody: string;
  specifications: string;
  shippingAndWarranty: string;
  reviewCount: number;
  logistics: ProductLogistics;
  theme?: "dark" | "pro";
};

function LogisticsRow({
  label,
  value,
  theme = "dark",
}: {
  label: string;
  value: ReactNode;
  theme?: "dark" | "pro";
}) {
  const isPro = theme === "pro";

  return (
    <div
      className={
        isPro
          ? "flex justify-between gap-4 border-b border-neutral-200 py-2.5 text-sm leading-relaxed last:border-b-0"
          : undefined
      }
      style={
        isPro
          ? undefined
          : {
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              fontSize: "14px",
              lineHeight: 1.5,
            }
      }
    >
      <span
        className={isPro ? "shrink-0 text-neutral-500" : undefined}
        style={isPro ? undefined : { color: "rgba(255,255,255,0.55)", flexShrink: 0 }}
      >
        {label}
      </span>
      <span
        className={isPro ? "text-right font-semibold text-neutral-900" : undefined}
        style={isPro ? undefined : { fontWeight: 600, textAlign: "right", color: "#fff" }}
      >
        {value}
      </span>
    </div>
  );
}

function FitmentLogistics({
  logistics,
  theme = "dark",
}: {
  logistics: ProductLogistics;
  theme?: "dark" | "pro";
}) {
  const { t } = useTranslation();

  return (
    <div>
      {logistics.fitment && (
        <LogisticsRow
          label={t("fitsCompatibility")}
          value={
            <TranslatedText as="span">{logistics.fitment}</TranslatedText>
          }
          theme={theme}
        />
      )}
      {logistics.drivetrain && (
        <LogisticsRow
          label={t("drivetrainLabel")}
          value={
            <TranslatedText as="span">{logistics.drivetrain}</TranslatedText>
          }
          theme={theme}
        />
      )}
      {logistics.partNumber && (
        <LogisticsRow label={t("partCode")} value={logistics.partNumber} theme={theme} />
      )}
      {logistics.included && logistics.included.length > 0 && (
        <LogisticsRow
          label={t("whatsIncluded")}
          value={
            <span style={{ display: "block" }}>
              {logistics.included.map((item) => (
                <span key={item} style={{ display: "block" }}>
                  <TranslatedText as="span">{item}</TranslatedText>
                </span>
              ))}
            </span>
          }
          theme={theme}
        />
      )}
      {logistics.coreCharge && (
        <LogisticsRow
          label={t("coreChargeLabel")}
          value={
            <TranslatedText as="span">{logistics.coreCharge}</TranslatedText>
          }
          theme={theme}
        />
      )}
      {logistics.freightNotes && (
        <LogisticsRow
          label={t("freightNotesLabel")}
          value={
            <TranslatedText as="span">{logistics.freightNotes}</TranslatedText>
          }
          theme={theme}
        />
      )}
      {logistics.warrantyTerms && (
        <LogisticsRow
          label={t("warrantyTermsLabel")}
          value={
            <TranslatedText as="span">{logistics.warrantyTerms}</TranslatedText>
          }
          theme={theme}
        />
      )}
    </div>
  );
}

type SectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  theme = "dark",
}: SectionProps & { theme?: "dark" | "pro" }) {
  const [open, setOpen] = useState(defaultOpen);
  const isPro = theme === "pro";

  return (
    <section
      className={
        isPro
          ? "rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 shadow-sm"
          : undefined
      }
      style={isPro ? undefined : { ...glassCard, padding: "14px" }}
    >
      <button
        type="button"
        className={`details-section-toggle ${isPro ? "details-section-toggle-pro" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={isPro ? "text-neutral-900" : undefined}>
          {open ? "▼" : "▶"} {title}
        </span>
      </button>
      {open && (
        <div className={`details-section-body ${isPro ? "details-section-body-pro" : ""}`}>
          {children}
        </div>
      )}

      <style jsx>{`
        .details-section-toggle {
          width: 100%;
          padding: 0;
          border: none;
          background: none;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }

        .details-section-toggle-pro {
          color: #111827;
        }

        .details-section-body {
          margin-top: 12px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.6;
          white-space: pre-line;
        }

        .details-section-body-pro {
          color: #374151;
        }
      `}</style>
    </section>
  );
}

export default function ProductDetailsSections({
  productId,
  rating,
  descriptionBody,
  specifications,
  shippingAndWarranty,
  reviewCount,
  logistics,
  theme = "dark",
}: ProductDetailsSectionsProps) {
  const { t } = useTranslation();

  return (
    <div className="product-details-sections">
      <CollapsibleSection title={t("descriptionTitle")} defaultOpen theme={theme}>
        <TranslatedText as="span">{descriptionBody}</TranslatedText>
      </CollapsibleSection>

      {specifications && (
        <CollapsibleSection title={t("specificationsTitle")} theme={theme}>
          <TranslatedText as="span">{specifications}</TranslatedText>
        </CollapsibleSection>
      )}

      {hasLogistics(logistics) && (
        <CollapsibleSection title={t("fitmentLogisticsTitle")} defaultOpen theme={theme}>
          <FitmentLogistics logistics={logistics} theme={theme} />
        </CollapsibleSection>
      )}

      {shippingAndWarranty && (
        <CollapsibleSection title={t("shippingWarrantyTitle")} theme={theme}>
          <TranslatedText as="span">{shippingAndWarranty}</TranslatedText>
        </CollapsibleSection>
      )}

      <CustomerReviewsSection
        productId={productId}
        rating={rating}
        reviewCount={reviewCount}
      />

      <style jsx>{`
        .product-details-sections {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}
