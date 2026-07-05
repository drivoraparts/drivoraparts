import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Checkout",
  description: "Secure checkout for your DrivoraParts order.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
