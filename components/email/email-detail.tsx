'use client';

import * as React from 'react';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  ExternalLink,
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

  // Detect content type
  const detectContentType = (
    content: string
  ): 'html' | 'markdown' | 'plain' => {
    if (!content) return 'plain';

    // Check for HTML tags
    const hasHTMLTags = /<[a-z][\s\S]*>/i.test(content);
    if (hasHTMLTags) return 'html';

    // Check for Markdown patterns
    const markdownPatterns = [
      /^#{1,6}\s/m, // Headers
      /\*\*[^*]+\*\*/, // Bold
      /\*[^*]+\*/, // Italic
      /\[[^\]]+\]\([^)]+\)/, // Links
      /^[-*+]\s/m, // Lists
      /^>\s/m, // Blockquotes
      /```[\s\S]*```/, // Code blocks
      /`[^`]+`/, // Inline code
    ];

    const hasMarkdown = markdownPatterns.some((pattern) =>
      pattern.test(content)
    );
    if (hasMarkdown) return 'markdown';

    return 'plain';
  };

  // Render Markdown content
  const renderMarkdown = (markdown: string) => {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom components for better styling
            h1: ({ ...props }) => (
              <h1
                className="text-2xl font-bold mb-4 mt-6 text-foreground"
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h2
                className="text-xl font-bold mb-3 mt-5 text-foreground"
                {...props}
              />
            ),
            h3: ({ ...props }) => (
              <h3
                className="text-lg font-semibold mb-2 mt-4 text-foreground"
                {...props}
              />
            ),
            p: ({ ...props }) => (
              <p className="mb-4 text-foreground leading-relaxed" {...props} />
            ),
            a: ({ ...props }) => (
              <a
                className="text-primary underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              return isInline ? (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-foreground text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="block bg-muted p-4 rounded-md overflow-x-auto text-foreground text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ ...props }) => (
              <pre
                className="bg-muted p-4 rounded-md overflow-x-auto my-4"
                {...props}
              />
            ),
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 border-primary pl-4 italic my-4 text-foreground"
                {...props}
              />
            ),
            ul: ({ ...props }) => (
              <ul className="list-disc ml-6 mb-4 text-foreground" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol
                className="list-decimal ml-6 mb-4 text-foreground"
                {...props}
              />
            ),
            li: ({ ...props }) => (
              <li className="mb-1 text-foreground" {...props} />
            ),
            img: ({ ...props }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="max-w-full h-auto rounded-md my-4"
                loading="lazy"
                alt={props.alt || 'Image'}
                {...props}
              />
            ),
            table: ({ ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse" {...props} />
              </div>
            ),
            th: ({ ...props }) => (
              <th
                className="border border-border p-2 bg-muted text-left font-semibold text-foreground"
                {...props}
              />
            ),
            td: ({ ...props }) => (
              <td
                className="border border-border p-2 text-foreground"
                {...props}
              />
            ),
            hr: ({ ...props }) => (
              <hr className="my-6 border-border" {...props} />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    );
  };

  // Helper to filter out problematic attributes for React
  const filterReactAttributes = (attribs: Record<string, string>) => {
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(attribs)) {
      // Skip 'style' - it's handled by DOMPurify and inline styles in sanitized HTML
      // Skip event handlers
      if (key === 'style' || key.startsWith('on')) {
        continue;
      }
      filtered[key] = value;
    }
    return filtered;
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
      // Sanitize HTML to prevent XSS attacks - Enhanced for Gmail API
      const sanitizedHTML = DOMPurify.sanitize(decodedBody, {
        ALLOWED_TAGS: [
          // Text formatting
          'p',
          'br',
          'strong',
          'b',
          'em',
          'i',
          'u',
          's',
          'strike',
          'del',
          'ins',
          'mark',
          'small',
          'sub',
          'sup',
          // Headings
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          // Lists
          'ul',
          'ol',
          'li',
          'dl',
          'dt',
          'dd',
          // Links and media
          'a',
          'img',
          // Quotes and code
          'blockquote',
          'q',
          'cite',
          'pre',
          'code',
          'kbd',
          'samp',
          'var',
          // Tables
          'table',
          'thead',
          'tbody',
          'tfoot',
          'tr',
          'th',
          'td',
          'caption',
          'col',
          'colgroup',
          // Structure
          'div',
          'span',
          'section',
          'article',
          'header',
          'footer',
          'main',
          'aside',
          'nav',
          'figure',
          'figcaption',
          // Misc
          'hr',
          'abbr',
          'address',
          'time',
          'details',
          'summary',
          // Gmail often uses these
          'center',
          'font',
        ],
        ALLOWED_ATTR: [
          'href',
          'src',
          'alt',
          'title',
          'width',
          'height',
          'style', // Allow inline styles (will be sanitized by DOMPurify)
          'class',
          'id',
          'align',
          'valign',
          'colspan',
          'rowspan',
          'border',
          'cellpadding',
          'cellspacing',
          'bgcolor',
          'color',
          'face',
          'size',
          'target',
          'rel',
          'dir',
          'lang',
          'start',
          'type',
          'datetime',
        ],
        ALLOW_DATA_ATTR: false,
        // Keep relative URLs and allow common protocols (Gmail-safe)
        ALLOWED_URI_REGEXP:
          /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        // Preserve Gmail's inline styles (DOMPurify auto-sanitizes dangerous ones)
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        // Allow Gmail's common style properties
        ADD_ATTR: ['target'],
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
              const safeAttribs = filterReactAttributes(node.attribs);
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  {...safeAttribs}
                  alt={node.attribs.alt || 'Email image'}
                  className="max-w-full h-auto rounded-md my-2"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
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
              const safeAttribs = filterReactAttributes(node.attribs);
              return (
                <a
                  {...safeAttribs}
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
            {/* Open in Gmail link */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Gmail URL format: https://mail.google.com/mail/u/0/#inbox/{messageId}
                const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${email.id}`;
                window.open(gmailUrl, '_blank', 'noopener,noreferrer');
              }}
              className="size-8"
              title="Open in Gmail"
            >
              <ExternalLink className="size-4" />
            </Button>
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
                (() => {
                  const contentType = detectContentType(email.body);

                  if (contentType === 'markdown') {
                    // Render as Markdown
                    return renderMarkdown(email.body);
                  } else if (contentType === 'html') {
                    // Render as HTML (existing implementation)
                    return (
                      <div
                        className="email-body-content text-sm leading-relaxed 
                        [&_p]:mb-4 [&_p]:text-foreground 
                        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-foreground 
                        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-foreground 
                        [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground 
                        [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-foreground 
                        [&_h5]:text-sm [&_h5]:font-medium [&_h5]:mb-1 [&_h5]:mt-2 [&_h5]:text-foreground 
                        [&_h6]:text-xs [&_h6]:font-medium [&_h6]:mb-1 [&_h6]:mt-2 [&_h6]:text-foreground 
                        [&_a]:text-primary [&_a]:underline [&_a:hover]:no-underline 
                        [&_strong]:font-semibold [&_strong]:text-foreground 
                        [&_b]:font-semibold [&_b]:text-foreground 
                        [&_em]:italic [&_em]:text-foreground 
                        [&_i]:italic [&_i]:text-foreground 
                        [&_u]:underline [&_u]:text-foreground 
                        [&_s]:line-through [&_s]:text-foreground 
                        [&_strike]:line-through [&_strike]:text-foreground 
                        [&_del]:line-through [&_del]:text-muted-foreground 
                        [&_ins]:underline [&_ins]:text-foreground 
                        [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-900 [&_mark]:px-1 [&_mark]:rounded 
                        [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-foreground [&_code]:text-xs [&_code]:font-mono 
                        [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:text-foreground [&_pre]:my-4 [&_pre]:font-mono 
                        [&_kbd]:bg-muted [&_kbd]:px-2 [&_kbd]:py-1 [&_kbd]:rounded [&_kbd]:text-xs [&_kbd]:font-mono [&_kbd]:border [&_kbd]:border-border 
                        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4 
                        [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:text-foreground 
                        [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:text-foreground 
                        [&_li]:mb-1 [&_li]:text-foreground 
                        [&_dl]:mb-4 [&_dt]:font-semibold [&_dt]:mb-1 [&_dd]:ml-6 [&_dd]:mb-2 
                        [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-foreground 
                        [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground 
                        [&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:text-foreground 
                        [&_caption]:text-sm [&_caption]:text-muted-foreground [&_caption]:mb-2 
                        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-foreground 
                        [&_q]:italic [&_q]:text-foreground 
                        [&_cite]:text-muted-foreground [&_cite]:text-sm 
                        [&_hr]:my-6 [&_hr]:border-border 
                        [&_abbr]:cursor-help [&_abbr]:underline [&_abbr]:decoration-dotted 
                        [&_address]:not-italic [&_address]:text-foreground 
                        [&_small]:text-xs [&_small]:text-muted-foreground 
                        [&_sub]:text-xs [&_sub]:align-sub 
                        [&_sup]:text-xs [&_sup]:align-super 
                        [&_center]:text-center 
                        [&_font]:text-foreground 
                        [&_div]:text-foreground 
                        [&_span]:text-foreground"
                      >
                        {renderEmailBody(email.body)}
                      </div>
                    );
                  } else {
                    // Render as plain text
                    return (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {email.body}
                      </div>
                    );
                  }
                })()
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
