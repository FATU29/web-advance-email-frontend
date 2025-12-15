import { axiosBI } from './axios.bi';
import { CustomAxiosResponse } from './axios.bi';
import { ApiResponse } from '@/types/api.types';
import { KANBAN_ENDPOINTS } from '@/utils/constants/api';

//==================== REGION KANBAN TYPES ====================

export interface IKanbanColumn {
  id: string;
  name: string;
  type:
    | 'INBOX'
    | 'BACKLOG'
    | 'TODO'
    | 'IN_PROGRESS'
    | 'DONE'
    | 'SNOOZED'
    | 'CUSTOM';
  order: number;
  color: string;
  isDefault: boolean;
  emailCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IKanbanEmail {
  id: string;
  emailId: string;
  columnId: string;
  orderInColumn: number;
  subject: string;
  fromEmail: string;
  fromName: string;
  preview: string;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  summary?: string | null;
  summaryGeneratedAt?: string | null;
  snoozed: boolean;
  snoozeUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IKanbanBoard {
  columns: IKanbanColumn[];
  emailsByColumn: Record<string, IKanbanEmail[]>;
}

export interface IAddEmailToKanbanRequest {
  emailId: string;
  columnId?: string | null;
  generateSummary?: boolean;
}

export interface IMoveEmailRequest {
  emailId: string;
  targetColumnId: string;
  newOrder?: number | null;
}

export interface ISnoozeEmailRequest {
  emailId: string;
  snoozeUntil: string;
}

export interface IGmailStatusResponse {
  connected: boolean;
}

export interface IKanbanSyncResult {
  synced: number; // Number of emails successfully synced
  skipped: number; // Number of emails skipped (already in Kanban)
  total: number; // Total emails processed from Gmail
  message: string; // Human-readable result message
}

export interface ICreateColumnRequest {
  name: string;
  color?: string;
  order?: number;
}

export interface IUpdateColumnRequest {
  name?: string;
  color?: string;
  order?: number;
}

//====================================================

//==================== REGION KANBAN SERVICE ====================

/**
 * Kanban Service
 * Handles all Kanban-related API calls
 */
class KanbanService {
  /**
   * Get the full Kanban board with all columns and emails
   */
  static async getBoard(): Promise<
    CustomAxiosResponse<ApiResponse<IKanbanBoard>>
  > {
    return await axiosBI.get(KANBAN_ENDPOINTS.GET_BOARD);
  }

  /**
   * Get all columns for the user
   */
  static async getColumns(): Promise<
    CustomAxiosResponse<ApiResponse<IKanbanColumn[]>>
  > {
    return await axiosBI.get(KANBAN_ENDPOINTS.GET_COLUMNS);
  }

  /**
   * Get emails in a specific column
   */
  static async getEmailsInColumn(
    columnId: string
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanEmail[]>>> {
    return await axiosBI.get(KANBAN_ENDPOINTS.GET_EMAILS_IN_COLUMN(columnId));
  }

  /**
   * Add an email to the Kanban board
   */
  static async addEmailToKanban(
    request: IAddEmailToKanbanRequest
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanEmail>>> {
    return await axiosBI.post(KANBAN_ENDPOINTS.ADD_EMAIL, request);
  }

  /**
   * Get a single email's Kanban status
   */
  static async getEmailStatus(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanEmail>>> {
    return await axiosBI.get(KANBAN_ENDPOINTS.GET_EMAIL_STATUS(emailId));
  }

  /**
   * Move an email to a different column (drag-and-drop)
   */
  static async moveEmail(
    request: IMoveEmailRequest
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanEmail>>> {
    return await axiosBI.post(KANBAN_ENDPOINTS.MOVE_EMAIL, request);
  }

  /**
   * Remove an email from the Kanban board
   */
  static async removeEmailFromKanban(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.delete(KANBAN_ENDPOINTS.REMOVE_EMAIL(emailId));
  }

  /**
   * Snooze an email until a specific time
   */
  static async snoozeEmail(
    request: ISnoozeEmailRequest
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanEmail>>> {
    return await axiosBI.post(KANBAN_ENDPOINTS.SNOOZE_EMAIL, request);
  }

  /**
   * Unsnooze an email (restore to previous column)
   */
  static async unsnoozeEmail(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanEmail>>> {
    return await axiosBI.post(KANBAN_ENDPOINTS.UNSNOOZE_EMAIL(emailId));
  }

  /**
   * Generate or regenerate AI summary for an email
   */
  static async generateSummary(
    emailId: string
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanEmail>>> {
    return await axiosBI.post(KANBAN_ENDPOINTS.GENERATE_SUMMARY(emailId));
  }

  /**
   * Check Gmail connection status
   */
  static async getGmailStatus(): Promise<
    CustomAxiosResponse<ApiResponse<IGmailStatusResponse>>
  > {
    return await axiosBI.get(KANBAN_ENDPOINTS.GMAIL_STATUS);
  }

  /**
   * Sync Gmail emails to Kanban board
   * @param maxEmails - Maximum emails to sync (default: 50, max: 100)
   */
  static async syncGmail(
    maxEmails: number = 50
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanSyncResult>>> {
    return await axiosBI.post(
      `${KANBAN_ENDPOINTS.SYNC_GMAIL}?maxEmails=${maxEmails}`
    );
  }

  /**
   * Get board with optional sync parameter
   * @param sync - If true, syncs new emails from Gmail before returning board
   * @param maxEmails - Maximum emails to sync/display
   */
  static async getBoardWithSync(
    sync: boolean = false,
    maxEmails: number = 50
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanBoard>>> {
    return await axiosBI.get(
      `${KANBAN_ENDPOINTS.GET_BOARD}?sync=${sync}&maxEmails=${maxEmails}`
    );
  }

  /**
   * Create a custom column
   */
  static async createColumn(
    request: ICreateColumnRequest
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanColumn>>> {
    return await axiosBI.post(KANBAN_ENDPOINTS.CREATE_COLUMN, request);
  }

  /**
   * Update a column
   */
  static async updateColumn(
    columnId: string,
    request: IUpdateColumnRequest
  ): Promise<CustomAxiosResponse<ApiResponse<IKanbanColumn>>> {
    return await axiosBI.put(KANBAN_ENDPOINTS.UPDATE_COLUMN(columnId), request);
  }

  /**
   * Delete a column (emails moved to Backlog)
   */
  static async deleteColumn(
    columnId: string
  ): Promise<CustomAxiosResponse<ApiResponse<null>>> {
    return await axiosBI.delete(KANBAN_ENDPOINTS.DELETE_COLUMN(columnId));
  }
}

export default KanbanService;

//====================================================
