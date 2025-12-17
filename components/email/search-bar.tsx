'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search emails...',
  className,
  autoFocus = false,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    onClear();
  };

  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 transition-all focus:ring-2 focus:ring-primary/20"
          autoFocus={autoFocus}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
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
