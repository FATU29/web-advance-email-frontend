//==================== REGION API TYPES ====================

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T | null;
}

// Auth Types
export interface IUserLoginParams {
  email: string;
  password: string;
}

export interface IUserSignupParams {
  name: string;
  email: string;
  password: string;
}

export interface IGoogleAuthParams {
  code: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRefreshTokenParams {
  // No longer needed - refresh token is sent automatically via HttpOnly cookie
  // Kept for backward compatibility
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ILogoutParams {
  // Optional refreshToken parameter removed
  // Backend clears HttpOnly cookie automatically
}

export interface IIntrospectParams {
  token: string;
}

export interface IIntrospectResponse {
  isValid: boolean;
}

export interface IVerifyEmailParams {
  email: string;
  code: string;
}

export interface IResendVerificationOtpParams {
  email: string;
}

export interface IForgotPasswordParams {
  email: string;
}

export interface IResetPasswordParams {
  email: string;
  code: string;
  newPassword: string;
}

export interface IChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  code: string;
}

export interface IAuthUser {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string | null; // null in HttpOnly cookie flow
  tokenType: string;
  expiresIn: number;
  user: IAuthUser;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string | null; // null in HttpOnly cookie flow - actual token is in HttpOnly cookie
  tokenType: string;
  expiresIn: number;
  user: IAuthUser;
}

// Mailbox Types
export type MailboxType =
  | 'INBOX'
  | 'SENT'
  | 'DRAFTS'
  | 'TRASH'
  | 'SPAM'
  | 'STARRED'
  | 'IMPORTANT'
  | 'CUSTOM';

export interface IMailbox {
  id: string;
  name: string;
  type: MailboxType;
  unreadCount: number;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
}

// Email Types
export interface IEmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export type KanbanStatus =
  | 'INBOX'
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'SNOOZED';

export interface IEmailListItem {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  preview: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  hasAttachments: boolean;
  receivedAt: string;
  kanbanStatus?: KanbanStatus;
  snoozeUntil?: string | null;
  aiSummary?: string | null;
}

export interface IEmailDetail {
  id: string;
  from: string;
  fromName: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  attachments: IEmailAttachment[];
  receivedAt: string;
  sentAt: string;
}

export interface IPaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  nextPageToken?: string | null;
}

export interface IGetEmailsParams {
  page?: number;
  size?: number;
  pageToken?: string | null;
}

export type EmailAction =
  | 'read'
  | 'unread'
  | 'star'
  | 'unstar'
  | 'delete'
  | 'archive';

export interface IBulkEmailActionParams {
  emailIds: string[];
  action: EmailAction;
}

export interface ISendEmailParams {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachmentIds?: string[];
}

export interface IReplyEmailParams {
  body: string;
  replyAll?: boolean;
  attachmentIds?: string[];
}

export interface IModifyEmailParams {
  emailIds: string[];
  action: EmailAction;
}

// Kanban Types
export interface IUpdateKanbanStatusParams {
  emailId: string;
  status: KanbanStatus;
}

export interface ISnoozeEmailParams {
  emailId: string;
  snoozeUntil: string; // ISO date string
}

export interface IGetEmailSummaryParams {
  emailId: string;
}

export interface IEmailSummaryResponse {
  summary: string;
}

// Kanban Search Types
export interface IKanbanSearchParams {
  query: string;
  limit?: number;
  includeBody?: boolean;
}

export interface IKanbanSearchResult {
  id: string;
  emailId: string;
  columnId: string;
  columnName: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  preview: string;
  summary: string | null;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  score: number;
  matchedFields: string[];
}

export interface IKanbanSearchResponse {
  query: string;
  totalResults: number;
  results: IKanbanSearchResult[];
}

// Kanban Filter Types
export interface IKanbanFilterParams {
  sortBy?: 'date_newest' | 'date_oldest' | 'sender_name';
  unreadOnly?: boolean;
  hasAttachmentsOnly?: boolean;
  fromSender?: string;
  columnId?: string;
  maxEmailsPerColumn?: number;
}

//====================================================
