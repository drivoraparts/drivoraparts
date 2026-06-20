"use client";

import {
  getConditionDisplay,
  resolveProductCondition,
} from "@/lib/inventory";

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
      {display.label}
    </span>
  );
}
