import { api, unwrapData } from "@/services/api";
import type { GlobalSearchResult } from "@/types/search";

export const searchService = {
  searchGlobal: async (query: string, limit = 8): Promise<GlobalSearchResult> => {
    const response = await api.get<unknown>("/user/search/global", {
      params: {
        q: query,
        limit,
      },
    });

    return unwrapData<GlobalSearchResult>(response);
  },
};
