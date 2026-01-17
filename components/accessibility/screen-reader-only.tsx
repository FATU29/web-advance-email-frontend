'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}

/**
 * Screen Reader Only Component
 * Content visible only to screen readers
 * Use for additional context that should be announced but not displayed
 */
export function ScreenReaderOnly({
  children,
  as: Component = 'span',
  className,
}: ScreenReaderOnlyProps) {
  return (
    <Component
      className={cn(
        'sr-only',
        'absolute w-px h-px p-0 -m-px overflow-hidden',
        'whitespace-nowrap border-0',
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Live Region for dynamic content announcements
 * Use for status updates, loading states, error messages
 */
interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  priority = 'polite',
  atomic = true,
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {children}
    </div>
  );
}

/**
 * Announce changes to screen readers
 */
export function useAnnounce() {
  const [announcement, setAnnouncement] = React.useState('');
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>(
    'polite'
  );

  const announce = React.useCallback(
    (message: string, announcePriority: 'polite' | 'assertive' = 'polite') => {
      setAnnouncement('');
      setPriority(announcePriority);
      setTimeout(() => {
        setAnnouncement(message);
      }, 100);
    },
    []
  );

  const AnnouncementRegion = React.useMemo(
    () => <LiveRegion priority={priority}>{announcement}</LiveRegion>,
    [announcement, priority]
  );

  return { announce, AnnouncementRegion };
}
