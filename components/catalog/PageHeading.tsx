export default function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-10">
      <h1 className="inline-block border-b-2 border-red-600 pb-2 text-3xl font-bold text-neutral-900">
        {title}
      </h1>

      {subtitle ? <p className="mt-4 text-sm text-neutral-500">{subtitle}</p> : null}
    </header>
  );
}
