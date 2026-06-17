export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { amount, orderId } = body;

    return Response.json({
      result: {
        url: `https://example-checkout.com/${orderId}`,
      },
    });
  } catch (err) {
    return Response.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}