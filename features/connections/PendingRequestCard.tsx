import { memo } from "react";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/date";
import type { Connection } from "@/types/connection";

interface PendingRequestCardProps {
  request: Connection;
  onRespond: (connectionId: string, status: "ACCEPTED" | "REJECTED") => void;
  isPending: boolean;
}

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

const PendingRequestCardComponent = ({
  request,
  onRespond,
  isPending,
}: PendingRequestCardProps) => {
  const requesterName = request.requester.name ?? request.requester.email;

  return (
    <article className="flex flex-wrap items-center gap-3 px-4 py-4 sm:flex-nowrap">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-surface-300 bg-surface-100 text-sm font-semibold text-surface-700">
        {getInitials(requesterName)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xl font-semibold leading-tight text-surface-900 sm:text-[1.32rem]">
          {requesterName}
          <span className="ml-2 text-base font-normal text-surface-700">
            invited you to connect
          </span>
        </p>
        <p className="mt-0.5 text-sm text-surface-600">{request.requester.email}</p>
        <p className="mt-1 text-sm text-surface-600">
          Context: {request.relationship.replaceAll("_", " ")}
        </p>
        <p className="mt-1 text-xs text-surface-500">Requested {formatDateTime(request.createdAt)}</p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onRespond(request.id, "REJECTED")}
          disabled={isPending}
          className="rounded-full px-4"
        >
          Ignore
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onRespond(request.id, "ACCEPTED")}
          disabled={isPending}
          className="rounded-full px-5"
        >
          {isPending ? "Updating..." : "Accept"}
        </Button>
      </div>
    </article>
  );
};

export const PendingRequestCard = memo(PendingRequestCardComponent);
