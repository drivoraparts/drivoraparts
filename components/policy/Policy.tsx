/* =========================================================
   SHARED LEGAL POLICY COMPONENT
   ---------------------------------------------------------
   Consistent legal-grade structure for every policy page:
   title (H1 + red underline), effective date, company
   identity, structured H2 sections, and a footer note.
========================================================= */

import { COMPANY_LEGAL_NAME, COMPANY_SUPPORT_EMAIL, US_HEADQUARTERS } from "@/lib/content/company";

export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export default function Policy({
  title,
  effectiveDate = "January 1, 2026",
  lastUpdated = "June 19, 2026",
  intro,
  sections,
}: {
  title: string;
  effectiveDate?: string;
  lastUpdated?: string;
  intro?: string;
  sections: PolicySection[];
}) {
  return (
    <article className="text-white">
      <h1 className="inline-block text-3xl md:text-4xl font-bold border-b-2 border-red-600 pb-2">
        {title}
      </h1>

      <div className="mt-5 space-y-1 text-sm text-gray-400">
        <p>
          Company:{" "}
          <span className="text-gray-200 font-medium">{COMPANY_LEGAL_NAME}</span>
        </p>
        <p>
          Headquarters: {US_HEADQUARTERS.city}, {US_HEADQUARTERS.stateName},{" "}
          {US_HEADQUARTERS.country}
        </p>
        <p>Effective Date: {effectiveDate}</p>
        <p>Last Updated: {lastUpdated}</p>
      </div>

      {intro && (
        <p className="mt-6 text-gray-300 leading-relaxed">{intro}</p>
      )}

      <div className="mt-10 space-y-9">
        {sections.map((section, index) => (
          <section key={section.heading}>
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              {index + 1}. {section.heading}
            </h2>

            {section.paragraphs?.map((paragraph, i) => (
              <p key={i} className="text-gray-300 leading-relaxed mb-3">
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className="list-disc pl-6 text-gray-300 leading-relaxed space-y-1">
                {section.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-14 pt-6 border-t border-white/10 text-xs leading-relaxed text-gray-500">
        © {new Date().getFullYear()} {COMPANY_LEGAL_NAME}. All rights reserved. This
        document is provided for general informational purposes only and does
        not constitute legal advice. For questions about this policy, contact
        {COMPANY_LEGAL_NAME} at {COMPANY_SUPPORT_EMAIL}.
      </p>
    </article>
  );
}
