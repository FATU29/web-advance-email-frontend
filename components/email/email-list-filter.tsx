'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'sender-asc'
  | 'sender-desc'
  | 'subject-asc'
  | 'subject-desc';

export type FilterOption = 'all' | 'unread' | 'read';

export interface EmailListFilterProps {
  searchQuery: string;
  sortBy: SortOption;
  filterBy: FilterOption;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
}

export function EmailListFilter({
  searchQuery,
  sortBy,
  filterBy,
  onSearchChange,
  onSortChange,
  onFilterChange,
}: EmailListFilterProps) {
  //Init state hook
  const isMobile = useIsMobile();

  //Init event handle
  const handleClearSearch = () => {
    onSearchChange('');
  };

  //Render mobile layout
  if (isMobile) {
    return (
      <div className="border-b p-2">
        <div className="flex flex-col gap-2">
          {/* Search Input - Full width on mobile */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9 h-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                onClick={handleClearSearch}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          {/* Sort and Filter - Row on mobile */}
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) => onSortChange(value as SortOption)}
            >
              <SelectTrigger className="h-9 flex-1 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="sender-asc">Sender A-Z</SelectItem>
                <SelectItem value="sender-desc">Sender Z-A</SelectItem>
                <SelectItem value="subject-asc">Subject A-Z</SelectItem>
                <SelectItem value="subject-desc">Subject Z-A</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterBy}
              onValueChange={(value) => onFilterChange(value as FilterOption)}
            >
              <SelectTrigger className="h-9 flex-1 text-xs">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  //Render desktop layout
  return (
    <div className="border-b p-3">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
              onClick={handleClearSearch}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        {/* Sort Select */}
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest first</SelectItem>
            <SelectItem value="date-asc">Oldest first</SelectItem>
            <SelectItem value="sender-asc">Sender A-Z</SelectItem>
            <SelectItem value="sender-desc">Sender Z-A</SelectItem>
            <SelectItem value="subject-asc">Subject A-Z</SelectItem>
            <SelectItem value="subject-desc">Subject Z-A</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Select */}
        <Select
          value={filterBy}
          onValueChange={(value) => onFilterChange(value as FilterOption)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
