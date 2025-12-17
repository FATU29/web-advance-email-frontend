'use client';

import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragCancelEvent,
} from '@dnd-kit/core';

import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { IEmailListItem } from '@/types/api.types';
import { IKanbanColumn } from '@/services/kanban.service';

export interface KanbanBoardProps {
  columns: IKanbanColumn[];
  emailsByColumn: Record<string, IEmailListItem[]>;
  onMoveEmail?: (emailId: string, targetColumnId: string) => void;
  onCardClick?: (email: IEmailListItem) => void;
  onCardSnooze?: (email: IEmailListItem) => void;
  onCardStar?: (emailId: string, starred: boolean) => void;
  onCardGenerateSummary?: (emailId: string) => void;
  generatingSummaryIds?: Set<string>;
}

export function KanbanBoard({
  columns,
  emailsByColumn,
  onMoveEmail,
  onCardClick,
  onCardSnooze,
  onCardStar,
  onCardGenerateSummary,
  generatingSummaryIds = new Set(),
}: KanbanBoardProps) {
  //Init state hook
  const [activeId, setActiveId] = React.useState<string | null>(null);

  //Init use hook
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px - balance between sensitivity and preventing accidental drags
      },
    })
  );

  // Get all emails for finding active email
  const allEmails = React.useMemo(() => {
    return Object.values(emailsByColumn).flat();
  }, [emailsByColumn]);

  //Init event handle
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // This handler ensures smooth visual feedback during drag
    // The actual logic is handled by the droppable zones
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset active state
    setActiveId(null);

    if (!over) {
      return;
    }

    const emailId = active.id as string;
    const targetColumnId = over.id as string;

    // Find the email
    const email = allEmails.find((e) => e.id === emailId);
    if (!email) {
      console.warn('Email not found:', emailId);
      return;
    }

    // Find source column
    let sourceColumnId: string | null = null;
    for (const [colId, emails] of Object.entries(emailsByColumn)) {
      if (emails.some((e) => e.id === emailId)) {
        sourceColumnId = colId;
        break;
      }
    }

    // Only move if column actually changed
    if (sourceColumnId && sourceColumnId !== targetColumnId) {
      // Call the move handler - will trigger optimistic update + API call
      onMoveEmail?.(emailId, targetColumnId);
    } else if (!sourceColumnId) {
      console.warn('Source column not found for email:', emailId);
    }
    // If same column, do nothing (no need to move)
  };

  const activeEmail = React.useMemo(() => {
    if (!activeId) return null;
    return allEmails.find((e) => e.id === activeId) || null;
  }, [activeId, allEmails]);

  //Init ref for horizontal scroll
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  //Init effect hook - Enable horizontal scroll with shift + wheel and improve scroll behavior
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // If shift is pressed, scroll horizontally
      if (e.shiftKey) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
        return;
      }

      // Allow horizontal scrolling with trackpad/touchpad
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Natural horizontal scroll, let it happen
        return;
      }

      // For vertical scroll on trackpad, allow it to scroll columns vertically
      // Don't prevent default to allow natural column scrolling
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  //Render
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={scrollContainerRef}
        className="flex gap-4 md:gap-6 h-full overflow-x-auto overflow-y-hidden pb-4 scroll-smooth [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-border/80"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--border)) hsl(var(--muted))',
        }}
      >
        {columns.map((column) => {
          const columnEmails = emailsByColumn[column.id] || [];
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.name}
              emails={columnEmails}
              count={column.emailCount}
              color={column.color}
              onCardClick={onCardClick}
              onCardSnooze={onCardSnooze}
              onCardStar={onCardStar}
              onCardGenerateSummary={onCardGenerateSummary}
              generatingSummaryIds={generatingSummaryIds}
            />
          );
        })}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {activeEmail ? (
          <div className="rotate-2 opacity-90 shadow-2xl scale-105 will-change-transform">
            <KanbanCard
              email={activeEmail}
              onOpen={onCardClick}
              onSnooze={onCardSnooze}
              onStar={onCardStar}
              onGenerateSummary={onCardGenerateSummary}
              isGeneratingSummary={generatingSummaryIds.has(activeEmail.id)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
