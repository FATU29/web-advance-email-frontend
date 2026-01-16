# Hệ Thống Quản Lý Email - Frontend

> **Đồ Án Phát Triển Ứng Dụng Web Nâng Cao**  
> **Môn học:** Advanced Web Application Development  
> **Năm học:** 2025-2026

---

## 📋 Mục Lục

- [Tổng Quan Dự Án](#-tổng-quan-dự-án)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cài Đặt & Khởi Chạy](#-cài-đặt--khởi-chạy)
- [Luồng Xác Thực (Authentication Flow)](#-luồng-xác-thực-authentication-flow)
- [Quản Lý Token](#-quản-lý-token)
- [API Endpoints](#-api-endpoints)
- [Cấu Hình Google OAuth](#-cấu-hình-google-oauth)
- [Bảo Mật](#-bảo-mật)
- [Demo Video](#-demo-video)

---

## 🎯 Tổng Quan Dự Án

Ứng dụng quản lý email thông minh tích hợp với Gmail API, sử dụng AI để tóm tắt email và tìm kiếm ngữ nghĩa. Giao diện được thiết kế theo phong cách Kanban board giúp người dùng quản lý email hiệu quả.

### ✨ Tính Năng Chính

- 🔐 **Xác thực an toàn:** Google OAuth 2.0 + Email/Password với OTP
- 📧 **Quản lý Email:** Kanban board với drag & drop
- 🤖 **AI-Powered:** Tóm tắt email tự động, tìm kiếm ngữ nghĩa
- 🔍 **Tìm kiếm thông minh:** Fuzzy search + Semantic search
- 📱 **Responsive:** Giao diện thân thiện trên mọi thiết bị
- ⚡ **Real-time:** Đồng bộ hai chiều với Gmail
- 🎨 **UI/UX hiện đại:** shadcn/ui + Tailwind CSS

---

## 🏗 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    NGƯỜI DÙNG (Trình duyệt)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─── Google OAuth 2.0
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js 15 - Port 3000)              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • React 19 Components                              │    │
│  │ • TanStack Query (State Management)                │    │
│  │ • Zustand (Auth Store)                             │    │
│  │ • @dnd-kit (Drag & Drop)                           │    │
│  │ • Axios (HTTP Client)                              │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ RESTful API (JWT)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           BACKEND (Spring Boot 3.5 - Port 8080)             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Gmail API Integration                            │    │
│  │ • JWT Authentication                               │    │
│  │ • Spring Security                                  │    │
│  │ • MongoDB (Database)                               │    │
│  │ • Lucene (Fuzzy Search)                            │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ AI API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            AI SERVICE (FastAPI - Port 8000)                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • OpenAI GPT-4 (Summarization)                     │    │
│  │ • Sentence Transformers (Embeddings)               │    │
│  │ • Vector Search (Semantic)                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Công Nghệ Sử Dụng

### Frontend Stack

| Công nghệ           | Phiên bản | Mục đích                |
| ------------------- | --------- | ----------------------- |
| **Next.js**         | 15.1.6    | Framework React với SSR |
| **React**           | 19.2.0    | Thư viện UI             |
| **TypeScript**      | 5.7.3     | Type-safe JavaScript    |
| **Tailwind CSS**    | 3.4.17    | Utility-first CSS       |
| **shadcn/ui**       | latest    | Component library       |
| **TanStack Query**  | 5.90.10   | Server state management |
| **Zustand**         | 5.0.3     | Client state management |
| **@dnd-kit**        | 6.3.1     | Drag and drop           |
| **Axios**           | 1.8.0     | HTTP client             |
| **React Hook Form** | 7.54.2    | Form validation         |
| **Zod**             | 3.24.1    | Schema validation       |
| **Sonner**          | 1.7.3     | Toast notifications     |

---

## 🚀 Cài Đặt & Khởi Chạy

### Yêu Cầu Hệ Thống

- **Node.js:** 20.x hoặc cao hơn
- **npm:** 10.x hoặc cao hơn
- **Backend:** Spring Boot (phải chạy trên port 8080)
- **AI Service:** FastAPI (phải chạy trên port 8000)

### 1️⃣ Khởi chạy từng service riêng lẻ

#### A. Khởi chạy AI Service (Port 8000)

```bash
# Di chuyển vào thư mục ai
cd ai

# Cài đặt dependencies (sử dụng uv)
uv sync

# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa .env và thêm OpenAI API key
# OPENAI_API_KEY=your_openai_api_key_here

# Khởi chạy AI service
uv run fastapi dev
```

✅ **AI Service đang chạy tại:** `http://localhost:8000`

---

#### B. Khởi chạy Backend (Port 8080)

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa .env với các giá trị thực:
# - JWT_SECRET=your-secret-key-here
# - GOOGLE_CLIENT_ID=your-google-client-id
# - GOOGLE_CLIENT_SECRET=your-google-client-secret
# - MONGODB_URI=mongodb://localhost:27017/awad_email
# - BREVO_API_KEY=your-brevo-api-key
# - SENDER_EMAIL=noreply@example.com

# Khởi chạy backend với Maven
./mvnw spring-boot:run

# Hoặc với script
./start.sh
```

✅ **Backend đang chạy tại:** `http://localhost:8080`

---

#### C. Khởi chạy Frontend (Port 3000)

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Chỉnh sửa .env (tùy chọn)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Chạy development server
npm run dev
```

✅ **Frontend đang chạy tại:** `http://localhost:3000`

---

### 2️⃣ Khởi chạy tất cả services với Docker Compose

```bash
# Từ thư mục gốc dự án
cd email-final-project

# Tạo file .env cho từng service (xem phần trên)
# - ai/.env
# - backend/.env
# - frontend/.env

# Build và khởi chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng tất cả services
docker-compose down
```

✅ **Service URLs:**

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- AI Service: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

---

## 🔐 Luồng Xác Thực (Authentication Flow)

### 1. Đăng ký với Email/Password

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│  USER    │                  │ FRONTEND │                  │ BACKEND  │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │                             │                             │
     │  1. Nhập email & password   │                             │
     ├────────────────────────────>│                             │
     │                             │                             │
     │                             │  2. POST /api/auth/signup   │
     │                             ├────────────────────────────>│
     │                             │  {email, password, name}    │
     │                             │                             │
     │                             │                             │ 3. Tạo user
     │                             │                             │    (enabled: false)
     │                             │                             │ 4. Generate OTP
     │                             │                             │ 5. Gửi email OTP
     │                             │                             │
     │                             │  6. Response: Success       │
     │                             │<────────────────────────────┤
     │                             │  "Check your email"         │
     │                             │                             │
     │  7. Hiển thị form OTP       │                             │
     │<────────────────────────────┤                             │
     │                             │                             │
     │  8. Nhập OTP code           │                             │
     ├────────────────────────────>│                             │
     │                             │                             │
     │                             │  9. POST /verify-email      │
     │                             ├────────────────────────────>│
     │                             │  {email, code}              │
     │                             │                             │
     │                             │                             │ 10. Verify OTP
     │                             │                             │ 11. Set enabled: true
     │                             │                             │ 12. Generate JWT tokens
     │                             │                             │
     │                             │  13. Response + Tokens      │
     │                             │<────────────────────────────┤
     │                             │  Set-Cookie: refreshToken   │
     │                             │  Body: {accessToken, user}  │
     │                             │                             │
     │  14. Lưu accessToken        │                             │
     │  15. Redirect to /mail      │                             │
     │<────────────────────────────┤                             │
     │                             │                             │

✅ Kết quả: User đã xác thực thành công và đăng nhập
```

### 2. Đăng nhập với Google OAuth 2.0

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  USER    │     │ FRONTEND │     │ BACKEND  │     │  GOOGLE  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │  1. Click      │                │                │
     │  "Login with   │                │                │
     │   Google"      │                │                │
     ├───────────────>│                │                │
     │                │                │                │
     │                │  2. Redirect   │                │
     │                │  to Google     │                │
     │                ├───────────────────────────────>│
     │                │  OAuth consent │                │
     │                │                │                │
     │  3. Authorize  │                │                │
     ├───────────────────────────────────────────────>│
     │                │                │                │
     │                │                │  4. Auth code  │
     │<───────────────────────────────────────────────┤
     │                │                │                │
     │                │  5. POST       │                │
     │                │  /auth/google  │                │
     │                ├───────────────>│                │
     │                │  {code}        │                │
     │                │                │                │
     │                │                │  6. Exchange   │
     │                │                │  code for      │
     │                │                │  tokens        │
     │                │                ├───────────────>│
     │                │                │                │
     │                │                │  7. Tokens +   │
     │                │                │  User info     │
     │                │                │<───────────────┤
     │                │                │                │
     │                │                │ 8. Create/update user
     │                │                │    (enabled: true)
     │                │                │    (verified: true)
     │                │                │ 9. Generate JWT
     │                │                │                │
     │                │  10. Response  │                │
     │                │<───────────────┤                │
     │                │  Set-Cookie:   │                │
     │                │  refreshToken  │                │
     │                │  Body: {       │                │
     │                │   accessToken, │                │
     │                │   user}        │                │
     │                │                │                │
     │  11. Lưu token │                │                │
     │  12. Redirect  │                │                │
     │<───────────────┤                │                │
     │                │                │                │

✅ Kết quả: User đăng nhập ngay lập tức (không cần xác thực email)
```

### 3. Refresh Token Flow

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│ FRONTEND │                  │ BACKEND  │                  │ BROWSER  │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │                             │                             │
     │  1. API call với expired    │                             │
     │     accessToken             │                             │
     ├────────────────────────────>│                             │
     │                             │                             │
     │  2. 401 Unauthorized         │                             │
     │<────────────────────────────┤                             │
     │                             │                             │
     │  3. POST /api/auth/refresh  │                             │
     ├────────────────────────────>│                             │
     │  (no body needed)           │                             │
     │                             │                             │
     │                             │  4. Lấy refreshToken        │
     │                             │<────────────────────────────┤
     │                             │     từ HttpOnly cookie      │
     │                             │                             │
     │                             │ 5. Verify refreshToken      │
     │                             │ 6. Generate new accessToken │
     │                             │                             │
     │  7. Response: New tokens    │                             │
     │<────────────────────────────┤                             │
     │  {accessToken, user}        │                             │
     │                             │                             │
     │  8. Lưu accessToken mới     │                             │
     │  9. Retry API call ban đầu  │                             │
     ├────────────────────────────>│                             │
     │                             │                             │
     │  10. Response: Success      │                             │
     │<────────────────────────────┤                             │
     │                             │                             │

✅ Kết quả: Token được làm mới tự động, user không bị logout
```

### 4. Logout Flow

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│ FRONTEND │                  │ BACKEND  │                  │ BROWSER  │
└────┬─────┘                  └────┬─────┘                  └────┬─────┘
     │                             │                             │
     │  1. Click Logout            │                             │
     │                             │                             │
     │  2. POST /api/auth/logout   │                             │
     ├────────────────────────────>│                             │
     │                             │                             │
     │                             │  3. Invalidate refreshToken │
     │                             │     (xóa khỏi database)     │
     │                             │                             │
     │                             │  4. Clear cookie            │
     │                             ├────────────────────────────>│
     │                             │  Set-Cookie: refreshToken=; │
     │                             │  Max-Age=0                  │
     │                             │                             │
     │  5. Response: Success       │                             │
     │<────────────────────────────┤                             │
     │                             │                             │
     │  6. Clear accessToken       │                             │
     │  7. Clear user state        │                             │
     │  8. Redirect to /login      │                             │
     │                             │                             │

✅ Kết quả: User đã logout, tokens bị xóa hoàn toàn
```

---

## 🔑 Quản Lý Token

### Token Strategy

Ứng dụng sử dụng **2 loại token** để đảm bảo bảo mật:

| Token Type        | Storage                       | Lifetime | Purpose               |
| ----------------- | ----------------------------- | -------- | --------------------- |
| **Access Token**  | Memory (Zustand store)        | 15 phút  | Xác thực API requests |
| **Refresh Token** | HttpOnly Cookie (server-side) | 7 ngày   | Làm mới access token  |

### Tại sao sử dụng HttpOnly Cookie?

#### ❌ **KHÔNG DÙNG** localStorage/sessionStorage cho Refresh Token

```javascript
// ⚠️ KHÔNG AN TOÀN - Dễ bị tấn công XSS
localStorage.setItem('refreshToken', token);
```

**Lý do:**

- JavaScript có thể truy cập → dễ bị tấn công XSS
- Nếu hacker inject script, họ có thể đọc và đánh cắp token

#### ✅ **DÙNG** HttpOnly Cookie cho Refresh Token

```javascript
// ✅ AN TOÀN - JavaScript không thể truy cập
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=None; Path=/api/auth
```

**Ưu điểm:**

- ✅ JavaScript **KHÔNG THỂ** đọc cookie (bảo vệ khỏi XSS)
- ✅ Browser tự động gửi cookie với mỗi request
- ✅ Cookie được quản lý bởi backend (an toàn hơn)
- ✅ Có thể set Secure flag (chỉ gửi qua HTTPS)
- ✅ Có thể set SameSite (bảo vệ khỏi CSRF)

### Implementation

#### Frontend - Axios Configuration

```typescript
// services/axios.bi.ts
import axios from 'axios';

const axiosBI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  withCredentials: true, // ✅ BẮT BUỘC: Enable cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động thêm Authorization header
axiosBI.interceptors.request.use((config) => {
  const token = getAccessToken(); // Lấy từ Zustand store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Tự động refresh token khi 401
axiosBI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi refresh token (browser tự động gửi cookie)
        const response = await axios.post(
          '/api/auth/refresh',
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = response.data.data;
        setAccessToken(accessToken); // Lưu vào store

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosBI(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        removeTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### Backend - Cookie Configuration

```java
// AuthController.java
private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
    int maxAgeSeconds = (int) (tokenProvider.getRefreshTokenExpirationMs() / 1000);

    StringBuilder cookieValue = new StringBuilder();
    cookieValue.append("refreshToken=").append(refreshToken);
    cookieValue.append("; Max-Age=").append(maxAgeSeconds); // 7 days
    cookieValue.append("; Path=/api/auth"); // Chỉ gửi cho auth endpoints
    cookieValue.append("; HttpOnly"); // ✅ Không thể truy cập bằng JS
    cookieValue.append("; Secure"); // ✅ Chỉ gửi qua HTTPS
    cookieValue.append("; SameSite=None"); // ✅ Allow cross-site requests

    response.addHeader("Set-Cookie", cookieValue.toString());
}
```

---

## 📡 API Endpoints

### Authentication Endpoints

#### 1. Signup (Email/Password)

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Signup successful. Please check your email for verification code.",
  "data": null
}
```

---

#### 2. Verify Email (OTP)

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": null,
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "profilePicture": null
    }
  }
}
```

**Note:** `refreshToken` là `null` trong response vì được set trong **HttpOnly cookie**.

---

#### 3. Login (Email/Password)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Tương tự như Verify Email

---

#### 4. Google OAuth Login

```http
POST /api/auth/google
Content-Type: application/json

{
  "code": "4/0AQa...",
  "redirectUri": "http://localhost:3000"
}
```

**Response:** Tương tự như Login

---

#### 5. Refresh Token

```http
POST /api/auth/refresh
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...
```

**Response:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": null,
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

#### 6. Logout

```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### Email Endpoints

#### Get Mailboxes

```http
GET /api/mailboxes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

#### Get Emails (Paginated)

```http
GET /api/mailboxes/{mailboxId}/emails?page=0&size=20&sort=receivedDate,desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

#### Get Email Detail

```http
GET /api/emails/{emailId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### Kanban Endpoints

#### Get Kanban Board

```http
GET /api/kanban/board
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

#### Move Email (Drag & Drop)

```http
POST /api/kanban/emails/move
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "emailId": "email123",
  "targetColumnId": "col_important",
  "targetPosition": 0
}
```

---

#### Generate Email Summary (AI)

```http
POST /api/kanban/emails/{emailId}/summary
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### Search Endpoints

#### Fuzzy Search

```http
GET /api/kanban/search?q=invoice&page=0&size=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

#### Semantic Search

```http
POST /api/search/semantic
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "query": "money issues",
  "limit": 20,
  "minScore": 0.7,
  "generateMissingEmbeddings": false
}
```

---

## 🔧 Cấu Hình Google OAuth

### Bước 1: Tạo Project trên Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới: **"Email Management System"**
3. Enable **Gmail API**

### Bước 2: Cấu hình OAuth Consent Screen

1. Vào **APIs & Services** → **OAuth consent screen**
2. Chọn **External** user type
3. Điền thông tin:
   - **App name:** Email Management System
   - **User support email:** your-email@example.com
   - **Developer contact:** your-email@example.com

### Bước 3: Thêm Scopes

Thêm các scopes sau:

```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.labels
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

### Bước 4: Tạo OAuth 2.0 Credentials

1. Vào **Credentials** → **Create Credentials** → **OAuth client ID**
2. Chọn **Web application**
3. Cấu hình:

**Authorized JavaScript origins:**

```
http://localhost:3000
http://localhost:8080
```

**Authorized redirect URIs:**

```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:8080/api/auth/google/callback
```

4. Lưu **Client ID** và **Client Secret**

### Bước 5: Cập nhật Environment Variables

**Backend (.env):**

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

**Frontend (.env):**

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## 🔒 Bảo Mật

### Security Best Practices

#### 1. Token Security

- ✅ **Access Token:** Lưu trong **memory** (Zustand store) - không lưu localStorage
- ✅ **Refresh Token:** Lưu trong **HttpOnly cookie** - JavaScript không thể truy cập
- ✅ **HTTPS Only:** Production phải dùng HTTPS (Secure flag)
- ✅ **Short-lived:** Access token chỉ sống 15 phút
- ✅ **Rotation:** Refresh token được rotate định kỳ

#### 2. XSS Protection

```typescript
// ✅ Sanitize HTML content
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(emailBody, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
  ALLOWED_ATTR: ['href', 'target'],
});
```

#### 3. CSRF Protection

```typescript
// ✅ Cookie với SameSite attribute
Set-Cookie: refreshToken=xxx; SameSite=Lax; HttpOnly; Secure
```

#### 4. Input Validation

```typescript
// ✅ Validate với Zod schema
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
```

#### 5. Rate Limiting

- Backend implements rate limiting với Spring Security
- Maximum 5 login attempts per minute per IP
- Maximum 10 API requests per second per user

#### 6. Secure Headers

```typescript
// Backend response headers
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 🎥 Demo Video

**Full Demo:** [https://www.youtube.com/watch?v=gWn2VShi3bQ](https://www.youtube.com/watch?v=gWn2VShi3bQ)

### Feature Demonstrations

- ✅ **Authentication:** Email signup, OTP verification, Google OAuth
- ✅ **Kanban Board:** Drag & drop emails, column management
- ✅ **AI Features:** Email summarization, semantic search
- ✅ **Search:** Fuzzy search with typo tolerance
- ✅ **Email Management:** Read, star, archive, snooze
- ✅ **Responsive UI:** Mobile, tablet, desktop views

---

## 📝 Cấu Trúc Thư Mục

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify/
│   ├── (routes)/            # Main application routes
│   │   └── mail/            # Email management
│   │       ├── [folder]/    # Dynamic folder pages
│   │       └── kanban/      # Kanban board
│   ├── layout.tsx
│   └── page.tsx
├── components/              # React components
│   ├── authentication/      # Auth components
│   ├── email/               # Email components
│   │   ├── kanban-board.tsx
│   │   ├── kanban-card.tsx
│   │   ├── kanban-column.tsx
│   │   ├── search-bar.tsx
│   │   └── search-results-view.tsx
│   ├── ui/                  # shadcn/ui components
│   └── context/             # React contexts
├── hooks/                   # Custom React hooks
│   ├── use-auth-mutations.ts
│   ├── use-email-mutations.ts
│   ├── use-kanban-mutations.ts
│   └── use-semantic-search.ts
├── lib/                     # Utilities
│   ├── stores/              # Zustand stores
│   │   └── use-auth.ts
│   └── utils.ts
├── services/                # API services
│   ├── auth.service.ts
│   ├── email.service.ts
│   ├── kanban.service.ts
│   ├── search.service.ts
│   └── axios.bi.ts          # Axios instance with interceptors
├── types/                   # TypeScript types
│   └── api.types.ts
└── utils/                   # Utility functions
    └── constants/
        └── api.ts           # API endpoints
```

---

## 🤝 Đóng Góp

Dự án này được phát triển bởi nhóm sinh viên:

- **22120120** - Nguyễn Thị Phương Anh
- **22120157** - Trần Lê Tấn Hưng
- **22120163** - Lê Văn Khoa

**Giảng viên hướng dẫn:** TS. Phạm Nguyên Khang  
**Môn học:** Phát Triển Ứng Dụng Web Nâng Cao  
**Trường:** Đại học Khoa học Tự nhiên, ĐHQG-HCM

---

## 📄 License

This project is for educational purposes only.

---

## 📞 Liên Hệ

- **GitHub:** [https://github.com/yourusername/email-final-project](https://github.com/yourusername/email-final-project)
- **Email:** your-team-email@example.com

---

**Made with ❤️ by HCMUS Students**
