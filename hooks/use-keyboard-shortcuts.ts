/**
 * Keyboard shortcuts hook for email navigation and actions
 * Provides Gmail-like keyboard shortcuts for efficient email management
 */

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcutsConfig {
  // Navigation
  onNextEmail?: () => void;
  onPreviousEmail?: () => void;
  onOpenEmail?: () => void;
  onCloseEmail?: () => void;

  // Actions
  onMarkRead?: () => void;
  onMarkUnread?: () => void;
  onToggleStar?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onReply?: () => void;
  onReplyAll?: () => void;
  onForward?: () => void;

  // Navigation
  onCompose?: () => void;
  onSearch?: () => void;
  onGoToInbox?: () => void;
  onGoToSent?: () => void;
  onGoToDrafts?: () => void;

  // UI
  onToggleSidebar?: () => void;

  // Disable shortcuts when typing in inputs
  disabled?: boolean;
  enabled?: boolean;
}

/**
 * Check if user is typing in an input field
 */
const isTypingInInput = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  const isInput =
    tagName === 'input' || tagName === 'textarea' || target.isContentEditable;

  // Check if it's a search input or compose input
  const isSearchInput = target.closest('[role="search"]');
  const isComposeInput = target.closest('[data-compose-input]');

  return isInput || !!isSearchInput || !!isComposeInput;
};

/**
 * Keyboard shortcuts hook
 */
export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig): void => {
  const {
    onNextEmail,
    onPreviousEmail,
    onOpenEmail,
    onCloseEmail,
    onMarkRead: _onMarkRead,
    onMarkUnread,
    onToggleStar,
    onDelete,
    onArchive,
    onReply,
    onReplyAll,
    onForward,
    onCompose,
    onSearch,
    onGoToInbox,
    onGoToSent,
    onGoToDrafts,
    onToggleSidebar: _onToggleSidebar,
    disabled = false,
    enabled = true,
  } = config;

  const configRef = useRef(config);

  // Update ref in effect to avoid updating during render
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle if disabled or not enabled
      if (disabled || !enabled) return;

      // Don't handle if user is typing in an input
      if (isTypingInInput(event.target)) {
        // Allow some shortcuts even when typing (with modifiers)
        const isModifierPressed = event.ctrlKey || event.metaKey;
        if (!isModifierPressed) return;
      }

      const key = event.key.toLowerCase();
      const isModifier = event.ctrlKey || event.metaKey || event.shiftKey;
      const isAlt = event.altKey;

      // Prevent default for handled shortcuts
      const preventDefault = () => {
        event.preventDefault();
        event.stopPropagation();
      };

      // Navigation shortcuts (no modifiers)
      if (!isModifier && !isAlt) {
        switch (key) {
          case 'j':
          case 'arrowdown':
            if (onNextEmail) {
              preventDefault();
              onNextEmail();
            }
            return;

          case 'k':
          case 'arrowup':
            if (onPreviousEmail) {
              preventDefault();
              onPreviousEmail();
            }
            return;

          case 'enter':
            if (onOpenEmail) {
              preventDefault();
              onOpenEmail();
            }
            return;

          case 'escape':
          case 'esc':
            if (onCloseEmail) {
              preventDefault();
              onCloseEmail();
            }
            return;

          case 'u':
            if (onMarkUnread) {
              preventDefault();
              onMarkUnread();
            }
            return;

          case 'r':
            if (onReply) {
              preventDefault();
              onReply();
            }
            return;

          case 'a':
            if (onArchive) {
              preventDefault();
              onArchive();
            }
            return;

          case 's':
            if (onToggleStar) {
              preventDefault();
              onToggleStar();
            }
            return;

          case 'd':
          case '#':
            if (onDelete) {
              preventDefault();
              onDelete();
            }
            return;

          case 'f':
            if (onForward) {
              preventDefault();
              onForward();
            }
            return;
        }
      }

      // Modifier shortcuts
      if (isModifier && !isAlt) {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;

        // Ctrl/Cmd + shortcuts
        if (isCtrlOrCmd) {
          switch (key) {
            case 'k':
              if (onSearch) {
                preventDefault();
                onSearch();
              }
              return;

            case 'enter':
              if (onReplyAll) {
                preventDefault();
                onReplyAll();
              }
              return;

            case 'n':
              if (onCompose) {
                preventDefault();
                onCompose();
              }
              return;
          }
        }

        // Shift + shortcuts
        if (event.shiftKey && !isCtrlOrCmd) {
          switch (key) {
            case 'r':
              if (onReplyAll) {
                preventDefault();
                onReplyAll();
              }
              return;

            case 'a':
              if (onReply) {
                preventDefault();
                onReply();
              }
              return;

            case 'i':
              if (onGoToInbox) {
                preventDefault();
                onGoToInbox();
              }
              return;

            case 't':
              if (onGoToSent) {
                preventDefault();
                onGoToSent();
              }
              return;

            case 'd':
              if (onGoToDrafts) {
                preventDefault();
                onGoToDrafts();
              }
              return;
          }
        }
      }

      // Gmail-style shortcuts (with 'g' prefix)
      if (key === 'g' && !isModifier) {
        // Wait for next key press
        const handleGmailShortcut = (e: KeyboardEvent) => {
          const nextKey = e.key.toLowerCase();
          switch (nextKey) {
            case 'i':
              if (onGoToInbox) {
                e.preventDefault();
                onGoToInbox();
              }
              break;
            case 't':
              if (onGoToSent) {
                e.preventDefault();
                onGoToSent();
              }
              break;
            case 'd':
              if (onGoToDrafts) {
                e.preventDefault();
                onGoToDrafts();
              }
              break;
          }
          window.removeEventListener('keydown', handleGmailShortcut);
        };

        window.addEventListener('keydown', handleGmailShortcut, { once: true });
        preventDefault();
        return;
      }
    },
    [
      disabled,
      enabled,
      onNextEmail,
      onPreviousEmail,
      onOpenEmail,
      onCloseEmail,
      onMarkUnread,
      onToggleStar,
      onDelete,
      onArchive,
      onReply,
      onReplyAll,
      onForward,
      onCompose,
      onSearch,
      onGoToInbox,
      onGoToSent,
      onGoToDrafts,
    ]
  );

  useEffect(() => {
    if (disabled || !enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled, enabled]);
};

/**
 * Keyboard shortcuts reference for help dialog
 */
export const KEYBOARD_SHORTCUTS = {
  navigation: [
    { keys: ['j', '↓'], action: 'Next email' },
    { keys: ['k', '↑'], action: 'Previous email' },
    { keys: ['Enter'], action: 'Open email' },
    { keys: ['Esc'], action: 'Close email' },
  ],
  actions: [
    { keys: ['r'], action: 'Reply' },
    { keys: ['Shift', 'r'], action: 'Reply all' },
    { keys: ['a'], action: 'Archive' },
    { keys: ['s'], action: 'Star/Unstar' },
    { keys: ['d', '#'], action: 'Delete' },
    { keys: ['u'], action: 'Mark unread' },
    { keys: ['f'], action: 'Forward' },
  ],
  navigation_pages: [
    { keys: ['g', 'i'], action: 'Go to Inbox' },
    { keys: ['g', 't'], action: 'Go to Sent' },
    { keys: ['g', 'd'], action: 'Go to Drafts' },
    { keys: ['Shift', 'i'], action: 'Go to Inbox' },
    { keys: ['Shift', 't'], action: 'Go to Sent' },
    { keys: ['Shift', 'd'], action: 'Go to Drafts' },
  ],
  global: [
    { keys: ['Ctrl', 'K'], action: 'Search' },
    { keys: ['Ctrl', 'N'], action: 'Compose' },
    { keys: ['Ctrl', 'B'], action: 'Toggle sidebar' },
  ],
} as const;
