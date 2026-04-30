"use client";

import type { ExtraPair } from "@/lib/assessment/types";

interface ExtraQuestionProps {
  pair: ExtraPair;
  onSelect: (choice: "A" | "B") => void;
}

export function ExtraQuestion({ pair, onSelect }: ExtraQuestionProps) {
  const alternatives: { value: "A" | "B"; label: string; text: string }[] = [
    { value: "A", label: "A", text: pair.A.t },
    { value: "B", label: "B", text: pair.B.t },
  ];

  return (
    <div className="flex flex-col gap-3">
      {alternatives.map(({ value, label, text }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className="flex items-start gap-4 w-full px-5 py-4 rounded-2xl border text-left transition-colors bg-background border-border hover:border-border-light cursor-pointer"
        >
          <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-surface text-text-secondary border border-border">
            {label}
          </div>

          <span className="text-base font-(family-name:--font-inter)] text-text-primary leading-relaxed">
            {text}
          </span>
        </button>
      ))}
    </div>
  );
}
