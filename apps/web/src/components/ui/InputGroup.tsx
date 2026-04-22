import type { InputHTMLAttributes } from "react";

interface InputGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function InputGroup({ label, hint, id, ...props }: InputGroupProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={id}
        className="text-sm font-medium text-text-primary [font-family:var(--font-poppins),sans-serif]"
      >
        {label}
      </label>
      <input
        id={id}
        className="h-11 w-full rounded-md border border-border bg-background px-4 text-base text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors"
        {...props}
      />
      {hint && <span className="text-xs text-text-secondary">{hint}</span>}
    </div>
  );
}
