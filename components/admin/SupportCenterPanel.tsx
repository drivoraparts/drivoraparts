"use client";

import { useState } from "react";

type SupportMessage = {
  id: string;
  customer_email: string;
  customer_name: string | null;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  admin_reply: string | null;
  created_at: string;
};

export default function SupportCenterPanel({
  initialMessages,
}: {
  initialMessages: SupportMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialMessages[0]?.id ?? null
  );
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<SupportMessage["status"]>("in_progress");
  const [loading, setLoading] = useState(false);

  const selected = messages.find((message) => message.id === selectedId);

  async function saveUpdate() {
    if (!selected) return;
    setLoading(true);

    const res = await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id,
        status,
        adminReply: reply,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setMessages((current) =>
        current.map((message) => (message.id === updated.id ? updated : message))
      );
    }

    setLoading(false);
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
        <h2 className="mb-4 text-lg font-bold">Inbox</h2>
        <div className="max-h-[560px] space-y-2 overflow-y-auto">
          {messages.map((message) => (
            <button
              key={message.id}
              type="button"
              onClick={() => {
                setSelectedId(message.id);
                setReply(message.admin_reply ?? "");
                setStatus(message.status);
              }}
              className={`w-full rounded-lg border px-4 py-3 text-left ${
                selectedId === message.id
                  ? "border-red-500/40 bg-white/[0.08]"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <p className="font-medium">{message.subject}</p>
              <p className="text-xs text-gray-400">{message.customer_email}</p>
              <p className="mt-1 text-xs capitalize text-gray-500">{message.status}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
        {selected ? (
          <>
            <h2 className="text-xl font-bold">{selected.subject}</h2>
            <p className="mt-2 text-sm text-gray-400">
              {selected.customer_name ?? "Customer"} — {selected.customer_email}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-sm text-gray-200">
              {selected.message}
            </p>

            <div className="mt-6 space-y-4">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as SupportMessage["status"])
                }
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm capitalize"
              >
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="resolved">resolved</option>
                <option value="closed">closed</option>
              </select>

              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={5}
                placeholder="Admin reply..."
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-red-500"
              />

              <button
                type="button"
                disabled={loading}
                onClick={saveUpdate}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Update"}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Select a support message.</p>
        )}
      </section>
    </div>
  );
}
