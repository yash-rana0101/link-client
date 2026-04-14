import type { RelationshipType } from "@/types/profile";

export type ConnectionStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ConnectionUser {
  id: string;
  name: string | null;
  email: string;
  trustScore: number;
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  relationship: RelationshipType;
  status: ConnectionStatus;
  createdAt: string;
  requester: ConnectionUser;
  receiver: ConnectionUser;
}

export interface RequestConnectionPayload {
  receiverId: string;
  relationship: RelationshipType;
}

export interface RespondConnectionPayload {
  connectionId: string;
  status: Extract<ConnectionStatus, "ACCEPTED" | "REJECTED">;
}
