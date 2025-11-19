'use client';

import { useState } from 'react';
import { MessageCircle, XIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Chat, type ChatProps } from '@/components/ui/chat';
import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';

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

  if (isMobile) {
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
        <DialogPortal data-slot="dialog-portal">
          <DialogOverlay
            className={cn(
              'bg-transparent',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
            )}
          />
          <DialogPrimitive.Content
            data-slot="dialog-content"
            className={cn(
              'bg-background',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'fixed inset-0 z-50',
              'p-0 gap-0',
              'h-screen w-screen max-h-screen rounded-none',
              'translate-x-0 translate-y-0 top-0 left-0',
              'border-0 shadow-none',
              dialogClassName
            )}
            onEscapeKeyDown={() => {
              setOpen(false);
            }}
            onPointerDownOutside={() => {
              setOpen(false);
            }}
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
            <div className="flex flex-col h-full w-full overflow-hidden pt-12 px-4 pb-4">
              <Chat
                {...(chatProps as ChatProps)}
                className="h-full flex-1 min-h-0"
              />
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          <MessageCircle className="h-4 w-4" />
          {triggerSize !== 'icon' && <span>{triggerLabel}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-0 gap-0 w-[500px] max-w-[calc(100vw-5rem)] rounded-lg border shadow-lg',
          'flex flex-col overflow-hidden',
          dialogClassName
        )}
        align="end"
        side="top"
        sideOffset={12}
      >
        <div className="flex flex-col  h-[inherit] p-4">
          <Chat {...(chatProps as ChatProps)} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
