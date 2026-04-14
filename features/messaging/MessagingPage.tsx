"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { ConversationList } from "@/features/messaging/ConversationList";
import { MessageBox } from "@/features/messaging/MessageBox";
import { useMessaging } from "@/features/messaging/useMessaging";
import { useAppSelector } from "@/store/hooks";

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

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
          <div className="flex items-center gap-3">
            {activeConversation.otherParticipant.publicProfileUrl ? (
              <Link
                href={`/in/${activeConversation.otherParticipant.publicProfileUrl}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-xs font-semibold text-surface-700"
              >
                {activeConversation.otherParticipant.profileImageUrl ? (
                  <img
                    src={activeConversation.otherParticipant.profileImageUrl}
                    alt={
                      activeConversation.otherParticipant.name ??
                      activeConversation.otherParticipant.email
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(
                    activeConversation.otherParticipant.name ??
                    activeConversation.otherParticipant.email,
                  )
                )}
              </Link>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-xs font-semibold text-surface-700">
                {activeConversation.otherParticipant.profileImageUrl ? (
                  <img
                    src={activeConversation.otherParticipant.profileImageUrl}
                    alt={
                      activeConversation.otherParticipant.name ??
                      activeConversation.otherParticipant.email
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(
                    activeConversation.otherParticipant.name ??
                    activeConversation.otherParticipant.email,
                  )
                )}
              </div>
            )}

            <div>
              {activeConversation.otherParticipant.publicProfileUrl ? (
                <Link
                  href={`/in/${activeConversation.otherParticipant.publicProfileUrl}`}
                  className="text-lg font-semibold text-surface-900 transition-colors duration-200 hover:text-trust-700"
                >
                  {activeConversation.otherParticipant.name ??
                    activeConversation.otherParticipant.email}
                </Link>
              ) : (
                <h2 className="text-lg font-semibold text-surface-900">
                  {activeConversation.otherParticipant.name ??
                    activeConversation.otherParticipant.email}
                </h2>
              )}
              <p className="text-sm text-surface-600">
                Trust score: {activeConversation.otherParticipant.trustScore}
              </p>
            </div>
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
