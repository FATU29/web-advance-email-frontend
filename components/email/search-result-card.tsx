'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Paperclip, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IKanbanEmail } from '@/services/kanban.service';

export interface SearchResultCardProps {
  result: IKanbanEmail;
  onView?: (result: IKanbanEmail) => void;
  onStar?: (emailId: string, starred: boolean) => void;
  className?: string;
}

export function SearchResultCard({
  result,
  onView,
  onStar,
  className,
}: SearchResultCardProps) {
  // Optimistic UI state for star status
  const [isStarred, setIsStarred] = React.useState(result.isStarred);

  // Update local state when result changes
  React.useEffect(() => {
    setIsStarred(result.isStarred);
  }, [result.isStarred]);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistically update UI
    setIsStarred(!isStarred);
    // Call the parent handler which will handle the API call
    onStar?.(result.emailId, !isStarred);
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

  const senderName = result.fromName || result.fromEmail.split('@')[0];
  const senderEmail = result.fromEmail;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
      if (diffInHours < 24 * 7) {
        return format(date, 'EEE, MMM d');
      }
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const isUnread = result.isRead === false;
  const snippet = result.summary || result.preview;

  return (
    <Card
      className={cn(
        'hover:bg-accent/50 hover:shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.01] border-border/50',
        isUnread && 'bg-accent/20 border-l-4 border-l-primary',
        className
      )}
      onClick={() => onView?.(result)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          {/* Avatar */}
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
            <AvatarImage src={undefined} alt={senderName} />
            <AvatarFallback
              className={cn(
                'text-white text-xs font-semibold',
                getAvatarColor(senderName, senderEmail)
              )}
            >
              {getInitials(senderName, senderEmail)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Sender and Date */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span
                    className={cn(
                      'text-xs sm:text-sm truncate',
                      isUnread ? 'font-semibold' : 'font-medium'
                    )}
                  >
                    {senderName}
                  </span>
                  {isUnread && (
                    <Badge
                      variant="default"
                      className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-blue-500 shrink-0"
                    >
                      New
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground truncate block">
                  {senderEmail}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {onStar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-muted transition-colors"
                    onClick={handleStarClick}
                    title={isStarred ? 'Unstar email' : 'Star email'}
                  >
                    <Star
                      className={cn(
                        'h-3 w-3 sm:h-4 sm:w-4 transition-all duration-200',
                        isStarred
                          ? 'fill-yellow-400 text-yellow-400 scale-110'
                          : 'hover:text-yellow-400'
                      )}
                    />
                  </Button>
                )}
                {result.hasAttachments && (
                  <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                )}
              </div>
            </div>

            {/* Date - Mobile: full width row, Desktop: inline */}
            <div className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:hidden">
              {formatDate(result.receivedAt)}
            </div>

            {/* Subject */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div
                className={cn(
                  'text-xs sm:text-sm line-clamp-1 flex-1 min-w-0',
                  isUnread ? 'font-semibold' : 'font-medium'
                )}
              >
                {result.subject || '(No subject)'}
              </div>
              {/* Date - Desktop only */}
              <span className="hidden sm:inline-block text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {formatDate(result.receivedAt)}
              </span>
            </div>

            {/* Snippet/Preview */}
            {snippet && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                {snippet}
              </p>
            )}

            {/* Search Metadata */}
            {(result.score !== undefined || result.matchedFields) && (
              <div className="mt-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {result.score !== undefined && (
                  <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:from-purple-100 hover:to-blue-100 transition-colors"
                    title={
                      result.matchedFields?.includes('semantic')
                        ? "Conceptual Match: This email is semantically related to your search query, even if it doesn't contain the exact keywords."
                        : `Relevance Score: ${Math.round(result.score * 100)}% similarity`
                    }
                  >
                    {result.matchedFields?.includes('semantic') ? (
                      <>
                        <span className="font-semibold mr-1">
                          🧠 Conceptual Match:
                        </span>
                        {Math.round(result.score * 100)}%
                      </>
                    ) : (
                      <>
                        <span className="font-semibold mr-1">Relevance:</span>
                        {Math.round(result.score * 100)}%
                      </>
                    )}
                  </Badge>
                )}
                {result.matchedFields &&
                  result.matchedFields.length > 0 &&
                  !result.matchedFields.includes('semantic') && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <span className="font-semibold mr-1">Matched:</span>
                      {result.matchedFields
                        .map((field) =>
                          field === 'fromName'
                            ? 'sender'
                            : field === 'fromEmail'
                              ? 'email'
                              : field
                        )
                        .join(', ')}
                    </Badge>
                  )}
              </div>
            )}

            {/* View Button - Mobile: full width, Desktop: right side */}
            <div className="mt-2 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(result);
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>

          {/* View Button - Desktop only */}
          <div className="hidden sm:block shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(result);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
