import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/date";
import type { Conversation } from "@/types/messaging";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) => (
  <div className="space-y-2">
    {conversations.map((conversation) => {
      const isActive = activeConversationId === conversation.id;

      return (
        <button
          key={conversation.id}
          type="button"
          onClick={() => onSelect(conversation.id)}
          className={cn(
            "w-full rounded-xl border px-3 py-3 text-left transition-colors",
            isActive
              ? "border-trust-300 bg-trust-50"
              : "border-surface-200 bg-white hover:bg-surface-100",
          )}
        >
          <p className="font-medium text-surface-900">
            {conversation.otherParticipant.name ??
              conversation.otherParticipant.email}
          </p>
          <p className="mt-1 truncate text-xs text-surface-500">
            {conversation.lastMessage?.content ?? "No messages yet"}
          </p>
          <p className="mt-1 text-[11px] text-surface-400">
            {formatDateTime(
              conversation.lastMessage?.createdAt ?? conversation.createdAt,
            )}
          </p>
        </button>
      );
    })}
  </div>
);
