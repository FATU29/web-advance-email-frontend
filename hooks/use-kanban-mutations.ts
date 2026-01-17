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
  IGmailLabel,
} from '@/services/kanban.service';
import { IKanbanFilterParams } from '@/types/api.types';
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
 * Get filtered Kanban board query
 */
export const useKanbanFilteredBoardQuery = (
  params: IKanbanFilterParams,
  options?: Omit<
    UseQueryOptions<IKanbanBoard, AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...kanbanQueryKeys.board(), 'filtered', params],
    queryFn: async () => {
      const response = await KanbanService.getFilteredBoard(params);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || 'Failed to fetch filtered board'
      );
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
      // Invalidate all board and columns queries (including filtered ones)
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.columns(),
        exact: false,
      });
    },
  });
};

/**
 * Move email mutation with optimistic updates
 */
export const useMoveEmailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IMoveEmailRequest) =>
      KanbanService.moveEmail(request),
    // Optimistic update: Update UI before API call
    onMutate: async (request: IMoveEmailRequest) => {
      // Cancel all outgoing refetches for board queries (including filtered)
      await queryClient.cancelQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false, // Cancel all board queries including filtered ones
      });

      // Get all cached board queries (including filtered ones)
      const queryCache = queryClient.getQueryCache();
      const allBoardQueries = queryCache
        .findAll({ queryKey: kanbanQueryKeys.board(), exact: false })
        .map((q) => ({
          key: q.queryKey,
          data: q.state.data as IKanbanBoard | undefined,
        }))
        .filter((q) => q.data);

      // Optimistically update all cached board queries
      allBoardQueries.forEach(({ key, data }) => {
        if (!data) return;

        queryClient.setQueryData<IKanbanBoard>(key, (old) => {
          if (!old) return old;

          // Find the email in emailsByColumn
          let emailToMove: IKanbanEmail | null = null;
          let sourceColumnId: string | null = null;

          // Find which column contains the email
          for (const [columnId, emails] of Object.entries(old.emailsByColumn)) {
            const email = emails.find((e) => e.emailId === request.emailId);
            if (email) {
              emailToMove = { ...email };
              sourceColumnId = columnId;
              break;
            }
          }

          if (!emailToMove || !sourceColumnId) {
            return old; // Email not found, return unchanged
          }

          // Create new emailsByColumn with the email moved
          const newEmailsByColumn = { ...old.emailsByColumn };

          // Remove from source column
          newEmailsByColumn[sourceColumnId] = newEmailsByColumn[
            sourceColumnId
          ].filter((e) => e.emailId !== request.emailId);

          // Add to target column at the beginning (top)
          const updatedEmail = {
            ...emailToMove,
            columnId: request.targetColumnId,
          };

          if (!newEmailsByColumn[request.targetColumnId]) {
            newEmailsByColumn[request.targetColumnId] = [];
          }
          newEmailsByColumn[request.targetColumnId] = [
            updatedEmail,
            ...newEmailsByColumn[request.targetColumnId],
          ];

          // Update column counts
          const newColumns = old.columns.map((col) => {
            if (col.id === sourceColumnId) {
              return { ...col, emailCount: Math.max(0, col.emailCount - 1) };
            }
            if (col.id === request.targetColumnId) {
              return { ...col, emailCount: col.emailCount + 1 };
            }
            return col;
          });

          return {
            ...old,
            columns: newColumns,
            emailsByColumn: newEmailsByColumn,
          };
        });
      });

      // Return context with snapshots for rollback
      return { previousQueries: allBoardQueries };
    },
    // Rollback on error
    onError: (_error, _request, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }
    },
    // Only refetch on error to ensure sync, skip on success since optimistic update is sufficient
    onSettled: (_data, error) => {
      if (error) {
        queryClient.invalidateQueries({
          queryKey: kanbanQueryKeys.board(),
          exact: false,
        });
      }
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
    // Optimistic update: Move email to SNOOZED column immediately
    onMutate: async (request: ISnoozeEmailRequest) => {
      // Cancel all outgoing refetches for board queries
      await queryClient.cancelQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false,
      });

      // Get all cached board queries
      const queryCache = queryClient.getQueryCache();
      const allBoardQueries = queryCache
        .findAll({ queryKey: kanbanQueryKeys.board(), exact: false })
        .map((q) => ({
          key: q.queryKey,
          data: q.state.data as IKanbanBoard | undefined,
        }))
        .filter((q) => q.data);

      // Optimistically update all cached board queries
      allBoardQueries.forEach(({ key, data }) => {
        if (!data) return;

        queryClient.setQueryData<IKanbanBoard>(key, (old) => {
          if (!old) return old;

          // Find the email and the SNOOZED column
          let emailToMove: IKanbanEmail | null = null;
          let sourceColumnId: string | null = null;
          const snoozedColumn = old.columns.find(
            (col) => col.type === 'SNOOZED'
          );

          if (!snoozedColumn) return old; // No SNOOZED column

          // Find which column contains the email
          for (const [columnId, emails] of Object.entries(old.emailsByColumn)) {
            const email = emails.find((e) => e.emailId === request.emailId);
            if (email) {
              emailToMove = { ...email };
              sourceColumnId = columnId;
              break;
            }
          }

          if (
            !emailToMove ||
            !sourceColumnId ||
            sourceColumnId === snoozedColumn.id
          ) {
            return old; // Email not found or already in SNOOZED column
          }

          // Create new emailsByColumn with the email moved to SNOOZED
          const newEmailsByColumn = { ...old.emailsByColumn };

          // Remove from source column
          newEmailsByColumn[sourceColumnId] = newEmailsByColumn[
            sourceColumnId
          ].filter((e) => e.emailId !== request.emailId);

          // Add to SNOOZED column (at the beginning)
          const updatedEmail = {
            ...emailToMove,
            columnId: snoozedColumn.id,
            kanbanStatus: 'SNOOZED' as const,
            snoozed: true,
            snoozeUntil: request.snoozeUntil,
          };

          if (!newEmailsByColumn[snoozedColumn.id]) {
            newEmailsByColumn[snoozedColumn.id] = [];
          }
          newEmailsByColumn[snoozedColumn.id] = [
            updatedEmail,
            ...newEmailsByColumn[snoozedColumn.id],
          ];

          // Update column counts
          const newColumns = old.columns.map((col) => {
            if (col.id === sourceColumnId) {
              return { ...col, emailCount: Math.max(0, col.emailCount - 1) };
            }
            if (col.id === snoozedColumn.id) {
              return { ...col, emailCount: col.emailCount + 1 };
            }
            return col;
          });

          return {
            ...old,
            columns: newColumns,
            emailsByColumn: newEmailsByColumn,
          };
        });
      });

      // Return context with snapshots for rollback
      return { previousQueries: allBoardQueries };
    },
    // Rollback on error
    onError: (_error, _request, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }
    },
    // Only refetch on error to ensure sync, skip on success since optimistic update is sufficient
    onSettled: (_data, error) => {
      if (error) {
        queryClient.invalidateQueries({
          queryKey: kanbanQueryKeys.board(),
          exact: false,
        });
      }
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
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false, // Invalidate all board queries including filtered ones
      });
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
    onSuccess: (response, emailId) => {
      // Extract the updated email from response
      const updatedEmail = response.data.data;

      if (updatedEmail) {
        // Update all board queries with the new summary
        const queryCache = queryClient.getQueryCache();
        const allBoardQueries = queryCache
          .findAll({ queryKey: kanbanQueryKeys.board(), exact: false })
          .map((q) => ({
            key: q.queryKey,
            data: q.state.data as IKanbanBoard | undefined,
          }))
          .filter((q) => q.data);

        // Update each cached board query
        allBoardQueries.forEach(({ key, data }) => {
          if (!data) return;

          queryClient.setQueryData<IKanbanBoard>(key, (old) => {
            if (!old) return old;

            // Update the email in emailsByColumn
            const newEmailsByColumn = { ...old.emailsByColumn };
            for (const [columnId, emails] of Object.entries(
              newEmailsByColumn
            )) {
              const emailIndex = emails.findIndex((e) => e.emailId === emailId);
              if (emailIndex !== -1) {
                // Update the email with new summary data
                newEmailsByColumn[columnId] = [
                  ...emails.slice(0, emailIndex),
                  {
                    ...emails[emailIndex],
                    summary: updatedEmail.summary,
                    aiSummary: updatedEmail.summary, // Keep both fields in sync
                    summaryGeneratedAt: updatedEmail.summaryGeneratedAt,
                  },
                  ...emails.slice(emailIndex + 1),
                ];
                break;
              }
            }

            return {
              ...old,
              emailsByColumn: newEmailsByColumn,
            };
          });
        });
      }

      // Still invalidate to ensure full sync
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false,
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
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false, // Invalidate all board queries including filtered ones
      });
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.columns(),
        exact: false,
      });
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
 * Create column mutation with optimistic update
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
    // Optimistic update: Add column to UI before API call
    onMutate: async (request: ICreateColumnRequest) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: kanbanQueryKeys.columns(),
        exact: false,
      });
      await queryClient.cancelQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false,
      });

      // Snapshot previous values
      const previousColumns = queryClient.getQueryData<IKanbanColumn[]>(
        kanbanQueryKeys.columns()
      );
      const queryCache = queryClient.getQueryCache();
      const allBoardQueries = queryCache
        .findAll({ queryKey: kanbanQueryKeys.board(), exact: false })
        .map((q) => ({
          key: q.queryKey,
          data: q.state.data as IKanbanBoard | undefined,
        }))
        .filter((q) => q.data);

      // Create optimistic column with temp ID
      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const optimisticColumn: IKanbanColumn = {
        id: tempId,
        name: request.name,
        type: 'CUSTOM',
        color: request.color || '#6366f1',
        order: previousColumns ? previousColumns.length : 0,
        isDefault: false,
        emailCount: 0,
        gmailLabelId: null,
        gmailLabelName: null,
        createdAt: now,
        updatedAt: now,
      };

      // Optimistically update columns query
      if (previousColumns) {
        queryClient.setQueryData<IKanbanColumn[]>(kanbanQueryKeys.columns(), [
          ...previousColumns,
          optimisticColumn,
        ]);
      }

      // Optimistically update all board queries
      allBoardQueries.forEach(({ key, data }) => {
        if (!data) return;
        queryClient.setQueryData<IKanbanBoard>(key, {
          ...data,
          columns: [...data.columns, optimisticColumn],
          emailsByColumn: {
            ...data.emailsByColumn,
            [tempId]: [],
          },
        });
      });

      return { previousColumns, previousBoards: allBoardQueries, tempId };
    },
    // Replace temp column with real data on success
    onSuccess: (newColumn, _request, context) => {
      if (context?.tempId) {
        // Update columns query with real column
        queryClient.setQueryData<IKanbanColumn[]>(
          kanbanQueryKeys.columns(),
          (old) =>
            old?.map((col) => (col.id === context.tempId ? newColumn : col))
        );

        // Update all board queries with real column
        const queryCache = queryClient.getQueryCache();
        const allBoardQueries = queryCache.findAll({
          queryKey: kanbanQueryKeys.board(),
          exact: false,
        });

        allBoardQueries.forEach((query) => {
          const data = query.state.data as IKanbanBoard | undefined;
          if (!data) return;

          queryClient.setQueryData<IKanbanBoard>(query.queryKey, {
            ...data,
            columns: data.columns.map((col) =>
              col.id === context.tempId ? newColumn : col
            ),
            emailsByColumn: {
              ...data.emailsByColumn,
              [newColumn.id]: data.emailsByColumn[context.tempId] || [],
            },
          });

          // Remove temp key
          const newEmailsByColumn = { ...data.emailsByColumn };
          delete newEmailsByColumn[context.tempId];
          queryClient.setQueryData<IKanbanBoard>(query.queryKey, (old) =>
            old
              ? {
                  ...old,
                  emailsByColumn: {
                    ...newEmailsByColumn,
                    [newColumn.id]: old.emailsByColumn[context.tempId] || [],
                  },
                }
              : old
          );
        });
      }
    },
    // Rollback on error
    onError: (_error, _request, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(
          kanbanQueryKeys.columns(),
          context.previousColumns
        );
      }
      if (context?.previousBoards) {
        context.previousBoards.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }
    },
  });
};

/**
 * Update column mutation with optimistic update
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
    // Optimistic update: Update column in UI before API call
    onMutate: async ({
      columnId,
      request,
    }: {
      columnId: string;
      request: IUpdateColumnRequest;
    }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: kanbanQueryKeys.columns(),
        exact: false,
      });
      await queryClient.cancelQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false,
      });

      // Snapshot previous values
      const previousColumns = queryClient.getQueryData<IKanbanColumn[]>(
        kanbanQueryKeys.columns()
      );
      const queryCache = queryClient.getQueryCache();
      const allBoardQueries = queryCache
        .findAll({ queryKey: kanbanQueryKeys.board(), exact: false })
        .map((q) => ({
          key: q.queryKey,
          data: q.state.data as IKanbanBoard | undefined,
        }))
        .filter((q) => q.data);

      // Optimistically update columns query
      if (previousColumns) {
        queryClient.setQueryData<IKanbanColumn[]>(
          kanbanQueryKeys.columns(),
          previousColumns.map((col) =>
            col.id === columnId
              ? {
                  ...col,
                  name: request.name ?? col.name,
                  color: request.color ?? col.color,
                  gmailLabelId: request.gmailLabelId ?? col.gmailLabelId,
                  gmailLabelName: request.gmailLabelName ?? col.gmailLabelName,
                }
              : col
          )
        );
      }

      // Optimistically update all board queries
      allBoardQueries.forEach(({ key, data }) => {
        if (!data) return;
        queryClient.setQueryData<IKanbanBoard>(key, {
          ...data,
          columns: data.columns.map((col) =>
            col.id === columnId
              ? {
                  ...col,
                  name: request.name ?? col.name,
                  color: request.color ?? col.color,
                  gmailLabelId: request.gmailLabelId ?? col.gmailLabelId,
                  gmailLabelName: request.gmailLabelName ?? col.gmailLabelName,
                }
              : col
          ),
        });
      });

      return { previousColumns, previousBoards: allBoardQueries };
    },
    // Rollback on error
    onError: (_error, _request, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(
          kanbanQueryKeys.columns(),
          context.previousColumns
        );
      }
      if (context?.previousBoards) {
        context.previousBoards.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }
    },
  });
};

/**
 * Delete column mutation with optimistic update
 */
export const useDeleteColumnMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (columnId: string) => {
      const response = await KanbanService.deleteColumn(columnId);
      if (response.data.success) {
        return columnId;
      }
      throw new Error(response.data.message || 'Failed to delete column');
    },
    // Optimistic update: Remove column from UI before API call
    onMutate: async (columnId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: kanbanQueryKeys.columns(),
        exact: false,
      });
      await queryClient.cancelQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false,
      });

      // Snapshot previous values
      const previousColumns = queryClient.getQueryData<IKanbanColumn[]>(
        kanbanQueryKeys.columns()
      );
      const queryCache = queryClient.getQueryCache();
      const allBoardQueries = queryCache
        .findAll({ queryKey: kanbanQueryKeys.board(), exact: false })
        .map((q) => ({
          key: q.queryKey,
          data: q.state.data as IKanbanBoard | undefined,
        }))
        .filter((q) => q.data);

      // Optimistically remove from columns query
      if (previousColumns) {
        queryClient.setQueryData<IKanbanColumn[]>(
          kanbanQueryKeys.columns(),
          previousColumns.filter((col) => col.id !== columnId)
        );
      }

      // Optimistically update all board queries
      allBoardQueries.forEach(({ key, data }) => {
        if (!data) return;
        const newEmailsByColumn = { ...data.emailsByColumn };
        delete newEmailsByColumn[columnId];

        queryClient.setQueryData<IKanbanBoard>(key, {
          ...data,
          columns: data.columns.filter((col) => col.id !== columnId),
          emailsByColumn: newEmailsByColumn,
        });
      });

      return { previousColumns, previousBoards: allBoardQueries };
    },
    // Rollback on error
    onError: (_error, _request, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(
          kanbanQueryKeys.columns(),
          context.previousColumns
        );
      }
      if (context?.previousBoards) {
        context.previousBoards.forEach(({ key, data }) => {
          if (data) {
            queryClient.setQueryData(key, data);
          }
        });
      }
    },
  });
};

/**
 * Get Gmail labels query
 */
export const useGmailLabelsQuery = (
  options?: Omit<
    UseQueryOptions<IGmailLabel[], AxiosError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<IGmailLabel[], AxiosError>({
    queryKey: [...kanbanQueryKeys.all, 'gmail-labels'] as const,
    queryFn: async () => {
      const response = await KanbanService.getGmailLabels();
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch Gmail labels');
    },
    ...options,
  });
};

//====================================================
