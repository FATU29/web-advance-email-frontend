'use client';

import * as React from 'react';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
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
import { IEmailDetail } from '@/types/api.types';
import { cn } from '@/lib/utils';

export interface EmailDetailProps {
  email: IEmailDetail;
  onBack?: () => void;
  onReply?: (email: IEmailDetail) => void;
  onReplyAll?: (email: IEmailDetail) => void;
  onForward?: (email: IEmailDetail) => void;
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp');
    } catch {
      return dateString;
    }
  };

  // Extract sender name and email from API format
  const senderName = email.fromName || email.from.split('@')[0];
  const senderEmail = email.from;

  const formatEmailAddresses = (addresses: string[]) => {
    return addresses.join(', ');
  };

  const hasAttachments = email.attachments && email.attachments.length > 0;

  // Decode HTML entities
  const decodeHTML = (html: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  };

  // Sanitize and parse HTML email body
  const renderEmailBody = (body: string) => {
    if (!body) return null;

    // First, decode HTML entities
    let decodedBody = body;
    try {
      // Decode common HTML entities
      decodedBody = decodedBody
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&#x60;/g, '`')
        .replace(/&#x3D;/g, '=');

      // Decode numeric entities like &#39;
      decodedBody = decodedBody.replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(parseInt(dec, 10));
      });

      // Decode hex entities like &#x27;
      decodedBody = decodedBody.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });

      // Use browser's native decoder for remaining entities
      if (typeof window !== 'undefined') {
        decodedBody = decodeHTML(decodedBody);
      }
    } catch (error) {
      // If decoding fails, use original body
      console.warn('Failed to decode HTML entities:', error);
    }

    // Check if body is HTML or plain text
    const isHTML = /<[a-z][\s\S]*>/i.test(decodedBody);

    if (isHTML) {
      // Sanitize HTML to prevent XSS attacks
      const sanitizedHTML = DOMPurify.sanitize(decodedBody, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'u',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'a',
          'img',
          'blockquote',
          'pre',
          'code',
          'table',
          'thead',
          'tbody',
          'tr',
          'th',
          'td',
          'div',
          'span',
          'hr',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'width',
          'height',
          'style',
          'class',
          'align',
          'colspan',
          'rowspan',
        ],
        ALLOW_DATA_ATTR: false,
        // Keep relative URLs and allow common protocols
        ALLOWED_URI_REGEXP:
          /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      });

      // Parse HTML to React elements
      return parse(sanitizedHTML, {
        replace: (domNode) => {
          // Type guard for element nodes
          if (
            domNode.type === 'tag' &&
            'name' in domNode &&
            'attribs' in domNode
          ) {
            const node = domNode as unknown as {
              name: string;
              attribs: Record<string, string>;
            };

            // Handle images - make them responsive and safe
            if (node.name === 'img' && node.attribs) {
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  {...node.attribs}
                  alt={node.attribs.alt || 'Email image'}
                  className="max-w-full h-auto rounded-md my-2"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              );
            }
            // Handle links - make them safe and decode href
            if (node.name === 'a' && node.attribs) {
              const href = node.attribs.href;
              // Decode href if it contains entities
              let decodedHref = href;
              if (href) {
                try {
                  decodedHref = decodeHTML(href);
                } catch {
                  // Keep original if decoding fails
                }
              }
              return (
                <a
                  {...node.attribs}
                  href={decodedHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                />
              );
            }
          }
          return undefined;
        },
      });
    } else {
      // Plain text - preserve line breaks and decode entities
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {decodedBody}
        </div>
      );
    }
  };

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
                onClick={() => onStar(email.id, !email.isStarred)}
                className="size-8"
              >
                <Star
                  className={cn(
                    'size-4',
                    email.isStarred && 'fill-yellow-500 text-yellow-500'
                  )}
                />
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
                <AvatarImage src={senderEmail} alt={senderName} />
                <AvatarFallback
                  className={cn(
                    'text-white font-semibold',
                    getAvatarColor(senderName, senderEmail)
                  )}
                >
                  {getInitials(senderName, senderEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-semibold">
                      {senderName || senderEmail}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {senderEmail}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(email.receivedAt)}
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

                {/* Important indicator */}
                {email.isImportant && (
                  <Badge variant="secondary" className="text-xs w-fit">
                    Important
                  </Badge>
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
                    <Card key={attachment.id} className="p-2">
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
            <div className="email-body-container min-h-[200px]">
              {email.body ? (
                <div className="email-body-content text-sm leading-relaxed [&_p]:mb-4 [&_p]:text-foreground [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground [&_a]:text-primary [&_a]:underline [&_a:hover]:no-underline [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-foreground [&_code]:text-xs [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:text-foreground [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:text-foreground [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:text-foreground [&_li]:mb-1 [&_li]:text-foreground [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-foreground [&_hr]:my-6 [&_hr]:border-border">
                  {renderEmailBody(email.body)}
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                  No content
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
