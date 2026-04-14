import { memo } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/date";
import type { Connection } from "@/types/connection";

interface PendingRequestCardProps {
  request: Connection;
  onRespond: (connectionId: string, status: "ACCEPTED" | "REJECTED") => void;
  isPending: boolean;
}

const PendingRequestCardComponent = ({
  request,
  onRespond,
  isPending,
}: PendingRequestCardProps) => (
  <Card className="space-y-3">
    <div>
      <p className="font-semibold text-surface-900">
        {request.requester.name ?? request.requester.email}
      </p>
      <p className="text-sm text-surface-600">{request.requester.email}</p>
    </div>

    <p className="text-sm text-surface-700">
      Relationship: {request.relationship.replaceAll("_", " ")}
    </p>

    <p className="text-xs text-surface-500">Requested {formatDateTime(request.createdAt)}</p>

    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        onClick={() => onRespond(request.id, "ACCEPTED")}
        disabled={isPending}
      >
        {isPending ? "Updating..." : "Accept"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onRespond(request.id, "REJECTED")}
        disabled={isPending}
      >
        Reject
      </Button>
    </div>
  </Card>
);

export const PendingRequestCard = memo(PendingRequestCardComponent);
