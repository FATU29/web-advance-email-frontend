'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Paperclip, Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IEmailListItem } from '@/types/api.types';

export interface EmailItemProps {
  email: IEmailListItem;
  isSelected?: boolean;
  isFocused?: boolean;
  onSelect?: (emailId: string, selected: boolean) => void;
  onClick?: (email: IEmailListItem) => void;
  isCompact?: boolean;
}

export function EmailItem({
  email,
  isSelected = false,
  isFocused = false,
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

  // Generate consistent random color based on email/name
  const getAvatarColor = (name?: string, email?: string) => {
    const str = name || email || 'default';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Extract sender name and email from API format
  const senderName = email.fromName || email.from.split('@')[0];
  const senderEmail = email.from;

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

  // Check if email is unread - handle both 'read' and 'isRead' fields from API
  // API returns 'read' but type interface uses 'isRead'
  const isUnread = !(email.isRead ?? (email as any).read ?? false);

  // Debug log to check email data
  React.useEffect(() => {
    if (email.subject === 'Hello WOrld') {
      console.log('Email data:', {
        id: email.id,
        subject: email.subject,
        isRead: email.isRead,
        read: (email as any).read,
        isUnread: isUnread,
      });
    }
  }, [email, isUnread]);

  //Render
  return (
    <Card
      className={cn(
        'group relative cursor-pointer rounded-none border-x-0 border-t-0 transition-colors',
        'hover:bg-accent/50',
        isSelected && 'bg-accent',
        isUnread && 'bg-primary/5 border-l-4 border-l-primary',
        isFocused &&
          'bg-primary/10 border-l-4 border-l-primary ring-2 ring-primary/30'
      )}
      onClick={handleClick}
    >
      <CardContent
        className={cn(
          'p-3 md:p-4',
          isFocused &&
            'bg-primary/5 border-l-4 border-l-primary ring-2 ring-primary/20'
        )}
      >
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
            {/* Unread indicator - only show when email is unread and checkbox is not visible */}
            {isUnread && !isSelected && (
              <div className="absolute -left-1.5 top-1/2 size-2 md:size-2.5 -translate-y-1/2 rounded-full bg-blue-600 ring-2 ring-background shadow-sm group-hover:opacity-0 transition-opacity" />
            )}
          </div>

          {/* Avatar with unread indicator */}
          {!isCompact && (
            <div className="relative">
              <Avatar className="size-8 shrink-0 md:size-10">
                <AvatarImage src={senderEmail} alt={senderName} />
                <AvatarFallback
                  className={cn(
                    'text-white text-xs md:text-sm font-semibold',
                    getAvatarColor(senderName, senderEmail)
                  )}
                >
                  {getInitials(senderName, senderEmail)}
                </AvatarFallback>
              </Avatar>
              {isUnread && (
                <div className="absolute -top-0.5 -right-0.5 size-2.5 md:size-3 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
              )}
            </div>
          )}

          {/* Compact mode unread indicator */}
          {isCompact && isUnread && (
            <div className="size-2 md:size-2.5 shrink-0 rounded-full bg-blue-600 shadow-sm mt-1.5" />
          )}

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1 md:gap-2">
                {/* Sender */}
                <span
                  className={cn(
                    'truncate text-xs md:text-sm',
                    isUnread
                      ? 'font-bold text-foreground'
                      : 'font-normal text-muted-foreground'
                  )}
                >
                  {senderName || senderEmail}
                </span>

                {/* Important indicator */}
                {email.isImportant && (
                  <Badge variant="secondary" className="text-xs">
                    Important
                  </Badge>
                )}
              </div>

              {/* Date */}
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(email.receivedAt)}
              </span>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'truncate text-xs md:text-sm',
                  isUnread
                    ? 'font-bold text-foreground'
                    : 'font-normal text-muted-foreground'
                )}
              >
                {email.subject || '(No Subject)'}
              </span>

              {/* Indicators */}
              <div className="flex items-center gap-1">
                {email.hasAttachments && (
                  <Paperclip className="size-3 shrink-0 text-muted-foreground md:size-3.5" />
                )}
                {email.isStarred && (
                  <Star className="size-3 shrink-0 text-yellow-500 fill-yellow-500 md:size-3.5" />
                )}
              </div>
            </div>

            {/* Preview */}
            {!isCompact && email.preview && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {email.preview || 'No preview available'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
