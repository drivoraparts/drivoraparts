"use client";

import CartContents from "@/components/cart/CartContents";

type CartDrawerProps = {
  onClose?: () => void;
};

export default function CartDrawer({ onClose }: CartDrawerProps) {
  return <CartContents variant="drawer" onClose={onClose} />;
}
