'use client';

import * as React from 'react';
import { ArrowLeft, Loader2, SearchX, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SearchBar } from './search-bar';
import { SearchResultCard } from './search-result-card';
import { useKanbanSearchQuery } from '@/hooks/use-kanban-search';
import {
  useSemanticSearchMutation,
  useSemanticSearchStatusQuery,
} from '@/hooks/use-semantic-search';
import { useToggleEmailStarMutation } from '@/hooks/use-email-mutations';
import { IKanbanEmail } from '@/services/kanban.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SearchResultsViewProps {
  onBack: () => void;
  onViewEmail: (emailId: string) => void;
  onStar?: (emailId: string, starred: boolean) => void;
  className?: string;
}

type SearchMode = 'fuzzy' | 'semantic' | 'both';

export function SearchResultsView({
  onBack,
  onViewEmail,
  onStar,
  className,
}: SearchResultsViewProps) {
  //Init state hook
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeQuery, setActiveQuery] = React.useState('');
  const [includeBody] = React.useState(true);
  const [searchMode, setSearchMode] = React.useState<SearchMode>('both');

  // Check semantic search availability
  const { data: semanticStatus } = useSemanticSearchStatusQuery();

  // Fuzzy search query (enabled for 'fuzzy' or 'both' mode)
  const {
    data: fuzzySearchResults,
    isLoading: isFuzzyLoading,
    error: fuzzyError,
  } = useKanbanSearchQuery(
    activeQuery,
    50,
    includeBody,
    activeQuery.trim() !== '' &&
      (searchMode === 'fuzzy' || searchMode === 'both')
  );

  // Semantic search mutation
  const semanticSearchMutation = useSemanticSearchMutation();

  // Use the star mutation hook
  const toggleStarMutation = useToggleEmailStarMutation();

  // Determine which results to use
  const searchResults = React.useMemo(() => {
    if (searchMode === 'both') {
      // Combine results from both fuzzy and semantic search
      const fuzzyResults = fuzzySearchResults?.results || [];
      const semanticResults = semanticSearchMutation.data?.results || [];

      // Create a map to deduplicate by emailId
      const resultsMap = new Map<string, IKanbanEmail>();

      // Add fuzzy results first
      fuzzyResults.forEach((result) => {
        resultsMap.set(result.emailId, result);
      });

      // Add semantic results (may override fuzzy if same emailId)
      semanticResults.forEach((result) => {
        resultsMap.set(result.emailId, {
          id: result.id,
          emailId: result.emailId,
          columnId: result.columnId,
          orderInColumn: 0,
          subject: result.subject,
          fromEmail: result.fromEmail,
          fromName: result.fromName,
          preview: result.preview,
          receivedAt: result.receivedAt,
          isRead: result.isRead,
          isStarred: result.isStarred,
          hasAttachments: result.hasAttachments,
          summary: result.summary,
          score: result.similarityScore,
          matchedFields: ['semantic'],
          createdAt: result.receivedAt,
          updatedAt: result.receivedAt,
          snoozed: false,
        } as IKanbanEmail);
      });

      const combinedResults = Array.from(resultsMap.values());

      return {
        query: activeQuery,
        totalResults: combinedResults.length,
        results: combinedResults,
      };
    } else if (searchMode === 'semantic' && semanticSearchMutation.data) {
      // Convert semantic search results to IKanbanEmail format
      return {
        query: semanticSearchMutation.data.query,
        totalResults: semanticSearchMutation.data.totalResults,
        results: semanticSearchMutation.data.results.map((result) => ({
          id: result.id,
          emailId: result.emailId,
          columnId: result.columnId,
          orderInColumn: 0,
          subject: result.subject,
          fromEmail: result.fromEmail,
          fromName: result.fromName,
          preview: result.preview,
          receivedAt: result.receivedAt,
          isRead: result.isRead,
          isStarred: result.isStarred,
          hasAttachments: result.hasAttachments,
          summary: result.summary,
          score: result.similarityScore,
          matchedFields: ['semantic'],
          createdAt: result.receivedAt,
          updatedAt: result.receivedAt,
          snoozed: false,
        })) as IKanbanEmail[],
      };
    } else if (searchMode === 'fuzzy' && fuzzySearchResults) {
      return fuzzySearchResults;
    }
    return null;
  }, [
    searchMode,
    semanticSearchMutation.data,
    fuzzySearchResults,
    activeQuery,
  ]);

  const isLoading =
    searchMode === 'both'
      ? isFuzzyLoading || semanticSearchMutation.isPending
      : searchMode === 'fuzzy'
        ? isFuzzyLoading
        : semanticSearchMutation.isPending;
  const error =
    searchMode === 'both'
      ? fuzzyError || semanticSearchMutation.error
      : searchMode === 'fuzzy'
        ? fuzzyError
        : semanticSearchMutation.error;

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setActiveQuery(trimmedQuery);

    // Perform semantic search if mode is 'semantic' or 'both'
    if (searchMode === 'semantic' || searchMode === 'both') {
      // Perform semantic search with auto-generate
      // Will automatically generate embeddings for emails that don't have them yet
      // NOTE: Set to false to test semantic search without generating embeddings
      // See: frontend/SEMANTIC_SEARCH_TESTING_GUIDE.md
      const generateMissing = true; // ✅ AUTO-GENERATE ENABLED | Set false to test without generating

      semanticSearchMutation.mutate(
        {
          query: trimmedQuery,
          limit: 50,
          minScore: 0.7,
          generateMissingEmbeddings: generateMissing,
        },
        {
          onSuccess: (data) => {
            // Show toast if embeddings were generated
            // When generateMissingEmbeddings is true, the backend generates embeddings for emails without them
            // emailsWithoutEmbeddings in response is the count AFTER generation attempt
            // If there were emails without embeddings initially, some were likely generated
            if (generateMissing && data.emailsWithoutEmbeddings > 0) {
              // Show toast - the count represents emails that still need embeddings after generation
              // Some embeddings were likely generated (the difference between initial and current count)
              toast.success(
                `✨ Generated embeddings for emails automatically`,
                {
                  duration: 3000,
                }
              );
            }
          },
          onError: (error) => {
            // Handle semantic search not available (OpenAI API key not configured)
            // Only fallback if mode is 'semantic' (not 'both', as user wants to see both results)
            if (
              error instanceof Error &&
              (error.message.includes('Semantic search is not available') ||
                error.message.includes('not available') ||
                error.message.includes('OpenAI API key not configured'))
            ) {
              if (searchMode === 'semantic') {
                toast.error(
                  'AI search is not available. Please use text search.'
                );
                setSearchMode('fuzzy');
                // Fallback to fuzzy search only if mode was 'semantic'
                setActiveQuery(trimmedQuery);
              } else {
                // In 'both' mode, just show error but don't fallback
                toast.error(
                  'AI search is not available. Showing text search results only.'
                );
              }
            } else if (
              error instanceof Error &&
              error.message.includes('Gmail not connected')
            ) {
              toast.error('Please connect your Gmail account first.');
            } else {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Semantic search failed. Please try again.'
              );
            }
          },
        }
      );
    }
    // Fuzzy search is handled automatically by the query hook (for 'fuzzy' or 'both' mode)
  };

  const handleSearchModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    // If switching mode and we have an active query, trigger search
    if (activeQuery.trim()) {
      handleSearch(activeQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveQuery('');
  };

  const handleViewResult = (result: IKanbanEmail) => {
    onViewEmail(result.emailId);
  };

  const handleStar = (emailId: string, starred: boolean) => {
    // Call the mutation
    toggleStarMutation.mutate(
      { emailId, starred },
      {
        onSuccess: () => {
          toast.success(starred ? 'Email starred' : 'Email unstarred');
          // Also call the parent callback if provided
          onStar?.(emailId, starred);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Failed to toggle star'
          );
        },
      }
    );
  };

  const hasSearched = activeQuery.trim() !== '';
  const hasResults =
    searchResults && searchResults.results && searchResults.results.length > 0;

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Header with Search Bar */}
      <div className="shrink-0 border-b bg-background p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to mail</span>
          </Button>
          <h2 className="text-lg font-semibold">Search Emails</h2>
        </div>

        <div className="space-y-2">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            onClear={handleClear}
            placeholder="Search by sender, subject, or content..."
            autoFocus
            searchMode={searchMode}
            onSearchModeChange={
              semanticStatus?.available ? handleSearchModeChange : undefined
            }
          />
          {searchMode === 'both' && semanticStatus?.available && (
            <div className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                <Search className="h-4 w-4" />
                <span>Both Text & AI Semantic Search</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Combined Results
              </Badge>
              <div className="text-xs text-blue-600 dark:text-blue-400 ml-auto">
                💡 Showing results from both search methods
              </div>
            </div>
          )}
          {searchMode === 'semantic' && semanticStatus?.available && (
            <div className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>AI-Powered Semantic Search</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Conceptual Match
              </Badge>
              <div className="text-xs text-purple-600 dark:text-purple-400 ml-auto">
                💡 Finds related emails even without exact keywords
              </div>
            </div>
          )}
        </div>

        {hasSearched && searchResults && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">
                {searchResults.totalResults}{' '}
                {searchResults.totalResults === 1 ? 'result' : 'results'}
              </span>
              <span className="text-muted-foreground">for</span>
              <Badge variant="outline" className="font-normal">
                {activeQuery}
              </Badge>
            </div>
            {(searchMode === 'semantic' || searchMode === 'both') &&
              semanticSearchMutation.data && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Sparkles className="h-3 w-3" />
                    {semanticSearchMutation.data.processingTimeMs}ms
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    📊 {semanticSearchMutation.data.emailsWithEmbeddings}{' '}
                    indexed
                  </Badge>
                  {semanticSearchMutation.data.emailsWithoutEmbeddings > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      ⚠️ {semanticSearchMutation.data.emailsWithoutEmbeddings}{' '}
                      not indexed
                    </Badge>
                  )}
                </div>
              )}
            {searchMode === 'both' && fuzzySearchResults && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  🔤 Fuzzy: {fuzzySearchResults.totalResults} results
                </Badge>
                {semanticSearchMutation.data && (
                  <Badge variant="outline" className="text-xs">
                    🧠 Semantic: {semanticSearchMutation.data.totalResults}{' '}
                    results
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Area with Fixed Scrolling */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 animate-in fade-in duration-300">
                <div className="rounded-full bg-primary/10 p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Searching emails...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Looking for &quot;{activeQuery}&quot;
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="rounded-full bg-destructive/10 p-3">
                  <SearchX className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-1">Search Error</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {error instanceof Error
                      ? error.message
                      : 'Failed to search emails. Please try again.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSearch(activeQuery)}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State - No Search Yet */}
            {!hasSearched && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 animate-in fade-in duration-500">
                <div className="rounded-full bg-primary/10 p-6 shadow-lg">
                  <SearchX className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center max-w-md">
                  <h3 className="text-xl font-semibold mb-2">
                    Search Your Emails
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enter a search query to find emails by sender, subject, or
                    content. The search is tolerant to typos and partial
                    matches.
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <p className="font-semibold mb-1">💡 Search Tips:</p>
                    <ul className="text-left space-y-1">
                      <li>
                        • Try partial words like &quot;proj&quot; for
                        &quot;project&quot;
                      </li>
                      <li>• Typos are okay - we&apos;ll find what you mean</li>
                      <li>• Search sender names, subjects, or content</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State - No Results */}
            {hasSearched && !hasResults && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 animate-in fade-in duration-300">
                <div className="rounded-full bg-muted/50 p-6">
                  <SearchX className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center max-w-md">
                  <h3 className="text-xl font-semibold mb-2">
                    No Results Found
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No emails match your search for{' '}
                    <span className="font-semibold text-foreground">
                      &quot;{activeQuery}&quot;
                    </span>
                    . Try different keywords or check your spelling.
                  </p>

                  {/* Show suggestion to try other search mode */}
                  {searchMode === 'semantic' && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 text-left">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        💡 Try Text Search
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        AI semantic search looks for{' '}
                        <strong>conceptual matches</strong> (e.g., searching
                        "money" finds "invoice", "price", "salary"). If you need
                        exact text matches, try switching to Text Search mode.
                      </p>
                    </div>
                  )}
                  {searchMode === 'fuzzy' && semanticStatus?.available && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 text-left">
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
                        💡 Try AI Semantic Search
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Text search looks for exact matches. Try AI semantic
                        search to find{' '}
                        <strong>conceptually similar emails</strong> (e.g.,
                        searching "money" finds "invoice", "price", "salary"
                        even if the word "money" isn't in the email).
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      className="transition-all hover:scale-105"
                    >
                      Clear Search
                    </Button>
                    {searchMode === 'semantic' && semanticStatus?.available && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSearchMode('fuzzy');
                          handleSearch(activeQuery);
                        }}
                      >
                        Try Text Search
                      </Button>
                    )}
                    {searchMode === 'fuzzy' && semanticStatus?.available && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSearchMode('semantic');
                          handleSearch(activeQuery);
                        }}
                        className="gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Try AI Search
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Results List */}
            {hasResults && !isLoading && !error && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {searchResults.results.map((result, index) => (
                  <div
                    key={result.emailId}
                    className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <SearchResultCard
                      result={result}
                      onView={handleViewResult}
                      onStar={handleStar}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
