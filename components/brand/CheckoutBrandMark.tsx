export function CheckoutBrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white/95 p-0.5 ${className}`}
    >
      <img
        src="/brand/drivora-checkout.png"
        alt=""
        width={16}
        height={16}
        className="h-full w-full object-contain"
        decoding="async"
      />
    </span>
  );
}
