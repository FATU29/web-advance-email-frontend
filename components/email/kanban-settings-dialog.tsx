'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Save, X, Mail, GripVertical } from 'lucide-react';
import { IKanbanColumn, IGmailLabel } from '@/services/kanban.service';
import {
  useKanbanColumnsQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
} from '@/hooks/use-kanban-mutations';
import { useGmailStatusQuery } from '@/hooks/use-kanban-mutations';
import KanbanService from '@/services/kanban.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export interface KanbanSettingsDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KanbanSettingsDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: KanbanSettingsDialogProps) {
  //Init state hook
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [editingColumnId, setEditingColumnId] = React.useState<string | null>(
    null
  );
  const [newColumnName, setNewColumnName] = React.useState('');
  const [editingColumnName, setEditingColumnName] = React.useState('');
  const [selectedColumnForLabelMapping, setSelectedColumnForLabelMapping] =
    React.useState<string | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? controlledOnOpenChange ||
      function () {
        return;
      }
    : setInternalOpen;

  // Query client for manual refetch
  const queryClient = useQueryClient();

  // Fetch columns
  const { data: columns = [], refetch: refetchColumns } =
    useKanbanColumnsQuery();

  // Fetch Gmail status
  const { data: gmailStatus } = useGmailStatusQuery();

  // Fetch Gmail labels
  const {
    data: gmailLabels = [],
    isLoading: isLoadingLabels,
    error: labelsError,
  } = useQuery<IGmailLabel[], AxiosError>({
    queryKey: ['gmail-labels'],
    queryFn: async () => {
      const response = await KanbanService.getGmailLabels();
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to fetch Gmail labels');
    },
    enabled: open && !!gmailStatus?.connected,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Mutations
  const createColumnMutation = useCreateColumnMutation();
  const updateColumnMutation = useUpdateColumnMutation();
  const deleteColumnMutation = useDeleteColumnMutation();

  //Init event handle
  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) {
      toast.error('Column name is required');
      return;
    }

    try {
      await createColumnMutation.mutateAsync({
        name: newColumnName.trim(),
        color: '#6366f1', // Default color
      });
      toast.success('Column created successfully');
      setNewColumnName('');
      // Force refetch to ensure UI updates immediately
      await refetchColumns();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create column'
      );
    }
  };

  const handleStartEdit = (column: IKanbanColumn) => {
    setEditingColumnId(column.id);
    setEditingColumnName(column.name);
  };

  const handleSaveEdit = async (columnId: string) => {
    if (!editingColumnName.trim()) {
      toast.error('Column name is required');
      return;
    }

    try {
      await updateColumnMutation.mutateAsync({
        columnId,
        request: {
          name: editingColumnName.trim(),
        },
      });
      toast.success('Column updated successfully');
      setEditingColumnId(null);
      setEditingColumnName('');
      // Force refetch to ensure UI updates immediately
      await refetchColumns();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update column'
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingColumnId(null);
    setEditingColumnName('');
  };

  const handleDeleteColumn = async (column: IKanbanColumn) => {
    if (column.isDefault) {
      toast.error('Cannot delete default columns');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${column.name}"? All emails in this column will be moved to Backlog.`
      )
    ) {
      return;
    }

    try {
      await deleteColumnMutation.mutateAsync(column.id);
      toast.success('Column deleted successfully');
      // Force refetch to ensure UI updates immediately
      await refetchColumns();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete column'
      );
    }
  };

  const handleSaveLabelMapping = async (
    columnId: string,
    mapping: {
      gmailLabelId: string | null;
      gmailLabelName: string | null;
      addLabelsOnMove: string[];
      removeLabelsOnMove: string[];
    }
  ) => {
    try {
      await updateColumnMutation.mutateAsync({
        columnId,
        request: mapping,
      });
      toast.success('Label mapping saved successfully');
      setSelectedColumnForLabelMapping(null);
      // Force refetch to ensure UI updates immediately
      await refetchColumns();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save label mapping'
      );
    }
  };

  const handleClearLabelMapping = async (columnId: string) => {
    try {
      await updateColumnMutation.mutateAsync({
        columnId,
        request: {
          clearLabelMapping: true,
        },
      });
      toast.success('Label mapping cleared');
      setSelectedColumnForLabelMapping(null);
      // Force refetch to ensure UI updates immediately
      await refetchColumns();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to clear label mapping'
      );
    }
  };

  // Sort columns by order
  const sortedColumns = React.useMemo(() => {
    return [...columns].sort((a, b) => a.order - b.order);
  }, [columns]);

  // Group Gmail labels
  const systemLabels = React.useMemo(() => {
    return gmailLabels.filter((label) => label.type === 'system');
  }, [gmailLabels]);

  const userLabels = React.useMemo(() => {
    return gmailLabels.filter((label) => label.type === 'user');
  }, [gmailLabels]);

  //Render
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-5xl max-h-[95vh] h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Kanban Board Settings</DialogTitle>
          <DialogDescription>
            Manage your Kanban columns and configure Gmail label mappings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6">
            <div className="space-y-6 py-4 pr-4">
              {/* Create New Column */}
              <div className="space-y-3 p-4 bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-dashed border-primary/30">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold text-primary">
                    Create New Column
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter column name (e.g., 'Urgent', 'Follow Up')..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateColumn();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateColumn}
                    disabled={
                      !newColumnName.trim() || createColumnMutation.isPending
                    }
                    className="gap-2 px-6"
                  >
                    {createColumnMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 Tip: You can map columns to Gmail labels for automatic
                  syncing
                </p>
              </div>

              <Separator />

              {/* Manage Columns */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <Label className="text-base font-bold">
                      Manage Columns
                    </Label>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <span className="font-semibold">
                      {sortedColumns.length}
                    </span>
                    <span className="text-xs">columns</span>
                  </Badge>
                </div>

                <div className="space-y-3">
                  {sortedColumns.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No columns yet</p>
                      <p className="text-xs mt-1">
                        Create your first column above to get started
                      </p>
                    </div>
                  ) : (
                    sortedColumns.map((column) => (
                      <div
                        key={column.id}
                        className="border-2 rounded-lg p-4 space-y-3 hover:border-primary/50 hover:shadow-md transition-all bg-card"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            {editingColumnId === column.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editingColumnName}
                                  onChange={(e) =>
                                    setEditingColumnName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEdit(column.id);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEdit();
                                    }
                                  }}
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(column.id)}
                                  disabled={updateColumnMutation.isPending}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 flex-1">
                                  <div
                                    className="w-4 h-4 rounded-full shadow-sm border-2 border-background"
                                    style={{ backgroundColor: column.color }}
                                    title={`Color: ${column.color}`}
                                  />
                                  <span className="font-semibold text-base">
                                    {column.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {column.isDefault && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs gap-1"
                                    >
                                      <span>🔒</span>
                                      Default
                                    </Badge>
                                  )}
                                  {column.type === 'CUSTOM' && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs gap-1"
                                    >
                                      <span>✨</span>
                                      Custom
                                    </Badge>
                                  )}
                                  {column.gmailLabelName && (
                                    <Badge className="text-xs gap-1 bg-blue-500">
                                      <Mail className="h-3 w-3" />
                                      Synced
                                    </Badge>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          {editingColumnId !== column.id && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStartEdit(column)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              {!column.isDefault && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteColumn(column)}
                                  disabled={deleteColumnMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Gmail Label Mapping */}
                        {gmailStatus?.connected && (
                          <div className="pl-7 space-y-2">
                            {selectedColumnForLabelMapping === column.id ? (
                              isLoadingLabels ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                  <span>Loading Gmail labels...</span>
                                </div>
                              ) : labelsError ? (
                                <div className="flex flex-col gap-2 text-sm p-3 bg-destructive/10 rounded-md">
                                  <span className="text-destructive">
                                    Failed to load Gmail labels
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setSelectedColumnForLabelMapping(null)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : gmailLabels.length === 0 ? (
                                <div className="flex flex-col gap-2 text-sm p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-900">
                                  <span className="text-yellow-800 dark:text-yellow-200">
                                    No Gmail labels found. Create some labels in
                                    Gmail first.
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setSelectedColumnForLabelMapping(null)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <ColumnLabelMappingForm
                                  column={column}
                                  gmailLabels={gmailLabels}
                                  systemLabels={systemLabels}
                                  userLabels={userLabels}
                                  onSave={(mapping) =>
                                    handleSaveLabelMapping(column.id, mapping)
                                  }
                                  onClear={() =>
                                    handleClearLabelMapping(column.id)
                                  }
                                  onCancel={() =>
                                    setSelectedColumnForLabelMapping(null)
                                  }
                                  isSaving={updateColumnMutation.isPending}
                                />
                              )
                            ) : (
                              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-3 text-sm">
                                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                                    <Mail className="h-4 w-4" />
                                  </div>
                                  <div>
                                    {column.gmailLabelName ? (
                                      <>
                                        <div className="font-medium flex items-center gap-2">
                                          <span>Gmail Label:</span>
                                          <Badge
                                            variant="secondary"
                                            className="gap-1"
                                          >
                                            {column.gmailLabelName}
                                          </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                          Automatically syncs with Gmail
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="font-medium text-muted-foreground">
                                          No Gmail label mapping
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                          Configure label sync for automatic
                                          updates
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={
                                    column.gmailLabelId ? 'outline' : 'default'
                                  }
                                  onClick={() =>
                                    setSelectedColumnForLabelMapping(column.id)
                                  }
                                  className="gap-2 shrink-0"
                                >
                                  {column.gmailLabelId ? (
                                    <>
                                      <Edit2 className="h-3.5 w-3.5" />
                                      Edit
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-3.5 w-3.5" />
                                      Add Mapping
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {!gmailStatus?.connected && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Gmail is not connected. Connect Gmail to enable label
                    mapping.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ColumnLabelMappingFormProps {
  column: IKanbanColumn;
  gmailLabels: IGmailLabel[];
  systemLabels: IGmailLabel[];
  userLabels: IGmailLabel[];
  onSave: (mapping: {
    gmailLabelId: string | null;
    gmailLabelName: string | null;
    addLabelsOnMove: string[];
    removeLabelsOnMove: string[];
  }) => void;
  onClear: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

function ColumnLabelMappingForm({
  column,
  gmailLabels,
  systemLabels,
  userLabels,
  onSave,
  onClear,
  onCancel,
  isSaving,
}: ColumnLabelMappingFormProps) {
  //Init state hook
  const [primaryLabelId, setPrimaryLabelId] = React.useState<string>(
    column.gmailLabelId || '__none__'
  );
  const [addLabels, setAddLabels] = React.useState<string[]>(
    column.addLabelsOnMove || []
  );
  const [removeLabels, setRemoveLabels] = React.useState<string[]>(
    column.removeLabelsOnMove || []
  );

  // Safety check - should not happen with loading state, but just in case
  if (!gmailLabels || gmailLabels.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
        No Gmail labels available
      </div>
    );
  }

  //Init event handle
  const handleSave = () => {
    const selectedLabel = gmailLabels.find((l) => l.id === primaryLabelId);
    onSave({
      gmailLabelId:
        primaryLabelId && primaryLabelId !== '__none__' ? primaryLabelId : null,
      gmailLabelName: selectedLabel?.name || null,
      addLabelsOnMove: addLabels.filter((id) => id !== primaryLabelId), // Don't duplicate primary label
      removeLabelsOnMove: removeLabels,
    });
  };

  const toggleLabel = (
    labelId: string,
    currentList: string[],
    setter: (labels: string[]) => void
  ) => {
    if (currentList.includes(labelId)) {
      setter(currentList.filter((id) => id !== labelId));
    } else {
      setter([...currentList, labelId]);
    }
  };

  //Render
  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Primary Gmail Label</Label>
        <Select value={primaryLabelId} onValueChange={setPrimaryLabelId}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select a label..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="__none__">-- No label --</SelectItem>
            {userLabels.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground pointer-events-none">
                  Your Labels
                </div>
                {userLabels.map((label) => (
                  <SelectItem key={label.id} value={label.id}>
                    {label.name}
                  </SelectItem>
                ))}
              </>
            )}
            {systemLabels.length > 0 && (
              <>
                {userLabels.length > 0 && (
                  <div className="h-px bg-border my-1" />
                )}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground pointer-events-none">
                  System Labels
                </div>
                {systemLabels.map((label) => (
                  <SelectItem key={label.id} value={label.id}>
                    {label.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This label will be added when emails are moved to this column.
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Additional Labels to Add
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          Click labels to add them when emails move here (besides the primary
          label).
        </p>
        <ScrollArea className="h-[120px] w-full rounded-md border p-3 bg-background">
          <div className="flex flex-wrap gap-1.5">
            {gmailLabels
              .filter((label) => label.id !== primaryLabelId) // Exclude primary label
              .map((label) => (
                <Badge
                  key={label.id}
                  variant={addLabels.includes(label.id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors hover:bg-accent text-xs"
                  onClick={() => toggleLabel(label.id, addLabels, setAddLabels)}
                >
                  {label.name}
                </Badge>
              ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Labels to Remove</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Click labels to remove them. Common: INBOX to archive, UNREAD to mark
          as read.
        </p>
        <ScrollArea className="h-[120px] w-full rounded-md border p-3 bg-background">
          <div className="flex flex-wrap gap-1.5">
            {gmailLabels.map((label) => (
              <Badge
                key={label.id}
                variant={
                  removeLabels.includes(label.id) ? 'destructive' : 'outline'
                }
                className="cursor-pointer transition-colors hover:bg-destructive/10 text-xs"
                onClick={() =>
                  toggleLabel(label.id, removeLabels, setRemoveLabels)
                }
              >
                {label.name}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? 'Saving...' : 'Save Mapping'}
        </Button>
        {column.gmailLabelId && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClear}
            disabled={isSaving}
          >
            Clear
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
