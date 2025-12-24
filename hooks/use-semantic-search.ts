import { useQuery, useMutation } from '@tanstack/react-query';
import SearchService, {
  ISemanticSearchRequest,
  ISemanticSearchResponse,
  ISemanticSearchStatusResponse,
} from '@/services/search.service';
import { AxiosError } from 'axios';

//==================== REGION QUERY KEYS ====================
export const semanticSearchQueryKeys = {
  all: ['semantic-search'] as const,
  status: () => [...semanticSearchQueryKeys.all, 'status'] as const,
  search: (query: string, params: ISemanticSearchRequest) =>
    [...semanticSearchQueryKeys.all, 'search', query, params] as const,
};
//====================================================

//==================== REGION REACT QUERY HOOKS ====================

/**
 * Check if semantic search is available
 */
export const useSemanticSearchStatusQuery = () => {
  return useQuery<ISemanticSearchStatusResponse, AxiosError>({
    queryKey: semanticSearchQueryKeys.status(),
    queryFn: async () => {
      const response = await SearchService.getSemanticSearchStatus();
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || 'Failed to check semantic search status'
      );
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Semantic search mutation
 */
export const useSemanticSearchMutation = () => {
  return useMutation<
    ISemanticSearchResponse,
    AxiosError,
    ISemanticSearchRequest
  >({
    mutationFn: async (request: ISemanticSearchRequest) => {
      const response = await SearchService.semanticSearch(request);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || 'Failed to perform semantic search'
      );
    },
  });
};

/**
 * Generate embeddings for all emails that don't have them
 */
export const useGenerateEmbeddingsMutation = () => {
  return useMutation<{ generated: number; message: string }, AxiosError, void>({
    mutationFn: async () => {
      const response = await SearchService.generateEmbeddings();
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to generate embeddings');
    },
  });
};

/**
 * Generate embedding for a single email
 */
export const useGenerateSingleEmbeddingMutation = () => {
  return useMutation<{ success: boolean }, AxiosError, string>({
    mutationFn: async (emailId: string) => {
      const response = await SearchService.generateSingleEmbedding(emailId);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || 'Failed to generate embedding for email'
      );
    },
  });
};

//====================================================
