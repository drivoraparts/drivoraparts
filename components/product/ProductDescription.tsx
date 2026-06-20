"use client";

import { useState } from "react";
import { glassCard } from "./styles";

type ProductDescriptionProps = {
  text: string;
};

export default function ProductDescription({ text }: ProductDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text?.trim()) return null;

  return (
    <div style={{ marginTop: "24px", ...glassCard, padding: "14px" }}>
      <h3
        style={{
          fontSize: "18px",
          marginBottom: "10px",
          color: "#fff",
        }}
      >
        Description
      </h3>
      <div
        style={{
          overflow: "hidden",
          maxHeight: expanded ? "4000px" : "6.4em",
          transition: "max-height 0.35s ease",
          color: "rgba(255,255,255,0.75)",
          lineHeight: 1.6,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          marginTop: "10px",
          padding: 0,
          border: "none",
          background: "none",
          color: "#e60000",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {expanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
}
