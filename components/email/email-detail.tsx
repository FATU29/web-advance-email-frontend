'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Archive,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
  MoreVertical,
  Trash2,
  Star,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ParsedMessage } from '@/types';

export interface EmailDetailProps {
  email: ParsedMessage;
  onBack?: () => void;
  onReply?: (email: ParsedMessage) => void;
  onReplyAll?: (email: ParsedMessage) => void;
  onForward?: (email: ParsedMessage) => void;
  onArchive?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
  onStar?: (emailId: string, starred: boolean) => void;
}

export function EmailDetail({
  email,
  onBack,
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onDelete,
  onStar,
}: EmailDetailProps) {
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp');
    } catch {
      return dateString;
    }
  };

  const formatEmailAddresses = (
    addresses: Array<{ name?: string; email: string }>
  ) => {
    return addresses.map((addr) => addr.name || addr.email).join(', ');
  };

  const hasAttachments = email.attachments && email.attachments.length > 0;

  //Render
  return (
    <Card className="flex h-full flex-col rounded-none border-0">
      {/* Header */}
      <CardHeader className="shrink-0 border-b px-4 md:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="size-8 shrink-0"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <CardTitle className="text-lg truncate">
              {email.subject || '(No Subject)'}
            </CardTitle>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onStar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStar(email.id, false)}
                className="size-8"
              >
                <Star className="size-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Email Info */}
            <div className="mb-6 flex items-start gap-4">
              <Avatar className="size-12 shrink-0">
                <AvatarImage src={email.sender.email} alt={email.sender.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(email.sender.name, email.sender.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-semibold">
                      {email.sender.name || email.sender.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {email.sender.email}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(email.receivedOn)}
                  </span>
                </div>

                {/* To, CC, BCC */}
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {email.to && email.to.length > 0 && (
                    <div>
                      <span className="font-medium">To:</span>{' '}
                      {formatEmailAddresses(email.to)}
                    </div>
                  )}
                  {email.cc && email.cc.length > 0 && (
                    <div>
                      <span className="font-medium">Cc:</span>{' '}
                      {formatEmailAddresses(email.cc)}
                    </div>
                  )}
                  {email.bcc && email.bcc.length > 0 && (
                    <div>
                      <span className="font-medium">Bcc:</span>{' '}
                      {formatEmailAddresses(email.bcc)}
                    </div>
                  )}
                </div>

                {/* Labels/Tags */}
                {email.tags && email.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {email.tags.map((tag) => (
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
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Attachments */}
            {hasAttachments && (
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Paperclip className="size-4" />
                  Attachments ({email.attachments?.length || 0})
                </div>
                <div className="flex flex-wrap gap-2">
                  {email.attachments?.map((attachment) => (
                    <Card key={attachment.attachmentId} className="p-2">
                      <div className="flex items-center gap-2">
                        <Paperclip className="size-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {attachment.filename}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(attachment.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Email Body */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {email.processedHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: email.processedHtml }}
                  className="email-body"
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm">
                  {email.body || 'No content'}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>

      {/* Separator */}
      <Separator className="shrink-0" />

      {/* Footer Actions */}
      <CardFooter className="shrink-0 border-t pt-4 pb-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            {onReply && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReply(email)}
                className="gap-2"
              >
                <Reply className="size-4" />
                Reply
              </Button>
            )}
            {onReplyAll && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReplyAll(email)}
                className="gap-2"
              >
                <ReplyAll className="size-4" />
                Reply All
              </Button>
            )}
            {onForward && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onForward(email)}
                className="gap-2"
              >
                <Forward className="size-4" />
                Forward
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onArchive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onArchive(email.id)}
                className="size-8"
              >
                <Archive className="size-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(email.id)}
                className="size-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
