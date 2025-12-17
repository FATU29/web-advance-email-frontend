'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KanbanCard } from './kanban-card';
import { IEmailListItem } from '@/types/api.types';
import { cn } from '@/lib/utils';

export interface KanbanColumnProps {
  id: string;
  title: string;
  emails: IEmailListItem[];
  count?: number;
  color?: string;
  onCardClick?: (email: IEmailListItem) => void;
  onCardSnooze?: (email: IEmailListItem) => void;
  onCardStar?: (emailId: string, starred: boolean) => void;
  onCardGenerateSummary?: (emailId: string) => void;
  generatingSummaryIds?: Set<string>;
}

export function KanbanColumn({
  id,
  title,
  emails,
  count,
  color,
  onCardClick,
  onCardSnooze,
  onCardStar,
  onCardGenerateSummary,
  generatingSummaryIds = new Set(),
}: KanbanColumnProps) {
  //Init use hook
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: {
      type: 'column',
      column: { id, title },
    },
  });

  // Check if an item is being dragged
  const isDragging = !!active;

  //Render
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] lg:min-w-[350px] lg:w-[350px] shrink-0 transition-all duration-200 will-change-transform',
        // Expand drop zone when dragging for easier targeting
        isDragging && 'px-3 -mx-3',
        isOver &&
          'ring-2 ring-primary ring-offset-2 rounded-xl scale-[1.01] z-10'
      )}
    >
      <Card
        className={cn(
          'flex flex-col h-full overflow-hidden transition-all duration-200',
          isOver
            ? 'shadow-xl bg-primary/10 border-2 border-primary'
            : isDragging
              ? 'shadow-md border-2 border-dashed border-primary/30 bg-primary/5'
              : 'shadow-sm hover:shadow-md'
        )}
        style={
          color ? { borderTopColor: color, borderTopWidth: '3px' } : undefined
        }
      >
        {/* Header */}
        <div className="p-4 border-b bg-muted/30 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h3
              className="font-semibold text-sm uppercase tracking-wide"
              style={color ? { color } : undefined}
            >
              {title}
            </h3>
            <span className="text-xs font-medium text-muted-foreground bg-background px-2.5 py-1 rounded-full border">
              {count ?? emails.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-0 scroll-smooth">
          <SortableContext
            id={id}
            items={emails.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className={cn(
                'p-3 md:p-4 space-y-3 pb-20 transition-colors duration-200 will-change-contents',
                isOver && 'bg-primary/5'
              )}
            >
              {emails.length === 0 ? (
                <div
                  className={cn(
                    'text-center py-12 text-sm text-muted-foreground border-2 border-dashed rounded-lg transition-all duration-200',
                    isOver
                      ? 'border-primary bg-primary/10 py-16'
                      : 'border-muted-foreground/25'
                  )}
                >
                  <p className={cn(isOver && 'text-primary font-semibold')}>
                    {isOver ? '📥 Drop here!' : 'No emails'}
                  </p>
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
                    onGenerateSummary={onCardGenerateSummary}
                    isGeneratingSummary={generatingSummaryIds.has(email.id)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </Card>
    </div>
  );
}
