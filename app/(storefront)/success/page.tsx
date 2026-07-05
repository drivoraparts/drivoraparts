import SuccessStatus from "./SuccessStatus";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Order Confirmed",
  description: "Your DrivoraParts order confirmation.",
  path: "/success",
  noIndex: true,
});

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; NP_id?: string }>;
}) {
  const params = await searchParams;
  return (
    <SuccessStatus
      orderId={params.orderId ?? null}
      npPaymentId={params.NP_id ?? null}
    />
  );
}
