"use client";

import { useEffect, useRef, useState } from "react";

export type FilterOption = {
  value: string;
  label: string;
};

export default function CatalogFilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 sm:flex-none sm:min-w-[10rem]">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-left text-[11px] text-white transition hover:border-white/20 sm:px-4 sm:py-2 sm:text-sm"
      >
        <span className="truncate">{selected.label}</span>
        <span aria-hidden="true" className="shrink-0 text-gray-400">
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-2xl"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value || "__all__"} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-xs text-white transition hover:bg-red-600/25 sm:text-sm ${
                    isSelected ? "bg-red-600/15 font-semibold text-red-300" : ""
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
