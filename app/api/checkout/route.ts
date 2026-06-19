export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();

  const { amount, orderId } = body;

  // replace with your BTC provider (NOWPayments / Coinbase Commerce / BTCPay)
  const response = await fetch("YOUR_BTC_API_ENDPOINT", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer YOUR_API_KEY`,
    },
    body: JSON.stringify({
      price_amount: amount,
      order_id: orderId,
    }),
  });

  const data = await response.json();

  return Response.json({ result: data });
}