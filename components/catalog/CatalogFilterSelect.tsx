"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type FilterOption = {
  value: string;
  label: string;
};

export default function CatalogFilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
  searchable = false,
  searchPlaceholder = "Search…",
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  ariaLabel: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  const visibleOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;

    const query = searchQuery.trim().toLowerCase();
    return options.filter(
      (option) => !option.value || option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery, searchable]);

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

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }

    if (searchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, searchable]);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 sm:flex-none sm:min-w-[10rem]">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-left text-[11px] text-neutral-900 transition hover:border-neutral-400 sm:px-4 sm:py-2 sm:text-sm"
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
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-xl"
        >
          {searchable ? (
            <li className="sticky top-0 z-10 border-b border-neutral-100 bg-white px-2 py-2">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] leading-none sm:text-xs"
                >
                  🔍
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder={searchPlaceholder}
                  aria-label={`${ariaLabel} search`}
                  className="w-full rounded-md border border-neutral-200 bg-white py-1.5 pl-7 pr-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
                />
              </div>
            </li>
          ) : null}

          {visibleOptions.length === 0 ? (
            <li className="px-3 py-2 text-xs text-neutral-500 sm:text-sm">
              No matches
            </li>
          ) : null}

          {visibleOptions.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value || "__all__"} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-xs text-neutral-800 transition hover:bg-red-50 sm:text-sm ${
                    isSelected ? "bg-red-50 font-semibold text-red-700" : ""
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
