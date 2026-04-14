"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { ConversationList } from "@/features/messaging/ConversationList";
import { MessageBox } from "@/features/messaging/MessageBox";
import { useMessaging } from "@/features/messaging/useMessaging";
import { useAppSelector } from "@/store/hooks";

export default function MessagingPage() {
  const { user } = useAppSelector((state) => state.auth);
  const {
    conversationsQuery,
    activeConversationId,
    activeConversation,
    setActiveConversation,
    messagesQuery,
    sendMessage,
    isSending,
    sendError,
  } = useMessaging();

  if (!user) {
    return (
      <ErrorState
        title="Session unavailable"
        description="Please log in again to access messages."
      />
    );
  }

  if (conversationsQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (conversationsQuery.isError) {
    return (
      <ErrorState
        title="Messaging unavailable"
        description="We could not load your conversations."
        action={<Button onClick={() => conversationsQuery.refetch()}>Retry</Button>}
      />
    );
  }

  if (!conversationsQuery.data?.length) {
    return (
      <EmptyState
        title="No conversations"
        description="Connect with someone to start trusted messaging."
      />
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-surface-300 bg-white p-3">
        <h2 className="mb-3 text-base font-semibold text-surface-900">
          Conversations
        </h2>
        <ConversationList
          conversations={conversationsQuery.data}
          activeConversationId={activeConversationId}
          onSelect={setActiveConversation}
        />
      </div>

      {activeConversation ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">
              {activeConversation.otherParticipant.name ??
                activeConversation.otherParticipant.email}
            </h2>
            <p className="text-sm text-surface-600">
              Trust score: {activeConversation.otherParticipant.trustScore}
            </p>
          </div>

          <MessageBox
            messages={messagesQuery.data?.items ?? []}
            currentUserId={user.id}
            onSend={sendMessage}
            isLoading={messagesQuery.isLoading}
            isSending={isSending}
            errorMessage={sendError}
          />
        </div>
      ) : (
        <EmptyState
          title="Pick a conversation"
          description="Select a thread on the left to start chatting."
        />
      )}
    </section>
  );
}
