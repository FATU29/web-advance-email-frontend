'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/utils/constants/routes';

import { EmailLayout } from '@/components/email/email-layout';
import { Sidebar } from '@/components/email/sidebar';
import { ComposeEmailDialog } from '@/components/email/compose-email-dialog';
import { SearchResultsView } from '@/components/email/search-results-view';
import { type Message } from '@/components/ui/chat-message';
import { KeyboardShortcutsDialog } from '@/components/accessibility';
import useAuth from '@/lib/stores/use-auth';
import {
  useMailboxesQuery,
  useEmailsInfiniteQuery,
  useEmailQuery,
  useDeleteEmailMutation,
  useToggleEmailStarMutation,
  useMarkEmailAsReadMutation,
  useBulkEmailActionMutation,
} from '@/hooks/use-email-mutations';
import {
  IEmailListItem,
  IEmailDetail,
  IPaginatedResponse,
} from '@/types/api.types';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function MailFolderPage({
  params,
}: {
  params: Promise<{ folder: string }>;
}) {
  const router = useRouter();
  const logout = useAuth((state) => state.logout);
  const user = useAuth((state) => state.user);

  // Unwrap params promise
  const resolvedParams = React.use(params);

  //Init state hook
  const [emailsList, setEmailsList] = React.useState<IEmailListItem[]>([]);
  const loadedPagesCountRef = React.useRef(0);
  const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(
    new Set()
  );
  const [selectedEmailId, setSelectedEmailId] = React.useState<string | null>(
    null
  );
  const [focusedEmailIndex, setFocusedEmailIndex] = React.useState<number>(-1);
  const [chatMessages, setChatMessages] = React.useState<Message[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [size] = React.useState(20);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [isSearchMode, setIsSearchMode] = React.useState(false);
  const [composeMode, setComposeMode] = React.useState<
    'compose' | 'reply' | 'replyAll' | 'forward'
  >('compose');
  const [originalEmail, setOriginalEmail] = React.useState<
    IEmailDetail | undefined
  >(undefined);

  // Fetch mailboxes
  const { data: mailboxes = [] } = useMailboxesQuery();

  // Find mailbox by folder name
  const currentMailbox = React.useMemo(() => {
    const folder = resolvedParams.folder.toLowerCase();

    // First try to find by exact id match
    let mailbox = mailboxes.find((m) => m.id.toLowerCase() === folder);

    // If not found, try to find by type mapping
    if (!mailbox) {
      const typeMap: Record<
        string,
        'INBOX' | 'SENT' | 'DRAFTS' | 'TRASH' | 'SPAM' | 'STARRED' | 'IMPORTANT'
      > = {
        inbox: 'INBOX',
        sent: 'SENT',
        drafts: 'DRAFTS',
        draft: 'DRAFTS',
        trash: 'TRASH',
        spam: 'SPAM',
        starred: 'STARRED',
        important: 'IMPORTANT',
      };
      const mailboxType = typeMap[folder];
      if (mailboxType) {
        mailbox = mailboxes.find((m) => m.type === mailboxType);
      }
    }

    // If still not found, try to find by name (case-insensitive)
    if (!mailbox) {
      mailbox = mailboxes.find((m) => m.name.toLowerCase() === folder);
    }

    return mailbox;
  }, [mailboxes, resolvedParams.folder]);

  // Fetch emails with infinite scroll
  const {
    data: emailsData,
    isLoading: emailsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: emailsError,
  } = useEmailsInfiniteQuery(currentMailbox?.id || '', size, {
    enabled: !!currentMailbox?.id,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  // Reset when mailbox changes
  React.useEffect(() => {
    if (currentMailbox?.id) {
      setEmailsList([]);
      loadedPagesCountRef.current = 0;
      setSelectedEmails(new Set());
      setSelectedEmailId(null);
    }
  }, [currentMailbox?.id]);

  // Update emails list when pages change
  React.useEffect(() => {
    // Don't update if no mailbox is selected
    if (!currentMailbox?.id) {
      setEmailsList([]);
      loadedPagesCountRef.current = 0;
      return;
    }

    // If no data yet, clear list
    if (!emailsData?.pages) {
      // Only clear if we're not loading (to avoid clearing during initial load)
      if (!emailsLoading) {
        setEmailsList([]);
        loadedPagesCountRef.current = 0;
      }
      return;
    }

    const currentPagesCount = emailsData.pages.length;
    const loadedCount = loadedPagesCountRef.current;

    // Initial load - set first page
    if (currentPagesCount === 1 && loadedCount === 0) {
      const firstPage = emailsData
        .pages[0] as IPaginatedResponse<IEmailListItem>;
      setEmailsList(firstPage.content);
      loadedPagesCountRef.current = 1;
      return;
    }

    // Load more - append new pages that haven't been loaded yet
    if (currentPagesCount > loadedCount) {
      // Get all new pages that haven't been loaded
      const newPages = emailsData.pages.slice(
        loadedCount
      ) as IPaginatedResponse<IEmailListItem>[];
      const allNewEmails = newPages.flatMap((page) => page.content);

      // Append only new emails (not duplicates)
      setEmailsList((prev) => {
        const existingIds = new Set(prev.map((e) => e.id));
        const uniqueNewEmails = allNewEmails.filter(
          (email) => !existingIds.has(email.id)
        );
        return [...prev, ...uniqueNewEmails];
      });

      loadedPagesCountRef.current = currentPagesCount;
    }
  }, [emailsData?.pages, currentMailbox?.id, emailsLoading]);

  const emails = emailsList;

  // Fetch selected email detail
  const { data: selectedEmail } = useEmailQuery(selectedEmailId || '', {
    enabled: !!selectedEmailId,
  });

  // Mutations
  const deleteEmailMutation = useDeleteEmailMutation();
  const toggleStarMutation = useToggleEmailStarMutation();
  const markAsReadMutation = useMarkEmailAsReadMutation();
  const bulkActionMutation = useBulkEmailActionMutation();

  //Init event handle
  const handleEmailSelect = (emailId: string, selected: boolean) => {
    const newSelected = new Set(selectedEmails);
    if (selected) {
      newSelected.add(emailId);
    } else {
      newSelected.delete(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEmails(
        new Set(emails.map((email: IEmailListItem) => email.id))
      );
    } else {
      setSelectedEmails(new Set());
    }
  };

  const handleEmailClick = (email: IEmailListItem) => {
    setSelectedEmailId(email.id);
    // Mark as read if unread
    if (!email.isRead) {
      markAsReadMutation.mutate(email.id, {
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to mark email as read'
          );
        },
      });
    }
  };

  const handleReply = (email: IEmailDetail) => {
    setOriginalEmail(email);
    setComposeMode('reply');
    setComposeOpen(true);
  };

  const handleReplyAll = (email: IEmailDetail) => {
    setOriginalEmail(email);
    setComposeMode('replyAll');
    setComposeOpen(true);
  };

  const handleForward = (email: IEmailDetail) => {
    setOriginalEmail(email);
    setComposeMode('forward');
    setComposeOpen(true);
  };

  const handleArchive = (emailId: string) => {
    bulkActionMutation.mutate(
      {
        emailIds: [emailId],
        action: 'archive',
      },
      {
        onSuccess: () => {
          toast.success('Email archived successfully');
          // Update local email list immediately
          setEmailsList((prevList) => prevList.filter((e) => e.id !== emailId));
          // Clear selected email if it was the archived one
          if (selectedEmailId === emailId) {
            setSelectedEmailId(null);
          }
          // Clear from selection
          const newSelected = new Set(selectedEmails);
          newSelected.delete(emailId);
          setSelectedEmails(newSelected);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Failed to archive email'
          );
        },
      }
    );
  };

  const handleBulkAction = (
    action: 'read' | 'unread' | 'star' | 'unstar' | 'delete' | 'archive',
    emailIds: string[]
  ) => {
    bulkActionMutation.mutate(
      {
        emailIds,
        action,
      },
      {
        onSuccess: () => {
          const actionLabels: Record<string, string> = {
            read: 'marked as read',
            unread: 'marked as unread',
            star: 'starred',
            unstar: 'unstarred',
            delete: 'deleted',
            archive: 'archived',
          };
          toast.success(
            `${emailIds.length} email(s) ${actionLabels[action]} successfully`
          );
          // Update local email list immediately for delete/archive actions
          if (action === 'delete' || action === 'archive') {
            setEmailsList((prevList) =>
              prevList.filter((e) => !emailIds.includes(e.id))
            );
          }
          // Clear selection after action
          setSelectedEmails(new Set());
          // Clear selected email if it was in the list
          if (selectedEmailId && emailIds.includes(selectedEmailId)) {
            if (action === 'delete' || action === 'archive') {
              setSelectedEmailId(null);
            }
          }
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Failed to perform action'
          );
        },
      }
    );
  };

  const handleDelete = (emailId: string) => {
    deleteEmailMutation.mutate(emailId, {
      onSuccess: () => {
        toast.success('Email deleted successfully');
        // Update local email list immediately
        setEmailsList((prevList) => prevList.filter((e) => e.id !== emailId));
        // Clear selected email if it was the deleted one
        if (selectedEmailId === emailId) {
          setSelectedEmailId(null);
        }
        // Clear from selection
        const newSelected = new Set(selectedEmails);
        newSelected.delete(emailId);
        setSelectedEmails(newSelected);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete email'
        );
      },
    });
  };

  const handleStar = (emailId: string, starred: boolean) => {
    toggleStarMutation.mutate(
      {
        emailId,
        starred,
      },
      {
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Failed to toggle star'
          );
        },
      }
    );
  };

  const handleSidebarItemClick = (itemId: string) => {
    // Navigate to folder
    router.push(ROUTES.MAIL_FOLDER(itemId));
  };

  const handleComposeClick = () => {
    setOriginalEmail(undefined);
    setComposeMode('compose');
    setComposeOpen(true);
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      // Redirect to login page after logout
      router.push(ROUTES.LOGIN);
    } catch {
      // Even if logout API fails, redirect to login
      router.push(ROUTES.LOGIN);
    }
  };

  //Init chat handlers
  const handleChatSubmit = (
    event?: { preventDefault?: () => void },
    _options?: { experimental_attachments?: FileList }
  ) => {
    event?.preventDefault?.();
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      createdAt: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsGenerating(true);

    // TODO: Implement chat API call
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'This is a placeholder response. Please implement the chat API.',
        createdAt: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  };

  const handleChatStop = () => {
    setIsGenerating(false);
    // TODO: Implement stop generation
  };

  const handleChatAppend = (message: { role: 'user'; content: string }) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: message.role,
      content: message.content,
      createdAt: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsGenerating(true);

    // TODO: Implement chat API call
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'This is a placeholder response. Please implement the chat API.',
        createdAt: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleToggleKanban = () => {
    router.push('/mail/kanban');
  };

  const handleOpenSearch = () => {
    setIsSearchMode(true);
  };

  const handleCloseSearch = () => {
    setIsSearchMode(false);
  };

  // Keyboard navigation handlers
  const handleNextEmail = React.useCallback(() => {
    if (emails.length === 0) return;
    setFocusedEmailIndex((prev) => {
      const next = prev < emails.length - 1 ? prev + 1 : prev;
      return next;
    });
  }, [emails.length]);

  const handlePreviousEmail = React.useCallback(() => {
    if (emails.length === 0) return;
    setFocusedEmailIndex((prev) => {
      const next = prev > 0 ? prev - 1 : 0;
      return next;
    });
  }, [emails.length]);

  const handleOpenFocusedEmail = React.useCallback(() => {
    if (focusedEmailIndex >= 0 && focusedEmailIndex < emails.length) {
      const email = emails[focusedEmailIndex];
      handleEmailClick(email);
    } else if (selectedEmailId) {
      // If email detail is open, keep it open
      return;
    } else if (emails.length > 0) {
      // Open first email if none focused
      handleEmailClick(emails[0]);
    }
  }, [focusedEmailIndex, emails, selectedEmailId, handleEmailClick]);

  const handleCloseEmail = React.useCallback(() => {
    setSelectedEmailId(null);
  }, []);

  const handleMarkRead = React.useCallback(() => {
    if (selectedEmailId) {
      markAsReadMutation.mutate(selectedEmailId);
    } else if (focusedEmailIndex >= 0 && focusedEmailIndex < emails.length) {
      const email = emails[focusedEmailIndex];
      if (!email.isRead) {
        markAsReadMutation.mutate(email.id);
      }
    }
  }, [selectedEmailId, focusedEmailIndex, emails, markAsReadMutation]);

  const handleMarkUnread = React.useCallback(() => {
    if (selectedEmailId) {
      bulkActionMutation.mutate({
        emailIds: [selectedEmailId],
        action: 'unread',
      });
    } else if (focusedEmailIndex >= 0 && focusedEmailIndex < emails.length) {
      const email = emails[focusedEmailIndex];
      if (email.isRead) {
        bulkActionMutation.mutate({
          emailIds: [email.id],
          action: 'unread',
        });
      }
    }
  }, [selectedEmailId, focusedEmailIndex, emails, bulkActionMutation]);

  const handleToggleStarFocused = React.useCallback(() => {
    if (selectedEmailId) {
      const email = emails.find((e) => e.id === selectedEmailId);
      if (email) {
        handleStar(email.id, !email.isStarred);
      }
    } else if (focusedEmailIndex >= 0 && focusedEmailIndex < emails.length) {
      const email = emails[focusedEmailIndex];
      handleStar(email.id, !email.isStarred);
    }
  }, [selectedEmailId, focusedEmailIndex, emails, handleStar]);

  const handleDeleteFocused = React.useCallback(() => {
    if (selectedEmailId) {
      handleDelete(selectedEmailId);
    } else if (focusedEmailIndex >= 0 && focusedEmailIndex < emails.length) {
      const email = emails[focusedEmailIndex];
      handleDelete(email.id);
      // Move focus to next email if available
      if (focusedEmailIndex < emails.length - 1) {
        setFocusedEmailIndex(focusedEmailIndex);
      } else if (focusedEmailIndex > 0) {
        setFocusedEmailIndex(focusedEmailIndex - 1);
      }
    }
  }, [selectedEmailId, focusedEmailIndex, emails, handleDelete]);

  const handleArchiveFocused = React.useCallback(() => {
    if (selectedEmailId) {
      handleArchive(selectedEmailId);
    } else if (focusedEmailIndex >= 0 && focusedEmailIndex < emails.length) {
      const email = emails[focusedEmailIndex];
      handleArchive(email.id);
      // Move focus to next email if available
      if (focusedEmailIndex < emails.length - 1) {
        setFocusedEmailIndex(focusedEmailIndex);
      } else if (focusedEmailIndex > 0) {
        setFocusedEmailIndex(focusedEmailIndex - 1);
      }
    }
  }, [selectedEmailId, focusedEmailIndex, emails, handleArchive]);

  const handleReplyFocused = React.useCallback(() => {
    if (selectedEmail && selectedEmailId) {
      handleReply(selectedEmail);
    }
  }, [selectedEmail, selectedEmailId, handleReply]);

  const handleReplyAllFocused = React.useCallback(() => {
    if (selectedEmail && selectedEmailId) {
      handleReplyAll(selectedEmail);
    }
  }, [selectedEmail, selectedEmailId, handleReplyAll]);

  const handleForwardFocused = React.useCallback(() => {
    if (selectedEmail && selectedEmailId) {
      handleForward(selectedEmail);
    }
  }, [selectedEmail, selectedEmailId, handleForward]);

  const handleGoToInbox = React.useCallback(() => {
    router.push(ROUTES.MAIL_FOLDER('inbox'));
  }, [router]);

  const handleGoToSent = React.useCallback(() => {
    router.push(ROUTES.MAIL_FOLDER('sent'));
  }, [router]);

  const handleGoToDrafts = React.useCallback(() => {
    router.push(ROUTES.MAIL_FOLDER('drafts'));
  }, [router]);

  // Reset focused index when emails change
  React.useEffect(() => {
    if (focusedEmailIndex >= emails.length) {
      setFocusedEmailIndex(Math.max(0, emails.length - 1));
    }
  }, [emails.length, focusedEmailIndex]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onNextEmail: handleNextEmail,
    onPreviousEmail: handlePreviousEmail,
    onOpenEmail: handleOpenFocusedEmail,
    onCloseEmail: handleCloseEmail,
    onMarkRead: handleMarkRead,
    onMarkUnread: handleMarkUnread,
    onToggleStar: handleToggleStarFocused,
    onDelete: handleDeleteFocused,
    onArchive: handleArchiveFocused,
    onReply: handleReplyFocused,
    onReplyAll: handleReplyAllFocused,
    onForward: handleForwardFocused,
    onCompose: handleComposeClick,
    onSearch: handleOpenSearch,
    onGoToInbox: handleGoToInbox,
    onGoToSent: handleGoToSent,
    onGoToDrafts: handleGoToDrafts,
    disabled: isSearchMode || composeOpen,
    enabled: !isSearchMode && !composeOpen,
  });

  const handleViewEmailFromSearch = (emailId: string) => {
    setSelectedEmailId(emailId);
    setIsSearchMode(false);
  };

  const chatSuggestions = [
    'Summarize my emails',
    'Find important emails',
    'Draft a reply',
    'Check my schedule',
  ];

  //Render
  return (
    <div className="relative flex h-screen w-full flex-col">
      {/* Keyboard Shortcuts Help - accessible via ? key */}
      <KeyboardShortcutsDialog />

      {isSearchMode ? (
        <SearchResultsView
          onBack={handleCloseSearch}
          onViewEmail={handleViewEmailFromSearch}
          className="h-full"
        />
      ) : (
        <EmailLayout
          sidebar={
            <Sidebar
              mailboxes={mailboxes}
              user={
                user
                  ? {
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      avatar: user.profilePicture || undefined,
                    }
                  : undefined
              }
              activeFolder={resolvedParams.folder}
              onItemClick={handleSidebarItemClick}
              onComposeClick={handleComposeClick}
              onLogoutClick={handleLogoutClick}
              onSearchClick={handleOpenSearch}
            />
          }
          emails={emails}
          loading={emailsLoading}
          isLoadingMore={isFetchingNextPage}
          hasMore={hasNextPage || false}
          onLoadMore={() => fetchNextPage()}
          selectedEmails={selectedEmails}
          onEmailSelect={handleEmailSelect}
          onEmailClick={handleEmailClick}
          onSelectAll={handleSelectAll}
          onBulkAction={handleBulkAction}
          onToggleKanban={handleToggleKanban}
          focusedEmailIndex={focusedEmailIndex}
          selectedEmail={selectedEmail || undefined}
          onBack={() => setSelectedEmailId(null)}
          onReply={handleReply}
          onReplyAll={handleReplyAll}
          onForward={handleForward}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onStar={handleStar}
          error={
            emailsError instanceof Error
              ? emailsError.message
              : emailsError
                ? 'Failed to load emails'
                : null
          }
          className="h-full"
        />
      )}

      {/* Compose Email Dialog */}
      <ComposeEmailDialog
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open);
          if (!open) {
            setOriginalEmail(undefined);
            setComposeMode('compose');
          }
        }}
        mode={composeMode}
        originalEmail={originalEmail}
      />
    </div>
  );
}
