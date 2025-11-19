'use client';

import * as React from 'react';

import { EmailItem } from './email-item';
import { EmailListFilter, SortOption, FilterOption } from './email-list-filter';
import { ParsedMessage, MailListProps } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

export interface EmailListProps extends MailListProps {
  emails?: ParsedMessage[];
  loading?: boolean;
  selectedEmails?: Set<string>;
  onEmailSelect?: (emailId: string, selected: boolean) => void;
  onEmailClick?: (email: ParsedMessage) => void;
  onSelectAll?: (selected: boolean) => void;
  error?: string | null;
}

export function EmailList({
  emails = [],
  loading = false,
  selectedEmails = new Set(),
  onEmailSelect,
  onEmailClick,
  onSelectAll,
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

  // Auto set compact mode on mobile
  const isCompact = isCompactProp || isMobile;

  //Init effect hook
  React.useEffect(() => {
    setLocalSelected(selectedEmails);
  }, [selectedEmails]);

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

  //Init util function
  const filteredAndSortedEmails = React.useMemo(() => {
    let filtered = [...emails];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(query) ||
          email.sender.name?.toLowerCase().includes(query) ||
          email.sender.email.toLowerCase().includes(query) ||
          email.body.toLowerCase().includes(query)
      );
    }

    // Filter by read/unread
    if (filterBy === 'unread') {
      filtered = filtered.filter((email) => email.unread);
    } else if (filterBy === 'read') {
      filtered = filtered.filter((email) => !email.unread);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (
            new Date(b.receivedOn).getTime() - new Date(a.receivedOn).getTime()
          );
        case 'date-asc':
          return (
            new Date(a.receivedOn).getTime() - new Date(b.receivedOn).getTime()
          );
        case 'sender-asc':
          return (a.sender.name || a.sender.email).localeCompare(
            b.sender.name || b.sender.email
          );
        case 'sender-desc':
          return (b.sender.name || b.sender.email).localeCompare(
            a.sender.name || a.sender.email
          );
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
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="rounded-none border-x-0 border-t-0">
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

  //Render email list
  return (
    <div className="flex h-full flex-col">
      {/* Filter Section */}
      <EmailListFilter
        searchQuery={searchQuery}
        sortBy={sortBy}
        filterBy={filterBy}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onFilterChange={setFilterBy}
      />

      {/* Email List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filteredAndSortedEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-sm text-muted-foreground">
                No emails match your filters
              </p>
            </div>
          ) : (
            filteredAndSortedEmails.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                isSelected={localSelected.has(email.id)}
                onSelect={handleEmailSelect}
                onClick={onEmailClick}
                isCompact={isCompact}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
