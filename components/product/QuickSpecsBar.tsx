"use client";

type QuickSpecsBarProps = {
  horsepower?: string;
  mileage: string;
  condition: string;
  warranty: string;
};

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-white/10 bg-black/25 px-2.5 py-2">
      <span className="block text-[13px] font-bold leading-snug text-white">{value}</span>
      <span className="block text-[10px] uppercase tracking-wider text-white/50">{label}</span>
    </div>
  );
}

export default function QuickSpecsBar({
  horsepower,
  mileage,
  condition,
  warranty,
}: QuickSpecsBarProps) {
  return (
    <div className="mt-3.5 grid grid-cols-2 gap-2.5 rounded-[10px] border border-white/10 bg-white/[0.04] p-3 md:grid-cols-4">
      {horsepower ? <SpecItem label="Horsepower" value={horsepower} /> : null}
      <SpecItem label="Mileage" value={mileage} />
      <SpecItem label="Condition" value={condition} />
      <SpecItem label="Warranty" value={warranty} />
    </div>
  );
}
