"use client";

import { useState, type ReactNode } from "react";
import CustomerReviewsSection from "./CustomerReviewsSection";
import TranslatedText from "@/components/i18n/TranslatedText";
import type {
  InstallationResources,
  ProductLogistics,
} from "@/lib/inventory/productEnhancements";
import { hasInstallationResources, hasLogistics } from "@/lib/inventory/productEnhancements";
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
  installResources: InstallationResources;
  theme?: "dark" | "pro";
};

function InstallationResourcesBlock({
  resources,
  theme = "dark",
}: {
  resources: InstallationResources;
  theme?: "dark" | "pro";
}) {
  return (
    <div>
      {resources.difficulty && (
        <LogisticsRow label="Difficulty" value={resources.difficulty} theme={theme} />
      )}
      {resources.estimatedTime && (
        <LogisticsRow
          label="Estimated Time"
          value={resources.estimatedTime}
          theme={theme}
        />
      )}
      {resources.torqueSpecs && (
        <LogisticsRow
          label="Torque Specs"
          value={<TranslatedText as="span">{resources.torqueSpecs}</TranslatedText>}
          theme={theme}
        />
      )}
      {resources.guideUrl && (
        <LogisticsRow
          label="Install Guide"
          value={
            <a
              href={resources.guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 underline hover:text-red-700"
            >
              View guide
            </a>
          }
          theme={theme}
        />
      )}
      {resources.videoUrl && (
        <LogisticsRow
          label="Install Video"
          value={
            <a
              href={resources.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 underline hover:text-red-700"
            >
              Watch video
            </a>
          }
          theme={theme}
        />
      )}
    </div>
  );
}

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
                <span
                  key={item}
                  style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}
                >
                  <span aria-hidden style={{ color: "#059669", flexShrink: 0 }}>
                    ✓
                  </span>
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
      {logistics.weight && (
        <LogisticsRow
          label={t("weightLabel")}
          value={<TranslatedText as="span">{logistics.weight}</TranslatedText>}
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

type DetailTab = {
  id: string;
  label: string;
  content: ReactNode;
};

function DetailTabs({
  tabs,
  theme = "dark",
}: {
  tabs: DetailTab[];
  theme?: "dark" | "pro";
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const isPro = theme === "pro";
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (!active) return null;

  return (
    <section
      className={
        isPro
          ? "rounded-sm border border-neutral-300 bg-neutral-50 shadow-sm"
          : undefined
      }
      style={isPro ? undefined : glassCard}
    >
      <div
        role="tablist"
        aria-label="Product details"
        className={
          isPro
            ? "flex gap-1 overflow-x-auto border-b border-neutral-300 px-2 pt-2"
            : "flex gap-1 overflow-x-auto border-b border-white/10 px-2 pt-2"
        }
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(tab.id)}
              className={
                isPro
                  ? `shrink-0 whitespace-nowrap rounded-t-md px-3 py-2.5 text-sm font-bold transition-colors ${
                      isActive
                        ? "border-b-2 border-red-600 text-neutral-900"
                        : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-800"
                    }`
                  : `shrink-0 whitespace-nowrap rounded-t-md px-3 py-2.5 text-sm font-bold transition-colors ${
                      isActive
                        ? "border-b-2 border-red-500 text-white"
                        : "border-b-2 border-transparent text-white/50 hover:text-white/80"
                    }`
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        className={
          isPro
            ? "px-4 py-4 text-sm leading-relaxed text-neutral-700"
            : "px-4 py-4 text-sm leading-relaxed text-white/75"
        }
        style={{ whiteSpace: "pre-line" }}
      >
        {active.content}
      </div>
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
  installResources,
  theme = "dark",
}: ProductDetailsSectionsProps) {
  const { t } = useTranslation();

  const tabs: DetailTab[] = [
    {
      id: "description",
      label: t("descriptionTitle"),
      content: (
        <>
          <p
            className={
              theme === "pro"
                ? "mb-4 rounded-sm border border-neutral-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-neutral-700"
                : undefined
            }
            style={
              theme === "pro"
                ? undefined
                : {
                    marginBottom: "14px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    fontSize: "14px",
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.82)",
                  }
            }
          >
            <TranslatedText as="span">{t("productImageNotice")}</TranslatedText>
          </p>
          {descriptionBody ? (
            <TranslatedText as="span">{descriptionBody}</TranslatedText>
          ) : null}
        </>
      ),
    },
  ];

  if (specifications) {
    tabs.push({
      id: "specifications",
      label: t("specificationsTitle"),
      content: <TranslatedText as="span">{specifications}</TranslatedText>,
    });
  }

  if (hasLogistics(logistics)) {
    tabs.push({
      id: "fitment",
      label: t("fitmentLogisticsTitle"),
      content: <FitmentLogistics logistics={logistics} theme={theme} />,
    });
  }

  if (hasInstallationResources(installResources)) {
    tabs.push({
      id: "installation",
      label: t("installationResourcesTitle"),
      content: <InstallationResourcesBlock resources={installResources} theme={theme} />,
    });
  }

  if (shippingAndWarranty) {
    tabs.push({
      id: "shipping",
      label: t("shippingWarrantyTitle"),
      content: <TranslatedText as="span">{shippingAndWarranty}</TranslatedText>,
    });
  }

  return (
    <div className="product-details-sections">
      <DetailTabs tabs={tabs} theme={theme} />

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
