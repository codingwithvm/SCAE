"use client";

import { useEffect, useId, useRef, useState } from "react";
import { addMonths, format, isValid, parse, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerProps {
  id?: string;
  label: string;
  name?: string;
  required?: boolean;
  onDateChange?: (isoDate: string | undefined) => void;
}

export function DatePicker({
  id,
  label,
  name,
  required,
  onDateChange,
}: DatePickerProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<Date | undefined>();
  const [month, setMonth] = useState(new Date(2001, 3));
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setInputValue(value);

    const parsedDate = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsedDate)) {
      setSelected(parsedDate);
      setMonth(parsedDate);
      onDateChange?.(format(parsedDate, "yyyy-MM-dd"));
      return;
    }

    setSelected(undefined);
    onDateChange?.(undefined);
  }

  function handleSelect(date: Date | undefined) {
    setSelected(date);
    setInputValue(date ? format(date, "dd/MM/yyyy") : "");
    onDateChange?.(date ? format(date, "yyyy-MM-dd") : undefined);
    if (date) {
      setMonth(date);
    }
    setIsOpen(false);
  }

  function handleToggle() {
    if (inputValue) {
      setSelected(undefined);
      setInputValue("");
      return;
    }

    setIsOpen((current) => !current);
  }

  return (
    <div ref={containerRef} className="relative flex w-full flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-text-primary [font-family:var(--font-poppins),sans-serif]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="dd/mm/aaaa"
          autoComplete="off"
          required={required}
          className="h-11 w-full rounded-md border border-border bg-background pl-4 pr-10 text-base text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary"
        />

        <button
          type="button"
          onClick={handleToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary"
          aria-label={inputValue ? "Limpar data" : "Abrir calendário"}
        >
          {inputValue ? <X size={16} /> : <CalendarDays size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-70 rounded-[16px] border border-border bg-background p-4 shadow-[0_8px_24px_rgba(30,79,174,0.12)]">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth((current) => subMonths(current, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-text-secondary transition-colors hover:bg-border-light"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm font-semibold text-text-primary [font-family:var(--font-poppins),sans-serif]">
              {(() => {
                const label = format(month, "MMMM yyyy", { locale: ptBR });
                return label.charAt(0).toUpperCase() + label.slice(1);
              })()}
            </span>

            <button
              type="button"
              onClick={() => setMonth((current) => addMonths(current, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-text-secondary transition-colors hover:bg-border-light"
              aria-label="Próximo mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            locale={ptBR}
            showOutsideDays={false}
            startMonth={new Date(1990, 0)}
            endMonth={new Date()}
            formatters={{
              formatWeekdayName: (date) =>
                format(date, "EEEEE", { locale: ptBR }),
            }}
            classNames={{
              root: "w-full",
              month: "w-full",
              month_caption: "hidden",
              caption_label: "hidden",
              nav: "hidden",
              button_previous: "hidden",
              button_next: "hidden",
              month_grid: "w-full border-collapse",
              weekdays: "mb-1",
              weekday:
                "h-9 w-9 p-0 text-center align-middle text-xs font-medium text-text-muted",
              weeks: "w-full",
              week: "",
              day: "h-9 w-9 p-0 text-center align-middle",
              day_button:
                "flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-normal text-text-primary transition-colors hover:bg-surface",
              selected:
                "!bg-primary !text-text-inverse rounded-full font-semibold hover:!bg-primary",
              today: "font-semibold text-primary",
              disabled: "opacity-30",
              outside: "opacity-0",
            }}
          />
        </div>
      )}
    </div>
  );
}
