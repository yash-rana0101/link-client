import { cn } from "@/lib/cn";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => (
  <span
    className={cn(
      "inline-block h-5 w-5 animate-spin rounded-full border-2 border-surface-300 border-t-trust-600",
      className,
    )}
    aria-label="Loading"
  />
);
