import { getMailboxes, getMailboxById } from '@/api/mailbox';
import {
  getEmails,
  getEmailById,
  bulkEmailAction,
  markEmailAsRead,
  markEmailAsUnread,
  toggleEmailStar,
  deleteEmail,
  sendEmail,
  replyEmail,
  updateKanbanStatus,
  snoozeEmail,
  getEmailSummary,
} from '@/api/email';
import {
  IMailbox,
  IEmailListItem,
  IEmailDetail,
  IGetEmailsParams,
  IBulkEmailActionParams,
  ISendEmailParams,
  IReplyEmailParams,
  IPaginatedResponse,
  KanbanStatus,
  ISnoozeEmailParams,
} from '@/types/api.types';
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import useEmail from '@/lib/stores/use-email';

//==================== REGION QUERY KEYS ====================
export const emailQueryKeys = {
  all: ['email'] as const,
  mailboxes: () => [...emailQueryKeys.all, 'mailboxes'] as const,
  mailbox: (id: string) => [...emailQueryKeys.mailboxes(), id] as const,
  emails: () => [...emailQueryKeys.all, 'emails'] as const,
  emailsByMailbox: (mailboxId: string, params?: IGetEmailsParams) =>
    [
      ...emailQueryKeys.emails(),
      mailboxId,
      params?.page || 0,
      params?.size || 20,
    ] as const,
  email: (id: string) => [...emailQueryKeys.all, 'email', id] as const,
};
//====================================================

//==================== REGION REACT QUERY HOOKS ====================

/**
 * Get all mailboxes query
 */
export const useMailboxesQuery = (
  options?: Omit<
    UseQueryOptions<IMailbox[], AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: emailQueryKeys.mailboxes(),
    queryFn: async () => {
      const response = await getMailboxes();
      if (response.data.success && response.data.data) {
        useEmail.setState({ mailboxes: response.data.data });
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch mailboxes');
    },
    ...options,
  });
};

/**
 * Get mailbox by ID query
 */
export const useMailboxQuery = (
  mailboxId: string,
  options?: Omit<UseQueryOptions<IMailbox, AxiosError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: emailQueryKeys.mailbox(mailboxId),
    queryFn: async () => {
      const response = await getMailboxById(mailboxId);
      if (response.data.success && response.data.data) {
        useEmail.setState({ selectedMailbox: response.data.data });
        // Update mailbox in list
        useEmail.setState((state) => ({
          mailboxes: state.mailboxes.map((m) =>
            m.id === mailboxId ? response.data.data! : m
          ),
        }));
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch mailbox');
    },
    enabled: !!mailboxId,
    ...options,
  });
};

/**
 * Get emails in mailbox query
 */
export const useEmailsQuery = (
  mailboxId: string,
  params?: IGetEmailsParams,
  options?: Omit<
    UseQueryOptions<IPaginatedResponse<IEmailListItem>, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: emailQueryKeys.emailsByMailbox(mailboxId, params),
    queryFn: async () => {
      const response = await getEmails(mailboxId, params);
      if (response.data.success && response.data.data) {
        const {
          content,
          page,
          size,
          totalElements,
          totalPages,
          last,
          nextPageToken,
        } = response.data.data;

        useEmail.setState({
          emails: content,
          pagination: {
            page,
            size,
            totalElements,
            totalPages,
            last,
            nextPageToken,
          },
        });

        // Store nextPageToken in history for bidirectional navigation
        if (nextPageToken !== undefined) {
          useEmail.getState().addPageToken(nextPageToken, page);
        }

        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch emails');
    },
    enabled: !!mailboxId,
    ...options,
  });
};

/**
 * Get emails in mailbox with infinite scroll query
 */
export const useEmailsInfiniteQuery = (
  mailboxId: string,
  size: number = 20,
  options?: Omit<
    UseInfiniteQueryOptions<
      IPaginatedResponse<IEmailListItem>,
      AxiosError,
      InfiniteData<IPaginatedResponse<IEmailListItem>>,
      readonly [string, string, string, 'infinite'],
      string | null
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) => {
  return useInfiniteQuery({
    queryKey: [...emailQueryKeys.emails(), mailboxId, 'infinite'],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const response = await getEmails(mailboxId, {
        page: 0, // Page number is not used for token-based pagination
        size,
        pageToken: pageParam, // Use pageToken from previous response
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch emails');
    },
    getNextPageParam: (lastPage: IPaginatedResponse<IEmailListItem>) => {
      // Return nextPageToken if available, undefined otherwise
      if (lastPage.last || !lastPage.nextPageToken) {
        return undefined; // No more pages
      }
      return lastPage.nextPageToken;
    },
    initialPageParam: null, // First page has no token
    enabled: !!mailboxId,
    ...options,
  });
};

/**
 * Get email by ID query
 */
export const useEmailQuery = (
  emailId: string,
  options?: Omit<
    UseQueryOptions<IEmailDetail, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: emailQueryKeys.email(emailId),
    queryFn: async () => {
      const response = await getEmailById(emailId);
      if (response.data.success && response.data.data) {
        const emailDetail = response.data.data;
        useEmail.setState({ selectedEmail: emailDetail });
        // Update email in list
        useEmail.setState((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId
              ? {
                  ...e,
                  isRead: emailDetail.isRead,
                  isStarred: emailDetail.isStarred,
                  isImportant: emailDetail.isImportant,
                }
              : e
          ),
        }));
        return emailDetail;
      }
      throw new Error(response.data.message || 'Failed to fetch email');
    },
    enabled: !!emailId,
    ...options,
  });
};

/**
 * Bulk email action mutation
 */
export const useBulkEmailActionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: IBulkEmailActionParams) => {
      const response = await bulkEmailAction(params);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Bulk action failed');
    },
    onSuccess: () => {
      // Invalidate all email queries to refresh data
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.mailboxes() });
    },
  });
};

/**
 * Mark email as read mutation
 */
export const useMarkEmailAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      const response = await markEmailAsRead(emailId);
      if (response.data.success) {
        // Update email in list and selected email
        useEmail.setState((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId ? { ...e, isRead: true } : e
          ),
          selectedEmail:
            state.selectedEmail?.id === emailId
              ? { ...state.selectedEmail, isRead: true }
              : state.selectedEmail,
        }));
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to mark email as read');
    },
    onSuccess: (_, emailId) => {
      queryClient.invalidateQueries({
        queryKey: emailQueryKeys.email(emailId),
      });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.mailboxes() });
    },
  });
};

/**
 * Mark email as unread mutation
 */
export const useMarkEmailAsUnreadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      const response = await markEmailAsUnread(emailId);
      if (response.data.success) {
        // Update email in list and selected email
        useEmail.setState((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId ? { ...e, isRead: false } : e
          ),
          selectedEmail:
            state.selectedEmail?.id === emailId
              ? { ...state.selectedEmail, isRead: false }
              : state.selectedEmail,
        }));
        return response.data;
      }
      throw new Error(
        response.data.message || 'Failed to mark email as unread'
      );
    },
    onSuccess: (_, emailId) => {
      queryClient.invalidateQueries({
        queryKey: emailQueryKeys.email(emailId),
      });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.mailboxes() });
    },
  });
};

/**
 * Toggle email star mutation
 */
export const useToggleEmailStarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      emailId,
      starred,
    }: {
      emailId: string;
      starred: boolean;
    }) => {
      const response = await toggleEmailStar(emailId, starred);
      if (response.data.success) {
        // Update email in list and selected email
        useEmail.setState((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId ? { ...e, isStarred: starred } : e
          ),
          selectedEmail:
            state.selectedEmail?.id === emailId
              ? { ...state.selectedEmail, isStarred: starred }
              : state.selectedEmail,
        }));
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to toggle star');
    },
    onSuccess: (_, { emailId }) => {
      queryClient.invalidateQueries({
        queryKey: emailQueryKeys.email(emailId),
      });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.mailboxes() });
    },
  });
};

/**
 * Delete email mutation
 */
export const useDeleteEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      const response = await deleteEmail(emailId);
      if (response.data.success) {
        // Remove email from list and clear selected if it was selected
        useEmail.setState((state) => ({
          emails: state.emails.filter((e) => e.id !== emailId),
          selectedEmail:
            state.selectedEmail?.id === emailId ? null : state.selectedEmail,
        }));
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to delete email');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.mailboxes() });
    },
  });
};

/**
 * Send email mutation
 */
export const useSendEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ISendEmailParams) => {
      const response = await sendEmail(params);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to send email');
    },
    onSuccess: () => {
      // Invalidate emails to refresh sent folder
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.mailboxes() });
    },
  });
};

/**
 * Reply email mutation
 */
export const useReplyEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      emailId,
      params,
    }: {
      emailId: string;
      params: IReplyEmailParams;
    }) => {
      const response = await replyEmail(emailId, params);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to reply email');
    },
    onSuccess: () => {
      // Invalidate emails to refresh sent folder
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.mailboxes() });
    },
  });
};

/**
 * Update email kanban status mutation
 */
export const useUpdateKanbanStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      emailId,
      status,
    }: {
      emailId: string;
      status: KanbanStatus;
    }) => {
      const response = await updateKanbanStatus(emailId, status);
      if (response.data.success) {
        // Update email in list
        useEmail.setState((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId ? { ...e, kanbanStatus: status } : e
          ),
        }));
        return response.data;
      }
      throw new Error(
        response.data.message || 'Failed to update kanban status'
      );
    },
    onSuccess: (_, { emailId }) => {
      queryClient.invalidateQueries({
        queryKey: emailQueryKeys.email(emailId),
      });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
    },
  });
};

/**
 * Snooze email mutation
 */
export const useSnoozeEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      emailId,
      snoozeUntil,
    }: {
      emailId: string;
      snoozeUntil: string;
    }) => {
      const response = await snoozeEmail(emailId, snoozeUntil);
      if (response.data.success) {
        // Update email in list
        useEmail.setState((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId
              ? { ...e, snoozeUntil, kanbanStatus: 'SNOOZED' as KanbanStatus }
              : e
          ),
        }));
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to snooze email');
    },
    onSuccess: (_, { emailId }) => {
      queryClient.invalidateQueries({
        queryKey: emailQueryKeys.email(emailId),
      });
      queryClient.invalidateQueries({ queryKey: emailQueryKeys.emails() });
    },
  });
};

/**
 * Get email summary query
 */
export const useEmailSummaryQuery = (
  emailId: string,
  options?: Omit<UseQueryOptions<string, AxiosError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...emailQueryKeys.email(emailId), 'summary'],
    queryFn: async () => {
      const response = await getEmailSummary(emailId);
      if (response.data.success && response.data.data) {
        return response.data.data.summary;
      }
      throw new Error(response.data.message || 'Failed to get email summary');
    },
    enabled: !!emailId,
    ...options,
  });
};

//====================================================
