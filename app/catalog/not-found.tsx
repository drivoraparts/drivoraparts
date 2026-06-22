import Link from "next/link";

export default function CatalogNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center text-white">
      <h1 className="text-2xl font-semibold">Catalog page not found</h1>
      <p className="max-w-md text-sm text-gray-400">
        The catalog section you&apos;re looking for doesn&apos;t exist or has
        moved.
      </p>
      <Link
        href="/catalog"
        className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
      >
        Browse all categories
      </Link>
    </main>
  );
}
