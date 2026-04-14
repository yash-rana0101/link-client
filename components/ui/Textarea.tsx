import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-xl border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-500",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
