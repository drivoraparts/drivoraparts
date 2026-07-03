/** NOWPayments partner mark — bundled asset from public/trust/nowpayments-mark.svg */
export default function NowPaymentsMark({
  className = "h-9 w-auto",
}: {
  className?: string;
}) {
  return (
    <img
      src="/trust/nowpayments-mark.svg"
      alt="Crypto payments powered by NOWPayments"
      width={160}
      height={40}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
