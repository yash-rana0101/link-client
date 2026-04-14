"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { connectionService } from "@/services/connection.service";

export const CONNECTIONS_QUERY_KEY = ["connections", "accepted"] as const;
export const CONNECTIONS_PENDING_QUERY_KEY = ["connections", "pending"] as const;

export const useConnections = () => {
  const queryClient = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: CONNECTIONS_QUERY_KEY,
    queryFn: connectionService.getConnections,
    staleTime: 20_000,
    retry: 2,
  });

  const pendingQuery = useQuery({
    queryKey: CONNECTIONS_PENDING_QUERY_KEY,
    queryFn: connectionService.getPendingConnections,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 2,
  });

  const requestMutation = useMutation({
    mutationFn: connectionService.requestConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_PENDING_QUERY_KEY });
    },
  });

  const respondMutation = useMutation({
    mutationFn: connectionService.respondToConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_PENDING_QUERY_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: connectionService.removeConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CONNECTIONS_PENDING_QUERY_KEY });
    },
  });

  return {
    connectionsQuery,
    pendingQuery,
    requestMutation,
    respondMutation,
    removeMutation,
  };
};
