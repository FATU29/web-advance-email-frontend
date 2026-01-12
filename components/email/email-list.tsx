'use client';

import * as React from 'react';

import { EmailItem } from './email-item';
import { EmailListFilter, SortOption, FilterOption } from './email-list-filter';
import { IEmailListItem } from '@/types/api.types';
import { MailListProps } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2, Archive, Trash2, Star, Mail, MailOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface EmailListProps extends MailListProps {
  emails?: IEmailListItem[];
  loading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  selectedEmails?: Set<string>;
  onEmailSelect?: (emailId: string, selected: boolean) => void;
  onEmailClick?: (email: IEmailListItem) => void;
  onSelectAll?: (selected: boolean) => void;
  onBulkAction?: (
    action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive',
    emailIds: string[]
  ) => void;
  onToggleKanban?: () => void;
  focusedEmailIndex?: number;
  error?: string | null;
}

export function EmailList({
  emails = [],
  loading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  selectedEmails = new Set(),
  onEmailSelect,
  onEmailClick,
  onSelectAll,
  onBulkAction,
  onToggleKanban,
  focusedEmailIndex = -1,
  isCompact: isCompactProp = false,
  error = null,
}: EmailListProps) {
  //Init state hook
  const [localSelected, setLocalSelected] =
    React.useState<Set<string>>(selectedEmails);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortOption>('date-desc');
  const [filterBy, setFilterBy] = React.useState<FilterOption>('all');
  const isMobile = useIsMobile();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = React.useRef(false);
  const emailItemRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  // Auto set compact mode on mobile
  const isCompact = isCompactProp || isMobile;

  //Init util function
  const filteredAndSortedEmails = React.useMemo(() => {
    let filtered = [...emails];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(query) ||
          email.fromName?.toLowerCase().includes(query) ||
          email.from.toLowerCase().includes(query) ||
          email.preview.toLowerCase().includes(query)
      );
    }

    // Filter by read/unread
    if (filterBy === 'unread') {
      filtered = filtered.filter((email) => !email.isRead);
    } else if (filterBy === 'read') {
      filtered = filtered.filter((email) => email.isRead);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
          );
        case 'date-asc':
          return (
            new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
          );
        case 'sender-asc':
          return (a.fromName || a.from).localeCompare(b.fromName || b.from);
        case 'sender-desc':
          return (b.fromName || b.from).localeCompare(a.fromName || a.from);
        case 'subject-asc':
          return a.subject.localeCompare(b.subject);
        case 'subject-desc':
          return b.subject.localeCompare(a.subject);
        default:
          return 0;
      }
    });

    return filtered;
  }, [emails, searchQuery, sortBy, filterBy]);

  // Scroll focused email into view
  React.useEffect(() => {
    if (
      focusedEmailIndex >= 0 &&
      focusedEmailIndex < filteredAndSortedEmails.length
    ) {
      const emailItemElement = emailItemRefs.current.get(focusedEmailIndex);
      if (emailItemElement) {
        // Find the scrollable viewport
        const findViewport = (): HTMLElement | null => {
          return (scrollContainerRef.current?.querySelector(
            '[data-slot="scroll-area-viewport"]'
          ) ||
            scrollContainerRef.current?.querySelector(
              '[data-radix-scroll-area-viewport]'
            ) ||
            null) as HTMLElement | null;
        };

        const viewport = findViewport();
        if (viewport) {
          const itemRect = emailItemElement.getBoundingClientRect();
          const viewportRect = viewport.getBoundingClientRect();

          // Check if item is outside viewport
          if (
            itemRect.top < viewportRect.top ||
            itemRect.bottom > viewportRect.bottom
          ) {
            emailItemElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        }
      }
    }
  }, [focusedEmailIndex, filteredAndSortedEmails.length]);

  //Init effect hook
  React.useEffect(() => {
    setLocalSelected(selectedEmails);
  }, [selectedEmails]);

  // Handle scroll to detect when near bottom
  React.useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    // Find the actual scrollable viewport element from ScrollArea
    const findViewport = (): HTMLElement | null => {
      // Try multiple selectors to find the viewport
      return (scrollContainerRef.current?.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) ||
        scrollContainerRef.current?.querySelector(
          '[data-radix-scroll-area-viewport]'
        ) ||
        null) as HTMLElement | null;
    };

    let viewport: HTMLElement | null = null;
    let mounted = true;
    let cleanupFn: (() => void) | null = null;

    // Wait a bit for ScrollArea to render
    const timeoutId = setTimeout(() => {
      if (!mounted) return;

      viewport = findViewport();
      if (!viewport) {
        console.warn('ScrollArea viewport not found');
        return;
      }

      const handleScroll = () => {
        if (!mounted || !viewport || isLoadingMore || isLoadingMoreRef.current)
          return;

        const { scrollTop, scrollHeight, clientHeight } = viewport;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const isNearBottom = distanceFromBottom < 200; // 200px threshold

        if (
          isNearBottom &&
          hasMore &&
          !isLoadingMore &&
          !isLoadingMoreRef.current
        ) {
          isLoadingMoreRef.current = true;
          onLoadMore();
        }
      };

      viewport.addEventListener('scroll', handleScroll, { passive: true });

      // Also check on mount if already scrolled near bottom
      handleScroll();

      cleanupFn = () => {
        viewport?.removeEventListener('scroll', handleScroll);
      };
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore, emails.length]);

  // Reset loading ref when loading completes
  React.useEffect(() => {
    if (!isLoadingMore) {
      isLoadingMoreRef.current = false;
    }
  }, [isLoadingMore]);

  //Init event handle
  const handleEmailSelect = (emailId: string, selected: boolean) => {
    const newSelected = new Set(localSelected);
    if (selected) {
      newSelected.add(emailId);
    } else {
      newSelected.delete(emailId);
    }
    setLocalSelected(newSelected);
    onEmailSelect?.(emailId, selected);
  };

  const _handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(emails.map((email) => email.id));
      setLocalSelected(allIds);
      emails.forEach((email) => {
        onEmailSelect?.(email.id, true);
      });
    } else {
      setLocalSelected(new Set());
      emails.forEach((email) => {
        onEmailSelect?.(email.id, false);
      });
    }
    onSelectAll?.(checked);
  };

  //Render loading state
  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-2 md:p-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-full md:w-32" />
            <Skeleton className="h-9 w-full md:w-32" />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card
                  key={index}
                  className="rounded-none border-x-0 border-t-0"
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <Skeleton className="size-4 shrink-0" />
                      {!isCompact && (
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-4 w-24 md:w-32" />
                          <Skeleton className="h-3 w-12 md:w-16" />
                        </div>
                        <Skeleton className="h-4 w-32 md:w-48" />
                        {!isCompact && <Skeleton className="h-3 w-full" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  //Render error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-center px-4">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  //Render empty state
  if (emails.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-center px-4">
        <p className="text-sm text-muted-foreground">No emails found</p>
      </div>
    );
  }

  //Init event handle
  const handleBulkActionClick = (
    action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive'
  ) => {
    if (localSelected.size > 0 && onBulkAction) {
      onBulkAction(action, Array.from(localSelected));
    }
  };

  //Render email list
  return (
    <div className="flex h-full flex-col">
      {/* Bulk Actions Toolbar */}
      {localSelected.size > 0 && (
        <div className="border-b bg-muted/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {localSelected.size} selected
            </span>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkActionClick('read')}
                className="h-8 gap-1.5"
              >
                <MailOpen className="size-3.5" />
                <span className="hidden sm:inline">Mark as read</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkActionClick('unread')}
                className="h-8 gap-1.5"
              >
                <Mail className="size-3.5" />
                <span className="hidden sm:inline">Mark as unread</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkActionClick('star')}
                className="h-8 gap-1.5"
              >
                <Star className="size-3.5" />
                <span className="hidden sm:inline">Star</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkActionClick('unstar')}
                className="h-8 gap-1.5"
              >
                <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                <span className="hidden sm:inline">Unstar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkActionClick('archive')}
                className="h-8 gap-1.5"
              >
                <Archive className="size-3.5" />
                <span className="hidden sm:inline">Archive</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkActionClick('delete')}
                className="h-8 gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <EmailListFilter
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterBy={filterBy}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
        onToggleKanban={onToggleKanban}
      />

      {/* Email List */}
      <div className="flex-1 min-h-0 overflow-hidden" ref={scrollContainerRef}>
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {filteredAndSortedEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <p className="text-sm text-muted-foreground">
                  No emails match your filters
                </p>
              </div>
            ) : (
              <>
                {filteredAndSortedEmails.map((email, index) => (
                  <div
                    key={email.id}
                    ref={(el) => {
                      if (el) {
                        emailItemRefs.current.set(index, el);
                      } else {
                        emailItemRefs.current.delete(index);
                      }
                    }}
                  >
                    <EmailItem
                      email={email}
                      isSelected={localSelected.has(email.id)}
                      isFocused={focusedEmailIndex === index}
                      onSelect={handleEmailSelect}
                      onClick={onEmailClick}
                      isCompact={isCompact}
                    />
                  </div>
                ))}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Loading more emails...
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
