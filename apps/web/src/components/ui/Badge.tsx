import { type ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "primary";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-[#C6F6D5] text-[#22543D]",
  warning: "bg-[#FEFCBF] text-[#744210]",
  error: "bg-[#FED7D7] text-[#742A2A]",
  info: "bg-[#BEE3F8] text-[#2A4365]",
  primary: "bg-primary text-white",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium font-(family-name:--font-inter)]",
        VARIANT_CLASSES[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
