import { adminUi } from "./admin-ui";

type Props = {
  show: boolean;
};

export default function DataDegradedBanner({ show }: Props) {
  if (!show) return null;

  return (
    <div className={`mb-6 ${adminUi.warningBox}`}>
      Dashboard temporarily unavailable — retrying data sources. Showing safe fallback
      metrics until Supabase analytics and orders data are reachable.
    </div>
  );
}
