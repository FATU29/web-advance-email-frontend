# KIẾN TRÚC MODULAR - FRONTEND SERVICE

## Tổng Quan

Dự án Frontend được xây dựng theo kiến trúc Modular (Module hóa), nghĩa là chia nhỏ toàn bộ ứng dụng thành các module độc lập, mỗi module có trách nhiệm riêng biệt và rõ ràng. Điều này giúp code dễ quản lý, bảo trì, mở rộng và làm việc nhóm hiệu quả.

---

## 1. COMPONENTS MODULE (`/components`)

### Vai Trò

Components Module đóng vai trò là lớp giao diện người dùng (UI Layer) trong kiến trúc ứng dụng, chứa tất cả các React component - những khối xây dựng cơ bản để tạo nên giao diện mà người dùng tương tác trực tiếp. Module này được tổ chức theo hướng feature-based (theo tính năng), nghĩa là các component được nhóm lại theo từng tính năng cụ thể như authentication, email, kanban, search... thay vì nhóm theo loại component (buttons, forms, cards...). Cách tổ chức này giúp code dễ quản lý hơn khi dự án phát triển lớn, developer có thể nhanh chóng tìm thấy component cần thiết, đồng thời tăng khả năng tái sử dụng (reusability) vì các component được thiết kế độc lập và có thể hoạt động ở nhiều ngữ cảnh khác nhau. Components Module cũng tuân theo nguyên tắc Single Responsibility - mỗi component chỉ làm một việc duy nhất, giúp code dễ đọc, dễ test và dễ bảo trì trong dài hạn.

### Cấu Trúc Chi Tiết

```
components/
├── authentication/        → Components cho đăng nhập/đăng ký
│   ├── login-form.tsx
│   ├── sign-up-form.tsx
│   ├── forgot-password-form.tsx
│   ├── reset-password-form.tsx
│   └── otp-form.tsx
│
├── email/                → Components cho email features
│   ├── email-list.tsx           → Danh sách email
│   ├── email-detail.tsx         → Chi tiết email
│   ├── email-item.tsx           → Item trong list
│   ├── kanban-board.tsx         → Kanban board chính
│   ├── kanban-card.tsx          → Card trong kanban
│   ├── kanban-column.tsx        → Column trong kanban
│   ├── search-bar.tsx           → Thanh tìm kiếm
│   ├── search-results-view.tsx  → Hiển thị kết quả tìm kiếm
│   └── sidebar.tsx              → Sidebar navigation
│
├── chat/                 → Components cho chat feature
├── chatbox/              → Chatbox widget components
├── icons/                → Custom icon components
└── ui/                   → Shared UI components (Button, Input, Dialog...)
```

### Nguyên Tắc Thiết Kế

- **Feature-based**: Nhóm components theo tính năng, không phải theo loại component
- **Single Responsibility**: Mỗi component chỉ làm 1 việc duy nhất
- **Reusability**: Components trong `ui/` có thể dùng ở nhiều nơi
- **Composition**: Component lớn được xây từ các component nhỏ hơn

### Ví Dụ Sử Dụng

```tsx
// Trong page
import { KanbanBoard } from '@/components/email/kanban-board';
import { SearchBar } from '@/components/email/search-bar';

export default function MailPage() {
  return (
    <>
      <SearchBar />
      <KanbanBoard />
    </>
  );
}
```

---

## 2. PROVIDERS MODULE (`/providers`)

### Vai Trò

Providers Module đóng vai trò là lớp quản lý trạng thái toàn cục (Global State Management Layer) của ứng dụng, chứa các React Context Provider - những component đặc biệt được sử dụng để bao bọc (wrap) toàn bộ ứng dụng nhằm cung cấp state và functionality cho tất cả các component con bên trong cây component. Module này giải quyết vấn đề "prop drilling" - tình trạng phải truyền props qua nhiều tầng component trung gian không cần thiết - bằng cách cho phép bất kỳ component nào cũng có thể truy cập trực tiếp vào global state thông qua React Context API. Providers Module thường chứa các provider quan trọng như AuthProvider (quản lý thông tin đăng nhập, user session, token), QueryProvider (setup React Query cho việc quản lý server state, caching, và data fetching), ThemeProvider (quản lý theme/giao diện), và các provider khác tùy theo nhu cầu của ứng dụng. Việc tổ chức các provider một cách có hệ thống giúp centralized logic (tập trung xử lý), tăng hiệu suất thông qua caching thông minh, và đảm bảo type safety với TypeScript cho toàn bộ context được chia sẻ.

### Cấu Trúc Chi Tiết

```
providers/
├── AuthProvider.tsx          → Quản lý authentication state
│   - User info (email, name, avatar)
│   - Login status
│   - Token management
│   - User session
│
├── AuthGuardProvider.tsx     → Bảo vệ routes
│   - Check authentication
│   - Redirect unauthenticated users
│   - Route protection logic
│
└── QueryProvider.tsx         → React Query setup
    - Server state management
    - Caching strategy
    - Refetch policies
    - Query invalidation
```

### Cách Hoạt Động

Providers được wrap trong `layout.tsx` để bao bọc toàn bộ app:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <QueryProvider>
      {' '}
      {/* Bọc ngoài cùng */}
      <AuthProvider>
        {' '}
        {/* Auth state */}
        <AuthGuardProvider>
          {' '}
          {/* Route protection */}
          {children}
        </AuthGuardProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
```

### Lợi Ích

- **Global State**: Truy cập state từ bất kỳ component nào mà không cần prop drilling
- **Centralized Logic**: Logic authentication được quản lý tập trung
- **Performance**: React Query giúp cache và optimize API calls
- **Type Safety**: TypeScript đảm bảo type cho toàn bộ context

### Best Practices

- Chỉ tạo Provider khi cần share state giữa nhiều components
- Tách Provider theo chức năng rõ ràng (Auth, Theme, Language...)
- Sử dụng React Query cho server state, Context cho UI state

---

## 3. HOOKS MODULE (`/hooks`)

### Vai Trò

Hooks Module là trái tim của business logic layer trong ứng dụng, chứa các custom React hooks - những hàm JavaScript đặc biệt được tạo ra để tách biệt hoàn toàn business logic ra khỏi UI components, giúp code tuân thủ nguyên tắc Separation of Concerns. Module này đóng vai trò cực kỳ quan trọng trong việc làm cho logic có thể tái sử dụng (reusable) ở nhiều component khác nhau mà không cần viết lại code, đồng thời giúp components trở nên "clean" hơn vì chúng chỉ cần tập trung vào việc render UI mà không phải lo về logic phức tạp. Hooks Module được phân loại thành nhiều nhóm như Mutation Hooks (xử lý các thao tác thay đổi data như create, update, delete), Data Fetching Hooks (lấy data từ server), và Utility Hooks (các tiện ích như debounce, throttle, responsive detection). Việc sử dụng custom hooks kết hợp với React Query giúp quản lý server state hiệu quả, tự động cache data, xử lý loading và error states, đồng thời giúp code dễ dàng unit test vì logic được tách biệt hoàn toàn khỏi UI. Đây chính là best practice trong React modern development.

### Cấu Trúc Chi Tiết

```
hooks/
├── use-auth-mutations.ts         → Auth operations (login, logout, signup)
├── use-email-mutations.ts        → Email CRUD (create, read, update, delete)
├── use-kanban-mutations.ts       → Kanban operations (drag-drop, move card)
├── use-semantic-search.ts        → AI-powered search logic
├── use-search-suggestions.ts     → Search suggestions
├── use-keyboard-shortcuts.ts     → Keyboard event handlers
├── use-mobile.ts                 → Responsive detection
├── use-copy-to-clipboard.ts      → Copy functionality
├── use-audio-recording.ts        → Audio recording logic
├── useDebounce.ts                → Debounce utility hook
├── useBoolean.ts                 → Boolean state helper
└── useAutosize-textarea.ts       → Auto-resize textarea
```

### Phân Loại Hooks

#### A. Mutation Hooks (Thay đổi data)

```typescript
// use-email-mutations.ts
export function useEmailMutations() {
  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailService.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['emails']),
  });

  return { deleteMutation };
}
```

#### B. Data Fetching Hooks (Lấy data)

```typescript
// use-semantic-search.ts
export function useSemanticSearch() {
  const { data, isLoading } = useQuery({
    queryKey: ['semantic-search', query],
    queryFn: () => searchService.semantic(query),
  });

  return { results: data, isLoading };
}
```

#### C. Utility Hooks (Tiện ích)

```typescript
// useDebounce.ts
export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Lợi Ích

- **Separation of Concerns**: Logic tách khỏi UI
- **Reusability**: Dùng lại logic ở nhiều components
- **Testability**: Dễ dàng unit test
- **Clean Components**: Components chỉ lo render UI

### Best Practices

- Hook name phải bắt đầu bằng `use`
- Một hook chỉ làm một việc cụ thể
- Kết hợp React Query cho data fetching
- Return object thay vì array để dễ đọc

---

## 4. SERVICES MODULE (`/services`)

### Vai Trò

Services Module đóng vai trò là lớp truy xuất dữ liệu (Data Access Layer) và là cầu nối trung gian giữa frontend application và backend API server, đảm bảo rằng tất cả các API calls đều được thực hiện một cách có tổ chức và nhất quán thông qua các service classes hoặc objects. Module này implement pattern "Service Layer" - một design pattern phổ biến trong software architecture, giúp tách biệt logic gọi API ra khỏi business logic của ứng dụng. Services Module chịu trách nhiệm cấu hình Axios instance với các interceptors để tự động thêm authentication token vào mọi request, xử lý refresh token khi hết hạn, handle errors một cách tập trung (centralized error handling), và setup timeout, retry logic cho các API calls. Việc tập trung tất cả API calls vào services mang lại nhiều lợi ích: code dễ maintain hơn vì khi API endpoint thay đổi chỉ cần sửa ở một chỗ, dễ dàng mock service khi viết unit tests hoặc develop mà không cần backend, có thể implement caching strategy, logging, và monitoring một cách nhất quán, đồng thời đảm bảo type safety với TypeScript cho cả request parameters và response data.

### Cấu Trúc Chi Tiết

```
services/
├── axios.bi.ts              → Axios instance configuration
│   - Base URL setup
│   - Request interceptors (add token)
│   - Response interceptors (handle errors)
│   - Timeout configuration
│
├── jwt.ts                   → JWT token management
│   - Get token from storage
│   - Refresh token logic
│   - Token validation
│
├── auth.service.ts          → Authentication APIs
│   - login(email, password)
│   - signup(userData)
│   - logout()
│   - refreshToken()
│   - verifyOTP(code)
│
├── email.service.ts         → Email CRUD APIs
│   - getEmails(params)
│   - getEmailById(id)
│   - createEmail(data)
│   - updateEmail(id, data)
│   - deleteEmail(id)
│   - markAsRead(id)
│   - markAsUnread(id)
│
├── kanban.service.ts        → Kanban operations
│   - moveCard(cardId, columnId)
│   - getKanbanBoard()
│   - updateCardPosition(data)
│
├── search.service.ts        → Search APIs
│   - basicSearch(query)
│   - semanticSearch(query, aiParams)
│   - searchSuggestions(partial)
│
└── mailbox.service.ts       → Mailbox operations
    - getMailboxes()
    - createMailbox(name)
    - updateMailbox(id, data)
```

### Axios Configuration

```typescript
// axios.bi.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào mọi request
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Ví Dụ Service

```typescript
// email.service.ts
import { axiosInstance } from './axios.bi';

class EmailService {
  async getEmails(params: EmailQueryParams) {
    return axiosInstance.get('/emails', { params });
  }

  async deleteEmail(id: string) {
    return axiosInstance.delete(`/emails/${id}`);
  }

  async markAsRead(id: string) {
    return axiosInstance.patch(`/emails/${id}/read`);
  }
}

export const emailService = new EmailService();
```

### Lợi Ích

- **Centralized API Calls**: Tất cả API ở một nơi
- **Easy to Mock**: Mock service khi test
- **Error Handling**: Xử lý lỗi tập trung
- **Token Management**: Tự động thêm auth token
- **Type Safety**: TypeScript types cho requests/responses

---

## 5. API MODULE (`/api`)

### Vai Trò

API Module đóng vai trò là lớp định nghĩa giao diện (API Definition Layer), chịu trách nhiệm khai báo và document tất cả các API endpoints cũng như cung cấp type-safe functions để gọi API một cách an toàn với TypeScript. Module này làm việc song song và bổ sung cho Services Module, nhưng có sự phân tách rõ ràng về trách nhiệm: trong khi Services Module lo việc implementation (cách thức gọi API, xử lý response/error), thì API Module tập trung vào việc định nghĩa contract - "hợp đồng" về cấu trúc data giữa frontend và backend, bao gồm request parameters, response format, error format. Module này đóng vai trò như một "single source of truth" cho việc giao tiếp với backend, giúp developer biết chính xác API nào có sẵn, nhận input gì, trả về output gì thông qua TypeScript types. Lợi ích lớn nhất của API Module là đảm bảo type safety - TypeScript compiler sẽ kiểm tra và báo lỗi ngay tại compile-time nếu bạn truyền sai type của parameters hoặc xử lý sai type của response, IDE cũng cung cấp autocomplete và IntelliSense tuyệt vời, giúp giảm thiểu bugs và tăng tốc độ development đáng kể.

### Cấu Trúc Chi Tiết

```
api/
├── auth.ts              → Authentication endpoints
│   - POST /auth/login
│   - POST /auth/signup
│   - POST /auth/logout
│   - POST /auth/refresh
│   - POST /auth/forgot-password
│   - POST /auth/reset-password
│   - POST /auth/verify-otp
│
├── email.ts             → Email endpoints
│   - GET /emails
│   - GET /emails/:id
│   - POST /emails
│   - PUT /emails/:id
│   - DELETE /emails/:id
│   - PATCH /emails/:id/read
│   - PATCH /emails/:id/star
│   - GET /emails/search
│
└── mailbox.ts           → Mailbox endpoints
    - GET /mailboxes
    - POST /mailboxes
    - PUT /mailboxes/:id
    - DELETE /mailboxes/:id
```

### Định Nghĩa API

```typescript
// api/email.ts
import type { Email, EmailQueryParams, EmailResponse } from '@/types';

export const emailApi = {
  // GET /emails - Lấy danh sách email
  getAll: (params: EmailQueryParams): Promise<EmailResponse> => {
    return emailService.getEmails(params);
  },

  // GET /emails/:id - Lấy 1 email
  getById: (id: string): Promise<Email> => {
    return emailService.getEmailById(id);
  },

  // DELETE /emails/:id - Xóa email
  delete: (id: string): Promise<void> => {
    return emailService.deleteEmail(id);
  },

  // PATCH /emails/:id/star - Đánh dấu sao
  toggleStar: (id: string, starred: boolean): Promise<Email> => {
    return emailService.toggleStar(id, starred);
  },
};
```

### Request/Response Types

```typescript
// types/api.types.ts
export interface EmailQueryParams {
  page?: number;
  limit?: number;
  category?: 'INBOX' | 'IMPORTANT' | 'STARRED' | 'DONE';
  search?: string;
  sortBy?: 'date' | 'sender';
  sortOrder?: 'asc' | 'desc';
}

export interface EmailResponse {
  data: Email[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
```

### Sử Dụng Trong Components

```typescript
import { emailApi } from '@/api/email'

export function EmailList() {
  const { data, isLoading } = useQuery({
    queryKey: ['emails', { page: 1, category: 'INBOX' }],
    queryFn: () => emailApi.getAll({ page: 1, category: 'INBOX' })
  })

  // TypeScript biết chính xác type của data
  return <div>{data?.data.map(email => ...)}</div>
}
```

### Lợi Ích

- **Type Safety**: TypeScript kiểm tra types compile-time
- **Single Source of Truth**: API contract ở một nơi
- **Documentation**: Types = living documentation
- **Autocomplete**: IDE suggest đầy đủ
- **Refactoring**: Đổi API dễ dàng, IDE báo lỗi ngay

---

## 6. LIB MODULE (`/lib`)

### Vai Trò

Lib Module đóng vai trò là lớp nền tảng (Foundation Layer) của ứng dụng, chứa các thư viện core, utilities, và shared logic mà nhiều phần khác của ứng dụng sẽ phụ thuộc vào. Module này bao gồm ba thành phần chính: State Management Stores (sử dụng Zustand hoặc Context API để quản lý global/local state như auth state, UI state, filters state...), Validation Schemas (sử dụng Zod để định nghĩa validation rules cho forms, đảm bảo data integrity trước khi gửi lên server), và Utility Functions (các hàm helper như cn() để merge Tailwind classes, formatDate(), formatFileSize()...). Lib Module khác với Utils Module ở chỗ nó chứa những thứ "core" và "structural" hơn - những thứ ảnh hưởng đến kiến trúc và cách hoạt động của ứng dụng, trong khi Utils Module chứa các helper functions đơn giản hơn. Việc tổ chức state stores và validation schemas trong Lib Module giúp chúng dễ dàng được import và sử dụng ở mọi nơi trong app, đồng thời đảm bảo consistency - ví dụ validation rules được định nghĩa một lần nhưng có thể dùng ở cả client-side và khi chuẩn bị data gửi lên server. Module này là nền tảng cho việc xây dựng các tính năng phức tạp hơn ở các layer trên.

### Cấu Trúc Chi Tiết

```
lib/
├── stores/                      → State management stores
│   ├── use-auth.tsx            → Auth global state (Zustand/Context)
│   │   - User info
│   │   - Login/logout actions
│   │   - Token persistence
│   │
│   └── use-email.tsx           → Email global state
│       - Selected email
│       - Email filters
│       - View mode (list/kanban)
│
├── validations/                → Validation schemas (Zod)
│   └── auth.ts                 → Auth form validations
│       - loginSchema
│       - signupSchema
│       - forgotPasswordSchema
│       - resetPasswordSchema
│
├── utils.ts                    → Utility functions
│   - cn() - classnames merge
│   - formatDate()
│   - formatFileSize()
│   - truncateText()
│
└── audio-utils.ts              → Audio recording utilities
    - startRecording()
    - stopRecording()
    - getAudioBlob()
```

### State Management với Zustand

```typescript
// lib/stores/use-auth.tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // Lưu vào localStorage
    }
  )
);
```

### Validation với Zod

```typescript
// lib/validations/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu tối thiểu 8 ký tự')
      .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Phải có ít nhất 1 số'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

### Utility Functions

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
```

### Lợi Ích

- **Type-Safe Validation**: Zod đảm bảo validation đúng
- **Global State**: Zustand nhẹ hơn Redux, dễ dùng hơn Context
- **Reusable Utils**: Functions dùng chung toàn app
- **Persistence**: State tự động lưu vào localStorage

---

## 7. UTILS MODULE (`/utils`)

### Vai Trò

Utils Module đóng vai trò là lớp tiện ích (Utility Layer) chứa các helper functions, constants, và utility code được sử dụng rộng rãi trong toàn bộ ứng dụng, tuân thủ nguyên tắc DRY (Don't Repeat Yourself) bằng cách tập trung các đoạn code nhỏ, đơn giản nhưng được tái sử dụng nhiều lần vào một nơi duy nhất. Module này bao gồm ba nhóm chính: Constants (các hằng số như API URLs, route paths, configuration values, magic numbers...), Helper Functions (các hàm tiện ích như cookie operations, date formatting, string manipulation, ID generation...), và Cross-cutting Concerns (các logic chạy xuyên suốt app như broadcast channel cho cross-tab communication, debounce/throttle functions...). Utils Module giúp code base sạch hơn vì tránh được việc hard-code values ở khắp nơi - thay vào đó ta import constants từ một nguồn duy nhất, giúp dễ dàng thay đổi config sau này. Các helper functions trong Utils cũng được viết một lần nhưng dùng ở nhiều components/services khác nhau, giảm code duplication và khi cần fix bug hoặc improve performance chỉ cần sửa ở một chỗ là tác động đến toàn bộ app. Module này khác với Lib Module ở chỗ nó chứa các utilities đơn giản, stateless, pure functions, không ảnh hưởng đến kiến trúc tổng thể của app.

### Cấu Trúc Chi Tiết

```
utils/
├── constants/                  → Application constants
│   ├── api.ts                 → API-related constants
│   │   - API_BASE_URL
│   │   - API_TIMEOUT
│   │   - API_VERSION
│   │   - ENDPOINTS
│   │
│   ├── general.ts             → General constants
│   │   - APP_NAME
│   │   - APP_VERSION
│   │   - ITEMS_PER_PAGE
│   │   - MAX_FILE_SIZE
│   │
│   └── routes.ts              → Route paths
│       - AUTH_ROUTES
│       - PROTECTED_ROUTES
│       - PUBLIC_ROUTES
│
├── helpers/                   → Helper functions
│   ├── cookie.ts             → Cookie operations
│   │   - getCookie()
│   │   - setCookie()
│   │   - deleteCookie()
│   │
│   └── google-auth.ts        → Google OAuth helpers
│       - buildGoogleAuthUrl()
│       - parseGoogleCallback()
│       - getGoogleUserInfo()
│
├── function.ts               → General utility functions
│   - debounce()
│   - throttle()
│   - sleep()
│   - generateId()
│
└── broadcast-channel.ts      → Cross-tab communication
    - Sync state giữa các tab
    - Broadcast logout event
    - Share notifications
```

### Constants

```typescript
// utils/constants/routes.ts
export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
} as const;

export const PROTECTED_ROUTES = {
  MAIL: '/mail',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

// utils/constants/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
  },
  EMAIL: {
    LIST: '/emails',
    DETAIL: (id: string) => `/emails/${id}`,
    DELETE: (id: string) => `/emails/${id}`,
  },
} as const;
```

### Helper Functions

```typescript
// utils/helpers/cookie.ts
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

export function setCookie(name: string, value: string, days: number = 7) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;

  document.cookie = `${name}=${value};${expires};path=/`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
}
```

### Utility Functions

```typescript
// utils/function.ts

// Debounce function - delay execution
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function - limit execution rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Sleep/delay
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### Cross-Tab Communication

```typescript
// utils/broadcast-channel.ts
const channel = new BroadcastChannel('app-channel');

// Broadcast logout to all tabs
export function broadcastLogout() {
  channel.postMessage({ type: 'LOGOUT' });
}

// Listen for messages from other tabs
channel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
    // Clear auth and redirect
    window.location.href = '/login';
  }
};
```

### Lợi Ích

- **DRY Principle**: Không lặp lại code
- **Maintainability**: Sửa ở 1 nơi, áp dụng toàn bộ
- **Constants**: Tránh hard-code, dễ config
- **Type Safety**: TypeScript cho constants
- **Testing**: Dễ test các helper functions

---

## 8. TYPES MODULE (`/types`)

### Vai Trò

Types Module đóng vai trò cực kỳ quan trọng như là lớp định nghĩa kiểu dữ liệu (Type Definition Layer), chứa tất cả TypeScript types, interfaces, enums, và type utilities cho toàn bộ ứng dụng, đóng vai trò là "single source of truth" - nguồn chân lý duy nhất cho mọi type definitions trong codebase. Module này đảm bảo type safety (an toàn kiểu dữ liệu) và consistency (tính nhất quán) xuyên suốt dự án bằng cách cung cấp các type definitions được chia sẻ (shared) giữa tất cả các modules khác. Types Module bao gồm nhiều loại types: Domain Types (User, Email, Kanban...), API Types (Request/Response formats, Query Parameters, Error formats), Form Types (LoginFormData, SignupFormData...), Component Props Types (ButtonProps, EmailItemProps...), và Utility Types (Partial, Pick, Omit...). Việc có một module riêng cho types mang lại nhiều lợi ích to lớn: TypeScript compiler có thể catch bugs ngay tại compile-time trước khi code chạy, IDE cung cấp IntelliSense và autocomplete tuyệt vời giúp developer code nhanh hơn và ít lỗi hơn, types hoạt động như "living documentation" - tài liệu sống luôn được cập nhật theo code, refactoring trở nên an toàn vì TypeScript sẽ báo lỗi ở mọi nơi bị ảnh hưởng khi ta thay đổi type, và quan trọng nhất là đảm bảo contract giữa frontend và backend được tuân thủ chặt chẽ.

### Cấu Trúc Chi Tiết

```
types/
├── api.types.ts             → API-related types
│   - Request types
│   - Response types
│   - Error types
│   - Query parameters
│
└── index.ts                 → Export tất cả types
    - User types
    - Email types
    - Kanban types
    - UI types
```

### API Types

```typescript
// types/api.types.ts

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Query parameters base
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

### Domain Types

```typescript
// types/index.ts

// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Email
export interface Email {
  id: string;
  subject: string;
  body: string;
  sender: {
    email: string;
    name: string;
  };
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  category: EmailCategory;
  isRead: boolean;
  isStarred: boolean;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Email Category
export enum EmailCategory {
  INBOX = 'INBOX',
  IMPORTANT = 'IMPORTANT',
  STARRED = 'STARRED',
  DONE = 'DONE',
}

// Attachment
export interface Attachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
}

// Kanban
export interface KanbanColumn {
  id: string;
  title: string;
  category: EmailCategory;
  emails: Email[];
  count: number;
}

export interface KanbanBoard {
  columns: KanbanColumn[];
  totalEmails: number;
}
```

### Form Types

```typescript
// types/index.ts

// Login form
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Signup form
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Email compose form
export interface ComposeEmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: File[];
}
```

### Component Props Types

```typescript
// types/index.ts

// Button props
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Email item props
export interface EmailItemProps {
  email: Email;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onStar?: (id: string) => void;
}
```

### Utility Types

```typescript
// types/index.ts

// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Pick specific properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit specific properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Example usage
export type UpdateEmailData = Partial<
  Pick<Email, 'subject' | 'body' | 'category'>
>;
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
```

### Type Guards

```typescript
// types/index.ts

// Check if error is ApiError
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  );
}

// Check if email has attachments
export function hasAttachments(email: Email): boolean {
  return email.attachments && email.attachments.length > 0;
}
```

### Lợi Ích

- **Type Safety**: Compile-time error detection
- **IntelliSense**: Auto-complete in IDE
- **Documentation**: Types = living docs
- **Refactoring**: Safe and confident changes
- **Consistency**: Single source of truth
- **Error Prevention**: Catch bugs before runtime

---

## 9. APP ROUTER MODULE (`/app`)

### Vai Trò

App Router Module đóng vai trò là lớp định tuyến và điểm vào chính (Routing & Entry Point Layer) của ứng dụng, sử dụng Next.js App Router - một routing system hiện đại dựa trên file-system routing, nơi cấu trúc thư mục trực tiếp tương ứng với URL structure của ứng dụng. Module này chịu trách nhiệm quản lý toàn bộ navigation flow, layouts (giao diện bao bọc các pages), page rendering (SSR - Server Side Rendering hoặc CSR - Client Side Rendering), loading states, error boundaries, và route organization. App Router Module tổ chức routes theo route groups (sử dụng cú pháp (folder-name) để nhóm routes mà không ảnh hưởng URL) như (auth) cho authentication pages và (routes) cho protected pages, cho phép mỗi group có layout riêng phù hợp với mục đích sử dụng - ví dụ auth layout đơn giản với form ở giữa màn hình, còn main app layout có sidebar và header. Module này cũng hỗ trợ nested layouts (layouts lồng nhau), dynamic routes với [id] syntax, parallel routes, intercepting routes, và nhiều tính năng advanced khác của Next.js 15. Vai trò quan trọng của App Router là tạo ra điểm vào cho ứng dụng thông qua layout.tsx - nơi wrap tất cả providers, setup global styles, metadata, và configurations, đồng thời quản lý user flow từ khi vào app đến khi navigate giữa các trang khác nhau.

### Cấu Trúc Chi Tiết

```
app/
├── layout.tsx                 → Root layout (wrap toàn bộ app)
├── page.tsx                   → Home page (/)
├── globals.css                → Global styles
├── favicon.ico                → App icon
│
├── (auth)/                    → Auth routes group
│   ├── layout.tsx            → Auth layout (login UI style)
│   ├── login/                → Login page
│   │   └── page.tsx
│   ├── signup/               → Signup page
│   │   └── page.tsx
│   ├── forgot-password/      → Forgot password
│   │   └── page.tsx
│   └── reset-password/       → Reset password
│       └── page.tsx
│
└── (routes)/                  → Protected routes group
    ├── layout.tsx            → Main app layout (sidebar, header)
    └── mail/                 → Mail application
        ├── page.tsx          → Mail page
        └── [id]/             → Dynamic route
            └── page.tsx      → Email detail page
```

### Root Layout

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Email Manager - Quản lý email thông minh',
  description: 'Ứng dụng quản lý email với AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

### Route Groups

Next.js App Router hỗ trợ route groups với cú pháp `(folder-name)`:

```typescript
// app/(auth)/layout.tsx - Layout cho auth pages
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Email Manager</h1>
        </div>

        {/* Auth form */}
        {children}
      </div>
    </div>
  )
}

// app/(routes)/layout.tsx - Layout cho protected pages
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuardProvider>
  )
}
```

### Pages

```typescript
// app/(routes)/mail/page.tsx
'use client'

import { KanbanBoard } from '@/components/email/kanban-board'
import { SearchBar } from '@/components/email/search-bar'

export default function MailPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Mail</h1>
        <SearchBar />
      </div>

      <KanbanBoard />
    </div>
  )
}

// app/(routes)/mail/[id]/page.tsx - Dynamic route
export default function EmailDetailPage({ params }: { params: { id: string } }) {
  return <EmailDetail emailId={params.id} />
}
```

### Loading & Error States

```typescript
// app/(routes)/mail/loading.tsx
export default function Loading() {
  return <div>Loading emails...</div>
}

// app/(routes)/mail/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Lợi Ích

- **File-based Routing**: Tạo route bằng cách tạo file/folder
- **Layouts**: Nested layouts, share UI giữa pages
- **Loading UI**: Built-in loading states
- **Error Handling**: Error boundaries tự động
- **Route Groups**: Tổ chức routes logic mà không ảnh hưởng URL
- **Server Components**: Performance tốt hơn

---

## 10. MOCKS MODULE (`/mocks`)

### Vai Trò

Mocks Module đóng vai trò là lớp dữ liệu giả lập (Mock Data & Testing Layer), cung cấp fake data, mock service implementations, và test fixtures phục vụ cho nhiều mục đích khác nhau trong quá trình phát triển ứng dụng. Module này cực kỳ quan trọng vì nó cho phép frontend team có thể phát triển hoàn toàn độc lập (independent development) mà không cần chờ backend team hoàn thành APIs, giúp tăng tốc development velocity đáng kể. Mocks Module chứa sample data với đầy đủ các trường hợp (happy cases, edge cases, error cases) để test UI trong mọi tình huống, mock service implementations mô phỏng hành vi của real services bao gồm cả API delays để simulate network latency, và helper functions để generate mock data on-the-fly. Module này được sử dụng rộng rãi trong nhiều scenarios: development mode khi backend chưa sẵn sàng hoặc đang down, unit testing và integration testing để đảm bảo test results consistent và không phụ thuộc vào external APIs, Storybook development để tạo component stories với mock data, demo và presentation khi cần showcase features mà không cần setup backend, và offline development khi làm việc không có internet. Việc có một module riêng cho mocks giúp dễ dàng switch giữa mock mode và real API mode thông qua environment variables hoặc configuration flags, đồng thời đảm bảo mock data luôn sync với real data structure thông qua TypeScript types.

### Cấu Trúc Chi Tiết

```
mocks/
├── emails.ts               → Mock email data
│   - Sample email objects
│   - Different categories
│   - Various states (read/unread, starred)
│
└── sidebar.tsx             → Mock sidebar data
    - Navigation items
    - Menu structure
    - Icons
```

### Mock Email Data

```typescript
// mocks/emails.ts
import type { Email, EmailCategory } from '@/types';

export const mockEmails: Email[] = [
  {
    id: '1',
    subject: 'Welcome to Email Manager',
    body: 'Chào mừng bạn đến với ứng dụng quản lý email...',
    sender: {
      email: 'admin@example.com',
      name: 'Admin',
    },
    recipients: ['user@example.com'],
    category: EmailCategory.INBOX,
    isRead: false,
    isStarred: false,
    attachments: [],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    subject: 'Important: Update Required',
    body: 'Vui lòng cập nhật thông tin...',
    sender: {
      email: 'security@example.com',
      name: 'Security Team',
    },
    recipients: ['user@example.com'],
    category: EmailCategory.IMPORTANT,
    isRead: true,
    isStarred: true,
    attachments: [
      {
        id: 'att-1',
        filename: 'update.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        url: '/files/update.pdf',
      },
    ],
    createdAt: '2024-01-09T15:30:00Z',
    updatedAt: '2024-01-09T15:30:00Z',
  },
  // ... more mock emails
];

// Helper functions
export function getMockEmailsByCategory(category: EmailCategory): Email[] {
  return mockEmails.filter((email) => email.category === category);
}

export function getMockEmailById(id: string): Email | undefined {
  return mockEmails.find((email) => email.id === id);
}

export function generateMockEmail(overrides?: Partial<Email>): Email {
  return {
    id: Math.random().toString(36).substr(2, 9),
    subject: 'Mock Email Subject',
    body: 'Mock email body content',
    sender: { email: 'mock@example.com', name: 'Mock Sender' },
    recipients: ['user@example.com'],
    category: EmailCategory.INBOX,
    isRead: false,
    isStarred: false,
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
```

### Mock Service Implementation

```typescript
// services/email.service.mock.ts
import { mockEmails, getMockEmailsByCategory } from '@/mocks/emails';

class MockEmailService {
  // Simulate API delay
  private delay(ms: number = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getEmails(params: EmailQueryParams) {
    await this.delay();

    let filtered = [...mockEmails];

    if (params.category) {
      filtered = getMockEmailsByCategory(params.category);
    }

    if (params.search) {
      filtered = filtered.filter((email) =>
        email.subject.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    return {
      data: filtered,
      pagination: {
        page: 1,
        limit: 20,
        total: filtered.length,
        totalPages: 1,
      },
    };
  }

  async deleteEmail(id: string) {
    await this.delay(300);
    const index = mockEmails.findIndex((e) => e.id === id);
    if (index > -1) {
      mockEmails.splice(index, 1);
    }
  }
}

export const emailService = new MockEmailService();
```

### Environment-based Switching

```typescript
// services/email.service.ts
import { MockEmailService } from './email.service.mock';
import { RealEmailService } from './email.service.real';

// Tự động dùng mock service nếu đang development
const isDevelopment = process.env.NODE_ENV === 'development';
const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const emailService =
  isDevelopment && useMock ? new MockEmailService() : new RealEmailService();
```

### Storybook Integration

```typescript
// components/email/email-item.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { EmailItem } from './email-item';
import { mockEmails } from '@/mocks/emails';

const meta: Meta<typeof EmailItem> = {
  title: 'Email/EmailItem',
  component: EmailItem,
};

export default meta;
type Story = StoryObj<typeof EmailItem>;

// Use mock data for stories
export const Unread: Story = {
  args: {
    email: mockEmails[0],
  },
};

export const Read: Story = {
  args: {
    email: { ...mockEmails[0], isRead: true },
  },
};

export const Starred: Story = {
  args: {
    email: { ...mockEmails[0], isStarred: true },
  },
};
```

### Testing với Mock Data

```typescript
// __tests__/email-list.test.tsx
import { render, screen } from '@testing-library/react'
import { EmailList } from '@/components/email/email-list'
import { mockEmails } from '@/mocks/emails'

describe('EmailList', () => {
  it('renders email list', () => {
    render(<EmailList emails={mockEmails} />)

    // Check if first email appears
    expect(screen.getByText(mockEmails[0].subject)).toBeInTheDocument()
  })

  it('shows empty state when no emails', () => {
    render(<EmailList emails={[]} />)
    expect(screen.getByText('No emails found')).toBeInTheDocument()
  })
})
```

### Lợi Ích

- **Independent Development**: Frontend không phụ thuộc backend
- **Fast Iteration**: Test UI nhanh với mock data
- **Consistent Testing**: Test với data ổn định
- **Demo Ready**: Luôn có data để demo
- **Offline Development**: Làm việc mà không cần internet
- **Storybook**: Dễ dàng tạo component stories

---

## Kết Luận

### Tổng Kết 10 Modules

| Module         | Vai Trò Chính        | Tương Tác              |
| -------------- | -------------------- | ---------------------- |
| **Components** | UI Layer             | → Hooks, Providers     |
| **Providers**  | Global State         | → Tất cả components    |
| **Hooks**      | Business Logic       | → Services, Stores     |
| **Services**   | API Calls            | → Backend API          |
| **API**        | Endpoint Definitions | → Services             |
| **Lib**        | Core Utilities       | → Toàn bộ app          |
| **Utils**      | Helper Functions     | → Toàn bộ app          |
| **Types**      | Type Definitions     | → Toàn bộ app          |
| **App Router** | Routing & Pages      | → Components, Layouts  |
| **Mocks**      | Test Data            | → Development, Testing |

### Luồng Data Flow

```
User Action
    ↓
Component (UI)
    ↓
Hook (Logic) ← Provider (Global State)
    ↓
Service (API Client) ← Lib/Store (Local State)
    ↓
API (Endpoint) ← Utils (Helpers)
    ↓
Backend
```

### Best Practices

1. **Separation of Concerns**: Mỗi module một trách nhiệm rõ ràng
2. **Single Responsibility**: Mỗi file/function làm một việc
3. **DRY Principle**: Không lặp lại code
4. **Type Safety**: Luôn dùng TypeScript types
5. **Reusability**: Tái sử dụng tối đa
6. **Testability**: Code dễ test
7. **Scalability**: Dễ mở rộng

### Ví Dụ Thực Tế: Feature Delete Email

```
1. User clicks Delete button
   → Component: email-item.tsx

2. Component calls hook
   → Hook: use-email-mutations.ts
   → const { deleteMutation } = useEmailMutations()
   → deleteMutation.mutate(emailId)

3. Hook gọi Service
   → Service: email.service.ts
   → emailService.deleteEmail(id)

4. Service call API
   → API: email.ts
   → DELETE /emails/:id

5. Backend xử lý

6. Response về
   → Service nhận response
   → Hook update state (React Query invalidate)
   → Provider/Store update global state
   → Component re-render với data mới

Done! ✅
```

Kiến trúc Modular giúp code organized, maintainable, và scalable! 🚀
