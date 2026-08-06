"use client";

function openLiveChat() {
  if (typeof window === "undefined") return;
  window.Tawk_API?.showWidget?.();
  window.Tawk_API?.maximize?.();
}

/** Fitment confidence badge + live-chat callout shown next to Add to Cart. */
export default function FitmentAssuranceCallout() {
  return (
    <div className="mt-4 space-y-2.5">
      <div className="flex items-center gap-2 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
        Guaranteed Fitment Check — verified against your vehicle before it ships.
      </div>

      <button
        type="button"
        onClick={openLiveChat}
        className="flex w-full items-center justify-center gap-2 rounded-sm border border-neutral-300 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-red-300 hover:text-red-700"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10c0 3.866-3.582 7-8 7a9.06 9.06 0 01-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C2.87 13.256 2 11.723 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
            clipRule="evenodd"
          />
        </svg>
        Not sure it fits? Chat with a parts specialist
      </button>
    </div>
  );
}
