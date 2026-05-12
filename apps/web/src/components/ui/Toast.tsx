"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const success = useCallback((msg: string) => add(msg, "success"), [add]);
  const error = useCallback((msg: string) => add(msg, "error"), [add]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-slideIn ${
              t.variant === "success"
                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
            }`}
          >
            {t.variant === "success" ? (
              <CheckCircle size={16} className="shrink-0" />
            ) : (
              <XCircle size={16} className="shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
