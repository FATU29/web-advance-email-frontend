'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { List } from 'lucide-react';

import { Sidebar } from '@/components/email/sidebar';
import { EmailDetail } from '@/components/email/email-detail';
import { KanbanBoard } from '@/components/email/kanban-board';
import { SnoozeDialog } from '@/components/email/snooze-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  useUpdateKanbanStatusMutation,
  useSnoozeEmailMutation,
} from '@/hooks/use-email-mutations';
import {
  useKanbanBoardQuery,
  useGenerateSummaryMutation,
  useMoveEmailMutation,
  useSnoozeEmailKanbanMutation,
} from '@/hooks/use-kanban-mutations';
import { IEmailListItem, KanbanStatus } from '@/types/api.types';

//==================== REGION MOCK DATA ====================
// Set to true to use mock data instead of API
const USE_MOCK_DATA = true;

// Fixed dates to prevent hydration mismatch
const MOCK_BASE_DATE = '2024-01-15T10:00:00.000Z';

const MOCK_MAILBOXES = [
  {
    id: 'mock-inbox',
    name: 'Inbox',
    type: 'INBOX' as const,
    unreadCount: 5,
    totalCount: 15,
    createdAt: MOCK_BASE_DATE,
    updatedAt: MOCK_BASE_DATE,
  },
];

const generateMockEmails = (): IEmailListItem[] => {
  const baseTime = new Date(MOCK_BASE_DATE).getTime();

  const mockEmails: IEmailListItem[] = [
    // INBOX emails
    {
      id: 'email-1',
      from: 'john.doe@example.com',
      fromName: 'John Doe',
      subject: 'Welcome to our new email system',
      preview:
        'Thank you for joining us. We are excited to have you on board...',
      isRead: false,
      isStarred: false,
      isImportant: true,
      hasAttachments: false,
      receivedAt: new Date(baseTime - 2 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'INBOX',
      aiSummary: 'Welcome email with onboarding information',
    },
    {
      id: 'email-2',
      from: 'sarah.smith@company.com',
      fromName: 'Sarah Smith',
      subject: 'Meeting scheduled for next week',
      preview:
        'Hi, I would like to schedule a meeting to discuss the project...',
      isRead: false,
      isStarred: true,
      isImportant: false,
      hasAttachments: true,
      receivedAt: new Date(baseTime - 5 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'INBOX',
      aiSummary: 'Meeting request for project discussion',
    },
    {
      id: 'email-3',
      from: 'support@service.com',
      fromName: 'Support Team',
      subject: 'Your ticket #1234 has been resolved',
      preview:
        'We have successfully resolved your issue. Please let us know if you need any further assistance...',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(baseTime - 1 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'INBOX',
    },

    // TODO emails
    {
      id: 'email-4',
      from: 'manager@company.com',
      fromName: 'Project Manager',
      subject: 'Review the quarterly report',
      preview:
        'Please review the Q4 report and provide your feedback by Friday...',
      isRead: true,
      isStarred: true,
      isImportant: true,
      hasAttachments: true,
      receivedAt: new Date(baseTime - 2 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'TODO',
      aiSummary: 'Action required: Review Q4 report by Friday',
    },
    {
      id: 'email-5',
      from: 'hr@company.com',
      fromName: 'HR Department',
      subject: 'Update your profile information',
      preview:
        'Please update your profile information in the employee portal...',
      isRead: false,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(baseTime - 3 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'TODO',
    },
    {
      id: 'email-6',
      from: 'finance@company.com',
      fromName: 'Finance Team',
      subject: 'Expense report approval needed',
      preview:
        'Your expense report for March is pending approval. Please review and submit...',
      isRead: true,
      isStarred: false,
      isImportant: true,
      hasAttachments: true,
      receivedAt: new Date(baseTime - 4 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'TODO',
    },

    // IN_PROGRESS emails
    {
      id: 'email-7',
      from: 'client@clientcompany.com',
      fromName: 'Client Name',
      subject: 'Project proposal feedback',
      preview:
        'I have reviewed the proposal and have some questions. Let me know when we can discuss...',
      isRead: true,
      isStarred: true,
      isImportant: true,
      hasAttachments: false,
      receivedAt: new Date(baseTime - 1 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'IN_PROGRESS',
      aiSummary: 'Client feedback on project proposal - needs discussion',
    },
    {
      id: 'email-8',
      from: 'developer@team.com',
      fromName: 'Dev Team Lead',
      subject: 'Code review request',
      preview:
        'Please review the pull request #456. It includes the new feature implementation...',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(baseTime - 6 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'IN_PROGRESS',
    },

    // DONE emails
    {
      id: 'email-9',
      from: 'noreply@system.com',
      fromName: 'System Notification',
      subject: 'Your password has been changed',
      preview:
        'This is a confirmation that your password was successfully changed...',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(baseTime - 5 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'DONE',
    },
    {
      id: 'email-10',
      from: 'newsletter@blog.com',
      fromName: 'Tech Blog Newsletter',
      subject: 'Weekly tech news roundup',
      preview: 'Here are the top tech news stories from this week...',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(baseTime - 7 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'DONE',
    },
    {
      id: 'email-11',
      from: 'vendor@supplier.com',
      fromName: 'Vendor Support',
      subject: 'Order confirmation #ORD-12345',
      preview:
        'Your order has been confirmed and will be shipped within 2-3 business days...',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: true,
      receivedAt: new Date(baseTime - 10 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'DONE',
    },

    // SNOOZED emails
    {
      id: 'email-12',
      from: 'reminder@calendar.com',
      fromName: 'Calendar Reminder',
      subject: 'Team building event next month',
      preview:
        'Just a reminder about the team building event scheduled for next month...',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(baseTime - 3 * 24 * 60 * 60 * 1000).toISOString(),
      kanbanStatus: 'SNOOZED',
      snoozeUntil: new Date(baseTime + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return mockEmails;
};
//====================================================

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

  //Init effect hook - Prevent hydration mismatch with @dnd-kit
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch mailboxes
  const { data: mailboxesData = [] } = useMailboxesQuery({
    enabled: !USE_MOCK_DATA,
  });

  // Use mock mailboxes if enabled
  const mailboxes = React.useMemo(() => {
    return USE_MOCK_DATA ? MOCK_MAILBOXES : mailboxesData;
  }, [mailboxesData]);

  // Find INBOX mailbox
  const inboxMailbox = React.useMemo(() => {
    return mailboxes.find((m) => m.type === 'INBOX') || mailboxes[0];
  }, [mailboxes]);

  // Fetch Kanban board data
  const {
    data: kanbanBoardData,
    isLoading: kanbanLoading,
    refetch: refetchKanbanBoard,
  } = useKanbanBoardQuery({
    enabled: !USE_MOCK_DATA,
  });

  // Fetch emails with infinite scroll (fallback for mock data)
  const { data: emailsData, isLoading: emailsLoading } = useEmailsInfiniteQuery(
    inboxMailbox?.id || '',
    50,
    {
      enabled: !!inboxMailbox?.id && USE_MOCK_DATA,
    }
  );

  // Convert Kanban board data to IEmailListItem format
  const emails = React.useMemo(() => {
    if (USE_MOCK_DATA) {
      return generateMockEmails();
    }
    if (!kanbanBoardData) return [];

    // Flatten emails from all columns
    const allEmails: IEmailListItem[] = [];
    Object.entries(kanbanBoardData.emailsByColumn).forEach(
      ([columnId, kanbanEmails]) => {
        kanbanEmails.forEach((kanbanEmail) => {
          // Find column to get status
          const column = kanbanBoardData.columns.find((c) => c.id === columnId);
          const status = column?.type as KanbanStatus | undefined;

          allEmails.push({
            id: kanbanEmail.emailId,
            from: kanbanEmail.fromEmail,
            fromName: kanbanEmail.fromName,
            subject: kanbanEmail.subject,
            preview: kanbanEmail.preview,
            isRead: kanbanEmail.isRead,
            isStarred: kanbanEmail.isStarred,
            isImportant: false, // Not available in Kanban response
            hasAttachments: false, // Not available in Kanban response
            receivedAt: kanbanEmail.receivedAt,
            kanbanStatus: status,
            snoozeUntil: kanbanEmail.snoozeUntil,
            aiSummary: kanbanEmail.summary || undefined,
          });
        });
      }
    );

    return allEmails;
  }, [kanbanBoardData]);

  // Fetch AI summaries for emails that don't have them
  // Note: AI summaries should be fetched from the backend when needed
  // const emailsWithoutSummary = React.useMemo(() => {
  //   return emails.filter((e) => !e.aiSummary && e.preview);
  // }, [emails]);

  // Fetch selected email detail
  const { data: selectedEmail } = useEmailQuery(selectedEmailId || '', {
    enabled: !!selectedEmailId,
  });

  // Mutations
  const toggleStarMutation = useToggleEmailStarMutation();
  const updateKanbanStatusMutation = useUpdateKanbanStatusMutation();
  const snoozeEmailMutation = useSnoozeEmailMutation();
  const moveEmailMutation = useMoveEmailMutation();
  const snoozeEmailKanbanMutation = useSnoozeEmailKanbanMutation();
  const generateSummaryMutation = useGenerateSummaryMutation();

  // Check for expired snoozes and restore them
  React.useEffect(() => {
    const checkSnoozes = () => {
      const now = new Date();
      const expiredSnoozes = emails.filter(
        (email) =>
          email.kanbanStatus === 'SNOOZED' &&
          email.snoozeUntil &&
          new Date(email.snoozeUntil) <= now
      );

      expiredSnoozes.forEach((email) => {
        updateKanbanStatusMutation.mutate(
          {
            emailId: email.id,
            status: 'INBOX',
          },
          {
            onSuccess: () => {
              toast.success(`Email "${email.subject}" restored to inbox`);
            },
          }
        );
      });
    };

    // Check immediately
    checkSnoozes();

    // Check every minute
    const interval = setInterval(checkSnoozes, 60000);

    return () => clearInterval(interval);
  }, [emails, updateKanbanStatusMutation]);

  //Init event handle
  const handleStatusChange = (emailId: string, newStatus: KanbanStatus) => {
    if (USE_MOCK_DATA) {
      // For mock data, use the old mutation
      updateKanbanStatusMutation.mutate(
        { emailId, status: newStatus },
        {
          onSuccess: () => {
            toast.success('Email moved successfully');
          },
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : 'Failed to move email'
            );
          },
        }
      );
    } else {
      // For real data, use Kanban move mutation
      // Find the target column ID
      const targetColumn = kanbanBoardData?.columns.find(
        (c) => c.type === newStatus
      );
      if (!targetColumn) {
        toast.error('Target column not found');
        return;
      }

      moveEmailMutation.mutate(
        {
          emailId,
          targetColumnId: targetColumn.id,
        },
        {
          onSuccess: () => {
            toast.success('Email moved successfully');
            refetchKanbanBoard();
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

  const handleCardClick = (email: IEmailListItem) => {
    setSelectedEmailId(email.id);
  };

  const handleSnooze = (email: IEmailListItem) => {
    setEmailToSnooze(email);
    setSnoozeDialogOpen(true);
  };

  const handleSnoozeConfirm = (snoozeUntil: string) => {
    if (!emailToSnooze) return;

    if (USE_MOCK_DATA) {
      snoozeEmailMutation.mutate(
        {
          emailId: emailToSnooze.id,
          snoozeUntil,
        },
        {
          onSuccess: () => {
            toast.success('Email snoozed successfully');
          },
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : 'Failed to snooze email'
            );
          },
        }
      );
    } else {
      snoozeEmailKanbanMutation.mutate(
        {
          emailId: emailToSnooze.id,
          snoozeUntil,
        },
        {
          onSuccess: () => {
            toast.success('Email snoozed successfully');
            refetchKanbanBoard();
          },
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : 'Failed to snooze email'
            );
          },
        }
      );
    }
  };

  const handleGenerateSummary = (emailId: string) => {
    setGeneratingSummaryIds((prev) => new Set(prev).add(emailId));

    generateSummaryMutation.mutate(emailId, {
      onSuccess: () => {
        toast.success('Summary generated successfully');
        refetchKanbanBoard();
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

  // Filter out snoozed emails that haven't expired
  const visibleEmails = React.useMemo(() => {
    const now = new Date();
    return emails.filter((email) => {
      if (email.kanbanStatus === 'SNOOZED' && email.snoozeUntil) {
        return new Date(email.snoozeUntil) <= now;
      }
      return true;
    });
  }, [emails]);

  //Render mobile message
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
          <h1 className="ml-2 text-lg font-semibold">Kanban Board</h1>
        </div>

        {/* Mobile Message */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Kanban View</CardTitle>
              <CardDescription>
                The Kanban board is optimized for desktop screens. Please use a
                desktop or tablet device for the best experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push('/mail/inbox')}
                className="w-full"
              >
                Go to List View
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/mail/inbox')}
                className="w-full"
              >
                <List className="size-4 mr-2" />
                Switch to Traditional View
              </Button>
            </CardContent>
          </Card>
        </div>
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
      <div className="flex h-screen">
        {!isMobile && (
          <Sidebar
            mailboxes={mailboxes}
            activeFolder={inboxMailbox.id}
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
            onItemClick={(folder) => router.push(`/mail/${folder}`)}
          />
        )}
        <div className="flex-1 flex flex-col">
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
    <div className="flex h-screen">
      {!isMobile && (
        <Sidebar
          mailboxes={mailboxes}
          activeFolder={inboxMailbox.id}
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
          onItemClick={(folder) => router.push(`/mail/${folder}`)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Kanban Board</h1>
            {(kanbanLoading || emailsLoading) && (
              <span className="text-sm text-muted-foreground">Loading...</span>
            )}
            {!kanbanLoading && !emailsLoading && visibleEmails.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {visibleEmails.length} email
                {visibleEmails.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Button variant="outline" onClick={handleToggleView}>
            <List className="size-4 mr-2" />
            Switch to List View
          </Button>
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
          ) : (
            <KanbanBoard
              emails={visibleEmails}
              onStatusChange={handleStatusChange}
              onCardClick={handleCardClick}
              onCardSnooze={handleSnooze}
              onCardStar={handleStar}
              onCardGenerateSummary={handleGenerateSummary}
              generatingSummaryIds={generatingSummaryIds}
            />
          )}
        </div>
      </div>

      {/* Snooze Dialog */}
      <SnoozeDialog
        open={snoozeDialogOpen}
        email={emailToSnooze}
        onOpenChange={setSnoozeDialogOpen}
        onConfirm={handleSnoozeConfirm}
      />
    </div>
  );
}
