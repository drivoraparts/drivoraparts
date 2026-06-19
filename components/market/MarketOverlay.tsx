"use client";

import { useMarket } from "@/components/context/MarketContext";
import { useMemo, useState } from "react";

/* =======================
   DATA (ENGINE STRUCTURE)
======================= */
const ENGINE_DATA = {
  "japanese-legends": [
    "Toyota 2JZ-GTE",
    "Toyota 1JZ-GTE",
    "Honda K20A / K24",
    "Nissan RB26DETT",
  ],
  "bmw-engines": [
    "BMW S58",
    "BMW N54",
    "BMW N55",
    "BMW M57 Diesel",
  ],
  "american-v8": [
    "LS3 V8",
    "LS7 Performance",
    "Ford Coyote 5.0",
    "Hellcat 6.2",
  ],
  "euro-performance": [
    "Mercedes M113 V8",
    "Audi 2.0 TFSI EA888",
    "VW VR6",
  ],
  "turbo-performance": [
    "GTX3076R Turbo Kit",
    "GTX3582R Turbo Kit",
    "BorgWarner EFR",
  ],
};

/* =======================
   MAIN CATEGORIES
======================= */
const CATEGORIES = [
  "engine",
  "brakes",
  "suspension",
  "electronics",
  "transmission",
  "turbocharger",
  "lighting",
  "interior",
  "body-parts",
];

export default function MarketOverlay() {
  const { marketOpen, setMarketOpen } = useMarket();

  const [step, setStep] = useState<"main" | "engine">("main");
  const [activeEngineGroup, setActiveEngineGroup] = useState<string | null>(null);

  const [clickAnim, setClickAnim] = useState<string | null>(null);

  const engineGroups = Object.keys(ENGINE_DATA);

  const engines =
    activeEngineGroup ? ENGINE_DATA[activeEngineGroup as keyof typeof ENGINE_DATA] : [];

  if (!marketOpen) return null;

  const handleClick = (id: string, fn: () => void) => {
    setClickAnim(id);
    setTimeout(() => {
      fn();
      setClickAnim(null);
    }, 120);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/95 z-[9999] flex flex-col">

      {/* HEADER SAFE AREA */}
      <div className="pt-24 px-6">

        {/* BACK BUTTON */}
        {(step !== "main") && (
          <button
            onClick={() => {
              setStep("main");
              setActiveEngineGroup(null);
            }}
            className="mb-4 text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>
        )}

        {/* ================= MAIN CATEGORIES ================= */}
        {step === "main" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === "engine") {
                    setStep("engine");
                  }
                }}
                className={`
                  p-5 rounded-xl border text-left capitalize
                  bg-white/5 border-white/10 text-white
                  hover:bg-white/10 hover:scale-[1.02]
                  active:scale-95 transition
                `}
              >
                {cat}
              </button>
            ))}

          </div>
        )}

        {/* ================= ENGINE SUBCATEGORIES ================= */}
        {step === "engine" && !activeEngineGroup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {engineGroups.map((group) => (
              <button
                key={group}
                onClick={() =>
                  handleClick(group, () => setActiveEngineGroup(group))
                }
                className={`
                  p-5 rounded-xl border text-left
                  bg-white/5 border-white/10 text-white
                  hover:border-red-500 hover:bg-white/10
                  transition active:scale-95
                  ${clickAnim === group ? "scale-95 bg-red-600" : ""}
                `}
              >
                <span className="text-red-500 font-bold uppercase">
                  {group.replace("-", " ")}
                </span>
              </button>
            ))}

          </div>
        )}

        {/* ================= ENGINE LIST ================= */}
        {step === "engine" && activeEngineGroup && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {engines.map((item, i) => (
              <div
                key={i}
                className={`
                  p-5 rounded-xl border bg-white/5 border-white/10
                  hover:scale-[1.03] transition
                  active:scale-95 cursor-pointer
                  ${clickAnim === item ? "scale-95 bg-red-600" : ""}
                `}
                onClick={() =>
                  handleClick(item, () => {
                    console.log("Selected:", item);
                  })
                }
              >
                {item}
              </div>
            ))}

          </div>
        )}

      </div>

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setMarketOpen(false)}
        className="absolute top-6 right-6 text-white text-2xl hover:scale-110 transition"
      >
        ✕
      </button>

    </div>
  );
}