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
import { useSendEmailMutation } from '@/hooks/use-email-mutations';
import { ISendEmailParams } from '@/types/api.types';

interface ComposeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: {
    to: string[];
    subject: string;
    cc?: string[];
  };
}

export function ComposeEmailDialog({
  open,
  onOpenChange,
  replyTo,
}: ComposeEmailDialogProps) {
  const [to, setTo] = React.useState('');
  const [cc, setCc] = React.useState('');
  const [bcc, setBcc] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [showCc, setShowCc] = React.useState(false);
  const [showBcc, setShowBcc] = React.useState(false);

  const sendEmailMutation = useSendEmailMutation();

  // Pre-fill fields when replying
  React.useEffect(() => {
    if (replyTo) {
      setTo(replyTo.to.join(', '));
      setSubject(
        replyTo.subject.startsWith('Re: ')
          ? replyTo.subject
          : `Re: ${replyTo.subject}`
      );
      if (replyTo.cc && replyTo.cc.length > 0) {
        setCc(replyTo.cc.join(', '));
        setShowCc(true);
      }
    }
  }, [replyTo]);

  const handleSend = async () => {
    // Validate required fields
    if (!to.trim()) {
      toast.error('Please enter at least one recipient');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!body.trim()) {
      toast.error('Please enter a message');
      return;
    }

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
        toast.success('Email sent successfully');
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
              {replyTo ? 'Reply' : 'New Message'}
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
              disabled={sendEmailMutation.isPending}
              className="gap-2"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
