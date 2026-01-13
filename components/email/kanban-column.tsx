'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useRef, useEffect } from 'react';

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

  // Separate droppable for top zone
  const { setNodeRef: setTopZoneRef, isOver: isOverTopZone } = useDroppable({
    id: `${id}-top`,
    data: {
      type: 'column-top',
      column: { id, title },
      position: 'top',
    },
  });

  // Check if an item is being dragged
  const isDragging = !!active;

  // Refs for scroll area
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to top when hovering over top drop zone
  useEffect(() => {
    if (isOverTopZone && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollElement) {
        scrollElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [isOverTopZone]);

  //Render
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] lg:min-w-[350px] lg:w-[350px] shrink-0 transition-all duration-150 will-change-transform',
        // Expand drop zone significantly when dragging for much easier targeting
        isDragging && 'px-4 -mx-4',
        isOver &&
          'ring-2 ring-primary ring-offset-2 rounded-xl scale-[1.02] z-10'
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

        {/* Top Drop Zone - Fixed area for dropping at the top */}
        {isDragging && (
          <div
            ref={setTopZoneRef}
            className={cn(
              'relative transition-all duration-300 m-3 md:m-4',
              isOverTopZone ? 'h-32' : 'h-24'
            )}
          >
            <div
              className={cn(
                'absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg transition-all duration-300',
                isOverTopZone
                  ? 'bg-primary/25 border-4 border-primary border-dashed scale-105 shadow-lg'
                  : 'bg-primary/10 border-2 border-primary/40 border-dashed'
              )}
            >
              <svg
                className={cn(
                  'transition-all duration-300',
                  isOverTopZone
                    ? 'w-10 h-10 animate-bounce text-primary'
                    : 'w-8 h-8 text-primary/70'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              <div className="text-center">
                <p
                  className={cn(
                    'font-semibold transition-all duration-300',
                    isOverTopZone
                      ? 'text-lg text-primary'
                      : 'text-sm text-primary/80'
                  )}
                >
                  {isOverTopZone ? '📥 Drop here to add at top' : 'Drop Zone'}
                </p>
                {isOverTopZone && (
                  <p className="text-xs text-primary/70 mt-1">
                    Email will be added to the top
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1 h-0 scroll-smooth" ref={scrollAreaRef}>
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
                    'text-center py-16 text-sm text-muted-foreground border-2 border-dashed rounded-lg transition-all duration-150 min-h-[200px] flex flex-col items-center justify-center',
                    isOver
                      ? 'border-primary bg-primary/15 py-20 scale-105 border-3'
                      : isDragging
                        ? 'border-primary/40 bg-primary/5 py-18'
                        : 'border-muted-foreground/25'
                  )}
                >
                  <p
                    className={cn(isOver && 'text-primary font-bold text-base')}
                  >
                    {isOver ? '📥 Drop here!' : 'No emails'}
                  </p>
                  {isDragging && !isOver && (
                    <p className="text-xs mt-2 text-primary/70">
                      Drag card here to move
                    </p>
                  )}
                  {!isDragging && (
                    <p className="text-xs mt-1">Drop emails here</p>
                  )}
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
