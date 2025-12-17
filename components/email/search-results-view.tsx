'use client';

import * as React from 'react';
import { ArrowLeft, Loader2, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchBar } from './search-bar';
import { SearchResultCard } from './search-result-card';
import { useKanbanSearchQuery } from '@/hooks/use-kanban-search';
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

export function SearchResultsView({
  onBack,
  onViewEmail,
  onStar,
  className,
}: SearchResultsViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeQuery, setActiveQuery] = React.useState('');
  const [includeBody] = React.useState(false);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useKanbanSearchQuery(
    activeQuery,
    50,
    includeBody,
    activeQuery.trim() !== ''
  );

  // Use the star mutation hook
  const toggleStarMutation = useToggleEmailStarMutation();

  const handleSearch = (query: string) => {
    setActiveQuery(query);
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
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with Search Bar */}
      <div className="border-b bg-background p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to mail</span>
          </Button>
          <h2 className="text-lg font-semibold">Search Emails</h2>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          onClear={handleClear}
          placeholder="Search by sender, subject, or content..."
          autoFocus
        />

        {hasSearched && searchResults && (
          <div className="text-sm text-muted-foreground">
            Found {searchResults.totalResults}{' '}
            {searchResults.totalResults === 1 ? 'result' : 'results'} for &quot;
            {activeQuery}&quot;
          </div>
        )}
      </div>

      {/* Results Area */}
      <ScrollArea className="flex-1">
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
                  content. The search is tolerant to typos and partial matches.
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
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No emails match your search for{' '}
                  <span className="font-semibold text-foreground">
                    &quot;{activeQuery}&quot;
                  </span>
                  . Try different keywords or check your spelling.
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="transition-all hover:scale-105"
                  >
                    Clear Search
                  </Button>
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
  );
}
