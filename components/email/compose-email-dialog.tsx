'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { X, Send, Paperclip, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  useSendEmailMutation,
  useReplyEmailMutation,
} from '@/hooks/use-email-mutations';
import { ISendEmailParams, IEmailDetail } from '@/types/api.types';

type ComposeMode = 'compose' | 'reply' | 'replyAll' | 'forward';

interface ComposeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: ComposeMode;
  originalEmail?: IEmailDetail;
}

export function ComposeEmailDialog({
  open,
  onOpenChange,
  mode = 'compose',
  originalEmail,
}: ComposeEmailDialogProps) {
  const [to, setTo] = React.useState('');
  const [cc, setCc] = React.useState('');
  const [bcc, setBcc] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [showCc, setShowCc] = React.useState(false);
  const [showBcc, setShowBcc] = React.useState(false);

  const sendEmailMutation = useSendEmailMutation();
  const replyEmailMutation = useReplyEmailMutation();

  // Pre-fill fields based on mode
  React.useEffect(() => {
    if (!open || !originalEmail) {
      // Reset when dialog closes
      if (!open) {
        setTo('');
        setCc('');
        setBcc('');
        setSubject('');
        setBody('');
        setShowCc(false);
        setShowBcc(false);
      }
      return;
    }

    if (mode === 'reply') {
      // Reply: To = original sender
      setTo(originalEmail.from);
      setSubject(
        originalEmail.subject.startsWith('Re: ')
          ? originalEmail.subject
          : `Re: ${originalEmail.subject}`
      );
      setCc('');
      setBcc('');
      setShowCc(false);
      setShowBcc(false);
      setBody('');
    } else if (mode === 'replyAll') {
      // Reply All: To = original sender + all recipients (excluding current user)
      const allRecipients = [...originalEmail.to];
      if (originalEmail.cc && originalEmail.cc.length > 0) {
        allRecipients.push(...originalEmail.cc);
      }
      // Note: We can't filter current user email here without user context
      // Backend will handle this properly
      setTo([originalEmail.from, ...allRecipients].join(', '));
      setSubject(
        originalEmail.subject.startsWith('Re: ')
          ? originalEmail.subject
          : `Re: ${originalEmail.subject}`
      );
      if (originalEmail.cc && originalEmail.cc.length > 0) {
        setCc(originalEmail.cc.join(', '));
        setShowCc(true);
      } else {
        setCc('');
        setShowCc(false);
      }
      setBcc('');
      setShowBcc(false);
      setBody('');
    } else if (mode === 'forward') {
      // Forward: Empty To, Fwd: prefix, include original email in body
      setTo('');
      setSubject(
        originalEmail.subject.startsWith('Fwd: ')
          ? originalEmail.subject
          : `Fwd: ${originalEmail.subject}`
      );
      setCc('');
      setBcc('');
      setShowCc(false);
      setShowBcc(false);

      // Include original email content in body
      const forwardHeader = `\n\n---------- Forwarded message ----------\nFrom: ${originalEmail.fromName || originalEmail.from} <${originalEmail.from}>\nDate: ${new Date(originalEmail.receivedAt).toLocaleString()}\nSubject: ${originalEmail.subject}\nTo: ${originalEmail.to.join(', ')}\n`;
      const forwardBody = originalEmail.body ? `\n\n${originalEmail.body}` : '';
      setBody(forwardHeader + forwardBody);
    } else {
      // Compose: Empty fields
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      setShowCc(false);
      setShowBcc(false);
    }
  }, [open, mode, originalEmail]);

  const handleSend = async () => {
    // Validate required fields
    // For reply/replyAll, backend handles recipients automatically
    if (
      mode !== 'forward' &&
      mode !== 'reply' &&
      mode !== 'replyAll' &&
      !to.trim()
    ) {
      toast.error('Please enter at least one recipient');
      return;
    }

    // For forward and compose, subject is required
    if ((mode === 'forward' || mode === 'compose') && !subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!body.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // For reply/replyAll, use reply API
    if ((mode === 'reply' || mode === 'replyAll') && originalEmail) {
      replyEmailMutation.mutate(
        {
          emailId: originalEmail.id,
          params: {
            body: body.trim(),
            replyAll: mode === 'replyAll',
          },
        },
        {
          onSuccess: () => {
            toast.success('Reply sent successfully');
            handleClose();
          },
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : 'Failed to send reply'
            );
          },
        }
      );
      return;
    }

    // For forward and compose, use send API
    // Parse email addresses
    const parseEmails = (str: string): string[] => {
      return str
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
    };

    const toEmails = parseEmails(to);
    const ccEmails = cc.trim() ? parseEmails(cc) : undefined;
    const bccEmails = bcc.trim() ? parseEmails(bcc) : undefined;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allEmails = [...toEmails, ...(ccEmails || []), ...(bccEmails || [])];

    const invalidEmails = allEmails.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email address: ${invalidEmails.join(', ')}`);
      return;
    }

    const params: ISendEmailParams = {
      to: toEmails,
      cc: ccEmails,
      bcc: bccEmails,
      subject: subject.trim(),
      body: body.trim(),
    };

    sendEmailMutation.mutate(params, {
      onSuccess: () => {
        toast.success(
          mode === 'forward'
            ? 'Email forwarded successfully'
            : 'Email sent successfully'
        );
        handleClose();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to send email'
        );
      },
    });
  };

  const handleClose = () => {
    // Reset form
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setShowCc(false);
    setShowBcc(false);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col p-0"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {mode === 'reply'
                ? 'Reply'
                : mode === 'replyAll'
                  ? 'Reply All'
                  : mode === 'forward'
                    ? 'Forward'
                    : 'New Message'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* To Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="to" className="text-sm font-medium w-12">
                To
              </Label>
              <Input
                id="to"
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com, another@example.com"
                className="flex-1"
                readOnly={mode === 'reply' || mode === 'replyAll'}
                disabled={mode === 'reply' || mode === 'replyAll'}
              />
              {!showCc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(true)}
                  className="text-xs"
                >
                  Cc
                </Button>
              )}
              {!showBcc && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(true)}
                  className="text-xs"
                >
                  Bcc
                </Button>
              )}
            </div>
          </div>

          {/* Cc Field */}
          {showCc && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="cc" className="text-sm font-medium w-12">
                  Cc
                </Label>
                <Input
                  id="cc"
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCc(false);
                    setCc('');
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Bcc Field */}
          {showBcc && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="bcc" className="text-sm font-medium w-12">
                  Bcc
                </Label>
                <Input
                  id="bcc"
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowBcc(false);
                    setBcc('');
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="subject" className="text-sm font-medium w-12">
                Subject
              </Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="flex-1"
              />
            </div>
          </div>

          {/* Body Field */}
          <div className="space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              className="w-full min-h-[300px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          {/* Hint */}
          <p className="text-xs text-muted-foreground">
            Tip: Press{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded border">
              Ctrl+Enter
            </kbd>{' '}
            to send
          </p>
        </div>

        <Separator />

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Attachment Button (Future feature) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled
              title="Attachments coming soon"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={sendEmailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={
                sendEmailMutation.isPending || replyEmailMutation.isPending
              }
              className="gap-2"
            >
              {sendEmailMutation.isPending || replyEmailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === 'reply' || mode === 'replyAll'
                    ? 'Sending reply...'
                    : mode === 'forward'
                      ? 'Forwarding...'
                      : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {mode === 'reply' || mode === 'replyAll'
                    ? 'Send Reply'
                    : mode === 'forward'
                      ? 'Forward'
                      : 'Send'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
