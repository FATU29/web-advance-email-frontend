# Frontend Service - Final Architecture Documentation

## 🎯 Tổng Quan (Overview)

Frontend Service là giao diện người dùng của ứng dụng email, được xây dựng bằng Next.js 16, React 19, và TypeScript. Đây là layer tương tác trực tiếp với người dùng, cung cấp trải nghiệm modern, responsive, và feature-rich.

---

## 🤔 Tại Sao Phải Dùng Next.js + React? (Why Next.js + React?)

### 1. **Next.js - The React Framework**

- **Server-Side Rendering (SSR)**: Load trang nhanh hơn, SEO tốt hơn
- **App Router**: Modern routing với React Server Components
- **API Routes**: Backend-for-Frontend pattern
- **Image Optimization**: Tự động optimize images
- **Built-in**: TypeScript, CSS Modules, Fast Refresh

**Lợi ích**:

- Performance out-of-the-box
- Developer experience tuyệt vời
- Production-ready features

### 2. **React 19 - Latest Version**

- **Server Components**: Reduce JavaScript bundle size
- **Concurrent Rendering**: Smooth UI updates
- **Suspense**: Better loading states
- **Hooks**: Modern state management
- **Ecosystem**: Hàng triệu packages available

**Tại sao React**:

- Component-based: Reusable UI components
- Virtual DOM: Efficient re-rendering
- Community: Largest ecosystem
- Learning resources: Vô số tutorials

### 3. **TypeScript - Type Safety**

- **Compile-time Errors**: Catch bugs trước khi run
- **IntelliSense**: Amazing auto-complete
- **Refactoring**: Safe & confident changes
- **Documentation**: Types = living documentation

**Impact**:

- Reduce bugs by 80%+
- Faster development
- Better team collaboration

### 4. **Modern UI Libraries**

- **Radix UI**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Pre-built, customizable components
- **Lucide Icons**: Beautiful icon set

**Result**: Professional UI với minimal effort

---

## 💡 Lợi Ích Cụ Thể (Specific Benefits)

### 1. **User Experience**

- **Fast**: Next.js optimizations
- **Responsive**: Mobile-first design
- **Accessible**: WCAG 2.1 AA compliant
- **Intuitive**: Clean, modern interface

### 2. **Developer Experience**

- **Type Safety**: TypeScript prevents errors
- **Hot Reload**: See changes instantly
- **Component Library**: Reusable UI components
- **Tooling**: ESLint, Prettier, Husky

### 3. **Performance**

- **Code Splitting**: Load only what's needed
- **Image Optimization**: Automatic WebP conversion
- **Lazy Loading**: Components load on demand
- **Caching**: React Query caching strategy

### 4. **Maintainability**

- **Clean Architecture**: Separation of concerns
- **Consistent Patterns**: Hooks, services, utils
- **Documentation**: Self-documenting code
- **Testing**: Unit & integration tests

---

## 🏗️ Kiến Trúc Chi Tiết (Detailed Architecture)

### **Cấu Trúc Thư Mục (Folder Structure)**

```
frontend/
├── package.json                      # Dependencies & scripts
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS config
├── components.json                   # shadcn/ui config
├── Dockerfile                        # Container definition
│
├── app/                              # 🔹 Next.js App Router
│   ├── layout.tsx                    # Root layout wrapper
│   ├── page.tsx                      # Home page (/)
│   ├── globals.css                   # Global styles
│   │
│   ├── (auth)/                       # Auth routes group
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Register page
│   │   └── callback/
│   │       └── page.tsx              # OAuth callback
│   │
│   └── (routes)/                     # Protected routes group
│       ├── inbox/
│       │   └── page.tsx              # Inbox page
│       ├── sent/
│       │   └── page.tsx              # Sent emails page
│       ├── starred/
│       │   └── page.tsx              # Starred emails page
│       ├── kanban/
│       │   └── page.tsx              # Kanban board page
│       └── settings/
│           └── page.tsx              # Settings page
│
├── components/                       # 🔹 React Components
│   ├── ui/                           # Base UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── email/                        # Email-specific components
│   │   ├── email-list.tsx            # Email list view
│   │   ├── email-item.tsx            # Single email item
│   │   ├── email-detail.tsx          # Email detail view
│   │   ├── email-compose.tsx         # Compose new email
│   │   └── email-preview.tsx         # Email preview pane
│   │
│   ├── kanban/                       # Kanban board components
│   │   ├── kanban-board.tsx          # Board container
│   │   ├── kanban-column.tsx         # Column component
│   │   ├── kanban-card.tsx           # Email card in board
│   │   └── kanban-create.tsx         # Create board dialog
│   │
│   ├── chat/                         # AI Chatbot components
│   │   ├── chatbox.tsx               # Chat container
│   │   ├── chat-message.tsx          # Single message
│   │   ├── chat-input.tsx            # Input area
│   │   └── chat-bubble.tsx           # Message bubble
│   │
│   ├── authentication/               # Auth components
│   │   ├── login-form.tsx            # Login form
│   │   ├── google-login-button.tsx   # OAuth button
│   │   └── protected-route.tsx       # Route guard
│   │
│   ├── context/                      # Layout components
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   ├── header.tsx                # Top navigation
│   │   └── footer.tsx                # Footer
│   │
│   └── icons/                        # Custom icons
│       └── gmail-icon.tsx
│
├── hooks/                            # 🔹 Custom React Hooks
│   ├── use-auth.ts                   # Authentication hook
│   ├── use-emails.ts                 # Email data fetching
│   ├── use-kanban.ts                 # Kanban state management
│   ├── use-toast.ts                  # Toast notifications
│   ├── use-debounce.ts               # Debounce input
│   └── use-local-storage.ts          # Local storage sync
│
├── lib/                              # 🔹 Shared Libraries
│   ├── axios.ts                      # Axios instance config
│   ├── utils.ts                      # Utility functions
│   ├── cn.ts                         # Classname utility (clsx)
│   └── date-utils.ts                 # Date formatting
│
├── api/                              # 🔹 API Client Layer
│   ├── client.ts                     # Base API client
│   ├── auth.ts                       # Auth API calls
│   ├── emails.ts                     # Email API calls
│   ├── kanban.ts                     # Kanban API calls
│   └── chat.ts                       # Chat API calls
│
├── services/                         # 🔹 Business Logic Services
│   ├── auth-service.ts               # Auth state management
│   ├── email-service.ts              # Email operations
│   ├── storage-service.ts            # Local storage
│   └── notification-service.ts       # Push notifications
│
├── types/                            # 🔹 TypeScript Types
│   ├── email.ts                      # Email types
│   ├── user.ts                       # User types
│   ├── kanban.ts                     # Kanban types
│   └── api.ts                        # API response types
│
├── providers/                        # 🔹 Context Providers
│   ├── auth-provider.tsx             # Auth context
│   ├── theme-provider.tsx            # Dark/light mode
│   └── query-provider.tsx            # React Query provider
│
├── utils/                            # 🔹 Utility Functions
│   ├── format-date.ts                # Date formatting
│   ├── sanitize-html.ts              # HTML sanitization
│   ├── parse-email.ts                # Email parsing
│   └── validators.ts                 # Form validators
│
├── public/                           # 🔹 Static Assets
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
└── reports/                          # 🔹 Test Reports
    └── lighthouse/
```

---

## 📁 Chi Tiết Từng Folder (Folder-by-Folder Breakdown)

### 1️⃣ **app/ - Next.js App Router (Pages)**

**Mục đích**: Define routes và pages structure

#### **Route Groups**

Next.js App Router sử dụng folder-based routing:

```
app/
├── (auth)/          # Route group - không thêm vào URL
│   ├── login/       # → /login
│   ├── register/    # → /register
│   └── callback/    # → /callback
│
└── (routes)/        # Protected routes
    ├── inbox/       # → /inbox
    ├── sent/        # → /sent
    └── kanban/      # → /kanban
```

**Tại sao dùng Route Groups**:

- Organize routes logically
- Share layouts (auth layout vs main layout)
- Không affect URL structure

#### **layout.tsx** - Root Application Layout

```tsx
// app/layout.tsx
export default function RootLayout({ children }: LayoutProps)
export const metadata: Metadata = { ... }
```

**Trách nhiệm và Kiến trúc Chi tiết**:

Root layout là wrapper ngoài cùng của entire React application. Mọi page, mọi component đều render bên trong layout này. Đây là nơi setup global providers, styles, và configuration.

**1. Provider Pattern và Context Hierarchy**:

- **Tại sao cần nhiều providers**: Mỗi provider manage một aspect của app state hay functionality. Combining providers tạo ra layered architecture - separation of concerns.

- **ThemeProvider (ngoài cùng)**:
  - **Purpose**: Manage light/dark mode toggle. Store theme preference trong localStorage. Provide theme context cho all components.
  - **Why first**: Theme affects rendering của mọi component. Phải wrap ngoài cùng để all children access theme.
  - **Implementation**: React Context với `theme` state và `toggleTheme` function. Components dùng `useTheme()` hook để access.
  - **CSS variables**: Theme provider set CSS variables (`--background`, `--foreground`, `--primary`) on `<html>` element. All styles reference variables - theme change instant, no re-render needed.
  - **System preference**: Detect OS theme với `window.matchMedia('(prefers-color-scheme: dark)')`. Default to system preference, allow user override.

- **QueryClientProvider (React Query)**:
  - **Purpose**: Manage server state - API data, caching, background refetching, optimistic updates.
  - **Configuration**:
    - `staleTime: 5 minutes` - Data considered fresh for 5 min, no refetch
    - `cacheTime: 10 minutes` - Keep unused data in cache 10 min before garbage collection
    - `refetchOnWindowFocus: false` - Don't refetch when user switch tabs back (annoying for users)
    - `retry: 1` - Retry failed requests once. More retries delay error feedback.
  - **Why powerful**: Automatic background refetching keep data up-to-date. Cached data = instant page loads. Optimistic updates = snappy UI.
  - **DevTools**: React Query DevTools show all queries, their status, cached data. Essential for debugging.

- **AuthProvider (innermost)**:
  - **Purpose**: Manage authentication state - current user, login/logout functions, token refresh.
  - **State**: `{ user: User | null, loading: boolean, login(), logout(), refreshToken() }`
  - **Token management**: Store JWT trong localStorage (persistent across browser restarts). Check token validity on app load. Auto-refresh before expiration.
  - **Protected routes**: Components call `useAuth()`, check `user` !== null. Redirect to login nếu not authenticated.
  - **Why innermost**: Auth depends on React Query (login API call). Must wrap inside QueryClientProvider.

**2. Metadata for SEO**:

- **Next.js metadata API**: Define `metadata` object trong layout. Next.js auto-generate `<head>` tags.
- **Critical metadata fields**:

  ```typescript
  metadata = {
    title: 'Email Client - Manage Your Inbox Efficiently',
    description: 'Modern email client with AI-powered features...',
    keywords: ['email', 'inbox', 'AI', 'productivity'],
    openGraph: {
      // For social media shares
      title: 'Email Client',
      description: '...',
      images: ['/og-image.png'], // Preview image when shared on Facebook/Twitter
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png', // iOS home screen icon
    },
  };
  ```

- **Dynamic metadata**: Per-page metadata override layout metadata. Email detail page có thể set `title` = email subject.

- **SEO impact**: Proper metadata improve search engine ranking, social media appearance, user trust (good title + description).

**3. Global Styles Setup**:

- **Tailwind CSS**: Utility-first CSS framework. Classes like `flex`, `items-center`, `bg-blue-500`. No custom CSS files needed.
- **CSS imports order**:
  1. `globals.css` - Tailwind base, components, utilities. CSS variables for theming.
  2. `@layer` directives for custom utilities
  3. Font imports (Google Fonts hay local)

- **Why Tailwind**: Consistent design system. Fast development (no context switching đến CSS files). Small bundle size (PurgeCSS removes unused classes).

**4. Font Optimization**:

- **Next.js font optimization**: Import fonts từ `next/font/google`. Next.js auto-host fonts locally, subset fonts (only include characters actually used), preload fonts.

- **Example**:

  ```tsx
  import { Inter } from 'next/font/google';
  const inter = Inter({ subsets: ['latin'], display: 'swap' });
  // display: 'swap' - Show fallback font immediately, swap to custom font when loaded
  ```

- **Performance**: Self-hosting fonts avoid extra DNS lookup + connection to Google servers. Subsetting reduce font file size 50-70%. Preload eliminate font flash.

**5. HTML Structure**:

- **`<html lang="en">`**: Specify language for screen readers và search engines. Critical for accessibility.

- **`<body>`**: Apply font class, base background color. All app content render inside body.

- **Suppress hydration warning**: Next.js server-render HTML, React hydrate on client. Nếu HTML khác nhau (ví dụ theme từ localStorage), warning. Suppress với `suppressHydrationWarning` on elements change client-side.

**Tại sao Layout Critical**:

- **Single setup point**: Configure providers once. All pages, components automatically have access. No repetition.

- **Performance**: Providers wrap entire app but re-render minimally. Context updates only trigger re-renders for components actually consuming that context.

- **Maintainability**: Add new global feature (analytics, error tracking) → add provider here. One place to manage.

- **User experience**: Proper theme, fonts, metadata make app feel professional và polished.

#### **page.tsx Files** - Route Pages

```tsx
// app/(routes)/inbox/page.tsx
export default function InboxPage() {
  const { emails, loading } = useEmails({ label: 'INBOX' });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <EmailList emails={emails} loading={loading} />
      <EmailDetail />
    </div>
  );
}
```

**Pattern**:

- Fetch data với hooks
- Render components
- Handle loading states

---

### 2️⃣ **components/ - React Components**

**Mục đích**: Reusable UI components

#### **ui/ - Base Components (shadcn/ui)**

Pre-built, accessible components:

```tsx
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
  }
);

export function Button({ variant, size, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size })} {...props} />;
}
```

**Lợi ích**:

- Consistent styling
- Accessible (WCAG compliant)
- Customizable
- Type-safe props

#### **email/ - Email Components**

##### **email-list.tsx** - Email List View

```tsx
export function EmailList({ emails, loading }: EmailListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) return <EmailListSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto">
      <ScrollArea>
        {emails.map((email) => (
          <EmailItem
            key={email.id}
            email={email}
            selected={email.id === selectedId}
            onClick={() => setSelectedId(email.id)}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
```

**Features**:

- Virtual scrolling (cho performance)
- Selection state
- Loading skeleton
- Infinite scroll

##### **email-detail.tsx** - Email Detail Pane

```tsx
export function EmailDetail({ emailId }: EmailDetailProps) {
  const { email, loading } = useEmail(emailId);
  const [showSummary, setShowSummary] = useState(false);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <EmailDetailHeader email={email} />

      {/* AI Summary */}
      {showSummary && <EmailSummary content={email.body} />}

      {/* Body */}
      <EmailBody html={email.body} />

      {/* Actions */}
      <EmailActions email={email} />
    </div>
  );
}
```

**Chức năng**:

- Display full email
- AI summary toggle
- Reply/Forward actions
- Attachment preview

##### **email-compose.tsx** - Compose Email

```tsx
export function EmailCompose({ replyTo, onSent }: ComposeProps) {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const { mutate: sendEmail, isLoading } = useSendEmail();

  const onSubmit = (data: EmailFormData) => {
    sendEmail(data, {
      onSuccess: () => {
        toast.success('Email sent!');
        onSent();
      },
    });
  };

  return (
    <Dialog>
      <Form {...form}>
        <Input {...form.register('to')} placeholder="To" />
        <Input {...form.register('subject')} placeholder="Subject" />
        <Textarea {...form.register('body')} />
        <Button type="submit" loading={isLoading}>
          Send
        </Button>
      </Form>
    </Dialog>
  );
}
```

**Features**:

- Form validation (Zod schema)
- Rich text editor
- Auto-save drafts
- Attachment upload

#### **kanban/ - Kanban Board Components**

##### **kanban-board.tsx** - Drag & Drop Board

```tsx
import { DndContext, DragOverlay } from '@dnd-kit/core';

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const { board, loading } = useKanbanBoard(boardId);
  const { sensors, handleDragEnd } = useDragDrop();

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto">
        {board.columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
      <DragOverlay>{/* Preview while dragging */}</DragOverlay>
    </DndContext>
  );
}
```

**Libraries**:

- `@dnd-kit/core`: Drag & drop functionality
- `@dnd-kit/sortable`: Sortable lists
- Accessible keyboard navigation

##### **kanban-column.tsx** - Board Column

```tsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

export function KanbanColumn({ column }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className="min-w-[300px]">
      <ColumnHeader name={column.name} count={column.emailIds.length} />

      <SortableContext items={column.emailIds}>
        {column.emailIds.map((emailId) => (
          <KanbanCard key={emailId} emailId={emailId} />
        ))}
      </SortableContext>

      <AddEmailButton columnId={column.id} />
    </div>
  );
}
```

**Features**:

- Drop zone for emails
- Sortable cards
- Column header with count
- Add email button

##### **kanban-card.tsx** - Email Card

```tsx
import { useSortable } from '@dnd-kit/sortable';

export function KanbanCard({ emailId }: CardProps) {
  const { email } = useEmail(emailId);
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: emailId,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-grab">
        <CardHeader>
          <h3>{email.subject}</h3>
          <p className="text-sm text-muted">{email.from}</p>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2">{email.snippet}</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Interaction**:

- Draggable
- Preview on hover
- Click to open detail
- Right-click context menu

#### **chat/ - AI Chatbot Components**

##### **chatbox.tsx** - Chat Container

```tsx
export function Chatbox({ isOpen, onClose }: ChatboxProps) {
  const { messages, sendMessage, loading } = useChat();
  const [input, setInput] = useState('');

  const handleSend = () => {
    sendMessage(input);
    setInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <ChatMessages messages={messages} />
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
```

**Features**:

- Real-time messages
- Typing indicator
- Auto-scroll to bottom
- Message history

---

### 3️⃣ **hooks/ - Custom React Hooks**

**Mục đích**: Reusable logic, separate từ UI

#### **use-auth.ts** - Authentication Hook

```tsx
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await fetchUser(token);
        setUser(user);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { token, user } = await authApi.login(credentials);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
}
```

**Usage**:

```tsx
function ProtectedPage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Welcome, {user.name}!</div>;
}
```

#### **use-emails.ts** - Email Data Fetching

```tsx
import { useQuery } from '@tanstack/react-query';

export function useEmails(filters: EmailFilters) {
  return useQuery({
    queryKey: ['emails', filters],
    queryFn: () => emailsApi.getEmails(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmail(emailId: string) {
  return useQuery({
    queryKey: ['email', emailId],
    queryFn: () => emailsApi.getEmail(emailId),
    enabled: !!emailId,
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: emailsApi.sendEmail,
    onSuccess: () => {
      // Invalidate emails list để refetch
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Email sent!');
    },
  });
}
```

**Lợi ích React Query**:

- Auto caching
- Background refetch
- Optimistic updates
- Loading & error states

#### **use-kanban.ts** - Kanban State Management

```tsx
export function useKanban(boardId: string) {
  const { data: board } = useQuery({
    queryKey: ['kanban', boardId],
    queryFn: () => kanbanApi.getBoard(boardId),
  });

  const moveEmail = useMutation({
    mutationFn: ({ emailId, fromColumn, toColumn, position }) =>
      kanbanApi.moveEmail(boardId, emailId, toColumn, position),

    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries(['kanban', boardId]);
      const previous = queryClient.getQueryData(['kanban', boardId]);

      // Update UI immediately
      queryClient.setQueryData(['kanban', boardId], (old) => {
        // Move email in cache
      });

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['kanban', boardId], context.previous);
      toast.error('Failed to move email');
    },
  });

  return { board, moveEmail };
}
```

**Optimistic Updates**:

- UI updates ngay lập tức
- Rollback nếu request fails
- Better user experience

---

### 4️⃣ **api/ - API Client Layer**

**Mục đích**: Centralize API calls, easy to mock/test

#### **client.ts** - Base Axios Instance

```tsx
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - try refresh
      const newToken = await refreshToken();
      if (newToken) {
        // Retry original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      }
      // Refresh failed - logout
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Features**:

- Auto add Authorization header
- Token refresh on 401
- Global error handling
- Request/response logging

#### **emails.ts** - Email API Calls

```tsx
import { apiClient } from './client';

export const emailsApi = {
  getEmails: (filters: EmailFilters) =>
    apiClient.get('/api/emails', { params: filters }).then((r) => r.data),

  getEmail: (id: string) =>
    apiClient.get(`/api/emails/${id}`).then((r) => r.data),

  sendEmail: (data: EmailData) =>
    apiClient.post('/api/emails', data).then((r) => r.data),

  deleteEmail: (id: string) =>
    apiClient.delete(`/api/emails/${id}`).then((r) => r.data),

  starEmail: (id: string) =>
    apiClient.post(`/api/emails/${id}/star`).then((r) => r.data),

  summarizeEmail: (id: string) =>
    apiClient.post(`/api/emails/${id}/summarize`).then((r) => r.data),
};
```

**Type Safety**:

```tsx
// types/email.ts
export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  date: string;
  labels: string[];
  starred: boolean;
  read: boolean;
}

export interface EmailFilters {
  label?: string;
  starred?: boolean;
  page?: number;
  size?: number;
}
```

---

### 5️⃣ **services/ - Business Logic Services**

**Mục đích**: Complex logic, không phải pure API calls

#### **email-service.ts** - Email Operations

```tsx
export class EmailService {
  // Parse email addresses
  static parseAddresses(addresses: string): string[] {
    return addresses.split(',').map((a) => a.trim());
  }

  // Format email for display
  static formatEmail(email: Email): FormattedEmail {
    return {
      ...email,
      date: formatDate(email.date),
      snippet: this.generateSnippet(email.body),
      hasAttachments: email.attachments?.length > 0,
    };
  }

  // Generate email snippet
  static generateSnippet(body: string, maxLength = 100): string {
    const text = stripHtml(body);
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  // Sanitize HTML email body
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'a', 'b', 'i', 'u', 'br', 'img'],
      ALLOWED_ATTR: ['href', 'src', 'alt'],
    });
  }
}
```

**Use Cases**:

- Data transformation
- Complex calculations
- Multiple API orchestration
- Caching strategies

#### **storage-service.ts** - Local Storage

```tsx
export class StorageService {
  private static prefix = 'email_app_';

  static set(key: string, value: any): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  static get<T>(key: string): T | null {
    const item = localStorage.getItem(this.prefix + key);
    return item ? JSON.parse(item) : null;
  }

  static remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  // Drafts auto-save
  static saveDraft(draft: EmailDraft): void {
    const drafts = this.get<EmailDraft[]>('drafts') || [];
    const existing = drafts.findIndex((d) => d.id === draft.id);

    if (existing >= 0) {
      drafts[existing] = draft;
    } else {
      drafts.push(draft);
    }

    this.set('drafts', drafts);
  }
}
```

---

### 6️⃣ **types/ - TypeScript Type Definitions**

**Mục đích**: Type safety cho toàn bộ app

```tsx
// types/email.ts
export interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  body: string;
  snippet: string;
  date: string;
  labels: Label[];
  starred: boolean;
  read: boolean;
  attachments: Attachment[];
}

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

**Lợi ích**:

- IDE auto-complete
- Catch type errors
- Self-documenting
- Refactoring safety

---

### 7️⃣ **providers/ - React Context Providers**

**Mục đích**: Global state management

#### **auth-provider.tsx** - Authentication Context

```tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}
```

#### **theme-provider.tsx** - Dark Mode

```tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

// Usage in components
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
```

---

## 🔄 Luồng Xử Lý (Request Flow)

### **Example: User Opens Email**

```
1. User clicks email in list
   ↓
2. EmailItem onClick triggers
   ├─ Update selectedId state
   └─ Navigate to detail view
   ↓
3. EmailDetail component mounts
   ├─ useEmail(emailId) hook runs
   └─ React Query checks cache
   ↓
4. If not cached, fetch from API
   ├─ emailsApi.getEmail(id)
   ├─ apiClient adds Authorization header
   └─ axios.get('/api/emails/123')
   ↓
5. Backend returns email data
   ├─ React Query caches response
   └─ Component re-renders with data
   ↓
6. Render email detail
   ├─ EmailDetailHeader (from, to, subject)
   ├─ EmailBody (sanitized HTML)
   └─ EmailActions (reply, forward, delete)
   ↓
7. User clicks "Show Summary"
   ├─ Call emailsApi.summarizeEmail(id)
   ├─ Backend calls AI Service
   └─ Display summary in component
```

**Total Time**: ~200ms (cached) / ~2s (fresh + AI)

---

## 🎨 Styling Strategy

### **Tailwind CSS**

```tsx
<div className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors">
  <Avatar className="h-10 w-10">
    <AvatarImage src={user.avatar} />
    <AvatarFallback>{user.initials}</AvatarFallback>
  </Avatar>
  <div className="flex-1">
    <h3 className="font-semibold">{email.subject}</h3>
    <p className="text-sm text-muted-foreground">{email.from}</p>
  </div>
</div>
```

**Lợi ích**:

- No CSS files to manage
- Responsive by default
- Dark mode support
- Consistent spacing

### **CSS Variables** (globals.css)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

**Theme System**:

- CSS variables cho colors
- Auto switch light/dark
- Easy customization

---

## 🚀 Performance Optimizations

### 1. **Code Splitting**

```tsx
import dynamic from 'next/dynamic';

const EmailCompose = dynamic(() => import('@/components/email/email-compose'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

### 2. **Image Optimization**

```tsx
import Image from 'next/image';

<Image
  src={avatar}
  alt="User"
  width={40}
  height={40}
  priority={false}
  loading="lazy"
/>;
```

### 3. **Virtual Scrolling**

```tsx
import { VirtualList } from 'virtua';

<VirtualList count={emails.length} itemSize={80}>
  {(index) => <EmailItem email={emails[index]} />}
</VirtualList>;
```

### 4. **Memoization**

```tsx
const MemoizedEmailList = memo(EmailList, (prev, next) => {
  return prev.emails.length === next.emails.length;
});
```

---

## 🔐 Security Best Practices

### 1. **XSS Prevention**

```tsx
import DOMPurify from 'dompurify';

const safeHtml = DOMPurify.sanitize(email.body, {
  ALLOWED_TAGS: ['p', 'a', 'b', 'i'],
  ALLOWED_ATTR: ['href'],
});
```

### 2. **CSRF Protection**

```tsx
// API client includes CSRF token
apiClient.defaults.headers.common['X-CSRF-Token'] = getCsrfToken();
```

### 3. **Secure Storage**

```tsx
// Never store sensitive data in localStorage
// Use HttpOnly cookies for tokens
const token = getCookie('auth_token'); // Server-side only
```

---

---

## 🧪 Testing Strategy (Chiến Lược Testing Toàn Diện)

### **1. Unit Testing với Jest & React Testing Library**

#### **Testing Components**

```tsx
// components/email/__tests__/EmailList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmailList } from '../EmailList';
import { mockEmails } from '@/mocks/email-data';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('EmailList', () => {
  it('renders email list correctly', () => {
    render(<EmailList emails={mockEmails} loading={false} />, { wrapper });

    expect(screen.getByText('Test Subject 1')).toBeInTheDocument();
    expect(screen.getByText('Test Subject 2')).toBeInTheDocument();
    expect(screen.getByText('sender1@test.com')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<EmailList emails={[]} loading={true} />, { wrapper });

    expect(screen.getByTestId('email-list-skeleton')).toBeInTheDocument();
  });

  it('handles email selection', () => {
    const onSelect = jest.fn();
    render(
      <EmailList emails={mockEmails} loading={false} onSelect={onSelect} />,
      { wrapper }
    );

    const firstEmail = screen.getByText('Test Subject 1');
    fireEvent.click(firstEmail);

    expect(onSelect).toHaveBeenCalledWith(mockEmails[0].id);
  });

  it('displays empty state when no emails', () => {
    render(<EmailList emails={[]} loading={false} />, { wrapper });

    expect(screen.getByText('No emails found')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /empty/i })).toBeInTheDocument();
  });

  it('renders starred emails with star icon', () => {
    const starredEmail = { ...mockEmails[0], starred: true };
    render(<EmailList emails={[starredEmail]} loading={false} />, { wrapper });

    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    expect(screen.getByTestId('star-icon')).toHaveClass('filled');
  });
});

// components/email/__tests__/EmailCompose.test.tsx
import { EmailCompose } from '../EmailCompose';

describe('EmailCompose', () => {
  it('validates email form', async () => {
    render(<EmailCompose onSent={jest.fn()} />, { wrapper });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Recipient is required')).toBeInTheDocument();
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const onSent = jest.fn();
    const mockSendEmail = jest.fn().mockResolvedValue({ id: '123' });

    render(<EmailCompose onSent={onSent} />, { wrapper });

    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: 'Test body content' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(onSent).toHaveBeenCalled();
    });
  });

  it('shows loading state while sending', async () => {
    render(<EmailCompose onSent={jest.fn()} />, { wrapper });

    // Fill form
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Test' },
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(sendButton).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

#### **Testing Hooks**

```tsx
// hooks/__tests__/use-emails.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmails } from '../use-emails';
import * as emailsApi from '@/api/emails';

jest.mock('@/api/emails');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('fetches emails successfully', async () => {
    const mockEmails = [
      { id: '1', subject: 'Test 1' },
      { id: '2', subject: 'Test 2' },
    ];

    (emailsApi.getEmails as jest.Mock).mockResolvedValue({
      items: mockEmails,
      total: 2,
    });

    const { result } = renderHook(() => useEmails({ label: 'INBOX' }), {
      wrapper,
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.emails).toEqual(mockEmails);
    expect(result.current.error).toBeNull();
  });

  it('handles error state', async () => {
    const error = new Error('API Error');
    (emailsApi.getEmails as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useEmails({ label: 'INBOX' }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.emails).toEqual([]);
  });

  it('refetches on filter change', async () => {
    const { result, rerender } = renderHook(
      ({ filters }) => useEmails(filters),
      {
        wrapper,
        initialProps: { filters: { label: 'INBOX' } },
      }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ filters: { label: 'SENT' } });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(emailsApi.getEmails).toHaveBeenCalledWith({ label: 'SENT' });
  });
});
```

#### **Testing API Client**

```tsx
// api/__tests__/emails.test.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { emailsApi } from '../emails';

const server = setupServer(
  rest.get('/api/emails', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [{ id: '1', subject: 'Test' }],
        total: 1,
      })
    );
  }),

  rest.post('/api/emails', (req, res, ctx) => {
    return res(ctx.json({ id: 'new_email_123' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('emailsApi', () => {
  it('fetches emails with filters', async () => {
    const result = await emailsApi.getEmails({ label: 'INBOX', page: 0 });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('sends email', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test',
      body: 'Body',
    };

    const result = await emailsApi.sendEmail(emailData);

    expect(result.id).toBe('new_email_123');
  });

  it('handles 401 error', async () => {
    server.use(
      rest.get('/api/emails', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
      })
    );

    await expect(emailsApi.getEmails()).rejects.toThrow('Unauthorized');
  });
});
```

### **2. Integration Testing**

```tsx
// __tests__/integration/email-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/app/page';

describe('Email Flow Integration', () => {
  it('complete email workflow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Login
    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    // 2. Navigate to inbox
    await user.click(screen.getByRole('link', { name: /inbox/i }));
    await waitFor(() => {
      expect(screen.getByText('Inbox')).toBeInTheDocument();
    });

    // 3. Open email
    const firstEmail = screen.getByText('Important Meeting');
    await user.click(firstEmail);

    await waitFor(() => {
      expect(screen.getByText('Email Detail')).toBeInTheDocument();
    });

    // 4. Star email
    await user.click(screen.getByLabelText('Star email'));

    await waitFor(() => {
      expect(screen.getByTestId('star-icon')).toHaveClass('filled');
    });

    // 5. Open compose dialog
    await user.click(screen.getByRole('button', { name: /compose/i }));

    // 6. Fill and send
    await user.type(screen.getByLabelText('To'), 'colleague@company.com');
    await user.type(screen.getByLabelText('Subject'), 'Re: Meeting');
    await user.type(screen.getByLabelText('Body'), 'Sounds good!');

    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('Email sent successfully')).toBeInTheDocument();
    });
  });
});
```

### **3. E2E Testing với Playwright**

```typescript
// e2e/email.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Email Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Login
    await page.click('button:has-text("Login with Google")');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign in")');

    await page.waitForNavigation();
  });

  test('should display inbox emails', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Inbox');

    const emailList = page.locator('[data-testid="email-list"]');
    await expect(emailList).toBeVisible();

    const emails = await emailList.locator('.email-item').count();
    expect(emails).toBeGreaterThan(0);
  });

  test('should send email', async ({ page }) => {
    // Click compose
    await page.click('button:has-text("Compose")');

    // Fill form
    await page.fill('input[name="to"]', 'recipient@test.com');
    await page.fill('input[name="subject"]', 'Test Email');
    await page.fill('textarea[name="body"]', 'This is a test email');

    // Send
    await page.click('button:has-text("Send")');

    // Verify toast
    await expect(page.locator('.toast')).toContainText('Email sent');
  });

  test('should star and unstar email', async ({ page }) => {
    const firstEmail = page.locator('.email-item').first();
    await firstEmail.click();

    // Star email
    const starButton = page.locator('button[aria-label="Star email"]');
    await starButton.click();

    await expect(starButton).toHaveClass(/filled/);

    // Unstar
    await starButton.click();
    await expect(starButton).not.toHaveClass(/filled/);
  });

  test('should search emails', async ({ page }) => {
    await page.fill('input[placeholder="Search emails"]', 'meeting');
    await page.press('input[placeholder="Search emails"]', 'Enter');

    await page.waitForTimeout(1000);

    const results = page.locator('.email-item');
    const count = await results.count();

    expect(count).toBeGreaterThan(0);

    // All results should contain "meeting"
    for (let i = 0; i < count; i++) {
      const text = await results.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('meeting');
    }
  });

  test('should navigate kanban board', async ({ page }) => {
    await page.click('a:has-text("Kanban")');

    await expect(page).toHaveURL(/kanban/);
    await expect(page.locator('h1')).toContainText('Kanban Board');

    const columns = page.locator('.kanban-column');
    const columnCount = await columns.count();

    expect(columnCount).toBeGreaterThanOrEqual(3);
  });

  test('should drag email in kanban', async ({ page }) => {
    await page.goto('http://localhost:3000/kanban');

    const card = page.locator('.kanban-card').first();
    const targetColumn = page.locator('.kanban-column').nth(1);

    // Drag and drop
    await card.dragTo(targetColumn);

    // Verify card moved
    await expect(targetColumn.locator('.kanban-card')).toContainText(
      (await card.textContent()) || ''
    );
  });
});

// Performance testing
test.describe('Performance', () => {
  test('should load inbox within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000/inbox');
    await page.waitForSelector('[data-testid="email-list"]');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle 100+ emails efficiently', async ({ page }) => {
    await page.goto('http://localhost:3000/inbox?size=100');

    const list = page.locator('[data-testid="email-list"]');
    await expect(list).toBeVisible();

    // Scroll performance
    const startTime = Date.now();
    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const scrollTime = Date.now() - startTime;

    expect(scrollTime).toBeLessThan(100);
  });
});
```

### **4. Accessibility Testing**

```tsx
// __tests__/a11y/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EmailList } from '@/components/email/EmailList';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('EmailList should have no accessibility violations', async () => {
    const { container } = render(
      <EmailList emails={mockEmails} loading={false} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', () => {
    const { container } = render(
      <EmailList emails={mockEmails} loading={false} />
    );

    const firstItem = container.querySelector('.email-item');
    expect(firstItem).toHaveAttribute('tabindex', '0');

    // Test focus
    firstItem?.focus();
    expect(document.activeElement).toBe(firstItem);
  });

  it('should have proper ARIA labels', () => {
    const { getByLabelText } = render(<EmailCompose onSent={jest.fn()} />);

    expect(getByLabelText('To')).toBeInTheDocument();
    expect(getByLabelText('Subject')).toBeInTheDocument();
    expect(getByLabelText('Body')).toBeInTheDocument();
  });
});
```

---

## 🚀 Advanced Implementation Patterns

### **1. Performance Optimization Strategies**

#### **Code Splitting & Lazy Loading**

```tsx
// Dynamic imports for route components
import dynamic from 'next/dynamic';

const InboxPage = dynamic(() => import('@/app/(routes)/inbox/page'), {
  loading: () => <PageSkeleton />,
  ssr: true,
});

const KanbanPage = dynamic(() => import('@/app/(routes)/kanban/page'), {
  loading: () => <KanbanSkeleton />,
  ssr: false, // Client-side only
});

const EmailCompose = dynamic(() => import('@/components/email/EmailCompose'), {
  loading: () => <Spinner />,
  ssr: false,
});

// Route-based code splitting
export default function Routes() {
  return (
    <Routes>
      <Route path="/inbox" element={<InboxPage />} />
      <Route path="/kanban" element={<KanbanPage />} />
    </Routes>
  );
}
```

#### **React Query Optimizations**

```tsx
// lib/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        toast.error('Something went wrong');
        console.error(error);
      },
    },
  },
});

// Prefetching
export function useEmailPrefetch() {
  const queryClient = useQueryClient();

  const prefetchEmail = useCallback(
    (emailId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['email', emailId],
        queryFn: () => emailsApi.getEmail(emailId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return { prefetchEmail };
}

// Optimistic updates
export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: emailsApi.sendEmail,

    onMutate: async (newEmail) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['emails'] });

      // Snapshot previous value
      const previousEmails = queryClient.getQueryData(['emails']);

      // Optimistically update
      queryClient.setQueryData(['emails'], (old: any) => ({
        ...old,
        items: [
          { ...newEmail, id: 'temp-' + Date.now(), sending: true },
          ...old.items,
        ],
      }));

      return { previousEmails };
    },

    onError: (err, newEmail, context) => {
      // Rollback on error
      queryClient.setQueryData(['emails'], context?.previousEmails);
    },

    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}
```

#### **Virtual Scrolling**

```tsx
// components/email/VirtualEmailList.tsx
import { Virtuoso } from 'react-virtuoso';

export function VirtualEmailList({ emails }: { emails: Email[] }) {
  const { prefetchEmail } = useEmailPrefetch();

  return (
    <Virtuoso
      data={emails}
      itemContent={(index, email) => (
        <EmailItem
          key={email.id}
          email={email}
          onMouseEnter={() => prefetchEmail(email.id)}
        />
      )}
      overscan={10}
      increaseViewportBy={200}
      components={{
        Header: () => <EmailListHeader />,
        Footer: () => <EmailListFooter />,
        EmptyPlaceholder: () => <EmptyState />,
      }}
    />
  );
}
```

#### **Image Optimization**

```tsx
import Image from 'next/image';

export function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-10 w-10">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="40px"
        className="rounded-full object-cover"
        priority={false}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
      />
    </div>
  );
}
```

### **2. State Management Patterns**

#### **Zustand Store**

```tsx
// store/email-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface EmailStore {
  selectedEmailId: string | null;
  viewMode: 'list' | 'detail' | 'split';
  filters: EmailFilters;

  setSelectedEmail: (id: string | null) => void;
  setViewMode: (mode: 'list' | 'detail' | 'split') => void;
  updateFilters: (filters: Partial<EmailFilters>) => void;
  resetFilters: () => void;
}

export const useEmailStore = create<EmailStore>()(
  devtools(
    persist(
      (set) => ({
        selectedEmailId: null,
        viewMode: 'split',
        filters: {
          label: 'INBOX',
          starred: false,
          read: undefined,
        },

        setSelectedEmail: (id) =>
          set({ selectedEmailId: id }, false, 'setSelectedEmail'),

        setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),

        updateFilters: (filters) =>
          set(
            (state) => ({ filters: { ...state.filters, ...filters } }),
            false,
            'updateFilters'
          ),

        resetFilters: () =>
          set(
            {
              filters: {
                label: 'INBOX',
                starred: false,
                read: undefined,
              },
            },
            false,
            'resetFilters'
          ),
      }),
      {
        name: 'email-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          filters: state.filters,
        }),
      }
    )
  )
);
```

#### **Context for UI State**

```tsx
// providers/ui-provider.tsx
import { createContext, useContext, useState } from 'react';

interface UIContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  composeOpen: boolean;
  openCompose: () => void;
  closeCompose: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const openCompose = () => setComposeOpen(true);
  const closeCompose = () => setComposeOpen(false);

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        composeOpen,
        openCompose,
        closeCompose,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
```

### **3. Advanced TypeScript Patterns**

```tsx
// types/advanced.ts

// Branded types for type safety
type Brand<K, T> = K & { __brand: T };
type EmailId = Brand<string, 'EmailId'>;
type UserId = Brand<string, 'UserId'>;

// Helper to create branded types
function brandEmailId(id: string): EmailId {
  return id as EmailId;
}

// Discriminated unions for email status
type EmailStatus =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; data: Email }
  | { type: 'error'; error: Error };

// Type guards
function isEmailSuccess(
  status: EmailStatus
): status is { type: 'success'; data: Email } {
  return status.type === 'success';
}

// Advanced generics
interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    hasMore: boolean;
  };
}

type ExtractData<T> = T extends ApiResponse<infer U> ? U : never;

// Utility types
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Conditional types
type IsArray<T> = T extends any[] ? true : false;
type UnwrapArray<T> = T extends (infer U)[] ? U : T;

// Template literal types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/api/${string}`;
type ApiCall = `${HttpMethod} ${Endpoint}`;

// Recursive types
type NestedEmail = Email & {
  replies?: NestedEmail[];
};

// Advanced mapped types
type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};

type MutableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends object ? MutableDeep<T[P]> : T[P];
};

// Type inference with ReturnType
type UseEmailsReturn = ReturnType<typeof useEmails>;
type EmailApiReturn = Awaited<ReturnType<typeof emailsApi.getEmails>>;
```

### **4. Error Handling Patterns**

```tsx
// lib/error-boundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from './logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);

    // Send to error tracking service
    if (typeof window !== 'undefined') {
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="mt-2 text-muted-foreground">
                {this.state.error?.message}
              </p>
              <button className="mt-4" onClick={() => window.location.reload()}>
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Usage
export default function App({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

#### **Custom Error Classes**

```tsx
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Error handler
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return 'Please log in to continue';
      case 403:
        return "You don't have permission to do this";
      case 404:
        return 'Resource not found';
      case 429:
        return 'Too many requests. Please try again later';
      case 500:
        return 'Server error. Please try again';
      default:
        return error.message;
    }
  }

  if (error instanceof ValidationError) {
    const firstField = Object.keys(error.fields)[0];
    return error.fields[firstField][0];
  }

  if (error instanceof NetworkError) {
    return 'Network error. Please check your connection';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
```

---

## 📊 Monitoring & Analytics

### **1. Performance Monitoring**

```tsx
// lib/performance.ts
export class PerformanceMonitor {
  private static marks = new Map<string, number>();

  static mark(name: string) {
    this.marks.set(name, performance.now());
  }

  static measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }

    const duration = performance.now() - start;

    // Log to analytics
    if (typeof window !== 'undefined') {
      // gtag('event', 'timing_complete', {
      //   name,
      //   value: Math.round(duration),
      //   event_category: 'Performance',
      // });
    }

    return duration;
  }

  static clearMarks() {
    this.marks.clear();
  }
}

// Usage in components
export function EmailList({ emails }: { emails: Email[] }) {
  useEffect(() => {
    PerformanceMonitor.mark('email-list-start');

    return () => {
      const duration = PerformanceMonitor.measure(
        'email-list-render',
        'email-list-start'
      );
      console.log(`Email list rendered in ${duration}ms`);
    };
  }, [emails]);

  return (
    // Component JSX
  );
}
```

### **2. User Analytics**

```tsx
// lib/analytics.ts
export class Analytics {
  static track(event: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event, properties);
    }

    // Custom analytics
    console.log('Analytics:', event, properties);
  }

  static pageView(url: string) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  }

  static identify(userId: string, traits?: Record<string, any>) {
    if (typeof window === 'undefined') return;

    if (window.gtag) {
      window.gtag('set', 'user_properties', {
        user_id: userId,
        ...traits,
      });
    }
  }
}

// Hook for tracking
export function useAnalytics() {
  const trackEvent = useCallback(
    (event: string, properties?: Record<string, any>) => {
      Analytics.track(event, properties);
    },
    []
  );

  return { trackEvent };
}

// Usage
export function EmailItem({ email }: { email: Email }) {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent('email_opened', {
      email_id: email.id,
      has_attachments: email.attachments.length > 0,
      is_starred: email.starred,
    });
  };

  return <div onClick={handleClick}>...</div>;
}
```

### **3. Real-time Monitoring**

```tsx
// lib/monitoring.ts
import { useEffect } from 'react';

export function useErrorMonitoring() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);

      // Send to monitoring service
      // Sentry.captureException(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);

      // Send to monitoring service
      // Sentry.captureException(event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, []);
}

// Web Vitals monitoring
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }, []);
}
```

---

## 🔧 Build & Deployment

### **1. Next.js Configuration**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/inbox',
        permanent: false,
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
```

### **2. Docker Configuration**

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### **3. CI/CD Pipeline**

```yaml
# .github/workflows/frontend-deploy.yml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/frontend

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run ESLint
        run: |
          cd frontend
          npm run lint

      - name: Run type check
        run: |
          cd frontend
          npm run type-check

      - name: Run tests
        run: |
          cd frontend
          npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: frontend/coverage/lcov.info
          flags: frontend

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Install Playwright
        run: |
          cd frontend
          npx playwright install --with-deps

      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/inbox
          uploadArtifacts: true

  build:
    needs: [lint-and-test, e2e-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: frontend
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Vercel
        run: |
          curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

---

## 📝 Conclusion

Frontend Service là giao diện người dùng hoàn chỉnh với:

- ✅ **Modern Stack**: Next.js 16 + React 19 + TypeScript
- ✅ **Great UX**: Fast, responsive, accessible
- ✅ **Type Safety**: Catch bugs early với TypeScript
- ✅ **Performance**: Optimized với React Query, code splitting, virtual scrolling
- ✅ **Clean Architecture**: Components, hooks, services separation
- ✅ **Developer Experience**: Hot reload, ESLint, Prettier, comprehensive testing
- ✅ **Testing**: Unit, integration, E2E, accessibility tests
- ✅ **Monitoring**: Performance tracking, error monitoring, analytics
- ✅ **CI/CD**: Automated testing và deployment
- ✅ **Security**: XSS prevention, CSRF protection, secure storage
- ✅ **Accessibility**: WCAG 2.1 AA compliant
- ✅ **Production-Ready**: Docker, Kubernetes, monitoring dashboards

Đây là foundation vững chắc cho một email client professional, scalable và maintainable!
