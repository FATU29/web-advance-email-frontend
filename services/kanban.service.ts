import { axiosBI } from './axios.bi';
import { CustomAxiosResponse } from './axios.bi';
import { ApiResponse } from '@/types/api.types';
import { KANBAN_ENDPOINTS } from '@/utils/constants/api';

//==================== REGION KANBAN TYPES ====================

export interface IKanbanColumn {
  id: string;
  name: string;
  type: 'INBOX' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'SNOOZED' | 'CUSTOM';
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
}

export default KanbanService;

//====================================================
