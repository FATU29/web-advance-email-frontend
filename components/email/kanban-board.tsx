'use client';

import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
        distance: 8,
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const emailId = active.id as string;
    const targetColumnId = over.id as string;

    // Find the email
    const email = allEmails.find((e) => e.id === emailId);
    if (!email) {
      setActiveId(null);
      return;
    }

    // Find source and target columns
    let sourceColumnId: string | null = null;
    for (const [colId, emails] of Object.entries(emailsByColumn)) {
      if (emails.some((e) => e.id === emailId)) {
        sourceColumnId = colId;
        break;
      }
    }

    // Check if column actually changed
    if (sourceColumnId && sourceColumnId !== targetColumnId) {
      onMoveEmail?.(emailId, targetColumnId);
    }

    setActiveId(null);
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
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
            <SortableContext
              key={column.id}
              id={column.id}
              items={columnEmails.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
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
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeEmail ? (
          <div className="rotate-2 opacity-95 shadow-xl scale-105">
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
