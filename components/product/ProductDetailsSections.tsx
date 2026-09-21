"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import CustomerReviewsSection from "./CustomerReviewsSection";
import TranslatedText from "@/components/i18n/TranslatedText";
import type { InstallationResources } from "@/lib/inventory/productEnhancements";
import { useTranslation } from "@/hooks/useTranslation";
import RichDescription from "./RichDescription";
import {
  FitmentDetails,
  OPEN_DETAILS_TAB_EVENT,
  type ProductFitmentData,
} from "./ProductFitment";
import {
  ORDER_PROCESSING,
  REFUND_PROCESSING,
  RETURN_POLICY_HREF,
  RETURN_WINDOW_DAYS,
  SHIPPING_POLICY_HREF,
  START_RETURN_HREF,
  WARRANTY_POLICY_HREF,
  shipmentType,
} from "@/lib/content/purchase-terms";

export type SpecRow = { label: string; value: ReactNode };

type ProductDetailsSectionsProps = {
  productId: number;
  rating: number;
  reviewCount: number;
  specRows: SpecRow[];
  /** Feature bullets from the listing, rendered as prose under the rows. */
  features: string;
  included?: string[];
  weight?: string;
  descriptionBody: string;
  fitment: ProductFitmentData;
  location?: string;
  freightNotes?: string;
  warranty?: string;
  warrantyTerms?: string;
  coreCharge?: string;
  installResources: InstallationResources;
};

type DetailTab = {
  id: string;
  label: string;
  content: ReactNode;
};

const linkClass =
  "font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline";

function DetailRows({ rows }: { rows: SpecRow[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-10 @2xl:grid-cols-2">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className="grid grid-cols-[minmax(7rem,40%)_minmax(0,1fr)] gap-x-4 border-b border-neutral-200 py-2.5 text-sm"
        >
          <dt className="text-muted">{row.label}</dt>
          <dd className="min-w-0 break-words font-medium text-neutral-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
      {children}
    </h3>
  );
}

function TermList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-neutral-800">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5">
          <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/*
 * Laid out against its own width, not the viewport's: the tabs sit under the
 * photos on desktop, narrower than they are full-width on a tablet.
 */
function DetailTabs({ tabs }: { tabs: DetailTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabIds = tabs.map((tab) => tab.id).join(",");

  // Other parts of the page (the fitment summary) can open a tab by id.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (!tabIds.split(",").includes(id)) return;
      setActiveId(id);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener(OPEN_DETAILS_TAB_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_DETAILS_TAB_EVENT, onOpen);
  }, [tabIds]);

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  if (!active) return null;

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = tabs.findIndex((tab) => tab.id === active.id);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
    event.preventDefault();
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Product details"
      className="@container scroll-mt-32 overflow-hidden rounded-[3px] border border-neutral-300 bg-white"
    >
      <div
        role="tablist"
        aria-label="Product details"
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-neutral-300 bg-neutral-50 px-2 sm:px-4"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              id={`product-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={isActive ? `product-panel-${tab.id}` : undefined}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold transition-colors ${
                isActive
                  ? "border-accent text-neutral-900"
                  : "border-transparent text-muted hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`product-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`product-tab-${active.id}`}
        className="px-4 py-5 sm:px-6 sm:py-6"
      >
        {active.content}
      </div>
    </section>
  );
}

export default function ProductDetailsSections({
  productId,
  rating,
  reviewCount,
  specRows,
  features,
  included,
  weight,
  descriptionBody,
  fitment,
  location,
  freightNotes,
  warranty,
  warrantyTerms,
  coreCharge,
  installResources,
}: ProductDetailsSectionsProps) {
  const { t } = useTranslation();
  const tabs: DetailTab[] = [];

  const rows: SpecRow[] = [
    ...specRows,
    ...(weight ? [{ label: t("weightLabel"), value: <TranslatedText as="span">{weight}</TranslatedText> }] : []),
  ];
  const hasIncluded = Boolean(included && included.length > 0);

  /*
   * Specifications lead because they are facts about this exact part. Most
   * descriptions in the catalog are imported copy; a buyer comparing parts
   * needs the rows first and the prose after.
   */
  if (rows.length > 0 || features || hasIncluded) {
    tabs.push({
      id: "specifications",
      label: t("specificationsTitle"),
      content: (
        <div className="space-y-6">
          {rows.length > 0 ? <DetailRows rows={rows} /> : null}
          {hasIncluded ? (
            <div>
              <SubHeading>{t("whatsIncluded")}</SubHeading>
              <TermList
                items={(included ?? []).map((item) => (
                  <TranslatedText key={item} as="span">
                    {item}
                  </TranslatedText>
                ))}
              />
            </div>
          ) : null}
          {features ? (
            <div>
              <SubHeading>{t("featuresTitle")}</SubHeading>
              <RichDescription text={features} />
            </div>
          ) : null}
        </div>
      ),
    });
  }

  tabs.push({
    id: "fitment",
    label: t("fitmentTitle"),
    content: <FitmentDetails fitment={fitment} />,
  });

  if (descriptionBody) {
    tabs.push({
      id: "description",
      label: t("descriptionTitle"),
      content: <RichDescription text={descriptionBody} />,
    });
  }

  const shipment = shipmentType(freightNotes);

  /*
   * Stated from the published policies, not from each listing's imported
   * "Shipping" paragraph. Those paragraphs were supplier boilerplate --
   * "freight quotes provided for oversized items", "contact for a quote" --
   * and contradicted both the Shipping Policy and the checkout, which charges
   * nothing for standard shipping on any order.
   */
  tabs.push({
    id: "shipping",
    label: t("shippingReturnsTitle"),
    content: (
      <div className="grid grid-cols-1 gap-8 @3xl:grid-cols-3">
        <div>
          <SubHeading>Shipping</SubHeading>
          <TermList
            items={[
              "Standard shipping is free.",
              ...(shipment ? [`${shipment}.`] : []),
              ...(location
                ? [
                    <>
                      Ships from <TranslatedText as="span">{location}</TranslatedText>.
                    </>,
                  ]
                : []),
              `Orders are typically processed within ${ORDER_PROCESSING} once payment is received and verified.`,
              "Tracking is sent after dispatch where the carrier provides it.",
              "International orders: import duties, taxes and customs fees are paid by the recipient.",
              <>
                Delivery estimates and regional restrictions are in the{" "}
                <Link href={SHIPPING_POLICY_HREF} prefetch={false} className={linkClass}>
                  shipping policy
                </Link>
                .
              </>,
            ]}
          />
        </div>

        <div>
          <SubHeading>Returns</SubHeading>
          <TermList
            items={[
              `Returns are accepted within ${RETURN_WINDOW_DAYS} days of delivery.`,
              "Items must be unused, uninstalled and in the original packaging, with all labels and accessories.",
              <>
                Authorization is required before anything is sent back.{" "}
                <Link href={START_RETURN_HREF} prefetch={false} className={linkClass}>
                  Start a return
                </Link>
              </>,
              "Return shipping is paid by the buyer unless the return is due to our error or a confirmed defect.",
              "A restocking fee may apply to large or specialized components; it is confirmed before the return is finalized.",
              `Approved refunds go to the original payment method within ${REFUND_PROCESSING}.`,
              <>
                Full terms and exclusions:{" "}
                <Link href={RETURN_POLICY_HREF} prefetch={false} className={linkClass}>
                  return policy
                </Link>
                .
              </>,
            ]}
          />
        </div>

        <div>
          <SubHeading>Warranty</SubHeading>
          <TermList
            items={[
              ...(warranty
                ? [
                    <TranslatedText key="warranty" as="span">{warranty}</TranslatedText>,
                    ...(warrantyTerms
                      ? [<TranslatedText key="terms" as="span">{warrantyTerms}</TranslatedText>]
                      : []),
                  ]
                : ["No manufacturer or supplier warranty is stated for this listing."]),
              ...(coreCharge
                ? [
                    <>
                      <span className="text-muted">{t("coreChargeLabel")}:</span>{" "}
                      <TranslatedText as="span">{coreCharge}</TranslatedText>
                    </>,
                  ]
                : []),
              <>
                How coverage and warranty requests work:{" "}
                <Link href={WARRANTY_POLICY_HREF} prefetch={false} className={linkClass}>
                  warranty policy
                </Link>
                .
              </>,
            ]}
          />
        </div>
      </div>
    ),
  });

  const installRows: SpecRow[] = [
    ...(installResources.difficulty
      ? [{ label: "Difficulty", value: installResources.difficulty }]
      : []),
    ...(installResources.estimatedTime
      ? [{ label: "Estimated time", value: installResources.estimatedTime }]
      : []),
    ...(installResources.torqueSpecs
      ? [
          {
            label: "Torque specs",
            value: <TranslatedText as="span">{installResources.torqueSpecs}</TranslatedText>,
          },
        ]
      : []),
    ...(installResources.guideUrl
      ? [
          {
            label: "Install guide",
            value: (
              <a href={installResources.guideUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                View guide
              </a>
            ),
          },
        ]
      : []),
    ...(installResources.videoUrl
      ? [
          {
            label: "Install video",
            value: (
              <a href={installResources.videoUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                Watch video
              </a>
            ),
          },
        ]
      : []),
  ];

  if (installRows.length > 0) {
    tabs.push({
      id: "installation",
      label: t("installationResourcesTitle"),
      content: <DetailRows rows={installRows} />,
    });
  }

  return (
    <div className="space-y-4">
      <DetailTabs tabs={tabs} />
      <CustomerReviewsSection productId={productId} rating={rating} reviewCount={reviewCount} />
    </div>
  );
}
