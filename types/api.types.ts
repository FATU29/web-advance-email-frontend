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

export interface IRefreshTokenParams {
  refreshToken: string;
}

export interface ILogoutParams {
  refreshToken?: string;
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
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: IAuthUser;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
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
}

export interface IGetEmailsParams {
  page?: number;
  size?: number;
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

//====================================================
