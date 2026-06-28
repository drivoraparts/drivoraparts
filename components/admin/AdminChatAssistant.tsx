"use client";

import { useEffect, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AdminChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Show revenue and conversion",
    "How many live users are online?",
    "What products need restock?",
    "Revenue optimization suggestions",
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Drivora business operator AI online. Ask about live users, revenue, orders, inventory, suppliers, pricing, or payments.",
    },
  ]);

  useEffect(() => {
    fetch("/api/admin/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.supabaseConfigured === "boolean") {
          setSupabaseConfigured(data.supabaseConfigured);
          if (!data.supabaseConfigured) {
            setMessages([
              {
                role: "assistant",
                content:
                  "Supabase is not connected yet, so I cannot report live revenue or orders. Ask how to connect the database, whether NOWPayments is configured, or what still works without Supabase.",
              },
            ]);
            setSuggestions([
              "How do I connect Supabase?",
              "Is NOWPayments configured?",
              "What works without Supabase?",
            ]);
          }
        }
      })
      .catch(() => {
        setSupabaseConfigured(null);
      });
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              typeof data.error === "string"
                ? data.error
                : "Assistant request failed. Try again or reload the page.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "No response available." },
      ]);

      if (Array.isArray(data.suggestions) && data.suggestions.length) {
        setSuggestions(data.suggestions);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Assistant unavailable right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 max-w-[calc(100vw-3rem)]">
      {open ? (
        <div className="pointer-events-auto mb-3 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Business Operator AI</p>
              <p className="text-xs text-zinc-600">
                {supabaseConfigured === false
                  ? "Setup mode — database not connected"
                  : "Live ops · revenue · inventory"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-zinc-600 hover:text-zinc-900"
            >
              ✕
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg px-3 py-2 ${
                  message.role === "assistant"
                    ? "bg-white shadow-sm border border-zinc-200 text-zinc-700"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          {suggestions.length ? (
            <div className="flex flex-wrap gap-2 border-t border-zinc-200 px-3 py-2">
              {suggestions.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:border-red-500/40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="flex gap-2 border-t border-zinc-200 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about sales, stock, suppliers..."
              className="flex-1 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto rounded-full bg-red-600 px-5 py-3 text-sm font-bold shadow-lg"
      >
        {open ? "Close Assistant" : "AI Assistant"}
      </button>
    </div>
  );
}
