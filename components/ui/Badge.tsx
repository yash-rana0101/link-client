import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "trust" | "neutral" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  trust: "bg-trust-100 text-trust-700 border border-trust-200",
  neutral: "bg-surface-200 text-surface-700 border border-surface-300",
  warning: "bg-amber-100 text-amber-800 border border-amber-200",
};

export const Badge = ({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
      variantClasses[variant],
      className,
    )}
    {...props}
  />
);
