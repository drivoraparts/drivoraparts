type Props = {
  show: boolean;
};

export default function DataDegradedBanner({ show }: Props) {
  if (!show) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      Dashboard temporarily unavailable — retrying data sources. Showing safe fallback
      metrics until Supabase analytics and orders data are reachable.
    </div>
  );
}
