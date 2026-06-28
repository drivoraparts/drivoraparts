import Link from "next/link";
import { adminUi } from "./admin-ui";

type Props = {
  show: boolean;
};

export default function DataDegradedBanner({ show }: Props) {
  if (!show) return null;

  return (
    <div className={`mb-6 ${adminUi.warningBox}`}>
      <p className="font-semibold">Analytics database not connected</p>
      <p className="mt-2 text-sm">
        Supabase is not configured in your Cloudflare environment, so revenue, orders,
        and AI insights show safe placeholder values (zeros). The storefront still works;
        this is not a temporary outage or retry loop.
      </p>
      <Link
        href="/admin/settings/system"
        className="mt-3 inline-block text-sm font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-950"
      >
        Open Supabase setup checklist in System Settings
      </Link>
    </div>
  );
}
