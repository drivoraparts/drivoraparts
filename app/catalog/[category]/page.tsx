export async function generateStaticParams() {
  return [
    { category: "engines" },
    { category: "brakes" },
    { category: "suspension" },
    { category: "turbochargers" },
    { category: "electronics" },
    { category: "transmissions" },
    { category: "headlights" },
    { category: "interiors" },
    { category: "body-parts" },
  ];
}