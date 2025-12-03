import { IMailbox, IEmailListItem, IEmailDetail } from '@/types/api.types';
import { create } from 'zustand';

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
    nextPageToken?: string | null;
  } | null;

  // Page token history for bidirectional navigation
  pageTokenHistory: (string | null)[];

  // Actions loading
  actionLoading: boolean;
}

interface EmailActions {
  // State setters
  setSelectedMailbox: (mailbox: IMailbox | null) => void;
  setSelectedEmail: (email: IEmailDetail | null) => void;
  setMailboxes: (mailboxes: IMailbox[]) => void;
  setEmails: (emails: IEmailListItem[]) => void;
  setPagination: (
    pagination: {
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
      last: boolean;
      nextPageToken?: string | null;
    } | null
  ) => void;
  setPageTokenHistory: (tokens: (string | null)[]) => void;
  addPageToken: (token: string | null, page: number) => void;
  resetPagination: () => void;

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
  pageTokenHistory: [null], // First page has no token
};

const useEmail = create<EmailStore>((set) => ({
  ...initialState,

  // Init state setters
  setSelectedMailbox: (mailbox: IMailbox | null) => {
    set({ selectedMailbox: mailbox });
  },

  setSelectedEmail: (email: IEmailDetail | null) => {
    set({ selectedEmail: email });
  },

  setMailboxes: (mailboxes: IMailbox[]) => {
    set({ mailboxes });
  },

  setEmails: (emails: IEmailListItem[]) => {
    set({ emails });
  },

  setPagination: (
    pagination: {
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
      last: boolean;
      nextPageToken?: string | null;
    } | null
  ) => {
    set({ pagination });
  },

  setPageTokenHistory: (tokens: (string | null)[]) => {
    set({ pageTokenHistory: tokens });
  },

  addPageToken: (token: string | null, page: number) => {
    set((state) => {
      const newHistory = [...state.pageTokenHistory];
      // Store token for next page
      if (page + 1 < newHistory.length) {
        newHistory[page + 1] = token;
      } else {
        newHistory.push(token);
      }
      return { pageTokenHistory: newHistory };
    });
  },

  resetPagination: () => {
    set({
      pagination: null,
      pageTokenHistory: [null],
      emails: [],
    });
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
