import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-surface-300 bg-white px-3 text-sm text-surface-900 placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-500",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
