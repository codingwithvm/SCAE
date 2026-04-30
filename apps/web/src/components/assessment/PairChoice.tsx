"use client";

import type { Pair } from "@/lib/assessment/types";

interface PairChoiceProps {
  pair: Pair;
  selected: "A" | "B" | null;
  onSelect: (choice: "A" | "B") => void;
}

export function PairChoice({ pair, selected, onSelect }: PairChoiceProps) {
  const alternatives: { value: "A" | "B"; label: string; text: string }[] = [
    { value: "A", label: "A", text: pair.A.t },
    { value: "B", label: "B", text: pair.B.t },
  ];

  return (
    <div className="flex flex-col gap-3">
      {alternatives.map(({ value, label, text }) => {
        const isSelected = selected === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={[
              "flex items-start gap-4 w-full px-5 py-4 rounded-2xl border text-left transition-colors",
              isSelected
                ? "bg-[#EDF9F5] border-cta border-2"
                : "bg-background border-border hover:border-border-light",
            ].join(" ")}
          >
            <div
              className={[
                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                isSelected
                  ? "bg-cta text-white"
                  : "bg-surface text-text-secondary border border-border",
              ].join(" ")}
            >
              {label}
            </div>

            <span
              className={[
                "text-base font-(family-name:--font-inter)] text-text-primary leading-relaxed",
                isSelected ? "font-medium" : "font-normal",
              ].join(" ")}
            >
              {text}
            </span>

            {isSelected && (
              <svg
                className="ml-auto shrink-0 mt-1 text-cta-dark"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
