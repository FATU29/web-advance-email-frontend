import KanbanService, {
  IKanbanBoard,
  IKanbanColumn,
  IKanbanEmail,
  IAddEmailToKanbanRequest,
  IMoveEmailRequest,
  ISnoozeEmailRequest,
} from '@/services/kanban.service';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

//==================== REGION QUERY KEYS ====================
export const kanbanQueryKeys = {
  all: ['kanban'] as const,
  board: () => [...kanbanQueryKeys.all, 'board'] as const,
  columns: () => [...kanbanQueryKeys.all, 'columns'] as const,
  emailsInColumn: (columnId: string) =>
    [...kanbanQueryKeys.all, 'column', columnId, 'emails'] as const,
  emailStatus: (emailId: string) =>
    [...kanbanQueryKeys.all, 'email', emailId] as const,
};
//====================================================

//==================== REGION REACT QUERY HOOKS ====================

/**
 * Get Kanban board query
 */
export const useKanbanBoardQuery = (
  options?: Omit<
    UseQueryOptions<IKanbanBoard, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: kanbanQueryKeys.board(),
    queryFn: async () => {
      const response = await KanbanService.getBoard();
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch Kanban board');
    },
    ...options,
  });
};

/**
 * Get Kanban columns query
 */
export const useKanbanColumnsQuery = (
  options?: Omit<
    UseQueryOptions<IKanbanColumn[], AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: kanbanQueryKeys.columns(),
    queryFn: async () => {
      const response = await KanbanService.getColumns();
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch columns');
    },
    ...options,
  });
};

/**
 * Get emails in column query
 */
export const useKanbanEmailsInColumnQuery = (
  columnId: string,
  options?: Omit<
    UseQueryOptions<IKanbanEmail[], AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: kanbanQueryKeys.emailsInColumn(columnId),
    queryFn: async () => {
      const response = await KanbanService.getEmailsInColumn(columnId);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || 'Failed to fetch emails in column'
      );
    },
    enabled: !!columnId,
    ...options,
  });
};

/**
 * Get email Kanban status query
 */
export const useKanbanEmailStatusQuery = (
  emailId: string,
  options?: Omit<
    UseQueryOptions<IKanbanEmail, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: kanbanQueryKeys.emailStatus(emailId),
    queryFn: async () => {
      const response = await KanbanService.getEmailStatus(emailId);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch email status');
    },
    enabled: !!emailId,
    ...options,
  });
};

//==================== REGION MUTATIONS ====================

/**
 * Add email to Kanban mutation
 */
export const useAddEmailToKanbanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IAddEmailToKanbanRequest) =>
      KanbanService.addEmailToKanban(request),
    onSuccess: () => {
      // Invalidate board and columns queries
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.columns() });
    },
  });
};

/**
 * Move email mutation
 */
export const useMoveEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IMoveEmailRequest) =>
      KanbanService.moveEmail(request),
    onSuccess: () => {
      // Invalidate board query to refresh all columns
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
    },
  });
};

/**
 * Snooze email mutation
 */
export const useSnoozeEmailKanbanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ISnoozeEmailRequest) =>
      KanbanService.snoozeEmail(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
    },
  });
};

/**
 * Unsnooze email mutation
 */
export const useUnsnoozeEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) => KanbanService.unsnoozeEmail(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
    },
  });
};

/**
 * Generate summary mutation
 */
export const useGenerateSummaryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) => KanbanService.generateSummary(emailId),
    onSuccess: (data, emailId) => {
      // Invalidate board and specific email status
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.emailStatus(emailId),
      });
    },
  });
};

/**
 * Remove email from Kanban mutation
 */
export const useRemoveEmailFromKanbanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) =>
      KanbanService.removeEmailFromKanban(emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.columns() });
    },
  });
};

//====================================================
