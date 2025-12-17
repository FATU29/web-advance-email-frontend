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
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 shrink-0">
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
          <div className="flex-1 min-w-0">
            {/* Sender and Date */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm truncate',
                      isUnread ? 'font-semibold' : 'font-medium'
                    )}
                  >
                    {senderName}
                  </span>
                  {isUnread && (
                    <Badge
                      variant="default"
                      className="h-5 px-1.5 text-xs bg-blue-500"
                    >
                      New
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate block">
                  {senderEmail}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onStar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-muted transition-colors"
                    onClick={handleStarClick}
                    title={isStarred ? 'Unstar email' : 'Star email'}
                  >
                    <Star
                      className={cn(
                        'h-4 w-4 transition-all duration-200',
                        isStarred
                          ? 'fill-yellow-400 text-yellow-400 scale-110'
                          : 'hover:text-yellow-400'
                      )}
                    />
                  </Button>
                )}
                {result.hasAttachments && (
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(result.receivedAt)}
                </span>
              </div>
            </div>

            {/* Subject */}
            <div
              className={cn(
                'text-sm mb-1 line-clamp-1',
                isUnread ? 'font-semibold' : 'font-medium'
              )}
            >
              {result.subject || '(No subject)'}
            </div>

            {/* Snippet/Preview */}
            {snippet && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {snippet}
              </p>
            )}

            {/* Search Metadata */}
            {(result.score !== undefined || result.matchedFields) && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {result.score !== undefined && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-semibold mr-1">Relevance:</span>
                    {Math.round(result.score * 100)}%
                  </Badge>
                )}
                {result.matchedFields && result.matchedFields.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
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
          </div>

          {/* View Button */}
          <div className="shrink-0">
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
