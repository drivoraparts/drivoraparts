import SuccessStatus from "./SuccessStatus";

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
