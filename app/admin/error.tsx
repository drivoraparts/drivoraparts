"use client";

import { useEffect } from "react";
import { adminUi } from "@/components/admin/admin-ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin:route-error]", error);
  }, [error]);

  return (
    <div className={`flex min-h-[50vh] items-center justify-center px-6 py-16 ${adminUi.page}`}>
      <div className={`max-w-lg text-center ${adminUi.card}`}>
        <h2 className="text-xl font-semibold text-zinc-900">Unable to load this page</h2>
        <p className={`mt-3 ${adminUi.muted}`}>
          {error.message || "An unexpected error occurred while loading this admin route."}
        </p>
        <button type="button" onClick={reset} className={`mt-6 ${adminUi.buttonPrimary}`}>
          Try again
        </button>
      </div>
    </div>
  );
}
