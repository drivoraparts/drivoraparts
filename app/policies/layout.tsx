/* =========================================================
   SHARED POLICY LAYOUT
   ---------------------------------------------------------
   Wraps every /policies page with a consistent, readable
   legal-document shell: centered max-width container,
   mobile-safe padding, dark theme, comfortable spacing.
========================================================= */

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="storefront-page min-h-screen bg-[var(--background)] text-neutral-900">
      <div className="mx-auto w-full max-w-4xl px-6 py-16 md:py-24 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
