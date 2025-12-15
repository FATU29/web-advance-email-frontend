import KanbanService, {
  IKanbanBoard,
  IKanbanColumn,
  IKanbanEmail,
  IAddEmailToKanbanRequest,
  IMoveEmailRequest,
  ISnoozeEmailRequest,
  IGmailStatusResponse,
  IKanbanSyncResult,
  ICreateColumnRequest,
  IUpdateColumnRequest,
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
      // Use invalidateQueries with exact match to prevent unnecessary refetches
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: true,
      });
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
      // Invalidate board and specific email status with exact match
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.emailStatus(emailId),
        exact: true,
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

/**
 * Check Gmail connection status query
 */
export const useGmailStatusQuery = (
  options?: Omit<
    UseQueryOptions<IGmailStatusResponse, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...kanbanQueryKeys.all, 'gmail-status'] as const,
    queryFn: async () => {
      const response = await KanbanService.getGmailStatus();
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to check Gmail status');
    },
    ...options,
  });
};

/**
 * Sync Gmail emails mutation
 */
export const useSyncGmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IKanbanSyncResult, AxiosError, number>({
    mutationFn: async (maxEmails: number = 50) => {
      const response = await KanbanService.syncGmail(maxEmails);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to sync Gmail');
    },
    onSuccess: () => {
      // Invalidate board query to refetch
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
    },
  });
};

/**
 * Create column mutation
 */
export const useCreateColumnMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ICreateColumnRequest) => {
      const response = await KanbanService.createColumn(request);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create column');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.columns() });
    },
  });
};

/**
 * Update column mutation
 */
export const useUpdateColumnMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      columnId,
      request,
    }: {
      columnId: string;
      request: IUpdateColumnRequest;
    }) => {
      const response = await KanbanService.updateColumn(columnId, request);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update column');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.columns() });
    },
  });
};

/**
 * Delete column mutation
 */
export const useDeleteColumnMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (columnId: string) => {
      const response = await KanbanService.deleteColumn(columnId);
      if (response.data.success) {
        return;
      }
      throw new Error(response.data.message || 'Failed to delete column');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.columns() });
    },
  });
};

//====================================================
