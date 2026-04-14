import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/date";
import type { Connection } from "@/types/connection";

interface ConnectionCardProps {
  connection: Connection;
  currentUserId: string;
  onRemove: (connectionId: string) => void;
  isRemoving: boolean;
}

const ConnectionCardComponent = ({
  connection,
  currentUserId,
  onRemove,
  isRemoving,
}: ConnectionCardProps) => {
  const otherUser =
    connection.requesterId === currentUserId
      ? connection.receiver
      : connection.requester;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-surface-900">
            {otherUser.name ?? otherUser.email}
          </p>
          <p className="text-sm text-surface-600">{otherUser.email}</p>
        </div>
        <Badge variant="trust">Trust {otherUser.trustScore}</Badge>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-surface-500">
        <span>{connection.relationship.replaceAll("_", " ")}</span>
        <span>Connected {formatDate(connection.createdAt)}</span>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onRemove(connection.id)}
          disabled={isRemoving}
        >
          {isRemoving ? "Removing..." : "Remove"}
        </Button>
      </div>
    </Card>
  );
};

export const ConnectionCard = memo(ConnectionCardComponent);
