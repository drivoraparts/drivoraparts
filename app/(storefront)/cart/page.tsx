import CartPageView from "@/components/cart/CartPageView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Your Cart",
  description:
    "Review items in your DrivoraParts cart, adjust quantities, and proceed to secure checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageView />;
}
