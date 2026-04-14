import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/date";
import type { Connection } from "@/types/connection";

interface ConnectionCardProps {
  connection: Connection;
  currentUserId: string;
  onRemove: (connectionId: string) => void;
  isRemoving: boolean;
}

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

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

  const displayName = otherUser.name ?? otherUser.email;

  return (
    <article className="flex flex-wrap items-center gap-3 px-4 py-4 sm:flex-nowrap">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-surface-300 bg-surface-100 text-sm font-semibold text-surface-700">
        {getInitials(displayName)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold text-surface-900">{displayName}</p>
        <p className="mt-0.5 text-sm text-surface-600">{otherUser.email}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-surface-500">
          <span>{connection.relationship.replaceAll("_", " ")}</span>
          <span className="text-surface-300">|</span>
          <span>Connected {formatDate(connection.createdAt)}</span>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Badge variant="trust">Trust {otherUser.trustScore}</Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(connection.id)}
          disabled={isRemoving}
          className="rounded-full px-4"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </Button>
      </div>
    </article>
  );
};

export const ConnectionCard = memo(ConnectionCardComponent);
