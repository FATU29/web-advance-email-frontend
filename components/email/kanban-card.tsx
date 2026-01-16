'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  Clock,
  ExternalLink,
  Maximize2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  //Init state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
      className={cn(
        'group transition-all duration-150 hover:shadow-lg border-2 will-change-transform',
        !email.isRead && 'border-l-4 border-l-primary',
        isDragging && 'opacity-40 scale-95 shadow-xl rotate-1',
        !isDragging && 'hover:scale-[1.01]'
      )}
    >
      <div
        {...listeners}
        className={cn(
          'p-2 md:p-2.5 space-y-1.5 md:space-y-2 cursor-grab active:cursor-grabbing'
        )}
        onClick={handleOpen}
      >
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
              className={cn(
                'size-6 transition-all hover:bg-muted',
                email.isStarred
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              )}
              onClick={handleStar}
              title={email.isStarred ? 'Unstar email' : 'Star email'}
            >
              <Star
                className={cn(
                  'transition-all duration-200',
                  email.isStarred
                    ? 'size-4 fill-yellow-500 text-yellow-500 drop-shadow-md'
                    : 'size-3.5 hover:text-yellow-500'
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
          <div className="bg-linear-to-br from-muted/60 to-muted/40 rounded-md p-1.5 border border-border/50 max-w-full overflow-hidden">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <div className="size-1 rounded-full bg-primary shrink-0"></div>
                <span className="text-[10px] font-semibold text-foreground truncate">
                  AI Summary
                </span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDialogOpen(true);
                      }}
                      title="View full summary"
                    >
                      <Maximize2 className="size-2.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh]">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="size-5 text-primary" />
                        AI Summary
                      </DialogTitle>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-20">
                            Subject:
                          </span>
                          <span className="flex-1 text-foreground">
                            {email.subject || '(No Subject)'}
                          </span>
                        </div>
                        {email.from && (
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-muted-foreground min-w-20">
                              From:
                            </span>
                            <span className="flex-1 text-foreground">
                              {email.fromName || email.from}
                              {email.fromName && (
                                <span className="text-muted-foreground ml-1">
                                  ({email.from})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {email.receivedAt && (
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-muted-foreground min-w-20">
                              Received:
                            </span>
                            <span className="flex-1 text-foreground">
                              {format(new Date(email.receivedAt), 'PPpp')}
                            </span>
                          </div>
                        )}
                      </div>
                    </DialogHeader>
                    <ScrollArea className="h-full max-h-[calc(85vh-200px)] pr-4">
                      <div className="space-y-3">
                        <div className="rounded-lg bg-linear-to-br from-primary/5 to-primary/10 border-2 border-primary/20 p-5">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {email.aiSummary
                              .split('\n')
                              .map((paragraph, idx) => {
                                // Check if line is a bullet point or numbered list
                                const isBullet = paragraph
                                  .trim()
                                  .match(/^[•\-\*]\s/);
                                const isNumbered = paragraph
                                  .trim()
                                  .match(/^\d+[\.\)]\s/);
                                const isEmpty = paragraph.trim().length === 0;

                                if (isEmpty && idx > 0) {
                                  return <div key={idx} className="h-3" />;
                                }

                                if (isBullet) {
                                  return (
                                    <div key={idx} className="flex gap-2 mb-2">
                                      <span className="text-primary font-bold mt-0.5">
                                        •
                                      </span>
                                      <p className="flex-1 m-0 text-foreground leading-relaxed">
                                        {paragraph.replace(/^[•\-\*]\s/, '')}
                                      </p>
                                    </div>
                                  );
                                }

                                if (isNumbered) {
                                  return (
                                    <div key={idx} className="flex gap-2 mb-2">
                                      <span className="text-primary font-bold mt-0.5">
                                        {paragraph.match(/^\d+[\.\)]/)?.[0]}
                                      </span>
                                      <p className="flex-1 m-0 text-foreground leading-relaxed">
                                        {paragraph.replace(/^\d+[\.\)]\s/, '')}
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <p
                                    key={idx}
                                    className="text-foreground leading-relaxed mb-3"
                                  >
                                    {paragraph}
                                  </p>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                {onGenerateSummary && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    title="Regenerate summary"
                  >
                    <Sparkles className="size-2.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug line-clamp-3 overflow-hidden wrap-break-word max-w-full">
              {email.aiSummary.length > 150
                ? `${email.aiSummary.substring(0, 150)}...`
                : email.aiSummary}
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
