export async function checkout(items: any[], total: number) {
  const orderId = "DRV-" + Date.now();

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: total,
      orderId,
    }),
  });

  const data = await res.json();

  if (data?.result?.url) {
    window.location.href = data.result.url;
  }
}