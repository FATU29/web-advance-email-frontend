'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, XIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Chat, type ChatProps } from '@/components/ui/chat';
import { cn } from '@/lib/utils';

interface ChatDialogProps extends Omit<ChatProps, 'className'> {
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon';
  dialogClassName?: string;
}

export function ChatDialog({
  triggerLabel = 'Chat',
  triggerClassName,
  triggerVariant = 'default',
  triggerSize = 'default',
  dialogClassName,
  ...chatProps
}: ChatDialogProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Hide overlay on mobile for fullscreen experience
  useEffect(() => {
    if (isMobile && open) {
      const overlay = document.querySelector('[data-slot="dialog-overlay"]');
      if (overlay) {
        (overlay as HTMLElement).style.backgroundColor = 'transparent';
      }
    }
  }, [isMobile, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          <MessageCircle className="h-4 w-4" />
          {triggerSize !== 'icon' && <span>{triggerLabel}</span>}
        </Button>
      </DialogTrigger>
      {isMobile ? (
        <DialogContent
          className={cn(
            'p-0 gap-0 max-w-full border-0 shadow-none',
            'h-screen w-screen max-h-screen rounded-none',
            'translate-x-0 translate-y-0 top-0 left-0 m-0 max-w-none',
            'data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100',
            '[&>button[data-slot="dialog-close"]]:hidden',
            '[&+*[data-slot="dialog-overlay"]]:bg-transparent',
            dialogClassName
          )}
          showCloseButton={false}
        >
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md hover:bg-background/95"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col h-full w-full overflow-hidden">
            <Chat {...(chatProps as ChatProps)} />
          </div>
        </DialogContent>
      ) : (
        <DialogContent
          className={cn(
            'p-0 gap-0 max-w-4xl h-[90vh] rounded-lg border shadow-lg',
            dialogClassName
          )}
          showCloseButton
        >
          <div className="flex flex-col h-full w-full overflow-hidden">
            <Chat {...(chatProps as ChatProps)} />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
