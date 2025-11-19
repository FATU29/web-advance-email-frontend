import { getMailboxes, getMailboxById } from '@/api/mailbox';
import {
  getEmails,
  getEmailById,
  bulkEmailAction,
  markEmailAsRead,
  markEmailAsUnread,
  toggleEmailStar,
  deleteEmail,
} from '@/api/email';
import {
  IMailbox,
  IEmailListItem,
  IEmailDetail,
  IGetEmailsParams,
  IBulkEmailActionParams,
} from '@/types/api.types';
import { create } from 'zustand';
import { AxiosError } from 'axios';

//==================== REGION TYPES ====================
interface EmailState {
  // Mailboxes
  mailboxes: IMailbox[];
  selectedMailbox: IMailbox | null;
  mailboxesLoading: boolean;
  mailboxesError: string | null;

  // Emails
  emails: IEmailListItem[];
  selectedEmail: IEmailDetail | null;
  emailsLoading: boolean;
  emailsError: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  } | null;

  // Actions loading
  actionLoading: boolean;
}

interface EmailActions {
  // Mailbox actions
  fetchMailboxes: () => Promise<void>;
  fetchMailboxById: (mailboxId: string) => Promise<void>;
  setSelectedMailbox: (mailbox: IMailbox | null) => void;

  // Email actions
  fetchEmails: (mailboxId: string, params?: IGetEmailsParams) => Promise<void>;
  fetchEmailById: (emailId: string) => Promise<void>;
  setSelectedEmail: (email: IEmailDetail | null) => void;

  // Bulk actions
  performBulkAction: (params: IBulkEmailActionParams) => Promise<void>;

  // Single email actions
  markAsRead: (emailId: string) => Promise<void>;
  markAsUnread: (emailId: string) => Promise<void>;
  toggleStar: (emailId: string, starred: boolean) => Promise<void>;
  deleteEmailById: (emailId: string) => Promise<void>;

  // Utility
  clearError: () => void;
  reset: () => void;
}

type EmailStore = EmailState & EmailActions;
//====================================================

const initialState: EmailState = {
  mailboxes: [],
  selectedMailbox: null,
  mailboxesLoading: false,
  mailboxesError: null,
  emails: [],
  selectedEmail: null,
  emailsLoading: false,
  emailsError: null,
  pagination: null,
  actionLoading: false,
};

const useEmail = create<EmailStore>((set, get) => ({
  ...initialState,

  // Init mailbox actions
  fetchMailboxes: async () => {
    set({ mailboxesLoading: true, mailboxesError: null });
    try {
      const response = await getMailboxes();
      if (response.data.success && response.data.data) {
        set({
          mailboxes: response.data.data,
          mailboxesLoading: false,
          mailboxesError: null,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch mailboxes');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to fetch mailboxes';
      set({
        mailboxesLoading: false,
        mailboxesError: errorMessage,
      });
      throw error;
    }
  },

  fetchMailboxById: async (mailboxId: string) => {
    set({ mailboxesLoading: true, mailboxesError: null });
    try {
      const response = await getMailboxById(mailboxId);
      if (response.data.success && response.data.data) {
        const mailbox = response.data.data;
        set({
          selectedMailbox: mailbox,
          mailboxesLoading: false,
          mailboxesError: null,
        });
        // Update mailbox in list if it exists
        set((state) => ({
          mailboxes: state.mailboxes.map((m) =>
            m.id === mailboxId ? mailbox : m
          ),
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch mailbox');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to fetch mailbox';
      set({
        mailboxesLoading: false,
        mailboxesError: errorMessage,
      });
      throw error;
    }
  },

  setSelectedMailbox: (mailbox: IMailbox | null) => {
    set({ selectedMailbox: mailbox });
  },

  // Init email actions
  fetchEmails: async (mailboxId: string, params?: IGetEmailsParams) => {
    set({ emailsLoading: true, emailsError: null });
    try {
      const response = await getEmails(mailboxId, params);
      if (response.data.success && response.data.data) {
        const { content, page, size, totalElements, totalPages, last } =
          response.data.data;
        set({
          emails: content,
          pagination: {
            page,
            size,
            totalElements,
            totalPages,
            last,
          },
          emailsLoading: false,
          emailsError: null,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch emails');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to fetch emails';
      set({
        emailsLoading: false,
        emailsError: errorMessage,
      });
      throw error;
    }
  },

  fetchEmailById: async (emailId: string) => {
    set({ emailsLoading: true, emailsError: null });
    try {
      const response = await getEmailById(emailId);
      if (response.data.success && response.data.data) {
        set({
          selectedEmail: response.data.data,
          emailsLoading: false,
          emailsError: null,
        });
        // Update email in list if it exists (convert IEmailDetail to IEmailListItem)
        if (response.data.data) {
          const emailDetail = response.data.data;
          set((state) => ({
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
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch email');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to fetch email';
      set({
        emailsLoading: false,
        emailsError: errorMessage,
      });
      throw error;
    }
  },

  setSelectedEmail: (email: IEmailDetail | null) => {
    set({ selectedEmail: email });
  },

  // Init bulk actions
  performBulkAction: async (params: IBulkEmailActionParams) => {
    set({ actionLoading: true });
    try {
      const response = await bulkEmailAction(params);
      if (response.data.success) {
        // Refresh emails after bulk action
        const { selectedMailbox, pagination } = get();
        if (selectedMailbox && pagination) {
          await get().fetchEmails(selectedMailbox.id, {
            page: pagination.page,
            size: pagination.size,
          });
        }
        set({ actionLoading: false });
      } else {
        throw new Error(response.data.message || 'Bulk action failed');
      }
    } catch (error) {
      set({ actionLoading: false });
      throw error;
    }
  },

  // Init single email actions
  markAsRead: async (emailId: string) => {
    try {
      const response = await markEmailAsRead(emailId);
      if (response.data.success) {
        // Update email in list and selected email
        set((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId ? { ...e, isRead: true } : e
          ),
          selectedEmail:
            state.selectedEmail?.id === emailId
              ? { ...state.selectedEmail, isRead: true }
              : state.selectedEmail,
        }));
      } else {
        throw new Error(
          response.data.message || 'Failed to mark email as read'
        );
      }
    } catch (error) {
      throw error;
    }
  },

  markAsUnread: async (emailId: string) => {
    try {
      const response = await markEmailAsUnread(emailId);
      if (response.data.success) {
        // Update email in list and selected email
        set((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId ? { ...e, isRead: false } : e
          ),
          selectedEmail:
            state.selectedEmail?.id === emailId
              ? { ...state.selectedEmail, isRead: false }
              : state.selectedEmail,
        }));
      } else {
        throw new Error(
          response.data.message || 'Failed to mark email as unread'
        );
      }
    } catch (error) {
      throw error;
    }
  },

  toggleStar: async (emailId: string, starred: boolean) => {
    try {
      const response = await toggleEmailStar(emailId, starred);
      if (response.data.success) {
        // Update email in list and selected email
        set((state) => ({
          emails: state.emails.map((e) =>
            e.id === emailId ? { ...e, isStarred: starred } : e
          ),
          selectedEmail:
            state.selectedEmail?.id === emailId
              ? { ...state.selectedEmail, isStarred: starred }
              : state.selectedEmail,
        }));
      } else {
        throw new Error(response.data.message || 'Failed to toggle star');
      }
    } catch (error) {
      throw error;
    }
  },

  deleteEmailById: async (emailId: string) => {
    try {
      const response = await deleteEmail(emailId);
      if (response.data.success) {
        // Remove email from list and clear selected if it was selected
        set((state) => ({
          emails: state.emails.filter((e) => e.id !== emailId),
          selectedEmail:
            state.selectedEmail?.id === emailId ? null : state.selectedEmail,
        }));
      } else {
        throw new Error(response.data.message || 'Failed to delete email');
      }
    } catch (error) {
      throw error;
    }
  },

  // Init utility
  clearError: () => {
    set({ mailboxesError: null, emailsError: null });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useEmail;
