"use client";

import { useState, type FormEvent } from "react";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";
import { showToast } from "@/lib/store/toastStore";

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "order", label: "Order status or tracking" },
  { value: "fitment", label: "Product or fitment help" },
  { value: "returns", label: "Returns or refunds" },
  { value: "business", label: "Business or partnership" },
] as const;

const inputClass =
  "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

type ContactFormProps = {
  defaultTopic?: (typeof TOPICS)[number]["value"];
  requireOrderId?: boolean;
};

export default function ContactForm({
  defaultTopic = "general",
  requireOrderId = false,
}: ContactFormProps = {}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] =
    useState<(typeof TOPICS)[number]["value"]>(defaultTopic);
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedMessage = message.trim();
    if (!name.trim() || !email.trim() || trimmedMessage.length < 10) {
      showToast("Please fill in your name, email, and a message (at least 10 characters).");
      return;
    }

    if (requireOrderId && !orderId.trim()) {
      showToast("Please enter your order ID so we can look up your order.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          orderId: orderId.trim() || undefined,
          message: trimmedMessage,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        showToast(data.error ?? "Unable to send message. Please try again.");
        return;
      }

      setSent(true);
      showToast("Message sent — we'll get back to you soon.");
    } catch {
      showToast("Unable to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">Message received</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Thanks for reaching out. Our support team will reply to{" "}
          <span className="font-medium text-neutral-900">{email}</span> as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setMessage("");
            setOrderId("");
          }}
          className="mt-4 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-neutral-200 bg-neutral-50 p-6"
    >
      <h2 className="mb-1 text-xl font-semibold text-neutral-900">Send us a message</h2>
      <p className="mb-6 text-sm text-neutral-600">
        Tell us what you need — orders, fitment, returns, or general help. We typically reply
        within 1–2 business days.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium text-neutral-700">
            Name <span className="text-accent">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="text-sm font-medium text-neutral-700">
            Email <span className="text-accent">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-topic" className="text-sm font-medium text-neutral-700">
            Topic
          </label>
          <select
            id="contact-topic"
            name="topic"
            value={topic}
            onChange={(e) =>
              setTopic(e.target.value as (typeof TOPICS)[number]["value"])
            }
            className={inputClass}
          >
            {TOPICS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-order" className="text-sm font-medium text-neutral-700">
            Order ID{" "}
            {requireOrderId ? (
              <span className="text-accent">*</span>
            ) : (
              <span className="font-normal text-neutral-500">(optional)</span>
            )}
          </label>
          <input
            id="contact-order"
            name="orderId"
            type="text"
            required={requireOrderId}
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="If this is about an order"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className="text-sm font-medium text-neutral-700">
          Message <span className="text-accent">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help? Include part numbers, vehicle details, or order questions if relevant."
          className={`${inputClass} resize-y min-h-[144px]`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {submitting ? "Sending..." : "Send message"}
      </button>

      <p className="mt-4 text-xs text-neutral-500">
        Prefer email? Write to{" "}
        <a
          href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
          className="text-accent hover:text-accent-hover"
        >
          {COMPANY_SUPPORT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}
