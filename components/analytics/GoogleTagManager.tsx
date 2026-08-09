import Script from "next/script";

type Props = {
  containerId: string | null;
};

/** GTM head script — belongs right after <body> opens per Google's install
 * instructions, paired with GoogleTagManagerNoScript. No-ops until
 * NEXT_PUBLIC_GTM_CONTAINER_ID is set. */
export default function GoogleTagManager({ containerId }: Props) {
  const id = containerId?.trim();
  if (!id) return null;

  return (
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${id}');
      `}
    </Script>
  );
}
