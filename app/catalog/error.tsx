"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[catalog] render error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center text-white">
      <h1 className="text-2xl font-semibold">We hit a snag loading the catalog</h1>
      <p className="max-w-md text-sm text-gray-400">
        Something went wrong while rendering this page. You can retry or head
        back to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
