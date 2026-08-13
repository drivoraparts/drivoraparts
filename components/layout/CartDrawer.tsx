"use client";

import CartContents from "@/components/cart/CartContents";
import SideDrawer from "./SideDrawer";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/hooks/useTranslation";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  // Same Zustand store the drawer contents and /cart page read — this is a
  // display read for the header count, not a second source of cart state.
  const { getItemCount } = useCart();
  const { t } = useTranslation();
  const itemCount = getItemCount();

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      side="right"
      title={t("cart")}
      closeLabel="Close cart"
      headerAside={
        itemCount > 0 ? (
          <span className="text-xs font-medium text-neutral-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        ) : null
      }
    >
      <CartContents variant="drawer" onClose={onClose} />
    </SideDrawer>
  );
}
