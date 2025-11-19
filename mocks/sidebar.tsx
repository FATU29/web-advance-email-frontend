'use client';

import * as React from 'react';
import {
  Inbox,
  Send,
  Archive,
  Trash2,
  Star,
  Folder,
  SquarePen,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from '@/types';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  isActive?: boolean;
}

export const mockSidebarItems: SidebarItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: Inbox,
    count: 5,
    isActive: true,
  },
  {
    id: 'starred',
    label: 'Starred',
    icon: Star,
    count: 2,
  },
  {
    id: 'sent',
    label: 'Sent',
    icon: Send,
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
  },
  {
    id: 'trash',
    label: 'Trash',
    icon: Trash2,
  },
];

export const mockUser: User = {
  id: 'mock-user',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
};

export interface MockSidebarProps {
  items?: SidebarItem[];
  user?: User;
  onItemClick?: (itemId: string) => void;
  onComposeClick?: () => void;
  onLogoutClick?: () => void;
}

export function MockSidebar({
  items = mockSidebarItems,
  user,
  onItemClick,
  onComposeClick,
  onLogoutClick,
}: MockSidebarProps) {
  // Use provided user or fallback to mock user
  const displayUser = user || mockUser;
  //Init util function
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  //Render
  return (
    <div className="flex h-full flex-col">
      {/* User Info Section */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(displayUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold">
              {displayUser.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {displayUser.email}
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

      {/* Compose Button */}
      <div className="border-b p-3">
        <Button className="w-full gap-2" onClick={onComposeClick}>
          <SquarePen className="size-4" />
          Compose
        </Button>
      </div>

      {/* Mail Title */}
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Mail</h2>
      </div>

      {/* Folder Items */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={item.isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  item.isActive && 'bg-accent'
                )}
                onClick={() => onItemClick?.(item.id)}
              >
                <Icon className="size-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {item.count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
