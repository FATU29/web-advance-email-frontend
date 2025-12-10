'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/utils/constants/routes';

import { EmailLayout } from '@/components/email/email-layout';
import { Sidebar } from '@/components/email/sidebar';
import { ComposeEmailDialog } from '@/components/email/compose-email-dialog';
import { type Message } from '@/components/ui/chat-message';
import { ChatDialog } from '@/components/chat/chat-dialog';
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
  const [chatMessages, setChatMessages] = React.useState<Message[]>([]);
  const [chatInput, setChatInput] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [size] = React.useState(20);
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [replyTo, setReplyTo] = React.useState<
    | {
        to: string[];
        subject: string;
        cc?: string[];
      }
    | undefined
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
    setReplyTo({
      to: [email.from],
      subject: email.subject.startsWith('Re: ')
        ? email.subject
        : `Re: ${email.subject}`,
    });
    setComposeOpen(true);
  };

  const handleReplyAll = (email: IEmailDetail) => {
    const allRecipients = [...email.to];
    if (email.cc && email.cc.length > 0) {
      allRecipients.push(...email.cc);
    }
    // Remove current user's email from recipients
    const filteredRecipients = allRecipients.filter((r) => r !== user?.email);

    setReplyTo({
      to: [email.from, ...filteredRecipients],
      subject: email.subject.startsWith('Re: ')
        ? email.subject
        : `Re: ${email.subject}`,
      cc: email.cc || undefined,
    });
    setComposeOpen(true);
  };

  const handleForward = (email: IEmailDetail) => {
    setReplyTo({
      to: [],
      subject: email.subject.startsWith('Fwd: ')
        ? email.subject
        : `Fwd: ${email.subject}`,
    });
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
          if (selectedEmailId === emailId) {
            setSelectedEmailId(null);
          }
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
        if (selectedEmailId === emailId) {
          setSelectedEmailId(null);
        }
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
    setReplyTo(undefined);
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

  const chatSuggestions = [
    'Summarize my emails',
    'Find important emails',
    'Draft a reply',
    'Check my schedule',
  ];

  //Render
  return (
    <div className="relative flex h-screen w-full flex-col">
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

      {/* Sticky Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <ChatDialog
          triggerSize="icon"
          triggerVariant="default"
          triggerClassName="h-14 w-14 rounded-full shadow-lg"
          messages={chatMessages}
          handleSubmit={handleChatSubmit}
          input={chatInput}
          handleInputChange={handleChatInputChange}
          isGenerating={isGenerating}
          stop={handleChatStop}
          setMessages={setChatMessages}
          append={handleChatAppend}
          suggestions={chatSuggestions}
        />
      </div>

      {/* Compose Email Dialog */}
      <ComposeEmailDialog
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open);
          if (!open) {
            setReplyTo(undefined);
          }
        }}
        replyTo={replyTo}
      />
    </div>
  );
}
