import Script from "next/script";

type Props = {
  measurementId: string | null;
};

/** GA4 — no-ops until NEXT_PUBLIC_GA_MEASUREMENT_ID is set. */
export default function GoogleAnalytics({ measurementId }: Props) {
  const id = measurementId?.trim();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
