import { useQuery } from '@tanstack/react-query';
import KanbanService from '@/services/kanban.service';

/**
 * Hook for Kanban fuzzy search
 */
export function useKanbanSearchQuery(
  query: string,
  limit: number = 20,
  includeBody: boolean = false,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['kanban-search', query, limit, includeBody],
    queryFn: async () => {
      if (!query || query.trim() === '') {
        return {
          query: '',
          totalResults: 0,
          results: [],
        };
      }

      const response = await KanbanService.searchKanban(
        query.trim(),
        limit,
        includeBody
      );
      return (
        response.data.data || {
          query: query.trim(),
          totalResults: 0,
          results: [],
        }
      );
    },
    enabled: enabled && !!query && query.trim() !== '',
    staleTime: 30000, // Cache for 30 seconds
  });
}
