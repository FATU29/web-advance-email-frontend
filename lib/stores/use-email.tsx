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
  } | null;

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
    } | null
  ) => void;

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
    } | null
  ) => {
    set({ pagination });
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
