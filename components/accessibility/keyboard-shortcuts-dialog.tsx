'use client';

import * as React from 'react';
import { Keyboard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KeyboardShortcut {
  keys: string[];
  action: string;
  description?: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: KeyboardShortcut[];
}

const KEYBOARD_SHORTCUTS: ShortcutCategory[] = [
  {
    title: 'Navigation',
    shortcuts: [
      {
        keys: ['j', '↓'],
        action: 'Next email',
        description: 'Move to next email in list',
      },
      {
        keys: ['k', '↑'],
        action: 'Previous email',
        description: 'Move to previous email in list',
      },
      {
        keys: ['Enter'],
        action: 'Open email',
        description: 'Open selected email',
      },
      {
        keys: ['Esc'],
        action: 'Close email',
        description: 'Close email detail view',
      },
    ],
  },
  {
    title: 'Email Actions',
    shortcuts: [
      { keys: ['r'], action: 'Reply', description: 'Reply to current email' },
      {
        keys: ['Shift', 'r'],
        action: 'Reply all',
        description: 'Reply to all recipients',
      },
      { keys: ['a'], action: 'Archive', description: 'Archive current email' },
      {
        keys: ['s'],
        action: 'Star/Unstar',
        description: 'Toggle star on current email',
      },
      {
        keys: ['d', '#'],
        action: 'Delete',
        description: 'Delete current email',
      },
      {
        keys: ['u'],
        action: 'Mark unread',
        description: 'Mark current email as unread',
      },
      { keys: ['f'], action: 'Forward', description: 'Forward current email' },
    ],
  },
  {
    title: 'Go to Folder',
    shortcuts: [
      {
        keys: ['g', 'i'],
        action: 'Go to Inbox',
        description: 'Navigate to Inbox folder',
      },
      {
        keys: ['g', 't'],
        action: 'Go to Sent',
        description: 'Navigate to Sent folder',
      },
      {
        keys: ['g', 'd'],
        action: 'Go to Drafts',
        description: 'Navigate to Drafts folder',
      },
      {
        keys: ['Shift', 'i'],
        action: 'Go to Inbox',
        description: 'Quick jump to Inbox',
      },
      {
        keys: ['Shift', 't'],
        action: 'Go to Sent',
        description: 'Quick jump to Sent',
      },
      {
        keys: ['Shift', 'd'],
        action: 'Go to Drafts',
        description: 'Quick jump to Drafts',
      },
    ],
  },
  {
    title: 'Global Shortcuts',
    shortcuts: [
      {
        keys: ['Ctrl', 'K'],
        action: 'Search',
        description: 'Open search (Cmd+K on Mac)',
      },
      {
        keys: ['Ctrl', 'N'],
        action: 'Compose',
        description: 'New email (Cmd+N on Mac)',
      },
      {
        keys: ['Ctrl', 'B'],
        action: 'Toggle sidebar',
        description: 'Show/hide sidebar (Cmd+B on Mac)',
      },
      {
        keys: ['Ctrl', 'Enter'],
        action: 'Send email',
        description: 'Send email in compose dialog',
      },
      {
        keys: ['?'],
        action: 'Show shortcuts',
        description: 'Show this help dialog',
      },
    ],
  },
  {
    title: 'Search Suggestions',
    shortcuts: [
      {
        keys: ['↑'],
        action: 'Previous suggestion',
        description: 'Navigate up in suggestions',
      },
      {
        keys: ['↓'],
        action: 'Next suggestion',
        description: 'Navigate down in suggestions',
      },
      {
        keys: ['Enter'],
        action: 'Select suggestion',
        description: 'Apply selected suggestion',
      },
      {
        keys: ['Esc'],
        action: 'Close suggestions',
        description: 'Close suggestions dropdown',
      },
    ],
  },
];

function KeyBadge({ keyText }: { keyText: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[2rem] h-7 px-2 py-1',
        'text-xs font-semibold',
        'bg-muted border border-border rounded',
        'shadow-sm'
      )}
    >
      {keyText}
    </kbd>
  );
}

interface KeyboardShortcutsDialogProps {
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsDialog({
  trigger,
}: KeyboardShortcutsDialogProps) {
  const [open, setOpen] = React.useState(false);

  // Listen for '?' key to open dialog
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (
        e.key === '?' &&
        !isTyping &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Keyboard className="size-4" />
            Shortcuts
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="size-6" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and manage your emails
            efficiently. Press <KeyBadge keyText="?" /> anytime to show this
            dialog.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {KEYBOARD_SHORTCUTS.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="font-semibold text-lg mb-3 text-foreground">
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className={cn(
                        'flex items-start justify-between gap-4 p-3',
                        'rounded-lg hover:bg-muted/50 transition-colors'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground">
                          {shortcut.action}
                        </div>
                        {shortcut.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {shortcut.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-muted-foreground text-xs mx-1">
                                then
                              </span>
                            )}
                            <KeyBadge keyText={key} />
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Accessibility Note */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
              💡 Accessibility Tips
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>
                All shortcuts work without a mouse for keyboard-only navigation
              </li>
              <li>Screen reader compatible with proper ARIA labels</li>
              <li>High contrast mode supported for better visibility</li>
              <li>Tab key cycles through interactive elements</li>
              <li>Skip navigation links available (press Tab on page load)</li>
            </ul>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
