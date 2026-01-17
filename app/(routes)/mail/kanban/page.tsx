'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addHours } from 'date-fns';
import {
  List,
  RefreshCw,
  Search,
  Settings,
  Inbox,
  Send,
  Star,
} from 'lucide-react';

import { Sidebar } from '@/components/email/sidebar';
import { EmailDetail } from '@/components/email/email-detail';
import { KanbanBoard } from '@/components/email/kanban-board';
import { KanbanCard } from '@/components/email/kanban-card';
import { KanbanFilters } from '@/components/email/kanban-filters';
import { SnoozeDialog } from '@/components/email/snooze-dialog';
import { SearchResultsView } from '@/components/email/search-results-view';
import { KanbanSettingsDialog } from '@/components/email/kanban-settings-dialog';
import { KeyboardShortcutsDialog } from '@/components/accessibility';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useIsMobile } from '@/hooks/use-mobile';
import useAuth from '@/lib/stores/use-auth';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import {
  useMailboxesQuery,
  useEmailsInfiniteQuery,
  useEmailQuery,
  useToggleEmailStarMutation,
} from '@/hooks/use-email-mutations';
import {
  useKanbanFilteredBoardQuery,
  useGenerateSummaryMutation,
  useMoveEmailMutation,
  useSnoozeEmailKanbanMutation,
  useUnsnoozeEmailMutation,
  useGmailStatusQuery,
  useSyncGmailMutation,
} from '@/hooks/use-kanban-mutations';
import { IEmailListItem, KanbanStatus } from '@/types/api.types';
import { cn } from '@/lib/utils';

// Mock data removed - using real Gmail API data only

export default function KanbanPage() {
  const router = useRouter();
  const logout = useAuth((state) => state.logout);
  const user = useAuth((state) => state.user);
  const isMobile = useIsMobile();

  //Init state hook
  const [selectedEmailId, setSelectedEmailId] = React.useState<string | null>(
    null
  );
  const [snoozeDialogOpen, setSnoozeDialogOpen] = React.useState(false);
  const [emailToSnooze, setEmailToSnooze] =
    React.useState<IEmailListItem | null>(null);
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [generatingSummaryIds, setGeneratingSummaryIds] = React.useState<
    Set<string>
  >(new Set());
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<
    'date-desc' | 'date-asc' | 'sender'
  >('date-desc');
  const [activeFilters, setActiveFilters] = React.useState<
    Set<'unread' | 'attachments' | 'starred'>
  >(new Set());
  const [isSearchMode, setIsSearchMode] = React.useState(false);
  const [selectedColumnId, setSelectedColumnId] = React.useState<string>('');

  //Init effect hook - Prevent hydration mismatch with @dnd-kit
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch mailboxes
  const { data: mailboxesData = [] } = useMailboxesQuery({
    enabled: true, // Always enabled - using real API
  });

  // Use mailboxes from API
  const mailboxes = React.useMemo(() => {
    return mailboxesData || [];
  }, [mailboxesData]);

  // Find INBOX mailbox - must use real Gmail label ID "INBOX"
  const inboxMailbox = React.useMemo(() => {
    // Find mailbox with type INBOX or ID "INBOX" (Gmail label ID)
    return (
      mailboxes.find((m) => m.type === 'INBOX' || m.id === 'INBOX') ||
      mailboxes[0]
    );
  }, [mailboxes]);

  // Check Gmail connection status
  const { data: gmailStatus, isLoading: gmailStatusLoading } =
    useGmailStatusQuery({
      enabled: true,
      refetchOnWindowFocus: false,
    });

  // Map frontend sortBy to backend format
  const backendSortBy = React.useMemo(():
    | 'date_newest'
    | 'date_oldest'
    | 'sender_name' => {
    switch (sortBy) {
      case 'date-desc':
        return 'date_newest';
      case 'date-asc':
        return 'date_oldest';
      case 'sender':
        return 'sender_name';
      default:
        return 'date_newest';
    }
  }, [sortBy]);

  // Build filter params for backend API
  const filterParams = React.useMemo(
    () => ({
      sortBy: backendSortBy,
      unreadOnly: activeFilters.has('unread') ? true : undefined,
      hasAttachmentsOnly: activeFilters.has('attachments') ? true : undefined,
      // Note: starred filter is client-side only as backend doesn't support it
    }),
    [backendSortBy, activeFilters]
  );

  // Fetch filtered Kanban board data from backend
  const { data: kanbanBoardData, isLoading: kanbanLoading } =
    useKanbanFilteredBoardQuery(filterParams, {
      enabled: true, // Always enabled - using real API
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchInterval: false, // Disable auto-refetch to prevent spam
    });

  // Sync mutation
  const syncGmailMutation = useSyncGmailMutation();

  // Fetch emails with infinite scroll (disabled - using Kanban API instead)
  // Note: This query is disabled and should not make any API calls
  // Only keeping it for potential future use, but it should never run
  const { isLoading: emailsLoading } = useEmailsInfiniteQuery(
    inboxMailbox?.id || 'INBOX', // Use 'INBOX' as fallback (Gmail label ID)
    50,
    {
      enabled: false, // Disabled - using Kanban API instead
    }
  );

  // Convert Kanban board data to IEmailListItem format
  const emailsByColumn = React.useMemo((): Record<string, IEmailListItem[]> => {
    if (!kanbanBoardData) return {};

    const converted: Record<string, IEmailListItem[]> = {};
    Object.entries(kanbanBoardData.emailsByColumn).forEach(
      ([columnId, kanbanEmails]) => {
        converted[columnId] = kanbanEmails.map((kanbanEmail) => {
          const column = kanbanBoardData.columns.find((c) => c.id === columnId);
          const status = column?.type as KanbanStatus | undefined;

          return {
            id: kanbanEmail.emailId,
            from: kanbanEmail.fromEmail,
            fromName: kanbanEmail.fromName,
            subject: kanbanEmail.subject,
            preview: kanbanEmail.preview,
            isRead: kanbanEmail.isRead,
            isStarred: kanbanEmail.isStarred,
            isImportant: false,
            hasAttachments: false,
            receivedAt: kanbanEmail.receivedAt,
            kanbanStatus: status,
            snoozeUntil: kanbanEmail.snoozeUntil,
            aiSummary: kanbanEmail.summary || undefined,
          };
        });
      }
    );
    return converted;
  }, [kanbanBoardData]);

  // Apply client-side filters that backend doesn't support (starred only)
  // Note: Backend handles sorting, unread, and attachments filters
  const filteredAndSortedEmailsByColumn = React.useMemo((): Record<
    string,
    IEmailListItem[]
  > => {
    // If starred filter is not active, return emails as-is from backend
    if (!activeFilters.has('starred')) {
      return emailsByColumn;
    }

    // Apply starred filter client-side
    const filtered: Record<string, IEmailListItem[]> = {};
    Object.entries(emailsByColumn).forEach(([columnId, emails]) => {
      filtered[columnId] = emails.filter((email) => email.isStarred);
    });

    return filtered;
  }, [emailsByColumn, activeFilters]);

  // Flatten emails from all columns for other uses
  const emails = React.useMemo(() => {
    return Object.values(emailsByColumn).flat();
  }, [emailsByColumn]);

  // Fetch selected email detail
  const { data: selectedEmail } = useEmailQuery(selectedEmailId || '', {
    enabled: !!selectedEmailId,
  });

  // Mutations
  const toggleStarMutation = useToggleEmailStarMutation();
  const moveEmailMutation = useMoveEmailMutation();
  const snoozeEmailKanbanMutation = useSnoozeEmailKanbanMutation();
  const unsnoozeEmailMutation = useUnsnoozeEmailMutation();
  const generateSummaryMutation = useGenerateSummaryMutation();

  // Set initial selected column for mobile
  React.useEffect(() => {
    if (isMobile && kanbanBoardData && !selectedColumnId) {
      const firstColumn = kanbanBoardData.columns[0];
      if (firstColumn) {
        setSelectedColumnId(firstColumn.id);
      }
    }
  }, [isMobile, kanbanBoardData, selectedColumnId]);

  // Check for expired snoozes and restore them
  React.useEffect(() => {
    // Skip if no emails
    if (emails.length === 0 || !kanbanBoardData) {
      return;
    }

    const checkSnoozes = () => {
      const now = new Date();
      const expiredSnoozes = emails.filter(
        (email) =>
          email.kanbanStatus === 'SNOOZED' &&
          email.snoozeUntil &&
          new Date(email.snoozeUntil) <= now
      );

      // Only process if there are expired snoozes
      if (expiredSnoozes.length === 0) {
        return;
      }

      // Process expired snoozes one by one to avoid spam
      // Use unsnooze mutation to restore to previous column
      expiredSnoozes.forEach((email) => {
        unsnoozeEmailMutation.mutate(email.id, {
          onSuccess: () => {
            toast.success(`Email "${email.subject}" restored`);
            // Query will be invalidated automatically by mutation
          },
          onError: (_error) => {
            // If unsnooze fails, try moving to inbox as fallback
            const targetColumn = kanbanBoardData?.columns.find(
              (c) => c.type === 'INBOX'
            );
            if (targetColumn) {
              moveEmailMutation.mutate(
                {
                  emailId: email.id,
                  targetColumnId: targetColumn.id,
                },
                {
                  onSuccess: () => {
                    toast.success(`Email "${email.subject}" restored to inbox`);
                  },
                }
              );
            }
          },
        });
      });
    };

    // Check every minute (not immediately to avoid spam on mount)
    const interval = setInterval(checkSnoozes, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails.length]); // Only depend on emails.length to prevent infinite loops

  //Init event handle
  const handleMoveEmail = (emailId: string, targetColumnId: string) => {
    // Check if target column is SNOOZED type
    const targetColumn = kanbanBoardData?.columns.find(
      (col) => col.id === targetColumnId
    );

    if (targetColumn?.type === 'SNOOZED') {
      // Automatically snooze with 1 hour when dragging to SNOOZED column
      const snoozeUntil = addHours(new Date(), 1).toISOString();
      snoozeEmailKanbanMutation.mutate(
        {
          emailId,
          snoozeUntil,
        },
        {
          onSuccess: () => {
            toast.success('Email snoozed for 1 hour');
            // Query will be invalidated automatically by mutation
          },
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : 'Failed to snooze email'
            );
          },
        }
      );
    } else {
      // Normal move for non-SNOOZED columns
      moveEmailMutation.mutate(
        {
          emailId,
          targetColumnId,
        },
        {
          onSuccess: () => {
            toast.success('Email moved successfully');
            // Query will be invalidated automatically by mutation
          },
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : 'Failed to move email'
            );
          },
        }
      );
    }
  };

  const handleSyncGmail = async () => {
    setIsSyncing(true);
    try {
      const result = await syncGmailMutation.mutateAsync(50);
      toast.success(
        `Synced ${result.synced} emails (${result.skipped} already in Kanban)`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sync Gmail'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCardClick = (email: IEmailListItem) => {
    setSelectedEmailId(email.id);
  };

  const handleSnooze = (email: IEmailListItem) => {
    setEmailToSnooze(email);
    setSnoozeDialogOpen(true);
  };

  const handleSnoozeConfirm = (snoozeUntil: string) => {
    if (!emailToSnooze) return;

    // Use Kanban snooze mutation
    snoozeEmailKanbanMutation.mutate(
      {
        emailId: emailToSnooze.id,
        snoozeUntil,
      },
      {
        onSuccess: () => {
          toast.success('Email snoozed successfully');
          // Query will be invalidated automatically by mutation
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Failed to snooze email'
          );
        },
      }
    );
  };

  const handleGenerateSummary = (emailId: string) => {
    setGeneratingSummaryIds((prev) => new Set(prev).add(emailId));

    generateSummaryMutation.mutate(emailId, {
      onSuccess: () => {
        toast.success('Summary generated successfully');
        // Query will be invalidated automatically by mutation
        setGeneratingSummaryIds((prev) => {
          const next = new Set(prev);
          next.delete(emailId);
          return next;
        });
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : 'Failed to generate summary'
        );
        setGeneratingSummaryIds((prev) => {
          const next = new Set(prev);
          next.delete(emailId);
          return next;
        });
      },
    });
  };

  const handleStar = (emailId: string, starred: boolean) => {
    toggleStarMutation.mutate(
      { emailId, starred },
      {
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'Failed to toggle star'
          );
        },
      }
    );
  };

  const handleBack = () => {
    setSelectedEmailId(null);
  };

  const handleToggleView = () => {
    if (viewMode === 'kanban') {
      router.push('/mail/inbox');
    } else {
      setViewMode('kanban');
    }
  };

  const handleOpenSearch = () => {
    setIsSearchMode(true);
  };

  const handleCloseSearch = () => {
    setIsSearchMode(false);
  };

  const handleViewEmailFromSearch = (emailId: string) => {
    setSelectedEmailId(emailId);
    setIsSearchMode(false);
  };

  // Note: We don't filter out snoozed emails here because they should be visible in the SNOOZED column
  // Backend scheduler automatically moves expired snoozed emails back to their original column
  const visibleEmails = emails;

  //Render mobile kanban view
  if (isMobile) {
    return (
      <div className="flex h-screen flex-col">
        {/* Mobile Header */}
        <div className="flex h-14 items-center border-b px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[280px] p-0"
              showCloseButton={false}
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="h-full">
                <Sidebar
                  mailboxes={mailboxes}
                  activeFolder={inboxMailbox?.id}
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
                  onLogoutClick={logout}
                  onItemClick={(folder) => {
                    setSidebarOpen(false);
                    router.push(`/mail/${folder}`);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="ml-2 text-base font-semibold flex-1 truncate">
            Kanban Board
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleView}
            className="gap-1 text-xs"
          >
            <List className="size-4" />
            List
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenSearch}
            className="size-9"
          >
            <Search className="size-5" />
          </Button>
        </div>

        {isSearchMode ? (
          <SearchResultsView
            onBack={handleCloseSearch}
            onViewEmail={handleViewEmailFromSearch}
            onStar={handleStar}
            className="h-full"
          />
        ) : (
          <>
            {/* Mobile Kanban Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {!isMounted || kanbanLoading || emailsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  </div>
                </div>
              ) : kanbanBoardData ? (
                <>
                  {/* Filter Tabs - Show status distribution */}
                  <div className="border-b bg-background overflow-x-auto">
                    <div className="flex p-2 gap-2 min-w-max">
                      {kanbanBoardData.columns.map((column) => {
                        const columnEmails =
                          filteredAndSortedEmailsByColumn[column.id] || [];
                        const isActive = selectedColumnId === column.id;
                        return (
                          <Button
                            key={column.id}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedColumnId(column.id)}
                            className="gap-2 whitespace-nowrap"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: column.color }}
                            />
                            <span className="truncate">{column.name}</span>
                            <span
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded-full shrink-0',
                                isActive
                                  ? 'bg-primary-foreground/20'
                                  : 'bg-muted'
                              )}
                            >
                              {columnEmails.length}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* All Emails List with Status Selector */}
                  <div className="flex-1 overflow-auto">
                    <div className="p-4 space-y-3 pb-20">
                      {(() => {
                        const activeColumn = kanbanBoardData.columns.find(
                          (c) => c.id === selectedColumnId
                        );
                        const columnEmails =
                          filteredAndSortedEmailsByColumn[selectedColumnId] ||
                          [];

                        if (!activeColumn) return null;

                        if (columnEmails.length === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="text-muted-foreground mb-2">
                                No emails in {activeColumn.name}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Change filter to see other emails
                              </p>
                            </div>
                          );
                        }

                        return columnEmails.map((email) => {
                          const currentColumn = kanbanBoardData.columns.find(
                            (col) =>
                              filteredAndSortedEmailsByColumn[col.id]?.some(
                                (e) => e.id === email.id
                              )
                          );

                          return (
                            <div
                              key={email.id}
                              className="space-y-2 rounded-lg hover:bg-muted/30 transition-colors p-1"
                            >
                              {/* Email Card */}
                              <div
                                onClick={() => handleCardClick(email)}
                                className="active:scale-[0.98] transition-transform cursor-pointer"
                              >
                                <KanbanCard
                                  email={email}
                                  onOpen={handleCardClick}
                                  onSnooze={handleSnooze}
                                  onStar={handleStar}
                                  onGenerateSummary={handleGenerateSummary}
                                  isGeneratingSummary={generatingSummaryIds.has(
                                    email.id
                                  )}
                                />
                              </div>

                              {/* Status Selector */}
                              <div className="flex items-center gap-2 px-2 pb-1">
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                  Status:
                                </span>
                                <Select
                                  value={currentColumn?.id || ''}
                                  onValueChange={(newColumnId) => {
                                    if (newColumnId !== currentColumn?.id) {
                                      handleMoveEmail(email.id, newColumnId);
                                      const newColumn =
                                        kanbanBoardData.columns.find(
                                          (c) => c.id === newColumnId
                                        );
                                      if (newColumn) {
                                        toast.success(
                                          `Moved to ${newColumn.name}`
                                        );
                                      }
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-9 text-xs flex-1 font-medium">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {kanbanBoardData.columns.map((column) => (
                                      <SelectItem
                                        key={column.id}
                                        value={column.id}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{
                                              backgroundColor: column.color,
                                            }}
                                          />
                                          <span className="font-medium">
                                            {column.name}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Mobile Actions Footer */}
                  <div className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
                    {/* Status Bar */}
                    {(kanbanLoading || emailsLoading || isSyncing) && (
                      <div className="px-4 py-1 text-xs text-center text-muted-foreground border-b bg-muted/30">
                        {isSyncing
                          ? 'Syncing with Gmail...'
                          : 'Loading emails...'}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="p-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSyncGmail}
                        disabled={
                          isSyncing || !gmailStatus?.connected || kanbanLoading
                        }
                        className="flex-1"
                      >
                        <RefreshCw
                          className={cn(
                            'h-4 w-4 mr-2',
                            isSyncing && 'animate-spin'
                          )}
                        />
                        Sync
                      </Button>
                      <KanbanSettingsDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2 p-4">
                    <p className="text-muted-foreground">
                      No Kanban board found
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/mail/inbox')}
                    >
                      Go to Inbox
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Snooze Dialog */}
            <SnoozeDialog
              open={snoozeDialogOpen}
              email={emailToSnooze}
              onOpenChange={setSnoozeDialogOpen}
              onConfirm={handleSnoozeConfirm}
            />
          </>
        )}
      </div>
    );
  }

  //Render
  if (!inboxMailbox) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No mailbox found</p>
        </div>
      </div>
    );
  }

  if (selectedEmail) {
    return (
      <div className="flex h-screen overflow-hidden">
        {!isMobile && (
          <div className="w-16 border-r shrink-0">
            <div className="flex flex-col h-full py-4 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/mail/inbox')}
                title="Inbox"
                className="size-10"
              >
                <Inbox className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/mail/sent')}
                title="Sent"
                className="size-10"
              >
                <Send className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/mail/starred')}
                title="Starred"
                className="size-10"
              >
                <Star className="size-5" />
              </Button>
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <div className="border-b p-4 flex items-center justify-between shrink-0">
            <Button variant="ghost" onClick={handleBack}>
              ← Back to Kanban
            </Button>
            <Button variant="outline" onClick={handleToggleView}>
              <List className="size-4 mr-2" />
              Switch to List View
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <EmailDetail
              email={selectedEmail}
              onBack={handleBack}
              onStar={handleStar}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsDialog />

      {isSearchMode ? (
        <SearchResultsView
          onBack={handleCloseSearch}
          onViewEmail={handleViewEmailFromSearch}
          onStar={handleStar}
          className="h-full"
        />
      ) : (
        <>
          {/* Header with Navigation */}
          <div className="border-b px-4 py-3 shrink-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">Kanban Board</h1>
                  {(kanbanLoading || emailsLoading) && (
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  )}
                  {!kanbanLoading &&
                    !emailsLoading &&
                    visibleEmails.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {visibleEmails.length} email
                        {visibleEmails.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  {/* Gmail Status Badge */}
                  {gmailStatusLoading ? (
                    <span className="text-xs text-muted-foreground">
                      Checking Gmail...
                    </span>
                  ) : gmailStatus?.connected ? (
                    <span className="text-xs text-green-600 flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-950">
                      ✓ Gmail Connected
                    </span>
                  ) : (
                    <span className="text-xs text-orange-600 flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-950">
                      ⚠️ Gmail not connected
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenSearch}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <KanbanSettingsDialog
                  trigger={
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncGmail}
                  disabled={
                    isSyncing || !gmailStatus?.connected || kanbanLoading
                  }
                >
                  <RefreshCw
                    className={cn('h-4 w-4 mr-2', isSyncing && 'animate-spin')}
                  />
                  {isSyncing ? 'Syncing...' : 'Sync Gmail'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleToggleView}>
                  <List className="size-4 mr-2" />
                  List View
                </Button>
              </div>
            </div>

            {/* Filter and Sort Controls */}
            <KanbanFilters
              sortBy={sortBy}
              onSortChange={setSortBy}
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
            />
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-hidden p-4 md:p-6">
            {!isMounted ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : kanbanLoading || emailsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Loading emails...</p>
                </div>
              </div>
            ) : visibleEmails.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">No emails found</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/mail/inbox')}
                  >
                    Go to Inbox
                  </Button>
                </div>
              </div>
            ) : kanbanBoardData ? (
              <KanbanBoard
                columns={kanbanBoardData.columns}
                emailsByColumn={filteredAndSortedEmailsByColumn}
                onMoveEmail={handleMoveEmail}
                onCardClick={handleCardClick}
                onCardSnooze={handleSnooze}
                onCardStar={handleStar}
                onCardGenerateSummary={handleGenerateSummary}
                generatingSummaryIds={generatingSummaryIds}
              />
            ) : null}
          </div>

          {/* Snooze Dialog */}
          <SnoozeDialog
            open={snoozeDialogOpen}
            email={emailToSnooze}
            onOpenChange={setSnoozeDialogOpen}
            onConfirm={handleSnoozeConfirm}
          />
        </>
      )}
    </div>
  );
}
