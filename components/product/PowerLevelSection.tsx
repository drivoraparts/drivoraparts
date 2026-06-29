"use client";

export type ProSpecSection = {
  label: string;
  values: string[];
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

export default function PowerLevelSection({ sections }: PowerLevelSectionProps) {
  const visible = sections.filter((section) =>
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
          <div className="flex flex-wrap gap-2">
            {section.values
              .filter((value) => value.trim().length > 0)
              .map((value, index) => (
                <SpecPill key={`${section.label}-${value}`} value={value} active={index === 0} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
