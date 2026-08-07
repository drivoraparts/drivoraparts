import TranslatedText from "@/components/i18n/TranslatedText";

/** Prominent, always-visible fitment callout — the real fitment text, not buried in an accordion. */
export default function CompatibilityHighlight({
  fitment,
  drivetrain,
}: {
  fitment?: string;
  drivetrain?: string;
}) {
  if (!fitment) return null;

  return (
    <div className="mt-4 rounded-sm border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">
        Confirmed Compatibility
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-emerald-950">
        <TranslatedText as="span">{fitment}</TranslatedText>
      </p>
      {drivetrain ? (
        <p className="mt-2 text-xs font-semibold text-emerald-700">
          Drivetrain: <TranslatedText as="span">{drivetrain}</TranslatedText>
        </p>
      ) : null}
    </div>
  );
}
