"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import TranslatedText from "@/components/i18n/TranslatedText";
import { CONTACT_HREF } from "@/lib/content/purchase-terms";

/*
 * Fitment, stated from the listing's own data and nothing else.
 *
 * Four honest states, and the page must not blur them:
 *  - an application list (year / make / model / submodel rows);
 *  - fitment text only;
 *  - universal, which the listing records only where the maker says so;
 *  - nothing recorded, which is said plainly rather than implied away.
 *
 * Rows are never merged into wider year ranges. Two submodels of the same
 * model often cover different years, and a combined "1975-1986" would claim
 * years a submodel does not fit.
 */

export type FitmentApplication = {
  yearFrom: number | null;
  yearTo: number | null;
  make: string;
  model: string;
  submodel?: string | null;
};

export type ProductFitmentData = {
  /** The listing's fitment text, e.g. "Fits 2015-2020 Ford F-150 4WD". */
  text?: string;
  applications: FitmentApplication[];
  years?: string;
  engine?: string;
  drivetrain?: string;
  universal: boolean;
  swapPackage: boolean;
};

/** Event the summary sends to open the Fitment tab in the details section. */
export const OPEN_DETAILS_TAB_EVENT = "product-details:open-tab";

export function openDetailsTab(tabId: string) {
  window.dispatchEvent(new CustomEvent(OPEN_DETAILS_TAB_EVENT, { detail: tabId }));
}

function yearsLabel({ yearFrom, yearTo }: FitmentApplication): string {
  if (yearFrom == null && yearTo == null) return "—";
  if (yearFrom != null && yearTo != null) {
    return yearFrom === yearTo ? String(yearFrom) : `${yearFrom}–${yearTo}`;
  }
  return String(yearFrom ?? yearTo);
}

function sortApplications(rows: FitmentApplication[]): FitmentApplication[] {
  return [...rows].sort(
    (a, b) =>
      a.make.localeCompare(b.make) ||
      a.model.localeCompare(b.model) ||
      (a.yearFrom ?? 0) - (b.yearFrom ?? 0) ||
      (a.submodel ?? "").localeCompare(b.submodel ?? "")
  );
}

/** "Buick, Chevrolet and Ford" */
function makesSentence(rows: FitmentApplication[]): string {
  const makes = [...new Set(rows.map((row) => row.make))].sort((a, b) => a.localeCompare(b));
  if (makes.length <= 1) return makes.join("");
  return `${makes.slice(0, -1).join(", ")} and ${makes[makes.length - 1]}`;
}

/** Every query word must match; a four-digit year matches the rows that cover it. */
function matchesQuery(row: FitmentApplication, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = `${row.make} ${row.model} ${row.submodel ?? ""}`.toLowerCase();
  return words.every((word) => {
    if (/^(19|20)\d{2}$/.test(word)) {
      const year = Number(word);
      const from = row.yearFrom ?? row.yearTo;
      const to = row.yearTo ?? row.yearFrom;
      return from != null && to != null && year >= from && year <= to;
    }
    return text.includes(word);
  });
}

function FitmentHelp() {
  return (
    <p className="text-[13px] leading-relaxed text-muted">
      Not sure it fits?{" "}
      <Link
        href={CONTACT_HREF}
        prefetch={false}
        className="font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline"
      >
        Send us your vehicle details
      </Link>{" "}
      before you order.
    </p>
  );
}

/** Compact fitment statement for the purchase column. */
export function FitmentSummary({ fitment }: { fitment: ProductFitmentData }) {
  const count = fitment.applications.length;

  let statement: ReactNode;
  if (fitment.swapPackage) {
    statement = (
      <>
        <p className="text-sm leading-relaxed text-neutral-900">
          Swap package. Fitment depends on your chassis and the fabrication
          involved.
        </p>
        {fitment.text ? (
          <p className="text-sm leading-relaxed text-neutral-900">
            <TranslatedText as="span">{fitment.text}</TranslatedText>
          </p>
        ) : null}
      </>
    );
  } else if (count > 0) {
    statement = (
      <p className="text-sm leading-relaxed text-neutral-900">
        <span className="font-semibold">
          {count.toLocaleString()} vehicle {count === 1 ? "application" : "applications"}
        </span>{" "}
        from {makesSentence(fitment.applications)}.{" "}
        <button
          type="button"
          onClick={() => openDetailsTab("fitment")}
          className="font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline"
        >
          View the full list
        </button>
      </p>
    );
  } else if (fitment.text) {
    statement = (
      <p className="text-sm leading-relaxed text-neutral-900">
        <TranslatedText as="span">{fitment.text}</TranslatedText>
      </p>
    );
  } else if (fitment.universal) {
    statement = (
      <p className="text-sm leading-relaxed text-neutral-900">
        Universal. The manufacturer lists no vehicle-specific application.
      </p>
    );
  } else {
    statement = (
      <p className="text-sm leading-relaxed text-neutral-900">
        No vehicle fitment is listed for this part.
      </p>
    );
  }

  return (
    <section aria-labelledby="fitment-summary-heading" className="space-y-2">
      <h2
        id="fitment-summary-heading"
        className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted"
      >
        Fitment
      </h2>
      {statement}
      {fitment.drivetrain ? (
        <p className="text-[13px] text-neutral-700">
          <span className="text-muted">Drivetrain:</span>{" "}
          <TranslatedText as="span">{fitment.drivetrain}</TranslatedText>
        </p>
      ) : null}
      <FitmentHelp />
    </section>
  );
}

const COLLAPSED_ROWS = 12;

/** The full fitment record, for the Fitment tab. */
export function FitmentDetails({ fitment }: { fitment: ProductFitmentData }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => sortApplications(fitment.applications), [fitment.applications]);
  const matches = useMemo(() => rows.filter((row) => matchesQuery(row, query)), [rows, query]);
  const filtering = query.trim().length > 0;
  const visible = filtering || expanded ? matches : matches.slice(0, COLLAPSED_ROWS);

  // Structured extras, shown only where the text does not already say them.
  const lowerText = (fitment.text ?? "").toLowerCase();
  const extras = [
    { label: "Years", value: fitment.years },
    { label: "Engine", value: fitment.engine },
    { label: "Drivetrain", value: fitment.drivetrain },
  ].filter(
    (row): row is { label: string; value: string } =>
      Boolean(row.value) && !lowerText.includes(String(row.value).toLowerCase())
  );

  return (
    <div className="space-y-5">
      {fitment.swapPackage ? (
        <p className="text-sm leading-relaxed text-neutral-800">
          This is a swap package. Whether it fits depends on the chassis it is
          going into and the fabrication involved, so there is no vehicle list
          to check against. Tell us about your build before ordering.
        </p>
      ) : null}

      {rows.length === 0 && fitment.text ? (
        <p className="text-sm leading-relaxed text-neutral-900">
          <TranslatedText as="span">{fitment.text}</TranslatedText>
        </p>
      ) : null}

      {rows.length === 0 && !fitment.text && fitment.universal ? (
        <p className="text-sm leading-relaxed text-neutral-900">
          Universal. The manufacturer lists no vehicle-specific application.
        </p>
      ) : null}

      {rows.length === 0 && !fitment.text && !fitment.universal && !fitment.swapPackage ? (
        <p className="text-sm leading-relaxed text-neutral-800">
          No vehicle fitment is listed for this part. Check the part number
          against your vehicle, or ask us before ordering.
        </p>
      ) : null}

      {extras.length > 0 ? (
        <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
          {extras.map((row) => (
            <div key={row.label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-2.5 text-sm">
              <dt className="text-muted">{row.label}</dt>
              <dd className="font-medium text-neutral-900">
                <TranslatedText as="span">{row.value}</TranslatedText>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {rows.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm text-neutral-800">
              <span className="font-semibold">{rows.length.toLocaleString()}</span> vehicle{" "}
              {rows.length === 1 ? "application" : "applications"}, as listed for this part.
            </p>
            {rows.length > COLLAPSED_ROWS ? (
              <label className="block sm:w-64">
                <span className="sr-only">Filter vehicle applications</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by year, make or model"
                  className="h-9 w-full rounded-[3px] border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-800"
                />
              </label>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-[3px] border border-neutral-200">
            <table className="w-full table-fixed border-collapse text-left text-[13px]">
              <thead className="bg-neutral-50 text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th scope="col" className="w-[5.75rem] px-3 py-2 sm:w-28">
                    Years
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Vehicle
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Submodel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {visible.map((row, index) => (
                  <tr key={`${row.make}-${row.model}-${row.submodel ?? ""}-${row.yearFrom}-${row.yearTo}-${index}`}>
                    <td className="px-3 py-2 align-top tabular-nums text-neutral-900">
                      {yearsLabel(row)}
                    </td>
                    <td className="px-3 py-2 align-top text-neutral-900">
                      <span className="break-words">
                        {row.make} {row.model}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top text-neutral-700">
                      <span className="break-words">{row.submodel || "—"}</span>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-neutral-700">
                      No listed application matches “{query.trim()}”.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {!filtering && matches.length > COLLAPSED_ROWS ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="text-sm font-semibold text-accent underline-offset-2 hover:text-accent-hover hover:underline"
            >
              {expanded
                ? "Show fewer"
                : `Show all ${matches.length.toLocaleString()} applications`}
            </button>
          ) : null}
        </div>
      ) : null}

      <FitmentHelp />
    </div>
  );
}
