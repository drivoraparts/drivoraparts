/* =========================================================
   REVIEW QUESTIONS BY PART TYPE
   ---------------------------------------------------------
   Stars alone say little about an auto part. What a buyer of
   the same part needs is: did it fit, what did it take, and
   (for used parts) was it as described. Each category gets a
   short set of structured questions; used and refurbished
   listings add a condition check.

   Plain data, shared by the form (client), the validator
   (server) and the review card (display), so the three can
   never disagree about what a question means. Answer values
   are stable keys stored in product_reviews.answers; labels
   can be reworded without touching stored reviews. A change
   to what a question ASKS gets a new set id (".v2").
========================================================= */

export type ChoiceOption = { value: string; label: string };

export type ReviewQuestion = {
  key: string;
  label: string;
  type: "choice" | "multi" | "number" | "text";
  options?: ChoiceOption[];
  required: boolean;
  help?: string;
  /** Asked only when another answer has one of these values. */
  showIf?: { key: string; values: string[] };
  min?: number;
  max?: number;
  unit?: string;
  maxLength?: number;
};

export type QuestionSet = {
  id: string;
  title: string;
  questions: ReviewQuestion[];
};

const INSPECTION: ReviewQuestion = {
  key: "inspection",
  label: "Did the vehicle pass a state safety inspection afterwards?",
  type: "choice",
  required: true,
  options: [
    { value: "passed", label: "Passed" },
    { value: "failed", label: "Failed" },
    { value: "not_yet", label: "Not inspected yet" },
    { value: "not_required", label: "Not required in my state" },
  ],
};

const INSPECTION_STATE: ReviewQuestion = {
  key: "inspection_state",
  label: "Which state?",
  type: "text",
  required: false,
  maxLength: 20,
  showIf: { key: "inspection", values: ["passed", "failed"] },
};

const DRIVELINE: QuestionSet = {
  id: "driveline.v1",
  title: "Fitment",
  questions: [
    {
      key: "fitment",
      label: "Did it bolt up?",
      type: "choice",
      required: true,
      options: [
        { value: "direct", label: "Bolted up directly" },
        { value: "minor_mods", label: "Needed minor modifications" },
        { value: "major_mods", label: "Needed major modifications" },
        { value: "not_installed", label: "Not installed yet" },
      ],
    },
    {
      key: "mods",
      label: "What did you have to change?",
      type: "multi",
      required: false,
      showIf: { key: "fitment", values: ["minor_mods", "major_mods"] },
      options: [
        { value: "harness", label: "Wiring harness" },
        { value: "mounts", label: "Engine / transmission mounts" },
        { value: "ecu", label: "ECU or tune" },
        { value: "flywheel", label: "Flywheel / flexplate" },
        { value: "cooling", label: "Cooling lines" },
        { value: "exhaust", label: "Exhaust" },
        { value: "other", label: "Something else" },
      ],
    },
    {
      key: "running",
      label: "Is it running now?",
      type: "choice",
      required: true,
      options: [
        { value: "yes", label: "Yes, running well" },
        { value: "issues", label: "Running, with issues" },
        { value: "no", label: "Not running" },
        { value: "not_installed", label: "Not installed yet" },
      ],
    },
  ],
};

const SUSPENSION: QuestionSet = {
  id: "suspension.v1",
  title: "Fitment",
  questions: [
    {
      key: "fitment",
      label: "How did it fit?",
      type: "choice",
      required: true,
      options: [
        { value: "direct", label: "Direct fit" },
        { value: "adjustment", label: "Needed adjustment" },
        { value: "fabrication", label: "Needed fabrication or welding" },
        { value: "not_installed", label: "Not installed yet" },
      ],
    },
    {
      key: "lift_achieved_in",
      label: "Lift you measured (if a lift kit)",
      type: "number",
      required: false,
      min: 0,
      max: 12,
      unit: "in",
    },
    {
      key: "alignment",
      label: "Could the alignment be set within spec?",
      type: "choice",
      required: false,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not_checked", label: "Not checked" },
      ],
    },
    INSPECTION,
    INSPECTION_STATE,
  ],
};

const BODY: QuestionSet = {
  id: "body.v1",
  title: "Fitment",
  questions: [
    {
      key: "fitment",
      label: "How did it mount?",
      type: "choice",
      required: true,
      options: [
        { value: "direct", label: "Bolted on directly" },
        { value: "drilling", label: "Needed drilling" },
        { value: "fabrication", label: "Needed fabrication or welding" },
        { value: "not_installed", label: "Not installed yet" },
      ],
    },
    {
      key: "sensors",
      label: "Do factory sensors, cameras and lights still work?",
      type: "choice",
      required: false,
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "not_applicable", label: "Not applicable" },
      ],
    },
    {
      key: "finish",
      label: "Finish on arrival",
      type: "choice",
      required: true,
      options: [
        { value: "as_described", label: "As described" },
        { value: "minor_flaws", label: "Minor flaws" },
        { value: "damaged", label: "Damaged" },
      ],
    },
    INSPECTION,
    INSPECTION_STATE,
  ],
};

const ELECTRICAL: QuestionSet = {
  id: "electrical.v1",
  title: "Installation",
  questions: [
    {
      key: "install",
      label: "How did it install?",
      type: "choice",
      required: true,
      options: [
        { value: "plug_and_play", label: "Plug and play" },
        { value: "splicing", label: "Needed splicing or adapters" },
        { value: "not_installed", label: "Not installed yet" },
      ],
    },
    {
      key: "errors",
      label: "Any warnings or errors?",
      type: "choice",
      required: true,
      options: [
        { value: "none", label: "None" },
        { value: "warning_lights", label: "Dash warnings / error codes" },
        { value: "hyperflash", label: "Hyper-flash" },
        { value: "not_installed", label: "Not installed yet" },
      ],
    },
  ],
};

const GENERAL: QuestionSet = {
  id: "general.v1",
  title: "Fitment",
  questions: [
    {
      key: "fitment",
      label: "How did it fit?",
      type: "choice",
      required: true,
      options: [
        { value: "direct", label: "Direct fit" },
        { value: "adjustment", label: "Needed adjustment" },
        { value: "fabrication", label: "Needed fabrication" },
        { value: "not_installed", label: "Not installed yet" },
      ],
    },
  ],
};

const CONDITION: QuestionSet = {
  id: "condition.v1",
  title: "Condition",
  questions: [
    {
      key: "wear_vs_description",
      label: "How did the condition compare with the listing?",
      type: "choice",
      required: true,
      options: [
        { value: "better", label: "Better than described" },
        { value: "as_described", label: "As described" },
        { value: "worse", label: "Worse than described" },
      ],
    },
    {
      key: "wear_detail",
      label: "What was different?",
      type: "text",
      required: true,
      maxLength: 500,
      showIf: { key: "wear_vs_description", values: ["worse"] },
    },
    {
      key: "mileage",
      label: "Was the stated mileage accurate?",
      type: "choice",
      required: false,
      options: [
        { value: "accurate", label: "Accurate" },
        { value: "higher", label: "Higher than stated" },
        { value: "could_not_check", label: "Could not check" },
      ],
    },
  ],
};

const SETS_BY_CATEGORY: Record<string, QuestionSet> = {
  engine: DRIVELINE,
  transmission: DRIVELINE,
  turbocharger: DRIVELINE,
  suspension: SUSPENSION,
  brakes: SUSPENSION,
  bumper: BODY,
  "body-parts": BODY,
  canopy: BODY,
  lighting: ELECTRICAL,
  electronics: ELECTRICAL,
};

const ALL_SETS = [DRIVELINE, SUSPENSION, BODY, ELECTRICAL, GENERAL, CONDITION];

/** The question sets for a listing: one for its part type, plus condition for used parts. */
export function questionSetsFor(category: string, condition: string): QuestionSet[] {
  const sets = [SETS_BY_CATEGORY[category] ?? GENERAL];
  if (condition !== "brand-new") sets.push(CONDITION);
  return sets;
}

export const INSTALLED_BY_OPTIONS: ChoiceOption[] = [
  { value: "self", label: "I installed it" },
  { value: "shop", label: "A shop installed it" },
  { value: "not_installed", label: "Not installed yet" },
];

export type ReviewAnswers = Record<string, string | string[] | number>;

function visible(question: ReviewQuestion, answers: ReviewAnswers): boolean {
  if (!question.showIf) return true;
  const value = answers[question.showIf.key];
  return typeof value === "string" && question.showIf.values.includes(value);
}

/**
 * Keeps only answers to questions that were asked, in the shape asked.
 * Returns an error string for a missing or malformed required answer.
 */
export function validateAnswers(
  sets: QuestionSet[],
  raw: unknown
): { answers: ReviewAnswers; error: string | null } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const answers: ReviewAnswers = {};

  for (const question of sets.flatMap((set) => set.questions)) {
    if (!visible(question, answers)) continue;
    const value = input[question.key];
    const allowed = new Set((question.options ?? []).map((o) => o.value));

    if (question.type === "choice") {
      if (typeof value === "string" && allowed.has(value)) answers[question.key] = value;
    } else if (question.type === "multi") {
      if (Array.isArray(value)) {
        const picked = [...new Set(value.filter((v): v is string => typeof v === "string" && allowed.has(v)))];
        if (picked.length) answers[question.key] = picked;
      }
    } else if (question.type === "number") {
      const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
      if (Number.isFinite(n) && n >= (question.min ?? -Infinity) && n <= (question.max ?? Infinity)) {
        answers[question.key] = Math.round(n * 10) / 10;
      }
    } else if (typeof value === "string" && value.trim()) {
      answers[question.key] = value.trim().slice(0, question.maxLength ?? 300);
    }

    if (question.required && answers[question.key] === undefined) {
      return { answers, error: `Please answer: ${question.label}` };
    }
  }

  return { answers, error: null };
}

/** "Fit: Needed fabrication or welding" lines for a stored review. */
export function describeAnswers(
  schema: string | null | undefined,
  answers: ReviewAnswers | null | undefined
): { label: string; value: string }[] {
  if (!schema || !answers) return [];
  const ids = schema.split("+");
  const lines: { label: string; value: string }[] = [];

  for (const set of ALL_SETS.filter((s) => ids.includes(s.id))) {
    for (const question of set.questions) {
      const value = answers[question.key];
      if (value === undefined) continue;
      const label = (v: string) => question.options?.find((o) => o.value === v)?.label ?? v;
      const text = Array.isArray(value)
        ? value.map(label).join(", ")
        : typeof value === "number"
          ? `${value}${question.unit ? ` ${question.unit}` : ""}`
          : question.type === "text"
            ? value
            : label(value);
      lines.push({ label: question.label, value: text });
    }
  }

  return lines;
}

export function schemaIdFor(sets: QuestionSet[]): string {
  return sets.map((set) => set.id).join("+");
}
