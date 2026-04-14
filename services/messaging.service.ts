import { api, unwrapData } from "@/services/api";
import type { Conversation, MessagePage } from "@/types/messaging";

interface MessageQuery {
  cursor?: string;
  limit?: number;
}

export const messagingService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<unknown>("/messages/conversations");
    return unwrapData<Conversation[]>(response);
  },

  getConversationMessages: async (
    conversationId: string,
    { cursor, limit = 30 }: MessageQuery = {},
  ): Promise<MessagePage> => {
    const response = await api.get<unknown>(`/messages/${conversationId}`, {
      params: {
        cursor,
        limit,
      },
    });

    return unwrapData<MessagePage>(response);
  },
};
