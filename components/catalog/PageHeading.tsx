/* =========================================================
   UNIFIED PAGE HEADING (ONE HEADER SYSTEM)
   ---------------------------------------------------------
   White title text with a red underline accent only.
   No colored headers anywhere.
========================================================= */

export default function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-10">
      <h1 className="inline-block text-3xl font-bold text-white border-b-2 border-red-600 pb-2">
        {title}
      </h1>

      {subtitle && <p className="text-sm text-gray-400 mt-4">{subtitle}</p>}
    </header>
  );
}
