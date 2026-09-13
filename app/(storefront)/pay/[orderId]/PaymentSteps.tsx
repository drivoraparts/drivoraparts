import {
  MANUAL_STATE_LABELS,
  type ManualPaymentState,
} from "@/lib/payments/manual-methods";

/*
 * The "Payment progress" stepper on /pay.
 *
 * Drawn with exactly the markers, connectors and colours of the Track Order
 * timeline (StepMarker, StepConnector and TONE_STYLES in
 * components/orders/TrackOrderForm.tsx), so a customer sees one stepper across
 * the site. Those pieces are private to that file; they are copied here rather
 * than exported from it so the Track Order page stays untouched. Change one,
 * change both.
 *
 * Only the look is shared. Which step is done or current still comes straight
 * from the manual-payment state, exactly as before -- and, as on Track Order,
 * the last step reached is the "current" one. The exception is Payment
 * Verified: see `finished` below.
 */

/** The happy path, in order. verification_failed is an aside, not a step. */
const STEPS: ManualPaymentState[] = [
  "awaiting_payment",
  "instructions_sent",
  "receipt_submitted",
  "under_review",
  "verified",
];

type StepState = "completed" | "current" | "upcoming";

// Track Order's green and neutral tones. Its amber and red are for shipment
// holds and delivery exceptions, which a payment never has.
type Tone = "green" | "neutral";

const TONE_STYLES: Record<Tone, { bg: string; text: string; border: string }> = {
  green: { bg: "bg-success", text: "text-success", border: "border-success" },
  neutral: { bg: "bg-neutral-300", text: "text-neutral-400", border: "border-neutral-300" },
};

function toneFor(state: StepState): Tone {
  return state === "upcoming" ? "neutral" : "green";
}

function StepMarker({ state, tone }: { state: StepState; tone: Tone }) {
  const styles = TONE_STYLES[tone];
  if (state === "completed") {
    return (
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${styles.bg} text-[10px] font-bold text-white`}
      >
        ✓
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className={`absolute inset-0 animate-spin rounded-full border-[3px] border-t-transparent ${styles.border}`} />
        <span className={`relative h-2 w-2 rounded-full ${styles.bg}`} />
      </span>
    );
  }
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-300 bg-white" />;
}

function StepConnector({ tone }: { tone: Tone }) {
  const styles = TONE_STYLES[tone];
  return (
    <div className="relative w-0.5 flex-1 self-stretch">
      <div className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 ${styles.bg} opacity-40`} />
      <svg
        viewBox="0 0 12 12"
        className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 ${styles.text}`}
        fill="currentColor"
      >
        <path d="M6 9 2 4h8z" />
      </svg>
    </div>
  );
}

export default function PaymentSteps({ state }: { state: ManualPaymentState }) {
  const failed = state === "verification_failed";
  const activeIndex = failed
    ? STEPS.indexOf("receipt_submitted")
    : STEPS.indexOf(state);

  // Verified is the finish line, not a step in progress: it gets a tick like
  // everything before it, never the spinner, which would read as still loading.
  const finished = state === "verified";

  const states: StepState[] = STEPS.map((_, index) =>
    index < activeIndex || finished
      ? "completed"
      : index === activeIndex && !failed
        ? "current"
        : "upcoming"
  );

  return (
    <ol>
      {STEPS.map((step, index) => {
        const isLast = index === STEPS.length - 1;
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepMarker state={states[index]} tone={toneFor(states[index])} />
              {/* Coloured by the step it leads to, as on Track Order. */}
              {!isLast && <StepConnector tone={toneFor(states[index + 1])} />}
            </div>
            <div className={isLast ? "pb-0.5" : "pb-4"}>
              <p
                className={`text-sm font-medium ${
                  states[index] === "upcoming" ? "text-muted" : "text-neutral-900"
                }`}
              >
                {MANUAL_STATE_LABELS[step]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
