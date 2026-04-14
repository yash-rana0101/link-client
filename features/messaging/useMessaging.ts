"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingService } from "@/services/messaging.service";
import { getSocket } from "@/lib/socket";
import { setActiveConversationId } from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Conversation, Message, MessagePage } from "@/types/messaging";

export const CONVERSATIONS_QUERY_KEY = ["messages", "conversations"] as const;

const messageQueryKey = (conversationId: string) =>
  ["messages", "conversation", conversationId] as const;

const byDateAscending = (left: string, right: string) =>
  new Date(left).getTime() - new Date(right).getTime();

export const useMessaging = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const activeConversationId = useAppSelector(
    (state) => state.ui.activeConversationId,
  );
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const appendMessage = useCallback(
    (message: Message) => {
      queryClient.setQueryData<MessagePage | undefined>(
        messageQueryKey(message.conversationId),
        (current) => {
          if (!current) {
            return {
              items: [message],
              pageInfo: {
                nextCursor: null,
                hasMore: false,
                limit: 30,
              },
            };
          }

          const exists = current.items.some((item) => item.id === message.id);
          if (exists) {
            return current;
          }

          return {
            ...current,
            items: [...current.items, message].sort((left, right) =>
              byDateAscending(left.createdAt, right.createdAt),
            ),
          };
        },
      );

      queryClient.setQueryData<Conversation[] | undefined>(
        CONVERSATIONS_QUERY_KEY,
        (current) => {
          if (!current) {
            return current;
          }

          const updated = current.map((conversation) => {
            if (conversation.id !== message.conversationId) {
              return conversation;
            }

            const duplicate = conversation.lastMessage?.id === message.id;

            return {
              ...conversation,
              lastMessage: message,
              messageCount: duplicate
                ? conversation.messageCount
                : conversation.messageCount + 1,
            };
          });

          return [...updated].sort((left, right) => {
            const leftDate = left.lastMessage?.createdAt ?? left.createdAt;
            const rightDate = right.lastMessage?.createdAt ?? right.createdAt;
            return new Date(rightDate).getTime() - new Date(leftDate).getTime();
          });
        },
      );
    },
    [queryClient],
  );

  const conversationsQuery = useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: messagingService.getConversations,
    staleTime: 20_000,
    refetchInterval: 30_000,
    retry: 2,
  });

  useEffect(() => {
    if (!activeConversationId && conversationsQuery.data?.length) {
      dispatch(setActiveConversationId(conversationsQuery.data[0].id));
    }
  }, [activeConversationId, conversationsQuery.data, dispatch]);

  const activeConversation = useMemo(
    () =>
      conversationsQuery.data?.find(
        (conversation) => conversation.id === activeConversationId,
      ) ?? null,
    [activeConversationId, conversationsQuery.data],
  );

  const messagesQuery = useQuery({
    queryKey: activeConversationId
      ? messageQueryKey(activeConversationId)
      : (["messages", "conversation", "idle"] as const),
    queryFn: async () => {
      if (!activeConversationId) {
        return {
          items: [],
          pageInfo: {
            nextCursor: null,
            hasMore: false,
            limit: 30,
          },
        } satisfies MessagePage;
      }

      return messagingService.getConversationMessages(activeConversationId, {
        limit: 50,
      });
    },
    enabled: Boolean(activeConversationId),
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: 2,
  });

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const onIncoming = (message: Message) => {
      appendMessage(message);
    };

    socket.on("receive_message", onIncoming);
    socket.on("message_received", onIncoming);

    return () => {
      socket.off("receive_message", onIncoming);
      socket.off("message_received", onIncoming);
    };
  }, [accessToken, appendMessage]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation) {
        setSendError("Select a conversation first.");
        return;
      }

      const trimmedContent = content.trim();
      if (!trimmedContent) {
        return;
      }

      const socket = getSocket();
      if (!socket) {
        setSendError("Realtime channel is offline.");
        return;
      }

      setSendError(null);
      setIsSending(true);

      try {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "send_message",
            {
              receiverId: activeConversation.otherParticipant.id,
              content: trimmedContent,
            },
            (ack) => {
              if (!ack.success) {
                reject(new Error(ack.message ?? "Message send failed."));
                return;
              }

              appendMessage(ack.data);
              resolve();
            },
          );
        });
      } catch (error) {
        setSendError(
          error instanceof Error ? error.message : "Unable to send message.",
        );
      } finally {
        setIsSending(false);
      }
    },
    [activeConversation, appendMessage],
  );

  return {
    conversationsQuery,
    activeConversationId,
    activeConversation,
    setActiveConversation: (conversationId: string) =>
      dispatch(setActiveConversationId(conversationId)),
    messagesQuery,
    sendMessage,
    isSending,
    sendError,
  };
};
