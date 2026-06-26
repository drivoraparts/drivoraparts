"use client";

import { useEffect } from "react";
import Link from "next/link";
import { routes } from "@/lib/inventory/routes";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[product] render error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center text-white">
      <h1 className="text-2xl font-semibold">
        We couldn&apos;t load this product
      </h1>
      <p className="max-w-md text-sm text-gray-400">
        Something went wrong while opening this product page. Retry to reload
        this product, or return to the catalog.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          Try again
        </button>
        <Link
          href={routes.all}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Browse all products
        </Link>
      </div>
    </main>
  );
}
