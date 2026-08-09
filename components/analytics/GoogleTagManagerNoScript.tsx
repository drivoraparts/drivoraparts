type Props = {
  containerId: string | null;
};

/** GTM's noscript fallback -- Google's install instructions require this as
 * literally the first element after <body> opens, paired with the head
 * script in GoogleTagManager. No-ops until NEXT_PUBLIC_GTM_CONTAINER_ID is
 * set. */
export default function GoogleTagManagerNoScript({ containerId }: Props) {
  const id = containerId?.trim();
  if (!id) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
