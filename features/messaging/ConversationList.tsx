/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/date";
import type { Conversation } from "@/types/messaging";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
}

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

const handleSelectKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  onSelect: (conversationId: string) => void,
  conversationId: string,
) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  onSelect(conversationId);
};

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) => (
  <div className="space-y-2">
    {conversations.map((conversation) => {
      const isActive = activeConversationId === conversation.id;
      const displayName =
        conversation.otherParticipant.name ?? conversation.otherParticipant.email;
      const profileHref = conversation.otherParticipant.publicProfileUrl
        ? `/in/${conversation.otherParticipant.publicProfileUrl}`
        : null;

      return (
        <div
          key={conversation.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(conversation.id)}
          onKeyDown={(event) => handleSelectKeyDown(event, onSelect, conversation.id)}
          className={cn(
            "w-full rounded-xl border px-3 py-3 text-left transition-colors",
            isActive
              ? "border-trust-300 bg-trust-50"
              : "border-surface-200 bg-white hover:bg-surface-100",
          )}
        >
          <div className="flex items-start gap-2">
            {profileHref ? (
              <Link
                href={profileHref}
                onClick={(event) => event.stopPropagation()}
                className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-xs font-semibold text-surface-700"
              >
                {conversation.otherParticipant.profileImageUrl ? (
                  <img
                    src={conversation.otherParticipant.profileImageUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(displayName)
                )}
              </Link>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-xs font-semibold text-surface-700">
                {conversation.otherParticipant.profileImageUrl ? (
                  <img
                    src={conversation.otherParticipant.profileImageUrl}
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
                  onClick={(event) => event.stopPropagation()}
                  className="font-medium text-surface-900 transition-colors duration-200 hover:text-trust-700"
                >
                  {displayName}
                </Link>
              ) : (
                <p className="font-medium text-surface-900">{displayName}</p>
              )}

              <p className="mt-1 truncate text-xs text-surface-500">
                {conversation.lastMessage?.content ?? "No messages yet"}
              </p>
              <p className="mt-1 text-[11px] text-surface-400">
                {formatDateTime(
                  conversation.lastMessage?.createdAt ?? conversation.createdAt,
                )}
              </p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
