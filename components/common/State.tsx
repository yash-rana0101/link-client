import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface StateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, action }: StateProps) => (
  <Card className="text-center">
    <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
    <p className="mt-2 text-sm text-surface-600">{description}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </Card>
);

export const ErrorState = ({ title, description, action }: StateProps) => (
  <Card className="border-red-200 bg-red-50/80 text-center">
    <h3 className="text-lg font-semibold text-red-700">{title}</h3>
    <p className="mt-2 text-sm text-red-600">{description}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </Card>
);
