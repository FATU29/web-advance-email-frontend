'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Paperclip } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ParsedMessage } from '@/types';

export interface EmailItemProps {
  email: ParsedMessage;
  isSelected?: boolean;
  onSelect?: (emailId: string, selected: boolean) => void;
  onClick?: (email: ParsedMessage) => void;
  isCompact?: boolean;
}

export function EmailItem({
  email,
  isSelected = false,
  onSelect,
  onClick,
  isCompact = false,
}: EmailItemProps) {
  //Init event handle
  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(email.id, checked);
  };

  const handleClick = () => {
    onClick?.(email);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
      if (diffInHours < 24 * 7) {
        return format(date, 'EEE');
      }
      return format(date, 'MMM d');
    } catch {
      return dateString;
    }
  };

  const hasAttachments = email.attachments && email.attachments.length > 0;

  //Render
  return (
    <Card
      className={cn(
        'group relative cursor-pointer rounded-none border-x-0 border-t-0 transition-colors',
        'hover:bg-accent/50',
        isSelected && 'bg-accent',
        !email.unread && 'bg-muted/30'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          {/* Checkbox and Unread Indicator */}
          <div
            className="relative flex items-center pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
            />
            {/* Unread indicator - next to checkbox */}
            {email.unread && (
              <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
            )}
          </div>

          {/* Avatar */}
          {!isCompact && (
            <Avatar className="size-8 shrink-0 md:size-10">
              <AvatarImage src={email.sender.email} alt={email.sender.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
                {getInitials(email.sender.name, email.sender.email)}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1 md:gap-2">
                {/* Sender */}
                <span
                  className={cn(
                    'truncate text-xs md:text-sm font-medium',
                    email.unread ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {email.sender.name || email.sender.email}
                </span>

                {/* Labels/Tags */}
                {email.tags && email.tags.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1">
                    {email.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={
                          tag.color
                            ? {
                                backgroundColor: tag.color.backgroundColor,
                                color: tag.color.textColor,
                                borderColor: tag.color.backgroundColor,
                              }
                            : undefined
                        }
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {email.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{email.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Date */}
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(email.receivedOn)}
              </span>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'truncate text-xs md:text-sm',
                  email.unread
                    ? 'font-semibold text-foreground'
                    : 'font-normal text-muted-foreground'
                )}
              >
                {email.subject || '(No Subject)'}
              </span>

              {/* Indicators */}
              <div className="flex items-center gap-1">
                {hasAttachments && (
                  <Paperclip className="size-3 shrink-0 text-muted-foreground md:size-3.5" />
                )}
                {email.isDraft && (
                  <Badge variant="outline" className="text-xs">
                    Draft
                  </Badge>
                )}
              </div>
            </div>

            {/* Preview */}
            {!isCompact && email.body && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {email.body.replace(/<[^>]*>/g, '').trim() ||
                  'No preview available'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
