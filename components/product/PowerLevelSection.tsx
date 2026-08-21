"use client";

export type ProSpecSection = {
  label: string;
  values: string[];
  /**
   * Richer alternative to `values` for figures that need qualifying. Power is
   * the case that matters: a factory rating and a build target look identical
   * as two bare pills, and the second one has to carry the condition attached
   * to it or it reads as a second thing being sold.
   */
  options?: { title: string; caption: string; emphasis?: boolean }[];
};

type PowerLevelSectionProps = {
  sections: ProSpecSection[];
};

function SpecPill({
  value,
  active = true,
}: {
  value: string;
  active?: boolean;
}) {
  return (
    <span
      className={
        active
          ? "inline-flex min-h-[38px] items-center justify-center rounded-sm border border-neutral-800 bg-neutral-800 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white"
          : "inline-flex min-h-[38px] items-center justify-center rounded-sm border border-neutral-300 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-800"
      }
    >
      {value}
    </span>
  );
}

function SpecOption({
  title,
  caption,
  emphasis = false,
}: {
  title: string;
  caption: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex-1 basis-[13rem] rounded-sm border border-neutral-800 bg-neutral-800 px-4 py-3"
          : "flex-1 basis-[13rem] rounded-sm border border-neutral-300 bg-white px-4 py-3"
      }
    >
      <p
        className={
          emphasis
            ? "text-[11px] font-bold uppercase tracking-[0.1em] text-white/70"
            : "text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500"
        }
      >
        {caption}
      </p>
      <p
        className={
          emphasis
            ? "mt-1 text-sm font-bold text-white"
            : "mt-1 text-sm font-bold text-neutral-900"
        }
      >
        {title}
      </p>
    </div>
  );
}

export default function PowerLevelSection({ sections }: PowerLevelSectionProps) {
  const visible = sections.filter(
    (section) =>
      section.options?.length ||
      section.values.some((value) => value.trim().length > 0)
  );

  if (visible.length === 0) return null;

  return (
    <div className="space-y-5 border-t border-neutral-200 pt-5">
      {visible.map((section) => (
        <div key={section.label}>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
            {section.label}
          </p>
          {section.options?.length ? (
            <div className="flex flex-wrap gap-2.5">
              {section.options.map((option) => (
                <SpecOption
                  key={option.title}
                  title={option.title}
                  caption={option.caption}
                  emphasis={option.emphasis}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {section.values
                .filter((value) => value.trim().length > 0)
                .map((value, index) => (
                  <SpecPill key={`${section.label}-${value}`} value={value} active={index === 0} />
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
