"use client";

import { useFormatPrice } from "@/hooks/useFormatPrice";

type PriceProps = {
  usd: number;
  className?: string;
};

export default function Price({ usd, className }: PriceProps) {
  const formatPrice = useFormatPrice();

  return (
    <span className={className} suppressHydrationWarning>
      {formatPrice(usd)}
    </span>
  );
}
