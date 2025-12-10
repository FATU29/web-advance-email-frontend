'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KanbanCard } from './kanban-card';
import { IEmailListItem, KanbanStatus } from '@/types/api.types';
import { cn } from '@/lib/utils';

export interface KanbanColumnProps {
  id: KanbanStatus;
  title: string;
  emails: IEmailListItem[];
  onCardClick?: (email: IEmailListItem) => void;
  onCardSnooze?: (email: IEmailListItem) => void;
  onCardStar?: (emailId: string, starred: boolean) => void;
  onCardStatusChange?: (emailId: string, status: KanbanStatus) => void;
  onCardGenerateSummary?: (emailId: string) => void;
  generatingSummaryIds?: Set<string>;
}

export function KanbanColumn({
  id,
  title,
  emails,
  onCardClick,
  onCardSnooze,
  onCardStar,
  onCardStatusChange,
  onCardGenerateSummary,
  generatingSummaryIds = new Set(),
}: KanbanColumnProps) {
  //Init use hook
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      column: { id, title },
    },
  });

  //Render
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] lg:min-w-[350px] lg:w-[350px] flex-shrink-0',
        isOver && 'ring-2 ring-primary ring-offset-2 rounded-lg transition-all'
      )}
    >
      <Card className="flex flex-col h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-4 border-b bg-muted/30 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase tracking-wide">
              {title}
            </h3>
            <span className="text-xs font-medium text-muted-foreground bg-background px-2.5 py-1 rounded-full border">
              {emails.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-3 md:p-4 space-y-3 min-h-[100px]">
            {emails.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No emails</p>
                <p className="text-xs mt-1">Drop emails here</p>
              </div>
            ) : (
              emails.map((email) => (
                <KanbanCard
                  key={email.id}
                  email={email}
                  onOpen={onCardClick}
                  onSnooze={onCardSnooze}
                  onStar={onCardStar}
                  onStatusChange={onCardStatusChange}
                  onGenerateSummary={onCardGenerateSummary}
                  isGeneratingSummary={generatingSummaryIds.has(email.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
