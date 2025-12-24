import { axiosBI } from './axios.bi';
import { CustomAxiosResponse } from './axios.bi';
import { ApiResponse } from '@/types/api.types';
import { SEARCH_ENDPOINTS } from '@/utils/constants/api';

//==================== REGION SEARCH TYPES ====================

export interface ISemanticSearchRequest {
  query: string;
  limit?: number;
  minScore?: number;
  generateMissingEmbeddings?: boolean;
}

export interface ISemanticSearchResult {
  id: string;
  emailId: string;
  columnId: string;
  columnName: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  preview: string;
  summary: string | null;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  similarityScore: number;
}

export interface ISemanticSearchResponse {
  query: string;
  totalResults: number;
  results: ISemanticSearchResult[];
  emailsWithEmbeddings: number;
  emailsWithoutEmbeddings: number;
  processingTimeMs: number;
}

export interface ISemanticSearchStatusResponse {
  available: boolean;
  message: string;
}

export interface IContactSuggestion {
  email: string;
  name: string;
  emailCount: number;
}

export interface IKeywordSuggestion {
  keyword: string;
  frequency: number;
}

export interface ISearchSuggestionResponse {
  query: string;
  contacts: IContactSuggestion[];
  keywords: IKeywordSuggestion[];
  recentSearches: string[];
}

//====================================================

//==================== REGION SEARCH SERVICE ====================

/**
 * Search Service
 * Handles semantic search and auto-suggestions
 */
class SearchService {
  /**
   * Check if semantic search is available
   */
  static async getSemanticSearchStatus(): Promise<
    CustomAxiosResponse<ApiResponse<ISemanticSearchStatusResponse>>
  > {
    return await axiosBI.get(SEARCH_ENDPOINTS.SEMANTIC_STATUS);
  }

  /**
   * Perform semantic search on emails
   */
  static async semanticSearch(
    request: ISemanticSearchRequest
  ): Promise<CustomAxiosResponse<ApiResponse<ISemanticSearchResponse>>> {
    return await axiosBI.post(SEARCH_ENDPOINTS.SEMANTIC, request);
  }

  /**
   * Get search suggestions (contacts, keywords, recent searches)
   */
  static async getSuggestions(
    query: string,
    limit: number = 5
  ): Promise<CustomAxiosResponse<ApiResponse<ISearchSuggestionResponse>>> {
    const params = new URLSearchParams();
    params.append('query', query);
    params.append('limit', limit.toString());

    return await axiosBI.get(
      `${SEARCH_ENDPOINTS.SUGGESTIONS}?${params.toString()}`
    );
  }

  /**
   * Get all unique contacts (senders)
   */
  static async getAllContacts(): Promise<
    CustomAxiosResponse<ApiResponse<IContactSuggestion[]>>
  > {
    return await axiosBI.get(SEARCH_ENDPOINTS.CONTACTS);
  }
}

export default SearchService;

//====================================================
