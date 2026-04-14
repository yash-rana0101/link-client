"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/date";
import type { Message } from "@/types/messaging";

interface MessageBoxProps {
  messages: Message[];
  currentUserId: string;
  onSend: (content: string) => Promise<void>;
  isLoading: boolean;
  isSending: boolean;
  errorMessage: string | null;
}

export const MessageBox = ({
  messages,
  currentUserId,
  onSend,
  isLoading,
  isSending,
  errorMessage,
}: MessageBoxProps) => {
  const [draft, setDraft] = useState("");

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      ),
    [messages],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setDraft("");
  };

  return (
    <Card className="flex min-h-[65vh] flex-col justify-between gap-4">
      <div className="space-y-3 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Spinner />
          </div>
        ) : null}

        {!isLoading && !sortedMessages.length ? (
          <p className="rounded-xl bg-surface-100 p-3 text-sm text-surface-600">
            No messages yet. Start a meaningful conversation.
          </p>
        ) : null}

        {sortedMessages.map((message) => {
          const isMine = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={cn("flex", isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2",
                  isMine
                    ? "bg-trust-600 text-white"
                    : "bg-surface-200 text-surface-900",
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={cn(
                    "mt-1 text-[11px]",
                    isMine ? "text-trust-100" : "text-surface-500",
                  )}
                >
                  {formatDateTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form className="space-y-2" onSubmit={handleSubmit}>
        {errorMessage ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message"
          />
          <Button type="submit" disabled={isSending || !draft.trim()}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
