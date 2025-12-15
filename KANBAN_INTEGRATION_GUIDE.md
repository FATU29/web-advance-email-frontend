# 🎯 Kanban Board Integration - Step by Step Guide

## 📋 Current Status

The frontend already has a **partially implemented** Kanban board. This guide will help you complete the integration following the backend API documentation.

---

## 🔍 What's Already Implemented ✅

### 1. **Service Layer** (`services/kanban.service.ts`)

- ✅ KanbanService class with basic CRUD operations
- ✅ TypeScript interfaces for Kanban types
- ✅ API endpoints defined in `utils/constants/api.ts`

### 2. **React Query Hooks** (`hooks/use-kanban-mutations.ts`)

- ✅ `useKanbanBoardQuery` - Fetch board
- ✅ `useMoveEmailMutation` - Drag & drop
- ✅ `useSnoozeEmailKanbanMutation` - Snooze emails
- ✅ `useUnsnoozeEmailMutation` - Unsnooze emails
- ✅ `useGenerateSummaryMutation` - AI summary generation

### 3. **UI Components**

- ✅ `KanbanBoard` component with drag-and-drop (@dnd-kit)
- ✅ `KanbanColumn` component
- ✅ `KanbanCard` component
- ✅ Kanban page at `/mail/kanban`

### 4. **Features Working**

- ✅ Drag-and-drop email movement
- ✅ Email snooze/unsnooze
- ✅ AI summary generation
- ✅ Star/unstar emails
- ✅ Email detail view

---

## ❌ What's Missing (According to Backend Documentation)

### 1. **Gmail Sync Feature** 🔴 CRITICAL

The backend documentation emphasizes:

- Gmail sync endpoint: `POST /api/kanban/sync?maxEmails=50`
- Gmail status check: `GET /api/kanban/gmail-status`
- Board sync parameter: `GET /api/kanban/board?sync=true&maxEmails=50`
- **New emails from Gmail INBOX are automatically placed in BACKLOG column**

**Current Issue:** Frontend doesn't have sync functionality implemented.

### 2. **BACKLOG Column Support** 🔴 CRITICAL

Backend uses 6 column types:

- `INBOX`, `BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE`, `SNOOZED`

**Current Issue:** Frontend only has 5 columns (missing BACKLOG).

### 3. **Custom Columns Management** 🟡 OPTIONAL

Backend supports:

- Create custom column: `POST /api/kanban/columns`
- Update column: `PUT /api/kanban/columns/{columnId}`
- Delete column: `DELETE /api/kanban/columns/{columnId}`

**Current Issue:** Not implemented in frontend.

### 4. **Performance Optimization** 🟡 OPTIONAL

- Backend caches emails in database for fast loading
- `sync=false` for fast loads, `sync=true` to fetch new emails

---

## 🛠️ Step-by-Step Integration Plan

---

## **STEP 1: Add Missing TypeScript Types** ✅ Easy

### File: `frontend/services/kanban.service.ts`

**Add these interfaces:**

```typescript
// Add to existing interfaces section
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
```

**Update IKanbanColumn type to include BACKLOG:**

```typescript
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
    | 'CUSTOM'; // Added BACKLOG
  order: number;
  color: string;
  isDefault: boolean;
  emailCount: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## **STEP 2: Add Missing API Endpoints** ✅ Easy

### File: `frontend/utils/constants/api.ts`

**Update KANBAN_ENDPOINTS:**

```typescript
export const KANBAN_ENDPOINTS = {
  GET_BOARD: '/api/kanban/board',
  SYNC_GMAIL: '/api/kanban/sync', // ⬅️ ADD THIS
  GMAIL_STATUS: '/api/kanban/gmail-status', // ⬅️ ADD THIS
  GET_COLUMNS: '/api/kanban/columns',
  CREATE_COLUMN: '/api/kanban/columns', // ⬅️ ADD THIS
  UPDATE_COLUMN: (columnId: string) => `/api/kanban/columns/${columnId}`, // ⬅️ ADD THIS
  DELETE_COLUMN: (columnId: string) => `/api/kanban/columns/${columnId}`, // ⬅️ ADD THIS
  GET_EMAILS_IN_COLUMN: (columnId: string) =>
    `/api/kanban/columns/${columnId}/emails`,
  ADD_EMAIL: '/api/kanban/emails',
  GET_EMAIL_STATUS: (emailId: string) => `/api/kanban/emails/${emailId}`,
  MOVE_EMAIL: '/api/kanban/emails/move',
  REMOVE_EMAIL: (emailId: string) => `/api/kanban/emails/${emailId}`,
  SNOOZE_EMAIL: '/api/kanban/emails/snooze',
  UNSNOOZE_EMAIL: (emailId: string) => `/api/kanban/emails/${emailId}/unsnooze`,
  GENERATE_SUMMARY: (emailId: string) =>
    `/api/kanban/emails/${emailId}/summarize`,
} as const;
```

---

## **STEP 3: Add Service Methods for Sync & Columns** ⚙️ Medium

### File: `frontend/services/kanban.service.ts`

**Add these methods to KanbanService class:**

```typescript
class KanbanService {
  // ... existing methods ...

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
```

---

## **STEP 4: Add React Query Hooks for New Features** ⚙️ Medium

### File: `frontend/hooks/use-kanban-mutations.ts`

**Add these hooks at the end of the file:**

```typescript
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

  return useMutation({
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
```

---

## **STEP 5: Update Type Definitions** ✅ Easy

### File: `frontend/types/api.types.ts`

**Update KanbanStatus type:**

```typescript
export type KanbanStatus =
  | 'INBOX'
  | 'BACKLOG' // ⬅️ ADD THIS
  | 'TODO'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'SNOOZED';
```

---

## **STEP 6: Add BACKLOG Column to UI** 🎨 Easy

### File: `frontend/components/email/kanban-board.tsx`

**Update COLUMNS array:**

```typescript
const COLUMNS: Array<{ id: KanbanStatus; title: string }> = [
  { id: 'INBOX', title: 'INBOX' },
  { id: 'BACKLOG', title: 'BACKLOG' }, // ⬅️ ADD THIS
  { id: 'TODO', title: 'TO DO' },
  { id: 'IN_PROGRESS', title: 'IN PROGRESS' },
  { id: 'DONE', title: 'DONE' },
  { id: 'SNOOZED', title: 'SNOOZED' },
];
```

**Update emailsByStatus initialization:**

```typescript
const emailsByStatus = React.useMemo(() => {
  const grouped: Record<KanbanStatus, IEmailListItem[]> = {
    INBOX: [],
    BACKLOG: [], // ⬅️ ADD THIS
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
    SNOOZED: [],
  };

  emails.forEach((email) => {
    const status = email.kanbanStatus || 'INBOX';
    if (grouped[status]) {
      grouped[status].push(email);
    } else {
      grouped.INBOX.push(email); // Fallback to INBOX if status unknown
    }
  });

  return grouped;
}, [emails]);
```

---

## **STEP 7: Add Gmail Sync UI to Kanban Page** 🎨 Medium Priority

### File: `frontend/app/(routes)/mail/kanban/page.tsx`

**Add imports:**

```typescript
import {
  useGmailStatusQuery,
  useSyncGmailMutation,
} from '@/hooks/use-kanban-mutations';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
```

**Add state and queries:**

```typescript
export default function KanbanPage() {
  // ... existing code ...

  const [isSyncing, setIsSyncing] = React.useState(false);

  // Check Gmail connection status
  const { data: gmailStatus, isLoading: gmailStatusLoading } =
    useGmailStatusQuery({
      enabled: true,
      refetchOnWindowFocus: false,
    });

  // Sync mutation
  const syncGmailMutation = useSyncGmailMutation();

  // ... existing code ...

  const handleSyncGmail = async () => {
    setIsSyncing(true);
    try {
      const result = await syncGmailMutation.mutateAsync(50);
      toast.success(
        `Synced ${result.synced} emails (${result.skipped} already in Kanban)`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to sync Gmail'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // ... rest of component ...
}
```

**Add Sync Button to the UI (after the mobile check, before the main content):**

```tsx
{
  /* Gmail Sync Header - Only show on desktop */
}
{
  !isMobile && (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Kanban Board</h2>
        {gmailStatusLoading ? (
          <span className="text-sm text-muted-foreground">
            Checking Gmail...
          </span>
        ) : gmailStatus?.connected ? (
          <span className="text-sm text-green-600 flex items-center gap-2">
            ✓ Gmail Connected
          </span>
        ) : (
          <Alert variant="destructive" className="w-fit py-2 px-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Gmail not connected.{' '}
              <a
                href="/api/auth/google/authorize"
                className="underline font-medium"
              >
                Connect Gmail
              </a>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncGmail}
          disabled={isSyncing || !gmailStatus?.connected || kanbanLoading}
        >
          <RefreshCw
            className={cn('h-4 w-4 mr-2', isSyncing && 'animate-spin')}
          />
          {isSyncing ? 'Syncing...' : 'Sync Gmail'}
        </Button>

        <Button variant="ghost" size="sm" onClick={handleToggleView}>
          <List className="h-4 w-4 mr-2" />
          List View
        </Button>
      </div>
    </div>
  );
}
```

---

## **STEP 8: Update KanbanCard Component** 🎨 Optional

### File: `frontend/components/email/kanban-card.tsx`

**Update STATUS_OPTIONS to include BACKLOG:**

```typescript
const STATUS_OPTIONS: Array<{ value: KanbanStatus; label: string }> = [
  { value: 'INBOX', label: 'INBOX' },
  { value: 'BACKLOG', label: 'BACKLOG' }, // ⬅️ ADD THIS
  { value: 'TODO', label: 'TO DO' },
  { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
  { value: 'DONE', label: 'DONE' },
  { value: 'SNOOZED', label: 'SNOOZED' },
];
```

---

## **STEP 9: (Optional) Add Custom Column Management** 🎨 Advanced

Create a new component for managing custom columns:

### File: `frontend/components/email/column-manager.tsx`

```tsx
'use client';

import * as React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
} from '@/hooks/use-kanban-mutations';

export function ColumnManager() {
  const [open, setOpen] = React.useState(false);
  const [columnName, setColumnName] = React.useState('');
  const [columnColor, setColumnColor] = React.useState('#9C27B0');

  const createColumnMutation = useCreateColumnMutation();

  const handleCreate = async () => {
    if (!columnName.trim()) {
      toast.error('Column name is required');
      return;
    }

    try {
      await createColumnMutation.mutateAsync({
        name: columnName,
        color: columnColor,
      });
      toast.success('Column created successfully');
      setOpen(false);
      setColumnName('');
      setColumnColor('#9C27B0');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create column'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Column</DialogTitle>
          <DialogDescription>
            Add a new custom column to organize your emails.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Column Name</Label>
            <Input
              id="name"
              placeholder="e.g., Review, Important"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={columnColor}
              onChange={(e) => setColumnColor(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createColumnMutation.isPending}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Then add ColumnManager to kanban page:**

```tsx
import { ColumnManager } from '@/components/email/column-manager';

// In the sync header section:
<div className="flex items-center gap-2">
  <ColumnManager />  {/* ⬅️ ADD THIS */}
  <Button ... >Sync Gmail</Button>
  ...
</div>
```

---

## **STEP 10: Testing Checklist** ✅

### Manual Testing Steps:

1. **Gmail Connection**
   - [ ] Check if Gmail status badge shows correctly
   - [ ] Click "Connect Gmail" if not connected
   - [ ] Verify OAuth flow completes

2. **Gmail Sync**
   - [ ] Click "Sync Gmail" button
   - [ ] Verify toast shows sync result (X synced, Y skipped)
   - [ ] Check that new emails appear in BACKLOG column

3. **Drag & Drop**
   - [ ] Drag email from BACKLOG to TODO
   - [ ] Drag email from TODO to IN_PROGRESS
   - [ ] Drag email from IN_PROGRESS to DONE
   - [ ] Verify emails can't be dragged into SNOOZED (should use snooze button)

4. **Snooze/Unsnooze**
   - [ ] Click snooze button on an email
   - [ ] Set snooze time
   - [ ] Verify email moves to SNOOZED column
   - [ ] Wait for snooze to expire (or use unsnooze button)
   - [ ] Verify email returns to previous column

5. **AI Summary**
   - [ ] Click "Summarize" button on an email
   - [ ] Verify loading state shows
   - [ ] Verify summary appears in card

6. **Column Management** (if implemented)
   - [ ] Click "Add Column"
   - [ ] Create custom column
   - [ ] Verify it appears on board
   - [ ] Drag emails into custom column
   - [ ] Delete custom column
   - [ ] Verify emails move to BACKLOG

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      KANBAN PAGE                            │
│  /app/(routes)/mail/kanban/page.tsx                        │
└──────────────┬─────────────────────────────────┬────────────┘
               │                                 │
               │ useKanbanBoardQuery()          │ useSyncGmailMutation()
               │ useGmailStatusQuery()          │ useMoveEmailMutation()
               │                                 │
               ▼                                 ▼
┌──────────────────────────────┐   ┌────────────────────────────┐
│  REACT QUERY HOOKS           │   │   KANBAN BOARD COMPONENT   │
│  use-kanban-mutations.ts     │   │   kanban-board.tsx         │
└────────────┬─────────────────┘   └──────────┬─────────────────┘
             │                                 │
             │ KanbanService.getBoard()       │ KanbanColumn
             │ KanbanService.syncGmail()      │ KanbanCard (@dnd-kit)
             │                                 │
             ▼                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                  KANBAN SERVICE                              │
│  services/kanban.service.ts                                 │
│  - getBoard(), getBoardWithSync()                           │
│  - syncGmail(), getGmailStatus()                            │
│  - moveEmail(), snoozeEmail()                               │
│  - createColumn(), updateColumn(), deleteColumn()           │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ axiosBI (with JWT token)
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│  - GET  /api/kanban/board?sync=true&maxEmails=50           │
│  - POST /api/kanban/sync?maxEmails=50                       │
│  - GET  /api/kanban/gmail-status                           │
│  - POST /api/kanban/emails/move                             │
│  - POST /api/kanban/emails/snooze                           │
│  - POST /api/kanban/emails/{id}/summarize                   │
│  - POST/PUT/DELETE /api/kanban/columns                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Priority Summary

### 🔴 **CRITICAL (Must Have)**

1. ✅ Add BACKLOG column type to TypeScript definitions
2. ✅ Add BACKLOG to UI columns
3. ✅ Implement Gmail sync button
4. ✅ Implement Gmail status check

### 🟡 **IMPORTANT (Should Have)**

5. ✅ Add sync parameter to board query
6. ✅ Add loading states for sync
7. ✅ Add error handling for sync failures

### 🟢 **NICE TO HAVE (Could Have)**

8. ⬜ Custom column management UI
9. ⬜ Column reordering
10. ⬜ Bulk operations on emails

---

## 🚀 Quick Start Commands

### 1. **Start Frontend Dev Server**

```bash
cd frontend
npm run dev
```

### 2. **Verify Backend is Running**

```bash
# Backend should be running on http://localhost:8080
curl http://localhost:8080/api/health
```

### 3. **Test Gmail Sync**

```bash
# After logging in, test sync endpoint directly
curl -X POST http://localhost:8080/api/kanban/sync?maxEmails=10 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: "Gmail not connected"

**Solution:**

1. Go to backend `GMAIL_API_SETUP.md`
2. Follow OAuth setup instructions
3. Restart backend server
4. Login again in frontend

### Issue: "Sync returns 0 emails"

**Solution:**

1. Check if Gmail inbox has emails
2. Verify Gmail API scopes are correct
3. Check backend logs for errors
4. Verify database connection

### Issue: "Emails not appearing in BACKLOG"

**Solution:**

1. Check backend column creation on user signup
2. Verify BACKLOG column exists in database
3. Check backend sync logic places emails in BACKLOG by default

### Issue: "Drag-and-drop not working"

**Solution:**

1. Verify `@dnd-kit` packages are installed
2. Check browser console for errors
3. Ensure `isMounted` state is true
4. Check if `moveEmail` mutation is working

---

## 📝 Notes

- **First Load Behavior:** According to documentation, first board load should auto-sync from Gmail if no cached emails exist.
- **Performance:** Use `sync=false` for normal loads (fast, uses cache). Use `sync=true` only when user clicks "Sync Gmail" button.
- **BACKLOG Column:** This is the default entry point for all new Gmail emails. Users drag emails from BACKLOG to other columns.
- **Snooze:** Backend has a scheduler that checks every 60 seconds for expired snoozes. Frontend also has a client-side check every 60 seconds.

---

## ✅ Completion Checklist

Once you complete all steps, verify:

- [ ] BACKLOG column visible in Kanban board
- [ ] Sync Gmail button works and shows results
- [ ] Gmail status badge shows connection state
- [ ] New emails from Gmail appear in BACKLOG
- [ ] Can drag emails between all 6 columns (INBOX, BACKLOG, TODO, IN_PROGRESS, DONE, SNOOZED)
- [ ] Snooze button moves emails to SNOOZED
- [ ] Expired snoozes auto-restore to previous column
- [ ] AI summary generation works
- [ ] Star/unstar works
- [ ] Mobile view shows appropriate message
- [ ] No console errors
- [ ] All TypeScript types are correct

---

## 🎉 Next Steps

After completing basic integration:

1. **Add tests** for Kanban mutations
2. **Add loading skeletons** for better UX
3. **Implement optimistic updates** for drag-and-drop
4. **Add keyboard shortcuts** (e.g., pressing 'S' to snooze)
5. **Add bulk operations** (select multiple emails, move all at once)
6. **Add filters** (show only unread, starred, etc.)
7. **Add search** in Kanban board
8. **Add email preview** on hover

---

## 📚 References

- Backend API Documentation: `ADDITIONAL_REQUIREMENT_FRONTEND_INTEGRATION.md`
- Gmail API Setup: `backend/GMAIL_API_SETUP.md`
- @dnd-kit Documentation: https://docs.dndkit.com/
- React Query Documentation: https://tanstack.com/query/latest

---

**Good luck with your integration! 🚀**
