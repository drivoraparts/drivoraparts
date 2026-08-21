import TranslatedText from "@/components/i18n/TranslatedText";

/** Prominent, always-visible fitment callout — the real fitment text, not buried in an accordion. */
export default function CompatibilityHighlight({
  fitment,
  drivetrain,
  /**
   * "Confirmed Compatibility" is right for a part with a defined fitment list.
   * A swap package has no such list — the same engine fits one chassis
   * directly and another only with fabrication — so those listings pass
   * "Swap Compatibility" instead of promising something they cannot.
   */
  label = "Confirmed Compatibility",
}: {
  fitment?: string;
  drivetrain?: string;
  label?: string;
}) {
  if (!fitment) return null;

  return (
    <div className="mt-4 rounded-sm border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">
        {label}
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
