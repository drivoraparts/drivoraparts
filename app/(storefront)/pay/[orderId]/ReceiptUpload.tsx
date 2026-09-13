"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

/**
 * Customer-side proof-of-payment upload.
 *
 * Accepts several files at once (a transfer often produces a confirmation page
 * and a receipt), shows what is selected before sending, and never claims the
 * order is paid -- submitting only tells DrivoraParts the customer says they
 * have paid.
 */
export default function ReceiptUpload({
  orderId,
  disabled,
}: {
  orderId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const pick = (list: FileList | null) => {
    if (!list) return;
    setError("");
    setFiles((current) => [...current, ...Array.from(list)].slice(0, 5));
  };

  const removeAt = (index: number) =>
    setFiles((current) => current.filter((_, i) => i !== index));

  const submit = async () => {
    if (!files.length) {
      setError("Please add at least one receipt image.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("orderId", orderId);
      if (note.trim()) body.set("note", note.trim());
      files.forEach((file) => body.append("receipts", file));

      const res = await fetch("/api/public/receipt-upload", {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setDone(true);
      setFiles([]);
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
        <p className="font-semibold">Receipt received — thank you.</p>
        <p className="mt-1 text-emerald-700">
          Our team will verify your payment and update this page. You will get an
          email as soon as it is confirmed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy || files.length >= 5}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 px-4 py-8 text-center transition hover:border-accent hover:bg-accent-subtle/40 disabled:opacity-50"
      >
        <span className="text-2xl leading-none text-neutral-400">+</span>
        <span className="text-sm font-medium text-neutral-700">
          Add payment receipt
        </span>
        <span className="text-[11px] text-neutral-500">
          JPG, PNG, WEBP, HEIC or PDF · up to 5 files · max 10MB each
        </span>
      </button>

      {files.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2"
            >
              {/*
                Name and size as siblings, so only the name truncates. The size
                used to sit inside the truncating span, where a long filename
                pushed it past the ellipsis and out of view.
              */}
              <span className="flex min-w-0 items-baseline gap-2 text-xs">
                <span className="min-w-0 truncate text-neutral-700">
                  {file.name}
                </span>
                <span className="shrink-0 text-neutral-400">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={busy}
                className="shrink-0 text-xs font-medium text-neutral-500 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <label className="mt-3 block text-xs font-medium text-neutral-700">
        Message (optional)
      </label>
      <textarea
        value={note}
        disabled={busy}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="e.g. Transfer sent this morning from my Chase account, reference DRV-…"
        className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
      />

      <button
        type="button"
        onClick={submit}
        disabled={disabled || busy || !files.length}
        className="mt-3 w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send payment receipt"}
      </button>

      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
          Submitting a receipt tells us you have paid. Your order is confirmed
          only after DrivoraParts verifies the funds have arrived.
        </p>
      )}
    </div>
  );
}
