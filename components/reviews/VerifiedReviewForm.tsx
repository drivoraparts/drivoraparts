"use client";

import Link from "next/link";
import { useState } from "react";
import type { ChoiceOption, QuestionSet, ReviewAnswers, ReviewQuestion } from "@/lib/reviews/questions";

const MIN_LENGTH = 40;

const fieldset = "mt-8 border-t border-border pt-6";
const legend = "text-xs font-semibold uppercase tracking-[0.16em] text-muted";
const label = "block text-sm font-semibold text-foreground";
const input =
  "mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none";

function ChoiceGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: ChoiceOption[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`min-h-10 rounded-md border px-3 text-sm transition-colors ${
              selected
                ? "border-foreground bg-foreground text-white"
                : "border-border bg-white text-foreground hover:border-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function VerifiedReviewForm({
  token,
  questionSets,
  installedByOptions,
  productHref,
}: {
  token: string;
  questionSets: QuestionSet[];
  installedByOptions: ChoiceOption[];
  productHref: string;
}) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [installedBy, setInstalledBy] = useState<string>();
  const [wouldBuyAgain, setWouldBuyAgain] = useState<string>();
  const [answers, setAnswers] = useState<ReviewAnswers>({});
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const setAnswer = (key: string, value: string | string[] | number | undefined) =>
    setAnswers((current) => {
      const next = { ...current };
      if (value === undefined || (Array.isArray(value) && value.length === 0)) delete next[key];
      else next[key] = value;
      return next;
    });

  const isVisible = (question: ReviewQuestion) =>
    !question.showIf ||
    (typeof answers[question.showIf.key] === "string" &&
      question.showIf.values.includes(answers[question.showIf.key] as string));

  if (state === "done") {
    return (
      <div className="mt-10 rounded-lg border border-border bg-surface-muted p-6">
        <p className="text-lg font-bold text-foreground">Thank you. Your review has been received.</p>
        <p className="mt-2 text-sm text-muted">
          It will appear on the product page once it has been checked for personal details and spam.
        </p>
        <Link href={productHref} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
          Back to the part
        </Link>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (rating < 1) return setError("Choose a star rating.");
    if (review.trim().length < MIN_LENGTH) {
      return setError(`Please write at least ${MIN_LENGTH} characters about the part.`);
    }
    setState("busy");
    const res = await fetch("/api/reviews/verified", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        token,
        rating,
        review,
        vehicle,
        installedBy,
        wouldBuyAgain: wouldBuyAgain === "yes" ? true : wouldBuyAgain === "no" ? false : null,
        answers,
      }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { error?: string } | null;
    if (res?.ok) {
      setState("done");
    } else {
      setState("idle");
      setError(data?.error ?? "We couldn't save your review. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6">
      <fieldset className={fieldset}>
        <legend className={legend}>Your rating</legend>
        <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              className={`text-3xl leading-none ${star <= rating ? "text-[#F5C542]" : "text-border-strong"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={fieldset}>
        <legend className={legend}>Your vehicle</legend>
        <label className={`${label} mt-3`}>
          Which vehicle did it go on?
          <input
            className={input}
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="e.g. 2016 Tacoma 3.5L 4x4"
            maxLength={80}
          />
        </label>
        <p className={`${label} mt-5`}>Who installed it?</p>
        <ChoiceGroup name="Who installed it" options={installedByOptions} value={installedBy} onChange={setInstalledBy} />
      </fieldset>

      {questionSets.map((set) => (
        <fieldset key={set.id} className={fieldset}>
          <legend className={legend}>{set.title}</legend>
          {set.questions.filter(isVisible).map((question) => (
            <div key={question.key} className="mt-5">
              <p className={label}>
                {question.label}
                {question.required ? null : <span className="ml-1 font-normal text-muted">(optional)</span>}
              </p>
              {question.type === "choice" ? (
                <ChoiceGroup
                  name={question.label}
                  options={question.options ?? []}
                  value={answers[question.key] as string | undefined}
                  onChange={(value) => setAnswer(question.key, value)}
                />
              ) : question.type === "multi" ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(question.options ?? []).map((option) => {
                    const current = (answers[question.key] as string[] | undefined) ?? [];
                    const checked = current.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm ${
                          checked ? "border-foreground bg-surface-muted" : "border-border"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setAnswer(
                              question.key,
                              checked ? current.filter((v) => v !== option.value) : [...current, option.value]
                            )
                          }
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              ) : question.type === "number" ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min={question.min}
                    max={question.max}
                    className={`${input} mt-0 max-w-32`}
                    value={(answers[question.key] as number | undefined) ?? ""}
                    onChange={(e) => setAnswer(question.key, e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                  {question.unit ? <span className="text-sm text-muted">{question.unit}</span> : null}
                </div>
              ) : (
                <input
                  className={input}
                  maxLength={question.maxLength}
                  value={(answers[question.key] as string | undefined) ?? ""}
                  onChange={(e) => setAnswer(question.key, e.target.value || undefined)}
                />
              )}
            </div>
          ))}
        </fieldset>
      ))}

      <fieldset className={fieldset}>
        <legend className={legend}>Your review</legend>
        <label className={`${label} mt-3`}>
          What should other Toyota owners know?
          <textarea
            className={`${input} min-h-36`}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={4000}
            placeholder="How it fit, what the install took, how it's held up. Please don't include phone numbers, addresses or your VIN."
          />
        </label>
        <p className="mt-1 text-xs text-muted">{Math.max(0, MIN_LENGTH - review.trim().length) || "✓"} {review.trim().length < MIN_LENGTH ? "more characters needed" : ""}</p>
        <p className={`${label} mt-5`}>Would you buy it again?</p>
        <ChoiceGroup
          name="Would you buy it again"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={wouldBuyAgain}
          onChange={setWouldBuyAgain}
        />
      </fieldset>

      {error ? (
        <p role="alert" className="mt-6 rounded-md border border-error bg-error-subtle px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state === "busy"}
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 text-sm font-bold uppercase tracking-wider text-white hover:bg-accent-hover disabled:opacity-60 sm:w-auto"
      >
        {state === "busy" ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
