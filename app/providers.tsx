"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { Provider } from "react-redux";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import {
  clearStoredSession,
  persistSession,
  readStoredSession,
} from "@/services/session";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setHydrated, setSession } from "@/store/slices/authSlice";
import type { Conversation, Message, MessagePage } from "@/types/messaging";
import type { NotificationItem } from "@/types/notification";

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;
const CONVERSATIONS_QUERY_KEY = ["messages", "conversations"] as const;
const conversationMessageKey = (conversationId: string) =>
  ["messages", "conversation", conversationId] as const;

const RuntimeBridge = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    const existingSession = readStoredSession();

    if (
      existingSession?.accessToken &&
      existingSession.refreshToken &&
      existingSession.user
    ) {
      dispatch(
        setSession({
          accessToken: existingSession.accessToken,
          refreshToken: existingSession.refreshToken,
          user: existingSession.user,
        }),
      );
      return;
    }

    dispatch(setHydrated());
  }, [dispatch]);

  useEffect(() => {
    if (!auth.hydrated) {
      return;
    }

    if (auth.accessToken && auth.refreshToken && auth.user) {
      persistSession({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        user: auth.user,
      });
      return;
    }

    disconnectSocket();
    clearStoredSession();
  }, [auth.accessToken, auth.hydrated, auth.refreshToken, auth.user]);

  useEffect(() => {
    if (!auth.accessToken || !auth.user) {
      return;
    }

    const socket = connectSocket(auth.accessToken, auth.user.id);
    if (!socket) {
      return;
    }

    const onNotification = (incoming: NotificationItem) => {
      queryClient.setQueryData<NotificationItem[] | undefined>(
        NOTIFICATIONS_QUERY_KEY,
        (current) => {
          if (!current) {
            return [incoming];
          }

          if (current.some((item) => item.id === incoming.id)) {
            return current;
          }

          return [incoming, ...current];
        },
      );
    };

    const onMessage = (incoming: Message) => {
      queryClient.setQueryData<MessagePage | undefined>(
        conversationMessageKey(incoming.conversationId),
        (current) => {
          if (!current) {
            return {
              items: [incoming],
              pageInfo: {
                nextCursor: null,
                hasMore: false,
                limit: 30,
              },
            };
          }

          if (current.items.some((item) => item.id === incoming.id)) {
            return current;
          }

          return {
            ...current,
            items: [...current.items, incoming].sort(
              (left, right) =>
                new Date(left.createdAt).getTime() -
                new Date(right.createdAt).getTime(),
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
            if (conversation.id !== incoming.conversationId) {
              return conversation;
            }

            const duplicate = conversation.lastMessage?.id === incoming.id;

            return {
              ...conversation,
              lastMessage: incoming,
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
    };

    socket.on("notification", onNotification);
    socket.on("notification_received", onNotification);
    socket.on("receive_message", onMessage);
    socket.on("message_received", onMessage);

    return () => {
      socket.off("notification", onNotification);
      socket.off("notification_received", onNotification);
      socket.off("receive_message", onMessage);
      socket.off("message_received", onMessage);
    };
  }, [auth.accessToken, auth.user, queryClient]);

  return null;
};

const ProvidersTree = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RuntimeBridge />
        {children}
      </QueryClientProvider>
    </Provider>
  );
};

export default ProvidersTree;
