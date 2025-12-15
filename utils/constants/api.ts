//==================== REGION API ENDPOINTS ====================

// Auth endpoints
export const AUTH_ENDPOINTS = {
  SIGNUP: '/api/auth/signup',
  LOGIN: '/api/auth/login',
  GOOGLE: '/api/auth/google',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  INTROSPECT: '/api/auth/introspect',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION_OTP: '/api/auth/resend-verification-otp',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  SEND_CHANGE_PASSWORD_OTP: '/api/auth/send-change-password-otp',
  CHANGE_PASSWORD: '/api/auth/change-password',
} as const;

// Mailbox endpoints
export const MAILBOX_ENDPOINTS = {
  GET_ALL: '/api/mailboxes',
  GET_BY_ID: (mailboxId: string) => `/api/mailboxes/${mailboxId}`,
  GET_EMAILS: (mailboxId: string) => `/api/mailboxes/${mailboxId}/emails`,
} as const;

// Email endpoints
export const EMAIL_ENDPOINTS = {
  GET_BY_ID: (emailId: string) => `/api/emails/${emailId}`,
  SEND: '/api/emails/send',
  REPLY: (emailId: string) => `/api/emails/${emailId}/reply`,
  BULK_ACTION: '/api/emails/actions',
  MODIFY: (emailId: string) => `/api/emails/${emailId}/modify`,
  MARK_READ: (emailId: string) => `/api/emails/${emailId}/read`,
  MARK_UNREAD: (emailId: string) => `/api/emails/${emailId}/unread`,
  TOGGLE_STAR: (emailId: string) => `/api/emails/${emailId}/star`,
  DELETE: (emailId: string) => `/api/emails/${emailId}`,
  UPDATE_KANBAN_STATUS: (emailId: string) =>
    `/api/emails/${emailId}/kanban-status`,
  SNOOZE: (emailId: string) => `/api/emails/${emailId}/snooze`,
  SUMMARY: (emailId: string) => `/api/emails/${emailId}/summary`,
} as const;

// Kanban endpoints
export const KANBAN_ENDPOINTS = {
  GET_BOARD: '/api/kanban/board',
  SYNC_GMAIL: '/api/kanban/sync',
  GMAIL_STATUS: '/api/kanban/gmail-status',
  GET_COLUMNS: '/api/kanban/columns',
  CREATE_COLUMN: '/api/kanban/columns',
  UPDATE_COLUMN: (columnId: string) => `/api/kanban/columns/${columnId}`,
  DELETE_COLUMN: (columnId: string) => `/api/kanban/columns/${columnId}`,
  GET_EMAILS_IN_COLUMN: (columnId: string) =>
    `/api/kanban/columns/${columnId}/emails`,
  ADD_EMAIL: '/api/kanban/emails',
  GET_EMAIL_STATUS: (emailId: string) => `/api/kanban/emails/${emailId}`,
  MOVE_EMAIL: '/api/kanban/emails/move',
  REMOVE_EMAIL: (emailId: string) => `/api/kanban/emails/${emailId}`,
  SNOOZE_EMAIL: '/api/kanban/emails/snooze',
  UNSNOOZE_EMAIL: (emailId: string) => `/api/kanban/emails/${emailId}/unsnooze`,
  GENERATE_SUMMARY: (emailId: string) =>
    `/api/kanban/emails/${emailId}/summarize`,
} as const;

// Health check endpoint
export const HEALTH_ENDPOINTS = {
  CHECK: '/api/health',
} as const;

// Attachment endpoints
export const ATTACHMENT_ENDPOINTS = {
  DOWNLOAD: (messageId: string, attachmentId: string) =>
    `/api/attachments/${messageId}/${attachmentId}`,
} as const;

//====================================================
