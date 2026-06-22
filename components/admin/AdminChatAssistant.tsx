"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AdminChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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

      const data = await res.json();
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
    <div className="fixed bottom-6 left-6 z-[10000]">
      {open ? (
        <div className="mb-3 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]/95 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Business Operator AI</p>
              <p className="text-xs text-gray-400">Live ops · revenue · inventory</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white"
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
                    ? "bg-white/[0.06] text-gray-200"
                    : "bg-red-600/20 text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          {suggestions.length ? (
            <div className="flex flex-wrap gap-2 border-t border-white/10 px-3 py-2">
              {suggestions.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-red-500/40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about sales, stock, suppliers..."
              className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-red-500"
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
        className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold shadow-lg"
      >
        {open ? "Close Assistant" : "AI Assistant"}
      </button>
    </div>
  );
}
