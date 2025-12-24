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

          // Add to target column (update columnId in email)
          const updatedEmail = {
            ...emailToMove,
            columnId: request.targetColumnId,
          };

          if (!newEmailsByColumn[request.targetColumnId]) {
            newEmailsByColumn[request.targetColumnId] = [];
          }
          newEmailsByColumn[request.targetColumnId] = [
            ...newEmailsByColumn[request.targetColumnId],
            updatedEmail,
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
    // Always refetch after error or success to ensure sync
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false, // Invalidate all board queries including filtered ones
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
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false, // Invalidate all board queries including filtered ones
      });
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
    onSuccess: (data, emailId) => {
      // Invalidate all board queries (including filtered ones) to show new summary
      queryClient.invalidateQueries({
        queryKey: kanbanQueryKeys.board(),
        exact: false, // Invalidate all board queries including filtered ones
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
 * Create column mutation with optimistic updates
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
    // Optimistic update: Update UI immediately with temporary column
    onMutate: async (request) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: kanbanQueryKeys.board() });
      await queryClient.cancelQueries({ queryKey: kanbanQueryKeys.columns() });

      // Snapshot previous values
      const previousBoard = queryClient.getQueryData<IKanbanBoard>(
        kanbanQueryKeys.board()
      );
      const previousColumns = queryClient.getQueryData<IKanbanColumn[]>(
        kanbanQueryKeys.columns()
      );

      // Create optimistic column
      const optimisticColumn: IKanbanColumn = {
        id: `temp-${Date.now()}`, // Temporary ID
        name: request.name,
        type: 'CUSTOM',
        order: request.order || 999,
        color: request.color || '#6366f1',
        isDefault: false,
        emailCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update board cache
      if (previousBoard) {
        queryClient.setQueryData<IKanbanBoard>(
          kanbanQueryKeys.board(),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              columns: [...old.columns, optimisticColumn],
            };
          }
        );
      }

      // Optimistically update columns cache
      if (previousColumns) {
        queryClient.setQueryData<IKanbanColumn[]>(
          kanbanQueryKeys.columns(),
          (old) => {
            if (!old) return old;
            return [...old, optimisticColumn];
          }
        );
      }

      // Return context for rollback
      return { previousBoard, previousColumns };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          kanbanQueryKeys.board(),
          context.previousBoard
        );
      }
      if (context?.previousColumns) {
        queryClient.setQueryData(
          kanbanQueryKeys.columns(),
          context.previousColumns
        );
      }
    },
    // Replace optimistic data with real data from server
    onSuccess: (newColumn) => {
      queryClient.setQueryData<IKanbanBoard>(kanbanQueryKeys.board(), (old) => {
        if (!old) return old;
        return {
          ...old,
          columns: old.columns.map((col) =>
            col.id.startsWith('temp-') ? newColumn : col
          ),
        };
      });
      queryClient.setQueryData<IKanbanColumn[]>(
        kanbanQueryKeys.columns(),
        (old) => {
          if (!old) return old;
          return old.map((col) =>
            col.id.startsWith('temp-') ? newColumn : col
          );
        }
      );
    },
    // Refetch to ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.columns() });
    },
  });
};

/**
 * Update column mutation with optimistic updates
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
    // Optimistic update: Update UI immediately
    onMutate: async ({ columnId, request }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: kanbanQueryKeys.board() });
      await queryClient.cancelQueries({ queryKey: kanbanQueryKeys.columns() });

      // Snapshot previous values
      const previousBoard = queryClient.getQueryData<IKanbanBoard>(
        kanbanQueryKeys.board()
      );
      const previousColumns = queryClient.getQueryData<IKanbanColumn[]>(
        kanbanQueryKeys.columns()
      );

      // Optimistically update board cache
      if (previousBoard) {
        queryClient.setQueryData<IKanbanBoard>(
          kanbanQueryKeys.board(),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              columns: old.columns.map((col) => {
                if (col.id === columnId) {
                  // Handle clear mapping
                  if (request.clearLabelMapping) {
                    return {
                      ...col,
                      gmailLabelId: null,
                      gmailLabelName: null,
                      addLabelsOnMove: [],
                      removeLabelsOnMove: [],
                    };
                  }
                  // Update with new values
                  return {
                    ...col,
                    ...(request.name !== undefined && { name: request.name }),
                    ...(request.color !== undefined && {
                      color: request.color,
                    }),
                    ...(request.order !== undefined && {
                      order: request.order,
                    }),
                    ...(request.gmailLabelId !== undefined && {
                      gmailLabelId: request.gmailLabelId,
                    }),
                    ...(request.gmailLabelName !== undefined && {
                      gmailLabelName: request.gmailLabelName,
                    }),
                    ...(request.addLabelsOnMove !== undefined && {
                      addLabelsOnMove: request.addLabelsOnMove,
                    }),
                    ...(request.removeLabelsOnMove !== undefined && {
                      removeLabelsOnMove: request.removeLabelsOnMove,
                    }),
                  };
                }
                return col;
              }),
            };
          }
        );
      }

      // Optimistically update columns cache
      if (previousColumns) {
        queryClient.setQueryData<IKanbanColumn[]>(
          kanbanQueryKeys.columns(),
          (old) => {
            if (!old) return old;
            return old.map((col) => {
              if (col.id === columnId) {
                // Handle clear mapping
                if (request.clearLabelMapping) {
                  return {
                    ...col,
                    gmailLabelId: null,
                    gmailLabelName: null,
                    addLabelsOnMove: [],
                    removeLabelsOnMove: [],
                  };
                }
                // Update with new values
                return {
                  ...col,
                  ...(request.name !== undefined && { name: request.name }),
                  ...(request.color !== undefined && { color: request.color }),
                  ...(request.order !== undefined && { order: request.order }),
                  ...(request.gmailLabelId !== undefined && {
                    gmailLabelId: request.gmailLabelId,
                  }),
                  ...(request.gmailLabelName !== undefined && {
                    gmailLabelName: request.gmailLabelName,
                  }),
                  ...(request.addLabelsOnMove !== undefined && {
                    addLabelsOnMove: request.addLabelsOnMove,
                  }),
                  ...(request.removeLabelsOnMove !== undefined && {
                    removeLabelsOnMove: request.removeLabelsOnMove,
                  }),
                };
              }
              return col;
            });
          }
        );
      }

      // Return context with previous values for rollback
      return { previousBoard, previousColumns };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          kanbanQueryKeys.board(),
          context.previousBoard
        );
      }
      if (context?.previousColumns) {
        queryClient.setQueryData(
          kanbanQueryKeys.columns(),
          context.previousColumns
        );
      }
    },
    // Refetch to ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.columns() });
    },
  });
};

/**
 * Delete column mutation with optimistic updates
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
    // Optimistic update: Remove column immediately from UI
    onMutate: async (columnId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: kanbanQueryKeys.board() });
      await queryClient.cancelQueries({ queryKey: kanbanQueryKeys.columns() });

      // Snapshot previous values
      const previousBoard = queryClient.getQueryData<IKanbanBoard>(
        kanbanQueryKeys.board()
      );
      const previousColumns = queryClient.getQueryData<IKanbanColumn[]>(
        kanbanQueryKeys.columns()
      );

      // Optimistically remove column from board cache
      if (previousBoard) {
        queryClient.setQueryData<IKanbanBoard>(
          kanbanQueryKeys.board(),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              columns: old.columns.filter((col) => col.id !== columnId),
              // Remove emails from deleted column
              emailsByColumn: Object.fromEntries(
                Object.entries(old.emailsByColumn).filter(
                  ([key]) => key !== columnId
                )
              ),
            };
          }
        );
      }

      // Optimistically remove column from columns cache
      if (previousColumns) {
        queryClient.setQueryData<IKanbanColumn[]>(
          kanbanQueryKeys.columns(),
          (old) => {
            if (!old) return old;
            return old.filter((col) => col.id !== columnId);
          }
        );
      }

      // Return context for rollback
      return { previousBoard, previousColumns };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          kanbanQueryKeys.board(),
          context.previousBoard
        );
      }
      if (context?.previousColumns) {
        queryClient.setQueryData(
          kanbanQueryKeys.columns(),
          context.previousColumns
        );
      }
    },
    // Refetch to ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.board() });
      queryClient.invalidateQueries({ queryKey: kanbanQueryKeys.columns() });
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
