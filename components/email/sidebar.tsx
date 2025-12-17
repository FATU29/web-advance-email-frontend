'use client';

import {
  Inbox,
  Send,
  Trash2,
  Star,
  Folder,
  SquarePen,
  LogOut,
  MessageSquare,
  AlertCircle,
  FileText,
  Tag,
  Mail,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { IMailbox, MailboxType } from '@/types/api.types';

export interface SidebarProps {
  mailboxes?: IMailbox[];
  user?: User;
  activeFolder?: string;
  onItemClick?: (folder: string) => void;
  onComposeClick?: () => void;
  onLogoutClick?: () => void;
  onSearchClick?: () => void;
}

// Map mailbox type to icon
const getMailboxIcon = (type: MailboxType, id: string) => {
  switch (type) {
    case 'INBOX':
      return Inbox;
    case 'SENT':
      return Send;
    case 'DRAFTS':
      return FileText;
    case 'TRASH':
      return Trash2;
    case 'SPAM':
      return AlertCircle;
    case 'STARRED':
      return Star;
    case 'IMPORTANT':
      return Star;
    case 'CUSTOM':
      // Special handling for custom mailboxes
      if (id === 'CHAT') return MessageSquare;
      if (id === 'YELLOW_STAR') return Star;
      if (id === 'UNREAD') return Mail;
      if (id.startsWith('CATEGORY_')) return Tag;
      return Folder;
    default:
      return Folder;
  }
};

// Map mailbox id/type to folder name for routing
const getFolderName = (mailbox: IMailbox): string => {
  const id = mailbox.id.toLowerCase();

  // Map specific mailbox IDs to folder names
  if (id === 'inbox') return 'inbox';
  if (id === 'sent') return 'sent';
  if (id === 'draft') return 'drafts';
  if (id === 'trash') return 'trash';
  if (id === 'spam') return 'spam';
  if (id === 'starred') return 'starred';
  if (id === 'important') return 'important';

  // For custom mailboxes, use the id as folder name
  return id.toLowerCase();
};

// Group mailboxes into standard and categories
const groupMailboxes = (mailboxes: IMailbox[]) => {
  const standardTypes: MailboxType[] = [
    'INBOX',
    'SENT',
    'DRAFTS',
    'TRASH',
    'SPAM',
    'STARRED',
    'IMPORTANT',
  ];

  const standard: IMailbox[] = [];
  const categories: IMailbox[] = [];
  const others: IMailbox[] = [];

  mailboxes.forEach((mailbox) => {
    if (standardTypes.includes(mailbox.type)) {
      standard.push(mailbox);
    } else if (
      mailbox.type === 'CUSTOM' &&
      mailbox.id.startsWith('CATEGORY_')
    ) {
      categories.push(mailbox);
    } else {
      others.push(mailbox);
    }
  });

  // Sort standard mailboxes by priority
  const priorityOrder: MailboxType[] = [
    'INBOX',
    'STARRED',
    'IMPORTANT',
    'SENT',
    'DRAFTS',
    'SPAM',
    'TRASH',
  ];
  standard.sort(
    (a, b) => priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type)
  );

  return { standard, categories, others };
};

export function Sidebar({
  mailboxes = [],
  user,
  activeFolder,
  onItemClick,
  onComposeClick,
  onLogoutClick,
  onSearchClick,
}: SidebarProps) {
  //Init util function
  const getInitials = (name?: string | null) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return (
      name
        .split(' ')
        .filter((n) => n.length > 0)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    );
  };

  const { standard, categories, others } = groupMailboxes(mailboxes);

  //Render
  return (
    <div className="flex h-full flex-col">
      {/* User Info Section */}
      {user && (
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={user.avatar} alt={user.name || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold">
                {user.name || 'User'}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email || ''}
              </span>
            </div>
            {onLogoutClick && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onLogoutClick}
                title="Logout"
              >
                <LogOut className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Compose Button */}
      {onComposeClick && (
        <div className="border-b p-3 space-y-2">
          <Button className="w-full gap-2" onClick={onComposeClick}>
            <SquarePen className="size-4" />
            Compose
          </Button>
          {onSearchClick && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onSearchClick}
            >
              <Search className="size-4" />
              Search
            </Button>
          )}
        </div>
      )}

      {/* Mail Title */}
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Mail</h2>
      </div>

      {/* Folder Items */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2">
            {/* Standard Mailboxes */}
            {standard.length > 0 && (
              <>
                {standard.map((mailbox) => {
                  const Icon = getMailboxIcon(mailbox.type, mailbox.id);
                  const folderName = getFolderName(mailbox);
                  const isActive = activeFolder === folderName;

                  return (
                    <Button
                      key={mailbox.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-2',
                        isActive && 'bg-accent'
                      )}
                      onClick={() => onItemClick?.(folderName)}
                    >
                      <Icon className="size-4" />
                      <span className="flex-1 text-left">{mailbox.name}</span>
                      {mailbox.unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                          {mailbox.unreadCount}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </>
            )}

            {/* Categories Section */}
            {categories.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="px-2 py-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                    Categories
                  </h3>
                </div>
                {categories.map((mailbox) => {
                  const Icon = getMailboxIcon(mailbox.type, mailbox.id);
                  const folderName = getFolderName(mailbox);
                  const isActive = activeFolder === folderName;

                  return (
                    <Button
                      key={mailbox.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-2',
                        isActive && 'bg-accent'
                      )}
                      onClick={() => onItemClick?.(folderName)}
                    >
                      <Icon className="size-4" />
                      <span className="flex-1 text-left">{mailbox.name}</span>
                      {mailbox.unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                          {mailbox.unreadCount}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </>
            )}

            {/* Other Custom Mailboxes */}
            {others.length > 0 && (
              <>
                <Separator className="my-2" />
                {others.map((mailbox) => {
                  const Icon = getMailboxIcon(mailbox.type, mailbox.id);
                  const folderName = getFolderName(mailbox);
                  const isActive = activeFolder === folderName;

                  return (
                    <Button
                      key={mailbox.id}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-2',
                        isActive && 'bg-accent'
                      )}
                      onClick={() => onItemClick?.(folderName)}
                    >
                      <Icon className="size-4" />
                      <span className="flex-1 text-left">{mailbox.name}</span>
                      {mailbox.unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                          {mailbox.unreadCount}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
