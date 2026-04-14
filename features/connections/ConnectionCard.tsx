/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
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
  const profileHref = otherUser.publicProfileUrl
    ? `/in/${otherUser.publicProfileUrl}`
    : null;

  return (
    <article className="flex flex-wrap items-center gap-3 px-4 py-4 sm:flex-nowrap">
      {profileHref ? (
        <Link
          href={profileHref}
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-sm font-semibold text-surface-700 transition-transform duration-200 hover:scale-[1.04]"
        >
          {otherUser.profileImageUrl ? (
            <img
              src={otherUser.profileImageUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </Link>
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-sm font-semibold text-surface-700">
          {otherUser.profileImageUrl ? (
            <img
              src={otherUser.profileImageUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {profileHref ? (
          <Link
            href={profileHref}
            className="text-lg font-semibold text-surface-900 transition-colors duration-200 hover:text-trust-700"
          >
            {displayName}
          </Link>
        ) : (
          <p className="text-lg font-semibold text-surface-900">{displayName}</p>
        )}
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
