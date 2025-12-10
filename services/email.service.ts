import { axiosBI } from './axios.bi';
import { CustomAxiosResponse } from './axios.bi';
import {
  ApiResponse,
  IEmailListItem,
  IEmailDetail,
  IPaginatedResponse,
  IGetEmailsParams,
  IBulkEmailActionParams,
  ISendEmailParams,
  IReplyEmailParams,
  IModifyEmailParams,
  IUpdateKanbanStatusParams,
  ISnoozeEmailParams,
  IGetEmailSummaryParams,
  IEmailSummaryResponse,
  KanbanStatus,
} from '@/types/api.types';
import { EMAIL_ENDPOINTS, MAILBOX_ENDPOINTS } from '@/utils/constants/api';

//==================== REGION EMAIL SERVICE ====================

/**
 * Email Service
 * Handles all email-related API calls
 */
class EmailService {
  /**
   * Get emails in mailbox (paginated)
   */
  static async getEmails(
    mailboxId: string,
    params?: IGetEmailsParams
  ): Promise<
    CustomAxiosResponse<ApiResponse<IPaginatedResponse<IEmailListItem>>>
  > {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    // Add pageToken if provided (not null and not for first page)
    if (params?.pageToken) {
      queryParams.append('pageToken', params.pageToken);
    }

    const queryString = queryParams.toString();
    const baseUrl = MAILBOX_ENDPOINTS.GET_EMAILS(mailboxId);
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    return await axiosBI.get(url);
  }

  /**
   * Get email detail by ID
   */
  static async getEmailById(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<IEmailDetail>>> {
    return await axiosBI.get(EMAIL_ENDPOINTS.GET_BY_ID(emailId));
  }

  /**
   * Perform bulk actions on emails
   */
  static async bulkAction(
    params: IBulkEmailActionParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(EMAIL_ENDPOINTS.BULK_ACTION, params);
  }

  /**
   * Mark email as read
   */
  static async markAsRead(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.patch(EMAIL_ENDPOINTS.MARK_READ(emailId));
  }

  /**
   * Mark email as unread
   */
  static async markAsUnread(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.patch(EMAIL_ENDPOINTS.MARK_UNREAD(emailId));
  }

  /**
   * Toggle star on email
   */
  static async toggleStar(
    emailId: string,
    starred: boolean
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.patch(
      `${EMAIL_ENDPOINTS.TOGGLE_STAR(emailId)}?starred=${starred}`
    );
  }

  /**
   * Delete email
   */
  static async delete(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.delete(EMAIL_ENDPOINTS.DELETE(emailId));
  }

  /**
   * Send email
   */
  static async send(
    params: ISendEmailParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(EMAIL_ENDPOINTS.SEND, params);
  }

  /**
   * Reply to email
   */
  static async reply(
    emailId: string,
    params: IReplyEmailParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(EMAIL_ENDPOINTS.REPLY(emailId), params);
  }

  /**
   * Modify email (alternative bulk action endpoint)
   */
  static async modify(
    emailId: string,
    params: IModifyEmailParams
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(EMAIL_ENDPOINTS.MODIFY(emailId), params);
  }

  /**
   * Update email kanban status
   */
  static async updateKanbanStatus(
    emailId: string,
    status: KanbanStatus
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.patch(EMAIL_ENDPOINTS.UPDATE_KANBAN_STATUS(emailId), {
      status,
    });
  }

  /**
   * Snooze email until a specific date
   */
  static async snoozeEmail(
    emailId: string,
    snoozeUntil: string
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.post(EMAIL_ENDPOINTS.SNOOZE(emailId), {
      snoozeUntil,
    });
  }

  /**
   * Get AI summary for email
   */
  static async getEmailSummary(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<IEmailSummaryResponse>>> {
    return await axiosBI.get(EMAIL_ENDPOINTS.SUMMARY(emailId));
  }
}

export default EmailService;

//====================================================
