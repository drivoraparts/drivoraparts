"use client";

import { useState } from "react";

export default function ReviewOptOutButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  if (state === "done") {
    return <p className="mt-8 font-semibold text-success">Done. We won&apos;t ask you for reviews again.</p>;
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        disabled={state === "busy" || !token}
        onClick={async () => {
          setState("busy");
          const res = await fetch("/api/reviews/opt-out", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token }),
          }).catch(() => null);
          setState(res?.ok ? "done" : "error");
        }}
        className="inline-flex min-h-11 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-white disabled:opacity-60"
      >
        {state === "busy" ? "Working…" : "Stop review requests"}
      </button>
      {state === "error" ? (
        <p className="mt-4 text-sm text-error">That didn&apos;t work. Please email support@drivoraparts.com and we&apos;ll do it for you.</p>
      ) : null}
    </div>
  );
}
