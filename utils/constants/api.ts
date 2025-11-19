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
  BULK_ACTION: '/api/emails/actions',
  MARK_READ: (emailId: string) => `/api/emails/${emailId}/read`,
  MARK_UNREAD: (emailId: string) => `/api/emails/${emailId}/unread`,
  TOGGLE_STAR: (emailId: string) => `/api/emails/${emailId}/star`,
  DELETE: (emailId: string) => `/api/emails/${emailId}`,
} as const;

//====================================================
