import SuccessStatus from "./SuccessStatus";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  return <SuccessStatus orderId={orderId ?? null} />;
}
