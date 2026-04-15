import { api, unwrapData } from "@/services/api";
import type {
  Connection,
  ConnectionRelationStatus,
  RequestConnectionPayload,
  RespondConnectionPayload,
} from "@/types/connection";

export const connectionService = {
  getConnections: async (): Promise<Connection[]> => {
    const response = await api.get<unknown>("/connections");
    return unwrapData<Connection[]>(response);
  },

  getPendingConnections: async (): Promise<Connection[]> => {
    const response = await api.get<unknown>("/connections/pending");
    return unwrapData<Connection[]>(response);
  },

  getConnectionStatus: async (userId: string): Promise<ConnectionRelationStatus> => {
    const response = await api.get<unknown>(`/connections/status/${encodeURIComponent(userId)}`);
    return unwrapData<ConnectionRelationStatus>(response);
  },

  requestConnection: async (
    payload: RequestConnectionPayload,
  ): Promise<Connection> => {
    const response = await api.post<unknown>("/connections/request", payload);
    return unwrapData<Connection>(response);
  },

  respondToConnection: async (
    payload: RespondConnectionPayload,
  ): Promise<Connection> => {
    const response = await api.post<unknown>("/connections/respond", payload);
    return unwrapData<Connection>(response);
  },

  removeConnection: async (connectionId: string): Promise<void> => {
    await api.delete(`/connections/${connectionId}`);
  },
};
