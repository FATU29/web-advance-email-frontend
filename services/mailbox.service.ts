import { axiosBI } from './axios.bi';
import { CustomAxiosResponse } from './axios.bi';
import { ApiResponse, IMailbox } from '@/types/api.types';
import { MAILBOX_ENDPOINTS } from '@/utils/constants/api';

//==================== REGION MAILBOX SERVICE ====================

/**
 * Mailbox Service
 * Handles all mailbox-related API calls
 */
class MailboxService {
  /**
   * Get all mailboxes
   */
  static async getMailboxes(): Promise<
    CustomAxiosResponse<ApiResponse<IMailbox[]>>
  > {
    return await axiosBI.get(MAILBOX_ENDPOINTS.GET_ALL);
  }

  /**
   * Get mailbox by ID
   */
  static async getMailboxById(
    mailboxId: string
  ): Promise<CustomAxiosResponse<ApiResponse<IMailbox>>> {
    return await axiosBI.get(MAILBOX_ENDPOINTS.GET_BY_ID(mailboxId));
  }
}

export default MailboxService;

//====================================================
