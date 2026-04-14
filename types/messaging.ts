import type { ApiPageInfo } from "@/types/api";

export interface MessageSender {
  id: string;
  name: string | null;
  email: string;
  profileImageUrl: string | null;
  publicProfileUrl: string | null;
  trustScore: number;
}

export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  sender: MessageSender;
}

export interface Conversation {
  id: string;
  createdAt: string;
  otherParticipant: MessageSender;
  lastMessage: Message | null;
  messageCount: number;
}

export interface MessagePage {
  items: Message[];
  pageInfo: ApiPageInfo;
}
