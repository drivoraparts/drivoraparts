type JsonLdPayload = Record<string, unknown> | Record<string, unknown>[] | null | undefined;

export default function JsonLdScript({ data }: { data: JsonLdPayload }) {
  if (!data) return null;

  const items = (Array.isArray(data) ? data : [data]).filter(Boolean) as Record<
    string,
    unknown
  >[];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
