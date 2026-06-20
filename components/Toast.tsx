"use client";

import { useToastStore } from "@/lib/store/toastStore";

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[10003] flex flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className="rounded-lg bg-[#111827] border border-white/10 px-4 py-3 text-sm text-white shadow-lg"
        >
          {toast.text}
        </button>
      ))}
    </div>
  );
}
