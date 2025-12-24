import { useQuery } from '@tanstack/react-query';
import SearchService, {
  ISearchSuggestionResponse,
} from '@/services/search.service';
import { AxiosError } from 'axios';

//==================== REGION QUERY KEYS ====================
export const searchSuggestionQueryKeys = {
  all: ['search-suggestions'] as const,
  suggestions: (query: string, limit: number) =>
    [...searchSuggestionQueryKeys.all, query, limit] as const,
};
//====================================================

//==================== REGION REACT QUERY HOOKS ====================

/**
 * Get search suggestions (contacts, keywords, recent searches)
 */
export const useSearchSuggestionsQuery = (
  query: string,
  limit: number = 5,
  enabled: boolean = true
) => {
  return useQuery<ISearchSuggestionResponse, AxiosError>({
    queryKey: searchSuggestionQueryKeys.suggestions(query, limit),
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return {
          query: query.trim(),
          contacts: [],
          keywords: [],
          recentSearches: [],
        };
      }

      const response = await SearchService.getSuggestions(query.trim(), limit);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || 'Failed to get search suggestions'
      );
    },
    enabled: enabled && !!query && query.trim().length >= 2,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
};

//====================================================
