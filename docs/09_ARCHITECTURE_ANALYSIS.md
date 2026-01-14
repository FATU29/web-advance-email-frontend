# 09. PHÂN TÍCH KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE ANALYSIS)

## 📋 THÔNG TIN CHUNG

| Thông tin           | Chi tiết                                                      |
| ------------------- | ------------------------------------------------------------- |
| **Dự án**           | React Email Client with Gmail Integration & AI-Powered Kanban |
| **Nhóm**            | 22120120 - 22120157 - 22120163                                |
| **Phiên bản**       | 1.0                                                           |
| **Ngày cập nhật**   | Tháng 1/2025                                                  |
| **Người thực hiện** | Nhóm phát triển                                               |

---

## 📖 MỤC LỤC

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Microservices Architecture](#2-microservices-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [AI Service Architecture](#5-ai-service-architecture)
6. [Database Design](#6-database-design)
7. [Security Architecture](#7-security-architecture)
8. [API Design](#8-api-design)
9. [State Management](#9-state-management)
10. [External Integrations](#10-external-integrations)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Performance Considerations](#12-performance-considerations)

---

## 1. TỔNG QUAN KIẾN TRÚC

### 1.1 Giới Thiệu

Hệ thống quản lý email là ứng dụng full-stack với tích hợp trí tuệ nhân tạo (AI), được xây dựng theo kiến trúc microservices hiện đại. Hệ thống bao gồm ba dịch vụ chính hoạt động độc lập nhưng phối hợp chặt chẽ với nhau.

**Ba Dịch Vụ Chính:**

1. **Frontend Service** - Giao diện người dùng với Next.js 15 và React 19
2. **Backend Service** - Logic nghiệp vụ với Spring Boot 3.5 và Java 21
3. **AI Service** - Các tính năng AI với FastAPI và Python 3.12

### 1.2 Sơ Đồ Kiến Trúc Tổng Thể

Hệ thống được thiết kế theo mô hình client-server với các lớp rõ ràng:

**Client Layer:**
Trình duyệt web hoặc thiết bị di động của người dùng, giao tiếp với hệ thống qua HTTPS.

**Presentation Layer (Frontend):**
Next.js server render các trang React, xử lý routing và giao tiếp với Backend qua REST API.

**Business Logic Layer (Backend):**
Spring Boot xử lý tất cả logic nghiệp vụ, authentication, và điều phối các requests.

**AI Layer:**
FastAPI cung cấp các tính năng AI như summarization, semantic search, và chat.

**Data Layer:**
MongoDB lưu trữ tất cả dữ liệu của hệ thống.

**External Services:**
Gmail API cho email operations và OpenAI API cho AI capabilities.

### 1.3 Công Nghệ Chính

**Frontend Stack:**

- Next.js 15 với App Router
- React 19 với Server Components
- TypeScript 5 cho type safety
- Tailwind CSS và shadcn/ui cho styling
- TanStack Query cho server state
- @dnd-kit cho drag and drop

**Backend Stack:**

- Spring Boot 3.5 framework
- Java 21 (LTS)
- MongoDB 7.0 database
- Spring Security và JWT
- Gmail API integration

**AI Stack:**

- FastAPI async framework
- Python 3.12
- OpenAI API (GPT-4o-mini, text-embedding-3-small)
- Pydantic cho validation
- Uvicorn ASGI server

---

## 2. MICROSERVICES ARCHITECTURE

### 2.1 Service Independence

Mỗi service trong hệ thống được thiết kế độc lập:

**Frontend Service (Port 3000):**

- Có thể deploy và scale độc lập
- Không phụ thuộc trực tiếp vào database
- Giao tiếp với Backend qua REST API

**Backend Service (Port 8080):**

- Core business logic
- Database access
- External API integration
- Có thể scale horizontally

**AI Service (Port 8000):**

- Stateless design
- Có thể scale dựa trên demand
- Chỉ được gọi từ Backend (không expose trực tiếp)

### 2.2 Inter-Service Communication

**Frontend ↔ Backend:**

- REST API với JSON payload
- JWT authentication
- HTTPS trong production

**Backend ↔ AI Service:**

- Internal REST API
- Service discovery qua Docker network
- Không cần authentication (internal network)

**Backend ↔ External APIs:**

- Gmail API qua OAuth 2.0
- OpenAI API qua API key (thông qua AI Service)

### 2.3 Service Discovery

Trong Docker Compose environment:

- Services sử dụng container names làm hostnames
- Internal network `email-network` cho communication
- External ports được expose cho development

### 2.4 Fault Tolerance

**Graceful Degradation:**

- Nếu AI Service down, Backend vẫn hoạt động (AI features disabled)
- Caching reduce dependencies
- Retry mechanisms cho external calls

---

## 3. FRONTEND ARCHITECTURE

### 3.1 Next.js App Router

Hệ thống sử dụng Next.js 15 với App Router pattern:

**Directory Structure:**

```
frontend/
├── app/                    # App Router
│   ├── (auth)/            # Auth route group
│   ├── (routes)/          # Protected routes
│   │   └── mail/          # Mail routes
│   │       ├── [folder]/  # Dynamic folder route
│   │       └── kanban/    # Kanban board
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── email/            # Email-specific components
├── hooks/                # Custom React hooks
├── services/             # API service layer
├── lib/                  # Utilities
│   └── stores/           # Zustand stores
└── types/                # TypeScript types
```

### 3.2 Component Architecture

**Component Categories:**

**UI Components (components/ui/):**
Shadcn/ui base components như Button, Dialog, Input, etc.

**Feature Components (components/email/):**

- KanbanBoard, KanbanColumn, KanbanCard
- SearchBar, SearchResultsView
- ComposeEmailDialog
- EmailDetail, EmailListItem

**Layout Components:**

- AppSidebar
- EmailLayout
- Header

### 3.3 Hooks Architecture

**Query Hooks:**

- useMailboxesQuery
- useEmailsInfiniteQuery
- useKanbanFilteredBoardQuery
- useSemanticSearchMutation

**Mutation Hooks:**

- useSendEmailMutation
- useToggleEmailStarMutation
- useMoveEmailToColumnMutation
- useSnoozeEmailMutation

**Utility Hooks:**

- useDebounce
- useIsMobile
- useLocalStorage

### 3.4 Service Layer

**Services:**

- EmailService: Email CRUD operations
- KanbanService: Kanban board operations
- SearchService: Search and suggestions
- AuthService: Authentication flows

**Pattern:**
Mỗi service encapsulate API calls và return typed responses.

---

## 4. BACKEND ARCHITECTURE

### 4.1 Layered Architecture

Backend follow Spring Boot layered architecture:

**Controller Layer:**

- REST endpoints
- Request/Response handling
- Input validation
- Authentication check

**Service Layer:**

- Business logic
- Transaction management
- External service integration
- Data transformation

**Repository Layer:**

- Database access
- MongoDB queries
- Data persistence

**Model Layer:**

- Entity definitions
- Domain objects

### 4.2 Package Structure

```
com.hcmus.awad_email/
├── controller/           # REST controllers
│   ├── AuthController
│   ├── EmailController
│   ├── KanbanController
│   └── SearchController
├── service/              # Business services
│   ├── EmailService
│   ├── GmailService
│   ├── KanbanService
│   ├── FuzzySearchService
│   └── SemanticSearchService
├── repository/           # MongoDB repositories
├── model/                # Entity models
├── dto/                  # Data Transfer Objects
├── security/             # Security config
├── config/               # App configuration
└── exception/            # Custom exceptions
```

### 4.3 Key Services

**EmailService:**
Core email operations - send, reply, forward, mark read/unread, star, delete.

**KanbanService:**
Kanban board management - columns, email status, move operations.

**GmailService:**
Gmail API integration - OAuth, message operations, label management.

**FuzzySearchService:**
Fuzzy text search với Levenshtein distance và N-gram similarity.

**SemanticSearchService:**
AI-powered semantic search via embeddings.

### 4.4 DTO Pattern

Backend sử dụng DTO pattern để tách biệt internal models và API contracts:

**Request DTOs:**

- SendEmailRequest
- KanbanFilterRequest
- SemanticSearchRequest

**Response DTOs:**

- EmailDetailResponse
- KanbanBoardResponse
- ApiResponse<T> wrapper

---

## 5. AI SERVICE ARCHITECTURE

### 5.1 FastAPI Structure

```
ai/
├── main.py              # Application entry
├── config.py            # Configuration
├── routers/             # API endpoints
│   ├── email.py        # Email AI endpoints
│   └── chat.py         # Chat endpoints
├── services/            # AI logic
│   ├── summarization.py
│   ├── embedding.py
│   └── chat.py
├── schemas/             # Pydantic models
└── utils/               # Utilities
    └── prompts.py      # AI prompts
```

### 5.2 AI Endpoints

**Email Summarization:**
POST /api/v1/email/summarize

- Nhận email content
- Generate summary với GPT-4o-mini
- Return structured summary

**Embedding Generation:**
POST /api/v1/email/embedding/generate/batch

- Generate embeddings cho nhiều emails
- Sử dụng text-embedding-3-small
- Return 1536-dimensional vectors

**Semantic Search:**
POST /api/v1/email/search/embedding

- Nhận query và emails với embeddings
- Tính cosine similarity
- Return ranked results

### 5.3 OpenAI Integration

**Models Used:**

- gpt-4o-mini: Summarization, chat, action items
- text-embedding-3-small: Vector embeddings (1536 dimensions)

**Prompt Engineering:**
Hệ thống sử dụng carefully crafted prompts cho:

- Email summarization với length options
- Action items extraction
- Chat responses
- Auto-categorization

---

## 6. DATABASE DESIGN

### 6.1 MongoDB Collections

**users:**
Thông tin người dùng và credentials.

- \_id: ObjectId
- email: String (unique, indexed)
- password: String (BCrypt hashed)
- name: String
- role: String
- createdAt: Date

**email_kanban_status:**
Trạng thái Kanban của mỗi email.

- \_id: ObjectId
- emailId: String (unique, indexed)
- userId: String (indexed)
- columnId: String (indexed)
- subject, fromEmail, fromName: Cached email data
- isRead, isStarred, hasAttachments: Boolean flags
- summary: AI-generated summary
- embedding: [Number] - Vector embedding
- snoozeUntil: Date
- receivedAt: Date

**kanban_columns:**
Định nghĩa các columns trong Kanban board.

- \_id: ObjectId
- userId: String (indexed)
- name: String
- type: String (TO_DO, IN_PROGRESS, DONE, SNOOZED)
- order: Number
- isDefault: Boolean

**mailboxes:**
Gmail label mapping.

- \_id: ObjectId
- userId: String
- name: String
- type: String (INBOX, SENT, STARRED, etc.)
- unreadCount: Number

**refresh_tokens:**
JWT refresh tokens.

- token: String (unique)
- userId: String
- expiresAt: Date (TTL index)
- isRevoked: Boolean

**google_tokens:**
OAuth tokens cho Gmail.

- userId: String (unique)
- accessToken: String (encrypted)
- refreshToken: String (encrypted)
- expiresAt: Date

### 6.2 Indexing Strategy

**Performance Indexes:**

- email_kanban_status.userId + columnId (compound)
- email_kanban_status.emailId (unique)
- users.email (unique)
- refresh_tokens.token (unique)
- refresh_tokens.expiresAt (TTL)

### 6.3 Data Relationships

MongoDB là document database, không có foreign keys. Relationships được manage ở application level:

**User ↔ Emails:**
userId field trong email_kanban_status links tới users.\_id

**Email ↔ Column:**
columnId field links tới kanban_columns.\_id

**Denormalization:**
Email metadata (subject, from, etc.) được cache trong email_kanban_status để reduce lookups.

---

## 7. SECURITY ARCHITECTURE

### 7.1 Authentication Flow

**Login Flow:**

1. User submit email/password
2. Backend validate credentials
3. Generate JWT Access Token (15 min expiry)
4. Generate Refresh Token (7 days expiry)
5. Store Refresh Token in MongoDB
6. Return tokens to Frontend
7. Frontend store tokens

**Request Authentication:**

1. Frontend attach JWT in Authorization header
2. Backend JwtAuthenticationFilter validate token
3. Extract userId from token
4. Proceed or reject request

**Token Refresh:**

1. Access token expired
2. Frontend call refresh endpoint
3. Backend validate refresh token
4. Generate new access token
5. Optionally rotate refresh token

### 7.2 JWT Configuration

**Access Token:**

- Algorithm: HS256
- Expiry: 15 minutes
- Claims: userId, email, roles

**Refresh Token:**

- Algorithm: HS256
- Expiry: 7 days
- Stored in MongoDB for revocation

### 7.3 Password Security

**BCrypt Hashing:**

- Strength: 12 rounds
- Salt: Auto-generated
- Never store plain text

### 7.4 OAuth 2.0 (Gmail)

**Flow:**

1. Frontend redirect to Google consent
2. User authorizes app
3. Google callback with auth code
4. Backend exchange code for tokens
5. Store encrypted tokens in MongoDB
6. Use tokens for Gmail API calls

**Token Storage:**

- Access token: Short-lived, refreshed automatically
- Refresh token: Long-lived, encrypted storage

### 7.5 Frontend Security

**XSS Protection:**

- DOMPurify for HTML sanitization
- React auto-escaping

**CSRF Protection:**

- Token-based protection
- SameSite cookie policy

**Secure Storage:**

- JWT in localStorage (consider HttpOnly cookies for production)
- Sensitive data not stored client-side

---

## 8. API DESIGN

### 8.1 RESTful Principles

**Resource-Based URLs:**

- /api/emails/{emailId}
- /api/kanban/columns/{columnId}
- /api/search/suggestions

**HTTP Methods:**

- GET: Read operations
- POST: Create operations
- PATCH: Partial updates
- DELETE: Remove operations

**Status Codes:**

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

### 8.2 Response Format

**Standard Response Wrapper:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-01-14T10:00:00Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2025-01-14T10:00:00Z"
}
```

### 8.3 Key Endpoints

**Authentication:**

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/gmail/connect

**Emails:**

- GET /api/emails
- GET /api/emails/{emailId}
- POST /api/emails/send
- POST /api/emails/{emailId}/reply
- DELETE /api/emails/{emailId}

**Kanban:**

- GET /api/kanban/board
- POST /api/kanban/board/filtered
- POST /api/kanban/move
- GET/POST/PUT/DELETE /api/kanban/columns

**Search:**

- POST /api/kanban/search (fuzzy)
- POST /api/search/semantic
- GET /api/search/suggestions

---

## 9. STATE MANAGEMENT

### 9.1 Server State (TanStack Query)

**Query Caching:**

- Automatic caching của API responses
- Stale time configuration
- Background refetching

**Mutation Handling:**

- Optimistic updates
- Error rollback
- Cache invalidation

**Query Keys:**
Hierarchical key structure cho granular invalidation.

### 9.2 Client State (Zustand)

**useEmail Store:**

- emails: Danh sách emails
- selectedEmail: Email đang xem
- selectedMailbox: Mailbox đang active
- mailboxes: Danh sách mailboxes

**useAuth Store:**

- user: Current user
- isAuthenticated: Auth status
- token: JWT token

### 9.3 Local State (useState)

Component-specific state:

- Form inputs
- UI toggles
- Temporary selections

### 9.4 State Synchronization

**Pattern:**

1. User action triggers mutation
2. Optimistic update local state
3. API call to backend
4. Success: Invalidate queries, sync với server
5. Error: Rollback local state

---

## 10. EXTERNAL INTEGRATIONS

### 10.1 Gmail API

**Authentication:**
OAuth 2.0 with offline access

**Operations:**

- List messages
- Get message details
- Send message
- Modify labels
- Trash/Untrash

**Rate Limiting:**

- 250 quota units per user per second
- Implement retry with exponential backoff

### 10.2 OpenAI API

**Models:**

- gpt-4o-mini: Text generation
- text-embedding-3-small: Embeddings

**Rate Limiting:**

- Token-based limits
- Implement queuing for batch operations

**Cost Management:**

- Cache summaries and embeddings
- Minimize redundant API calls

### 10.3 MongoDB Atlas (Production)

**Features:**

- Managed database service
- Auto-scaling
- Backups
- Monitoring

---

## 11. DEPLOYMENT ARCHITECTURE

### 11.1 Docker Compose

**Services:**

```yaml
services:
  mongodb: # Database
  ai-service: # FastAPI
  backend: # Spring Boot
  frontend: # Next.js
```

**Networks:**

- email-network: Internal communication
- External ports exposed for development

### 11.2 Container Configuration

**Frontend Container:**

- Base: node:20-alpine
- Build: npm run build
- Serve: npm start
- Port: 3000

**Backend Container:**

- Base: eclipse-temurin:21-jdk
- Build: Maven
- Run: java -jar
- Port: 8080

**AI Service Container:**

- Base: python:3.12-slim
- Dependencies: uv sync
- Run: uvicorn
- Port: 8000

### 11.3 Environment Configuration

**Frontend (.env):**

- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_AI_SERVICE_URL

**Backend (application.properties):**

- MONGODB_URI
- JWT_SECRET
- GOOGLE_CLIENT_ID/SECRET
- AI_SERVICE_URL

**AI Service (.env):**

- OPENAI_API_KEY
- HOST, PORT

### 11.4 Production Considerations

**Scaling:**

- Horizontal scaling cho Backend và AI Service
- Load balancer cho traffic distribution

**SSL/TLS:**

- HTTPS everywhere
- Certificate management

**Monitoring:**

- Health check endpoints
- Logging aggregation
- Metrics collection

---

## 12. PERFORMANCE CONSIDERATIONS

### 12.1 Frontend Performance

**Code Splitting:**

- Next.js automatic code splitting
- Dynamic imports cho heavy components

**Caching:**

- TanStack Query caching
- Browser caching cho static assets

**Optimizations:**

- Memoization với useMemo/useCallback
- Virtualization cho long lists
- Image optimization

**Metrics:**

- Initial load: < 2s
- Route navigation: < 200ms
- Drag & drop: 60fps

### 12.2 Backend Performance

**Database:**

- Proper indexing
- Connection pooling
- Query optimization

**Caching:**

- AI summaries cached in DB
- Embeddings stored for reuse

**Concurrency:**

- Spring async processing
- Non-blocking I/O

**Metrics:**

- API response: < 100ms average
- Database query: < 50ms

### 12.3 AI Service Performance

**Optimizations:**

- Batch embedding generation
- Async processing
- Response streaming cho chat

**Metrics:**

- Summarization: 2-5s
- Embedding: 1-2s
- Semantic search: < 1s

### 12.4 Network Optimization

**Compression:**

- Gzip for API responses
- Minified assets

**Connection:**

- Keep-alive connections
- HTTP/2 support

---

## 📊 TỔNG KẾT

### Điểm Mạnh Kiến Trúc

1. **Microservices Separation**: Các service độc lập, dễ scale và maintain

2. **Modern Tech Stack**: Sử dụng các công nghệ mới nhất (Next.js 15, Java 21, Python 3.12)

3. **Type Safety**: TypeScript ở frontend, Java ở backend đảm bảo code quality

4. **AI Integration**: Tích hợp AI seamless với architecture tốt

5. **Security First**: Multiple layers của security (JWT, OAuth, encryption)

6. **Developer Experience**: Docker Compose cho easy local development

### Điểm Có Thể Cải Thiện

1. **Message Queue**: Thêm RabbitMQ/Kafka cho async processing

2. **Caching Layer**: Thêm Redis cho distributed caching

3. **API Gateway**: Kong hoặc nginx cho routing và rate limiting

4. **Monitoring**: ELK stack hoặc Prometheus/Grafana

5. **CI/CD**: GitHub Actions pipeline cho automated deployment

6. **Testing**: Increase test coverage với unit và integration tests

---

**Tài liệu được tạo cho mục đích học thuật và phát triển dự án.**

_© 2025 - Nhóm 22120120 - 22120157 - 22120163_
