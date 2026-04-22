import React, {
  type ButtonHTMLAttributes,
  type ReactNode,
  type ReactElement,
} from "react";
import Link from "next/link";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-cta text-text-on-cta font-semibold [font-family:var(--font-poppins),sans-serif] hover:bg-cta-dark",
  secondary:
    "bg-primary text-text-inverse font-semibold [font-family:var(--font-poppins),sans-serif] hover:bg-primary-dark",
  outline:
    "bg-background text-primary font-medium border border-border hover:bg-surface",
  ghost: "bg-transparent text-primary font-medium hover:bg-surface",
  destructive: "bg-error text-text-inverse font-semibold hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-3 text-base gap-2",
  lg: "px-8 py-4 text-lg gap-2.5",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed no-underline";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  asChild = false,
  ...rest
}: ButtonProps) {
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(" ");

  if (asChild) {
    const child = children as ReactElement<{
      href: string;
      children?: ReactNode;
    }>;
    return (
      <Link href={child.props.href} className={classes}>
        {child.props.children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
