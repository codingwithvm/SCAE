"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isFullSelection, setIsFullSelection] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(() => {
    const opt = options.find((o) => o.value === value);
    return opt?.label || "";
  }, [options, value]);

  const filtered = useMemo(() => {
    if (!inputValue.trim() || isFullSelection) return options;
    const q = inputValue.toLowerCase().trim();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(q)),
    );
  }, [options, inputValue, isFullSelection]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filtered]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setInputValue("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, open]);

  function handleFocus() {
    setOpen(true);
    setInputValue(selectedLabel);
    setIsFullSelection(true);
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  }

  function handleSelect(optValue: string) {
    onChange(optValue);
    setOpen(false);
    setInputValue("");
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex].value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setInputValue("");
      inputRef.current?.blur();
    }
  }

  function highlightMatch(text: string, query: string) {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-inherit rounded-sm px-0">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  const displayValue = open ? inputValue : selectedLabel;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          onFocus={handleFocus}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsFullSelection(false);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-border-light bg-background pl-3 pr-8 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-(family-name:--font-inter)]"
        />
        <ChevronDown
          size={14}
          className={[
            "absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border-light bg-background shadow-lg overflow-hidden">
          <div className="max-h-[240px] overflow-y-auto" ref={listRef}>
            {filtered.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={[
                  "w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between",
                  i === highlightedIndex ? "bg-surface" : "",
                  value === opt.value
                    ? "text-primary font-medium"
                    : "text-text-primary",
                ].join(" ")}
              >
                <span className="truncate">
                  {highlightMatch(opt.label, inputValue)}
                </span>
                {opt.sublabel && (
                  <span className="text-xs text-text-muted ml-2 shrink-0">
                    {highlightMatch(opt.sublabel, inputValue)}
                  </span>
                )}
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-text-muted">
                Nenhum resultado encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
