'use client';

import * as React from 'react';
import { Search, X, User, Hash, Clock, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSearchSuggestionsQuery } from '@/hooks/use-search-suggestions';
import { useDebounce } from '@/hooks/useDebounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
  searchMode?: 'fuzzy' | 'semantic' | 'both';
  onSearchModeChange?: (mode: 'fuzzy' | 'semantic' | 'both') => void;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search emails...',
  className,
  autoFocus = false,
  showSuggestions = true,
  searchMode = 'fuzzy',
  onSearchModeChange,
}: SearchBarProps) {
  //Init state hook
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  // Debounce search query for suggestions
  const debouncedQuery = useDebounce(value, 300);

  // Fetch suggestions (always enabled when showSuggestions is true, not just when focused)
  const { data: suggestions, isLoading: suggestionsLoading } =
    useSearchSuggestionsQuery(debouncedQuery, 5, showSuggestions);

  // Build flat list of suggestions for keyboard navigation
  const flatSuggestions = React.useMemo(() => {
    const items: Array<{
      type: 'contact' | 'keyword' | 'recent';
      value: string;
      label: string;
      subtitle?: string;
      icon: React.ReactNode;
    }> = [];

    if (suggestions) {
      // Contacts
      suggestions.contacts.forEach((contact) => {
        items.push({
          type: 'contact',
          value: `from:${contact.email}`,
          label: contact.name,
          subtitle: contact.email,
          icon: <User className="h-4 w-4" />,
        });
      });

      // Keywords
      suggestions.keywords.forEach((keyword) => {
        items.push({
          type: 'keyword',
          value: keyword.keyword,
          label: keyword.keyword,
          subtitle: `${keyword.frequency} emails`,
          icon: <Hash className="h-4 w-4" />,
        });
      });

      // Recent searches
      suggestions.recentSearches.forEach((search) => {
        items.push({
          type: 'recent',
          value: search,
          label: search,
          icon: <Clock className="h-4 w-4" />,
        });
      });
    }

    return items;
  }, [suggestions]);

  const hasSuggestions =
    flatSuggestions.length > 0 && isFocused && value.trim().length >= 2;

  //Init event handle
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatSuggestions.length) {
        // Select suggestion
        const suggestion = flatSuggestions[selectedIndex];
        onChange(suggestion.value);
        onSearch(suggestion.value);
        setIsFocused(false);
        setSelectedIndex(-1);
      } else if (value.trim()) {
        // Search current value
        onSearch(value.trim());
        setIsFocused(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < flatSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    onChange('');
    onClear();
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestionValue: string) => {
    onChange(suggestionValue);
    onSearch(suggestionValue);
    setIsFocused(false);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setSelectedIndex(-1);
  };

  const handleBlur = (_e: React.FocusEvent) => {
    // Delay blur to allow click on suggestions
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    }, 200);
  };

  // Scroll selected suggestion into view
  React.useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.querySelector(
        `[data-suggestion-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  //Render
  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors pointer-events-none z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="pl-9 pr-9 transition-all focus:ring-2 focus:ring-primary/20"
            autoFocus={autoFocus}
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors z-10"
              onClick={handleClear}
              type="button"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {hasSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-[400px] animate-in fade-in slide-in-from-top-2"
          >
            <div className="max-h-[400px] overflow-y-auto">
              <div className="p-1">
                {/* Contacts Section */}
                {suggestions && suggestions.contacts.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Contacts
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {suggestions.contacts.length}
                      </Badge>
                    </div>
                    {suggestions.contacts.map((contact) => {
                      const flatIndex = flatSuggestions.findIndex(
                        (s) =>
                          s.type === 'contact' &&
                          s.value === `from:${contact.email}`
                      );
                      return (
                        <div
                          key={contact.email}
                          data-suggestion-index={flatIndex}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all',
                            selectedIndex === flatIndex
                              ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                              : 'hover:bg-accent/70 hover:shadow-sm'
                          )}
                          onClick={() =>
                            handleSuggestionClick(`from:${contact.email}`)
                          }
                        >
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shrink-0 text-xs">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">
                              {contact.name}
                            </div>
                            <div className="text-xs opacity-70 truncate">
                              {contact.email}
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {contact.emailCount}
                          </Badge>
                        </div>
                      );
                    })}
                    {(suggestions.keywords.length > 0 ||
                      suggestions.recentSearches.length > 0) && (
                      <Separator className="my-2" />
                    )}
                  </>
                )}

                {/* Keywords Section */}
                {suggestions && suggestions.keywords.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      Keywords
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {suggestions.keywords.length}
                      </Badge>
                    </div>
                    {suggestions.keywords.map((keyword) => {
                      const flatIndex = flatSuggestions.findIndex(
                        (s) =>
                          s.type === 'keyword' && s.value === keyword.keyword
                      );
                      return (
                        <div
                          key={keyword.keyword}
                          data-suggestion-index={flatIndex}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all',
                            selectedIndex === flatIndex
                              ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                              : 'hover:bg-accent/70 hover:shadow-sm'
                          )}
                          onClick={() => handleSuggestionClick(keyword.keyword)}
                        >
                          <div className="h-8 w-8 rounded-md bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shrink-0">
                            <Hash className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {keyword.keyword}
                            </div>
                            <div className="text-xs opacity-70">
                              Found in subject or content
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {keyword.frequency}x
                          </Badge>
                        </div>
                      );
                    })}
                    {suggestions.recentSearches.length > 0 && (
                      <Separator className="my-2" />
                    )}
                  </>
                )}

                {/* Recent Searches Section */}
                {suggestions && suggestions.recentSearches.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {suggestions.recentSearches.length}
                      </Badge>
                    </div>
                    {suggestions.recentSearches.map((search) => {
                      const flatIndex = flatSuggestions.findIndex(
                        (s) => s.type === 'recent' && s.value === search
                      );
                      return (
                        <div
                          key={search}
                          data-suggestion-index={flatIndex}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all',
                            selectedIndex === flatIndex
                              ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                              : 'hover:bg-accent/70 hover:shadow-sm'
                          )}
                          onClick={() => handleSuggestionClick(search)}
                        >
                          <div className="h-8 w-8 rounded-md bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shrink-0">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {search}
                            </div>
                            <div className="text-xs opacity-70">
                              Previous search
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Loading State */}
                {suggestionsLoading && (
                  <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                    Loading suggestions...
                  </div>
                )}

                {/* Empty State */}
                {!suggestionsLoading &&
                  flatSuggestions.length === 0 &&
                  value.trim().length >= 2 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                      No suggestions found
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Mode Toggle - 3 buttons: Both, Semantic, Fuzzy */}
      {onSearchModeChange && (
        <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
          <Button
            variant={searchMode === 'both' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => onSearchModeChange('both')}
            title="Search with both text and AI semantic search"
          >
            Both
          </Button>
          <Button
            variant={searchMode === 'semantic' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => onSearchModeChange('semantic')}
            title="AI-powered conceptual search"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Semantic
          </Button>
          <Button
            variant={searchMode === 'fuzzy' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => onSearchModeChange('fuzzy')}
            title="Text search with typo tolerance"
          >
            Fuzzy
          </Button>
        </div>
      )}

      <Button
        onClick={() => value.trim() && onSearch(value.trim())}
        disabled={!value.trim()}
        className="transition-all hover:scale-105 active:scale-95 disabled:scale-100"
      >
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  );
}
