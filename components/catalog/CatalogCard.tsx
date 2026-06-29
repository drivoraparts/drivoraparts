import Link from "next/link";

export default function CatalogCard({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group relative overflow-hidden
        rounded-xl border border-neutral-200 bg-white p-4
        transition-all duration-300 active:scale-95
        hover:border-red-500 hover:shadow-md
      "
    >
      <div className="absolute inset-0 bg-red-500/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      <div className="relative text-neutral-900">{children}</div>

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-600 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
