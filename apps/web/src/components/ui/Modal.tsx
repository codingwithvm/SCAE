"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col w-120 bg-background rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary font-(family-name:--font-poppins)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ModalFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
}

export function ModalField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
}: ModalFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 px-3 rounded-md border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none transition-colors font-(family-name:--font-inter)] ${error ? "border-error" : "border-border focus:border-primary"}`}
      />
      {error && (
        <span className="text-xs text-error font-(family-name:--font-inter)]">
          {error}
        </span>
      )}
    </div>
  );
}

interface ModalSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function ModalSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
}: ModalSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary font-(family-name:--font-inter)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-3 rounded-md border border-border bg-background text-sm text-text-primary focus:outline-none focus:border-primary transition-colors font-(family-name:--font-inter)] cursor-pointer"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
