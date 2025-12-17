'use client';

import * as React from 'react';
import { Filter, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type SortOption = 'date-desc' | 'date-asc' | 'sender';
export type FilterType = 'unread' | 'attachments' | 'starred';

export interface KanbanFiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeFilters: Set<FilterType>;
  onFiltersChange: (filters: Set<FilterType>) => void;
  className?: string;
}

const sortLabels: Record<SortOption, string> = {
  'date-desc': 'Date: Newest First',
  'date-asc': 'Date: Oldest First',
  sender: 'Sender Name',
};

const filterLabels: Record<FilterType, string> = {
  unread: 'Unread Only',
  attachments: 'With Attachments',
  starred: 'Starred Only',
};

export function KanbanFilters({
  sortBy,
  onSortChange,
  activeFilters,
  onFiltersChange,
  className,
}: KanbanFiltersProps) {
  const toggleFilter = (filter: FilterType) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange(new Set());
  };

  const hasActiveFilters = activeFilters.size > 0;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-accent transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <DropdownMenuRadioItem value="date-desc">
              Date: Newest First
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date-asc">
              Date: Oldest First
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="sender">
              Sender Name
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 hover:bg-accent transition-colors',
              hasActiveFilters && 'border-primary/50 bg-primary/5'
            )}
          >
            <Filter className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 px-1.5 py-0 bg-primary text-primary-foreground"
              >
                {activeFilters.size}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel>Filter By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={activeFilters.has('unread')}
            onCheckedChange={() => toggleFilter('unread')}
          >
            Unread Only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={activeFilters.has('attachments')}
            onCheckedChange={() => toggleFilter('attachments')}
          >
            With Attachments
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={activeFilters.has('starred')}
            onCheckedChange={() => toggleFilter('starred')}
          >
            Starred Only
          </DropdownMenuCheckboxItem>
          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={clearAllFilters}
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-left-2 duration-300">
          {Array.from(activeFilters).map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="gap-1 pl-2.5 pr-1 cursor-pointer hover:bg-secondary/80 transition-all hover:scale-105 active:scale-95 bg-primary/10 border-primary/20 text-primary"
              onClick={() => toggleFilter(filter)}
            >
              {filterLabels[filter]}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Current Sort Display */}
      <div className="text-sm text-muted-foreground ml-auto hidden md:block">
        <span className="font-medium">Sorted by:</span> {sortLabels[sortBy]}
      </div>
    </div>
  );
}
