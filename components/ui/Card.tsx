import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-surface-300 bg-white/90 p-5 shadow-sm backdrop-blur-sm",
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-3 flex items-start justify-between", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold text-surface-900", className)} {...props} />
);

export const CardBody = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-3", className)} {...props} />
);

export const CardFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 flex items-center gap-2", className)} {...props} />
);
