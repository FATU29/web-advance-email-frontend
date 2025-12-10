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
import { IEmailListItem, KanbanStatus } from '@/types/api.types';

export interface KanbanBoardProps {
  emails: IEmailListItem[];
  onStatusChange?: (emailId: string, newStatus: KanbanStatus) => void;
  onCardClick?: (email: IEmailListItem) => void;
  onCardSnooze?: (email: IEmailListItem) => void;
  onCardStar?: (emailId: string, starred: boolean) => void;
}

const COLUMNS: Array<{ id: KanbanStatus; title: string }> = [
  { id: 'INBOX', title: 'INBOX' },
  { id: 'TODO', title: 'TO DO' },
  { id: 'IN_PROGRESS', title: 'IN PROGRESS' },
  { id: 'DONE', title: 'DONE' },
  { id: 'SNOOZED', title: 'SNOOZED' },
];

export function KanbanBoard({
  emails,
  onStatusChange,
  onCardClick,
  onCardSnooze,
  onCardStar,
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

  // Group emails by status
  const emailsByStatus = React.useMemo(() => {
    const grouped: Record<KanbanStatus, IEmailListItem[]> = {
      INBOX: [],
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
      SNOOZED: [],
    };

    emails.forEach((email) => {
      const status = email.kanbanStatus || 'INBOX';
      if (grouped[status]) {
        grouped[status].push(email);
      } else {
        grouped.INBOX.push(email);
      }
    });

    return grouped;
  }, [emails]);

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
    const newStatus = over.id as KanbanStatus;

    // Find the email
    const email = emails.find((e) => e.id === emailId);
    if (!email) {
      setActiveId(null);
      return;
    }

    // Check if status actually changed
    const currentStatus = email.kanbanStatus || 'INBOX';
    if (currentStatus !== newStatus) {
      onStatusChange?.(emailId, newStatus);
    }

    setActiveId(null);
  };

  const activeEmail = React.useMemo(() => {
    if (!activeId) return null;
    return emails.find((e) => e.id === activeId) || null;
  }, [activeId, emails]);

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
        {COLUMNS.map((column) => {
          const columnEmails = emailsByStatus[column.id] || [];
          return (
            <SortableContext
              key={column.id}
              id={column.id}
              items={columnEmails.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={column.id}
                title={column.title}
                emails={columnEmails}
                onCardClick={onCardClick}
                onCardSnooze={onCardSnooze}
                onCardStar={onCardStar}
                onCardStatusChange={onStatusChange}
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
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
