"use client";

import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";

export const GLOBAL_SEARCH_QUERY_KEY = ["search", "global"] as const;

export const useGlobalSearch = (query: string, limit = 8, enabled = true) => {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: [...GLOBAL_SEARCH_QUERY_KEY, normalizedQuery, limit],
    queryFn: () => searchService.searchGlobal(normalizedQuery, limit),
    staleTime: 20_000,
    retry: 1,
    enabled,
  });
};
