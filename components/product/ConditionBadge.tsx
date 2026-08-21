"use client";

import {
  getConditionDisplay,
  getConditionLabel,
  resolveProductCondition,
} from "@/lib/inventory/condition";

type ConditionBadgeProps = {
  category: string;
  condition?: string;
};

export default function ConditionBadge({
  category,
  condition,
}: ConditionBadgeProps) {
  const resolved = resolveProductCondition({ category, condition });
  const display = getConditionDisplay(resolved);
  // Colours come from the resolved condition, the wording from the same
  // helper the spec table uses — otherwise the badge could read "Used" while
  // the specs beneath it read "Used Like New".
  const label = getConditionLabel({ category, condition });

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: display.color,
        background: display.background,
        border: `1px solid ${display.border}`,
      }}
    >
      {label}
    </span>
  );
}
