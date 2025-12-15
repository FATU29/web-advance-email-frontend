'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  Clock,
  ExternalLink,
  MoreVertical,
  Star,
  Sparkles,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IEmailListItem } from '@/types/api.types';
import { cn } from '@/lib/utils';

export interface KanbanCardProps {
  email: IEmailListItem;
  onOpen?: (email: IEmailListItem) => void;
  onSnooze?: (email: IEmailListItem) => void;
  onStar?: (emailId: string, starred: boolean) => void;
  onGenerateSummary?: (emailId: string) => void;
  isGeneratingSummary?: boolean;
}

export function KanbanCard({
  email,
  onOpen,
  onSnooze,
  onStar,
  onGenerateSummary,
  isGeneratingSummary = false,
}: KanbanCardProps) {
  //Init use hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: email.id,
    data: {
      type: 'email',
      email,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  //Init util function
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

      if (diffInHours < 24) {
        return format(date, 'h:mm a');
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d');
      }
    } catch {
      return dateString;
    }
  };

  const senderName = email.fromName || email.from.split('@')[0];
  const senderEmail = email.from;

  //Init event handle
  const handleOpen = () => {
    onOpen?.(email);
  };

  const handleSnooze = () => {
    onSnooze?.(email);
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStar?.(email.id, !email.isStarred);
  };

  const handleGenerateSummary = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGenerateSummary?.(email.id);
  };

  //Render
  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group cursor-grab active:cursor-grabbing transition-all hover:shadow-lg border-2',
        !email.isRead && 'border-l-4 border-l-primary',
        isDragging && 'opacity-50 scale-95 shadow-xl',
        !isDragging && 'hover:scale-[1.02]'
      )}
      onClick={handleOpen}
    >
      <div className="p-2 md:p-2.5 space-y-1.5 md:space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="size-7 shrink-0">
              <AvatarImage src={senderEmail} alt={senderName} />
              <AvatarFallback
                className={cn(
                  'text-xs text-white font-semibold',
                  getAvatarColor(senderName, senderEmail)
                )}
              >
                {getInitials(senderName, senderEmail)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {senderName || senderEmail}
                </span>
                {email.isStarred && (
                  <Star className="size-3 fill-yellow-500 text-yellow-500 shrink-0" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(email.receivedAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              onClick={handleStar}
            >
              <Star
                className={cn(
                  'size-3.5',
                  email.isStarred && 'fill-yellow-500 text-yellow-500'
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                {!email.aiSummary && onGenerateSummary && (
                  <DropdownMenuItem
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                  >
                    <Sparkles className="size-4 mr-2" />
                    {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSnooze}>
                  <Clock className="size-4 mr-2" />
                  Snooze
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpen}>
                  <ExternalLink className="size-4 mr-2" />
                  Open Mail
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Subject */}
        <div>
          <h4 className="text-xs font-semibold line-clamp-2 mb-0.5">
            {email.subject || '(No Subject)'}
          </h4>
        </div>

        {/* AI Summary */}
        {email.aiSummary && (
          <div className="bg-gradient-to-br from-muted/60 to-muted/40 rounded-lg p-2 border border-border/50">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-primary"></div>
                <span className="text-xs font-semibold text-foreground">
                  AI Summary
                </span>
              </div>
              {onGenerateSummary && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  title="Regenerate summary"
                >
                  <Sparkles className="size-3" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {email.aiSummary}
            </p>
          </div>
        )}

        {/* Preview (fallback if no AI summary) */}
        {!email.aiSummary && email.preview && (
          <div className="relative">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {email.preview}
            </p>
            {onGenerateSummary && (
              <Button
                variant="outline"
                size="sm"
                className="mt-1.5 w-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
              >
                <Sparkles className="size-3 mr-1.5" />
                {isGeneratingSummary
                  ? 'Generating Summary...'
                  : 'Generate AI Summary'}
              </Button>
            )}
          </div>
        )}

        {/* Footer badges and status select */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {email.isImportant && (
              <Badge variant="secondary" className="text-xs">
                Important
              </Badge>
            )}
            {email.hasAttachments && (
              <Badge variant="outline" className="text-xs">
                Attachment
              </Badge>
            )}
            {email.snoozeUntil && (
              <Badge variant="outline" className="text-xs">
                <Clock className="size-3 mr-1" />
                Snoozed
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
