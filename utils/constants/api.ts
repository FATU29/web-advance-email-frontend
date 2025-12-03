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
