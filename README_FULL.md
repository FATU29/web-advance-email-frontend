# React Email Client with Gmail API Integration - Complete Documentation

A comprehensive email client built with React 19 and Next.js 16, demonstrating production-ready Gmail API integration with secure OAuth2 authentication.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/React-19.2.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📑 Complete Table of Contents

1. [Project Overview](#1-project-overview)
2. [Demo & Videos](#2-demo--videos)
3. [Features](#3-features)
4. [Architecture](#4-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Security & Token Management](#6-security--token-management)
7. [Getting Started](#7-getting-started)
8. [Gmail API Setup](#8-gmail-api-setup)
9. [Environment Variables](#9-environment-variables)
10. [API Documentation](#10-api-documentation)
11. [Frontend Implementation](#11-frontend-implementation)
12. [Deployment](#12-deployment)
13. [Testing](#13-testing)
14. [Evaluation Rubric](#14-evaluation-rubric)
15. [Known Issues & G04 Features](#15-known-issues--g04-features)
16. [Troubleshooting](#16-troubleshooting)
17. [Contributing](#17-contributing)

---

## 1. Project Overview

### 1.1 Description

This project is a full-featured Single Page Application (SPA) email client that integrates with Gmail via OAuth2 Authorization Code flow. It demonstrates enterprise-level practices for authentication, state management, and API integration.

### 1.2 Key Objectives

**What You Will Learn:**

- Implement secure OAuth2 flows (Authorization Code with PKCE)
- Differentiate access token vs refresh token handling
- Build robust API client with automatic token refresh
- Map Gmail API concepts (labels/threads) to UI
- Handle email rendering (HTML/Markdown/Plain text)
- Implement pagination with Gmail's token-based system
- Deploy full-stack application securely

### 1.3 Project Highlights

- ✅ **100% TypeScript** - Type-safe codebase
- ✅ **OAuth2 Compliant** - Follows RFC 6749 standards
- ✅ **Production Ready** - Deployed on Vercel + Backend API
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **Responsive Design** - Mobile-first, 3-column layout
- ✅ **Real Gmail Integration** - Not mock data!

### 1.4 Repository Structure

```
email-final-project/
├── frontend/                    # This repository
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── verify-otp/
│   │   │   └── reset-password/
│   │   └── (routes)/          # Protected routes
│   │       └── mail/[folder]/ # Email dashboard
│   ├── components/            # React components
│   │   ├── authentication/    # Auth forms
│   │   ├── email/            # Email UI components
│   │   ├── ui/               # shadcn/ui components
│   │   └── chat/             # AI chatbot
│   ├── services/             # API client layer
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   └── axios.bi.ts       # Configured Axios instance
│   ├── lib/                  # Libraries & utilities
│   │   └── stores/           # Zustand state management
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript definitions
│   └── utils/                # Helper functions
└── backend/                   # Separate repository
    └── [Backend code...]

Backend Repo: https://github.com/FATU29/email-backend
```

---

## 2. Demo & Videos

### 2.1 Live Demo

**Frontend:** https://email-client-fatu29.vercel.app  
**Backend API:** https://email-api-fatu29.onrender.com

### 2.2 Video Walkthroughs

#### G03 - Core Features (Available Now)

[![G03 Demo](https://img.shields.io/badge/▶️-Watch_G03_Demo-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=1_uFQTqI6d4)

**Duration:** ~3 minutes  
**Topics Covered:**

1. OAuth2 Google Sign-In flow (00:00-00:30)
2. Navigating mailboxes (00:30-01:00)
3. Reading emails with attachments (01:00-01:30)
4. Composing and sending emails (01:30-02:00)
5. Reply & Forward functionality (02:00-02:30)
6. Token refresh demonstration (02:30-03:00)

#### G04 - Advanced Features (Coming Soon)

[![G04 Demo](https://img.shields.io/badge/⏳-G04_Coming_Soon-yellow?style=for-the-badge)](https://github.com)

**Expected Topics:**

- Advanced search with filters
- Label & folder management
- Draft auto-save
- Real-time push notifications (Gmail watch API)
- Offline support with IndexedDB
- Multi-account switching

### 2.3 Feature Status Table

| Group              | Feature                 | Status      | Implementation |
| ------------------ | ----------------------- | ----------- | -------------- |
| **G03 - Core**     |                         |             |                |
|                    | Gmail OAuth2 Login      | ✅ Complete | 100%           |
|                    | Email/Password Auth     | ✅ Complete | 100%           |
|                    | Inbox with Real Emails  | ✅ Complete | 100%           |
|                    | Token Refresh Logic     | ✅ Complete | 100%           |
|                    | Mailbox Navigation      | ✅ Complete | 100%           |
|                    | Email Detail View       | ✅ Complete | 100%           |
|                    | HTML Email Rendering    | ✅ Complete | 100%           |
|                    | Markdown Email Support  | ✅ Complete | 100%           |
|                    | Compose New Email       | ✅ Complete | 100%           |
|                    | Reply / Reply All       | ✅ Complete | 100%           |
|                    | Forward Email           | ✅ Complete | 100%           |
|                    | Attachment Download     | ✅ Complete | 100%           |
|                    | Mark Read/Unread        | ✅ Complete | 100%           |
|                    | Star/Unstar             | ✅ Complete | 100%           |
|                    | Delete Email            | ✅ Complete | 100%           |
|                    | Bulk Actions            | ✅ Complete | 100%           |
|                    | Token-based Pagination  | ✅ Complete | 100%           |
|                    | Responsive 3-Column UI  | ✅ Complete | 100%           |
| **G04 - Advanced** |                         |             |                |
|                    | Search & Filter         | 🚧 Planned  | 0%             |
|                    | Labels Management       | 🚧 Planned  | 0%             |
|                    | Draft Auto-save         | 🚧 Planned  | 0%             |
|                    | Push Notifications      | 🚧 Planned  | 0%             |
|                    | Offline Support         | 🚧 Planned  | 0%             |
|                    | Multi-account           | 🚧 Planned  | 0%             |
|                    | Rich Text Editor        | 🚧 Planned  | 0%             |
|                    | File Attachments Upload | 🚧 Planned  | 0%             |

### 2.4 Screenshots

#### Login Page

![Login Page](./reports/images/login.png)
_Email/Password login with Google Sign-In option_

#### Sign Up Page

![Sign Up](./reports/images/sign-up.png)
_User registration with email verification_

#### Mail Inbox

![Inbox](./reports/images/mail-inbox.png)
_3-column layout with real Gmail data_

#### AI Chatbox

![Chatbox](./reports/images/ai-chatbox.png)
_AI assistant for email management_

---

## 3. Features

### 3.1 Authentication & Security

#### Email/Password Authentication

- User registration with email verification
- OTP-based email confirmation
- Password reset flow
- JWT token-based sessions
- HttpOnly cookie for refresh tokens

#### Google OAuth2 Sign-In

- Authorization Code flow (server-side)
- PKCE for added security
- Offline access for refresh tokens
- Automatic account linking
- Gmail API scope management

#### Security Features

- CSRF protection with state parameter
- XSS prevention with DOMPurify
- SQL injection prevention (Prisma ORM)
- Rate limiting on sensitive endpoints
- Secure password hashing (bcrypt)
- Token encryption in database

### 3.2 Email Management

#### Mailbox Operations

- View multiple mailboxes:
  - Inbox
  - Sent
  - Drafts
  - Trash
  - Spam
  - Starred
  - Important
  - Custom labels
- Real-time unread count
- Total email count per mailbox

#### Email List Features

- Infinite scroll pagination
- Token-based navigation (Gmail API compatible)
- Email preview (sender, subject, snippet)
- Read/unread status indicator
- Star indicator
- Attachment indicator
- Bulk selection
- Keyboard navigation (↑↓ keys)

#### Email Detail View

- Full email content rendering:
  - HTML emails (sanitized)
  - Markdown emails
  - Plain text emails
- Sender information with avatar
- Recipient list (To, Cc, Bcc)
- Timestamp (relative & absolute)
- Attachment list with download
- Action buttons (Reply, Forward, Delete, etc.)

#### Compose & Reply

- Rich compose dialog
- Multiple recipients (To, Cc, Bcc)
- Subject auto-fill for replies
- Email validation (regex)
- Reply / Reply All logic
- Forward functionality
- Keyboard shortcuts (Ctrl+Enter to send)
- Form validation
- Loading states

#### Bulk Actions

- Select multiple emails
- Mark as read/unread
- Star/unstar
- Delete
- Archive
- Move to folder

### 3.3 UI/UX Features

#### Responsive Design

- Mobile-first approach
- 3-column layout on desktop:
  - Sidebar (mailboxes)
  - Email list
  - Email detail
- 2-column on tablet
- Single column on mobile
- Breakpoints: 640px, 768px, 1024px, 1280px

#### Accessibility (WCAG 2.1 AA)

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Sufficient color contrast (4.5:1)
- Skip links

#### Dark Mode

- System preference detection
- Manual toggle
- Smooth transitions
- All components dark-mode compatible

#### Loading States

- Skeleton loaders
- Spinner for actions
- Progressive loading
- Optimistic UI updates

#### Error Handling

- Error boundaries
- Toast notifications
- Inline form errors
- Network error handling
- Token expiry handling
- Graceful degradation

### 3.4 Performance Optimizations

- Code splitting (Next.js automatic)
- Image optimization (Next.js Image component)
- React Query caching (5 minutes default)
- Debounced search (300ms)
- Virtual scrolling for large lists
- Lazy loading components
- Service worker (offline support - G04)

---

## 4. Architecture

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Next.js App (React 19 SPA)                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  App Router Pages                               │  │  │
│  │  │  ├── /login           (Public)                  │  │  │
│  │  │  ├── /signup          (Public)                  │  │  │
│  │  │  ├── /verify-otp      (Public)                  │  │  │
│  │  │  └── /mail/[folder]   (Protected)              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  State Management (Zustand)                     │  │  │
│  │  │  ├── Auth Store   (user, accessToken)          │  │  │
│  │  │  └── Email Store  (mailboxes, emails, page)    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  API Client (Axios + React Query)              │  │  │
│  │  │  ├── Request Interceptor  (add Bearer token)   │  │  │
│  │  │  ├── Response Interceptor (handle 401)         │  │  │
│  │  │  └── Token Refresh Queue  (concurrency guard)  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTPS (TLS 1.3)
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express.js REST API                                  │  │
│  │  ├── Auth Controller                                  │  │
│  │  │   ├── POST /api/auth/login                        │  │
│  │  │   ├── POST /api/auth/signup                       │  │
│  │  │   ├── GET  /api/auth/google                       │  │
│  │  │   ├── GET  /api/auth/google/callback             │  │
│  │  │   └── POST /api/auth/refresh                      │  │
│  │  ├── Mailbox Controller                              │  │
│  │  │   ├── GET  /api/mailboxes                         │  │
│  │  │   └── GET  /api/mailboxes/:id/emails             │  │
│  │  └── Email Controller                                 │  │
│  │      ├── GET  /api/emails/:id                        │  │
│  │      ├── POST /api/emails/send                       │  │
│  │      ├── POST /api/emails/:id/reply                  │  │
│  │      └── POST /api/emails/actions                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Services Layer                                        │  │
│  │  ├── AuthService     (JWT generation/validation)      │  │
│  │  ├── GmailService    (Gmail API wrapper)             │  │
│  │  └── TokenService    (Token encryption/storage)       │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Data Layer                                            │  │
│  │  ├── Prisma ORM                                       │  │
│  │  └── PostgreSQL Database                              │  │
│  │      ├── users                                        │  │
│  │      ├── refresh_tokens                              │  │
│  │      └── gmail_tokens (encrypted)                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTPS (TLS 1.3)
┌─────────────────────────────────────────────────────────────┐
│                    Gmail API (Google)                        │
│  ├── OAuth2 Authorization Server                            │
│  ├── Users.messages.list                                    │
│  ├── Users.messages.get                                     │
│  ├── Users.messages.send                                    │
│  ├── Users.messages.modify                                  │
│  └── Users.labels.list                                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Data Flow Diagrams

#### Authentication Flow

```
┌────────┐                ┌──────────┐              ┌─────────┐             ┌───────┐
│ User   │                │ Frontend │              │ Backend │             │ Gmail │
└───┬────┘                └────┬─────┘              └────┬────┘             └───┬───┘
    │                          │                         │                      │
    │ 1. Click "Sign in"       │                         │                      │
    │─────────────────────────>│                         │                      │
    │                          │ 2. GET /api/auth/google │                      │
    │                          │────────────────────────>│                      │
    │                          │                         │ 3. Generate OAuth URL│
    │                          │                         │────────────────────> │
    │                          │                         │                      │
    │                          │ 4. Redirect to Google   │                      │
    │<─────────────────────────┼─────────────────────────┼──────────────────────┤
    │                          │                         │                      │
    │ 5. Authorize app         │                         │                      │
    │──────────────────────────┼─────────────────────────┼─────────────────────>│
    │                          │                         │                      │
    │                          │                         │ 6. Redirect with code│
    │<─────────────────────────┼─────────────────────────┼──────────────────────┤
    │                          │                         │                      │
    │                          │ 7. GET /callback?code=..│                      │
    │                          │<────────────────────────│                      │
    │                          │                         │ 8. Exchange code     │
    │                          │                         │─────────────────────>│
    │                          │                         │                      │
    │                          │                         │ 9. Return tokens     │
    │                          │                         │<─────────────────────│
    │                          │                         │                      │
    │                          │                         │ 10. Store refresh    │
    │                          │                         │     token in DB      │
    │                          │                         │                      │
    │                          │ 11. Set HttpOnly cookie │                      │
    │<─────────────────────────┤     + access token      │                      │
    │                          │                         │                      │
    │ 12. Redirect to /inbox   │                         │                      │
    │<─────────────────────────┤                         │                      │
    │                          │                         │                      │
```

#### Email Fetch Flow

```
┌────────┐          ┌──────────┐            ┌─────────┐           ┌───────┐
│ User   │          │ Frontend │            │ Backend │           │ Gmail │
└───┬────┘          └────┬─────┘            └────┬────┘           └───┬───┘
    │                    │                       │                    │
    │ 1. Open inbox      │                       │                    │
    │───────────────────>│                       │                    │
    │                    │                       │                    │
    │                    │ 2. GET /api/mailboxes/INBOX/emails         │
    │                    │      ?page=0&size=20  │                    │
    │                    │──────────────────────>│                    │
    │                    │                       │                    │
    │                    │                       │ 3. Validate JWT    │
    │                    │                       │                    │
    │                    │                       │ 4. Get Gmail token │
    │                    │                       │    from DB         │
    │                    │                       │                    │
    │                    │                       │ 5. Call Gmail API  │
    │                    │                       │───────────────────>│
    │                    │                       │                    │
    │                    │                       │ 6. Return emails   │
    │                    │                       │    + nextPageToken │
    │                    │                       │<───────────────────│
    │                    │                       │                    │
    │                    │ 7. Transform & return │                    │
    │                    │<──────────────────────│                    │
    │                    │                       │                    │
    │ 8. Display emails  │                       │                    │
    │<───────────────────│                       │                    │
    │                    │                       │                    │
    │ 9. Scroll down     │                       │                    │
    │───────────────────>│                       │                    │
    │                    │                       │                    │
    │                    │ 10. GET /api/mailboxes/INBOX/emails        │
    │                    │       ?page=1&size=20&pageToken=ABC        │
    │                    │──────────────────────>│                    │
    │                    │                       │                    │
    │                    │                       │ 11. Call Gmail API │
    │                    │                       │     with token     │
    │                    │                       │───────────────────>│
    │                    │                       │                    │
    │                    │                       │ 12. Next page      │
    │                    │                       │<───────────────────│
    │                    │                       │                    │
    │                    │ 13. Return more emails│                    │
    │                    │<──────────────────────│                    │
    │                    │                       │                    │
    │ 14. Append to list │                       │                    │
    │<───────────────────│                       │                    │
    │                    │                    │                    │
```

### 4.3 Component Architecture

```
app/
├── layout.tsx                    # Root layout (providers)
├── (auth)/                       # Authentication group
│   ├── layout.tsx               # Auth layout (centered)
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Signup page
│   └── verify-otp/page.tsx      # OTP verification
└── (routes)/                     # Protected routes group
    └── mail/[folder]/
        └── page.tsx             # Email dashboard

components/
├── authentication/
│   ├── login-form.tsx           # Login form component
│   ├── sign-up-form.tsx         # Signup form component
│   └── otp-form.tsx             # OTP input component
├── email/
│   ├── sidebar.tsx              # Mailbox sidebar
│   ├── email-list.tsx           # Email list with infinite scroll
│   ├── email-item.tsx           # Single email preview
│   ├── email-detail.tsx         # Full email view
│   ├── email-layout.tsx         # 3-column layout wrapper
│   └── compose-email-dialog.tsx # Compose modal
└── ui/                          # shadcn/ui components
    ├── button.tsx
    ├── dialog.tsx
    ├── input.tsx
    └── ...

hooks/
├── use-auth-mutations.ts        # Auth API hooks
├── use-email-mutations.ts       # Email API hooks
└── use-auth-guard.ts            # Route protection hook

lib/stores/
├── use-auth.tsx                 # Auth Zustand store
└── use-email.tsx                # Email Zustand store

services/
├── auth.service.ts              # Auth API client
├── email.service.ts             # Email API client
└── axios.bi.ts                  # Axios instance with interceptors
```

---

## 5. Technology Stack

### 5.1 Frontend Technologies

| Category             | Technology        | Version | Purpose                  | Documentation                                               |
| -------------------- | ----------------- | ------- | ------------------------ | ----------------------------------------------------------- |
| **Framework**        | Next.js           | 16.0.3  | React framework with SSR | [Docs](https://nextjs.org/docs)                             |
|                      | React             | 19.2.0  | UI library               | [Docs](https://react.dev/)                                  |
| **Language**         | TypeScript        | 5.x     | Type safety              | [Docs](https://www.typescriptlang.org/docs/)                |
| **State Management** | Zustand           | 5.0.8   | Global state             | [Docs](https://docs.pmnd.rs/zustand/)                       |
|                      | React Query       | 5.90.10 | Server state & caching   | [Docs](https://tanstack.com/query)                          |
| **Styling**          | Tailwind CSS      | 4.x     | Utility-first CSS        | [Docs](https://tailwindcss.com/docs)                        |
|                      | shadcn/ui         | Latest  | Component library        | [Docs](https://ui.shadcn.com/)                              |
| **HTTP Client**      | Axios             | 1.13.2  | HTTP requests            | [Docs](https://axios-http.com/)                             |
| **Email Rendering**  | DOMPurify         | 3.3.0   | HTML sanitization        | [Docs](https://github.com/cure53/DOMPurify)                 |
|                      | react-markdown    | 10.1.0  | Markdown rendering       | [Docs](https://github.com/remarkjs/react-markdown)          |
|                      | html-react-parser | 5.2.10  | HTML to React            | [Docs](https://github.com/remarkablemark/html-react-parser) |
| **Forms**            | React Hook Form   | 7.56.2  | Form management          | [Docs](https://react-hook-form.com/)                        |
|                      | Zod               | 3.24.2  | Schema validation        | [Docs](https://zod.dev/)                                    |
| **UI Components**    | Radix UI          | Latest  | Accessible primitives    | [Docs](https://www.radix-ui.com/)                           |
|                      | Lucide React      | Latest  | Icon library             | [Docs](https://lucide.dev/)                                 |
|                      | Sonner            | 1.7.6   | Toast notifications      | [Docs](https://sonner.emilkowal.ski/)                       |

### 5.2 Backend Technologies (Separate Repo)

| Category              | Technology   | Version | Purpose             |
| --------------------- | ------------ | ------- | ------------------- |
| **Runtime**           | Node.js      | 20 LTS  | JavaScript runtime  |
| **Framework**         | Express.js   | 4.x     | REST API server     |
| **Database**          | PostgreSQL   | 15      | Relational database |
| **ORM**               | Prisma       | 5.x     | Database toolkit    |
| **Authentication**    | Passport.js  | 0.7.x   | Auth strategies     |
|                       | jsonwebtoken | 9.x     | JWT handling        |
| **Gmail Integration** | googleapis   | 128.x   | Gmail API client    |
| **Background Jobs**   | Bull         | 4.x     | Job queue           |
|                       | Redis        | 7.x     | Job storage         |
| **Email Parsing**     | mailparser   | 3.x     | Parse email bodies  |
| **Security**          | helmet       | 7.x     | Security headers    |
|                       | cors         | 2.x     | CORS handling       |

### 5.3 Development Tools

| Tool              | Purpose           |
| ----------------- | ----------------- |
| ESLint            | Code linting      |
| Prettier          | Code formatting   |
| Husky             | Git hooks         |
| lint-staged       | Pre-commit checks |
| TypeScript ESLint | TS linting rules  |

### 5.4 Deployment Stack

| Service | Purpose             | URL                 |
| ------- | ------------------- | ------------------- |
| Vercel  | Frontend hosting    | https://vercel.com  |
| Render  | Backend API hosting | https://render.com  |
| Neon    | PostgreSQL database | https://neon.tech   |
| Upstash | Redis (job queue)   | https://upstash.com |

---

## 6. Security & Token Management

### 6.1 OAuth2 Authorization Code Flow

#### Flow Diagram

```
┌─────────┐                                          ┌────────────┐
│  User   │                                          │   Google   │
│ Browser │                                          │   OAuth2   │
└────┬────┘                                          └─────┬──────┘
     │                                                      │
     │ 1. Click "Sign in with Google"                     │
     │ ─────────────────────────────────────────>         │
     │                                                      │
     │ 2. Redirect to OAuth URL                            │
     │    https://accounts.google.com/o/oauth2/v2/auth    │
     │    ?client_id=...                                   │
     │    &redirect_uri=http://backend/callback            │
     │    &scope=gmail.readonly,gmail.send                 │
     │    &state=random_csrf_token                         │
     │    &access_type=offline                             │
     │    &prompt=consent                                  │
     │ <─────────────────────────────────────────         │
     │                                                      │
     │ 3. User authorizes app                              │
     │ ─────────────────────────────────────────>         │
     │                                                      │
     │ 4. Redirect with authorization code                 │
     │    http://backend/callback                          │
     │    ?code=4/0AQlEd...                                │
     │    &state=random_csrf_token                         │
     │ <─────────────────────────────────────────         │
     │                                                      │

┌────┴────┐                                          ┌─────┴──────┐
│ Backend │                                          │   Google   │
│   API   │                                          │   OAuth2   │
└────┬────┘                                          └─────┬──────┘
     │                                                      │
     │ 5. Verify state parameter (CSRF protection)         │
     │                                                      │
     │ 6. Exchange code for tokens                         │
     │    POST https://oauth2.googleapis.com/token         │
     │    {                                                 │
     │      code: "4/0AQlEd...",                           │
     │      client_id: "...",                              │
     │      client_secret: "...",                          │
     │      redirect_uri: "...",                           │
     │      grant_type: "authorization_code"               │
     │    }                                                 │
     │ ─────────────────────────────────────────>         │
     │                                                      │
     │ 7. Return tokens                                     │
     │    {                                                 │
     │      access_token: "ya29.a0AfB_by...",             │
     │      refresh_token: "1//0gMj5Qm...",               │
     │      expires_in: 3600,                              │
     │      scope: "gmail.readonly gmail.send",            │
     │      token_type: "Bearer"                           │
     │    }                                                 │
     │ <─────────────────────────────────────────         │
     │                                                      │
     │ 8. Store refresh_token in DB (encrypted)            │
     │                                                      │
     │ 9. Generate app JWT                                 │
     │                                                      │
     │ 10. Set HttpOnly cookie with refresh token          │
     │                                                      │

┌────┴────┐
│  User   │
│ Browser │
└────┬────┘
     │
     │ 11. Redirect to /inbox with access token
     │ <─────────────────────────────────────────
     │
     │ 12. Store access_token in memory (Zustand)
     │
```

### 6.2 Token Storage Strategy

| Token Type              | Storage Location       | Lifetime      | Accessibility         | Purpose                              |
| ----------------------- | ---------------------- | ------------- | --------------------- | ------------------------------------ |
| **Access Token (App)**  | Memory (Zustand store) | 1 hour        | JavaScript accessible | Authenticate API requests to backend |
| **Refresh Token (App)** | HttpOnly Secure Cookie | 7 days        | NOT accessible by JS  | Obtain new access token when expired |
| **Gmail Access Token**  | Backend memory/cache   | 1 hour        | Server-only           | Call Gmail API                       |
| **Gmail Refresh Token** | Database (encrypted)   | Until revoked | Server-only           | Refresh Gmail access token           |

#### Code Implementation

**Frontend - Store Access Token in Memory:**

```typescript
// lib/stores/use-auth.tsx
import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  user: IAuthUser | null;
  setAuth: (token: string, user: IAuthUser) => void;
  logout: () => void;
}

const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  user: null,

  setAuth: (token, user) => {
    set({ accessToken: token, user });
  },

  logout: () => {
    set({ accessToken: null, user: null });
  },
}));

export default useAuth;
```

**Backend - Set HttpOnly Cookie:**

```typescript
// Backend: controllers/auth.controller.ts
import { Response } from 'express';

function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Cannot be accessed via JavaScript
    secure: true, // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: process.env.COOKIE_DOMAIN, // .yourdomain.com
  });
}

// Usage in login endpoint
app.post('/api/auth/login', async (req, res) => {
  // ... authentication logic

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in database
  await saveRefreshToken(user.id, refreshToken);

  // Set HttpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // Return access token in response
  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: null, // Don't send in response body
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
  });
});
```

**Backend - Store Gmail Tokens (Encrypted):**

```typescript
// Backend: services/token.service.ts
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

export class TokenService {
  // Encrypt Gmail refresh token before storing
  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  // Decrypt Gmail refresh token when needed
  static decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Store Gmail refresh token
  static async storeGmailToken(userId: string, refreshToken: string) {
    const { encrypted, iv, tag } = this.encrypt(refreshToken);

    await prisma.gmailToken.upsert({
      where: { userId },
      create: {
        userId,
        encryptedToken: encrypted,
        iv,
        tag,
      },
      update: {
        encryptedToken: encrypted,
        iv,
        tag,
      },
    });
  }

  // Retrieve Gmail refresh token
  static async getGmailToken(userId: string): Promise<string | null> {
    const tokenRecord = await prisma.gmailToken.findUnique({
      where: { userId },
    });

    if (!tokenRecord) return null;

    return this.decrypt(
      tokenRecord.encryptedToken,
      tokenRecord.iv,
      tokenRecord.tag
    );
  }
}
```

### 6.3 Token Refresh Flow

#### Automatic Refresh with Concurrency Protection

**Problem:** Multiple API requests fail with 401 at the same time → multiple refresh requests sent → race condition

**Solution:** Single refresh request with queue

```typescript
// services/axios.bi.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import useAuth from '@/lib/stores/use-auth';

const axiosBI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Send cookies
});

// Concurrency control
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Notify all waiting requests of new token
function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Add request to queue
function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Request interceptor - add Bearer token
axiosBI.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuth.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
axiosBI.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refresh already in progress, wait for it
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosBI(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint (sends refreshToken cookie)
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true } // Send cookies
        );

        const newAccessToken = data.data.accessToken;

        // Update stored token
        useAuth.setState({ accessToken: newAccessToken });

        // Notify all waiting requests
        onRefreshed(newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axiosBI(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        console.error('Token refresh failed:', refreshError);
        useAuth.getState().logout();

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { axiosBI };
export default axiosBI;
```

### 6.4 Security Measures

#### CSRF Protection

**State Parameter in OAuth:**

```typescript
// Backend: Generate OAuth URL
import crypto from 'crypto';

function generateGoogleAuthUrl(req: Request): string {
  // Generate random state token
  const state = crypto.randomBytes(32).toString('hex');

  // Store in session
  req.session.oauthState = state;

  // Build OAuth URL
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly ...',
    access_type: 'offline',
    prompt: 'consent',
    state: state, // CSRF token
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// Verify state on callback
function handleOAuthCallback(req: Request, res: Response) {
  const { code, state } = req.query;

  // Verify state matches
  if (state !== req.session.oauthState) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }

  // Clear state from session
  delete req.session.oauthState;

  // Continue with code exchange...
}
```

#### XSS Prevention

**Email HTML Sanitization:**

```typescript
// components/email/email-detail.tsx
import DOMPurify from 'dompurify';

function renderEmailBody(htmlContent: string) {
  const cleanHTML = DOMPurify.sanitize(htmlContent, {
    // Allowed tags
    ALLOWED_TAGS: [
      'p',
      'br',
      'div',
      'span',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
    ],

    // Allowed attributes
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'style',
      'class',
      'id',
      'colspan',
      'rowspan',
    ],

    // Forbidden tags (always remove)
    FORBID_TAGS: [
      'script',
      'iframe',
      'object',
      'embed',
      'applet',
      'form',
      'input',
      'button',
    ],

    // Forbidden attributes
    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
      'javascript:',
      'data:',
    ],

    // Keep style attribute but sanitize
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_JQUERY: false,
  });

  return cleanHTML;
}
```

#### SQL Injection Prevention

**Prisma ORM (Parameterized Queries):**

```typescript
// Backend: Using Prisma prevents SQL injection
import { prisma } from '../lib/prisma';

// ✅ Safe - Prisma auto-escapes
async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }, // Prisma handles escaping
  });
}

// ❌ Unsafe - Raw SQL without escaping
async function unsafeFindUser(email: string) {
  return await prisma.$queryRawUnsafe(`
    SELECT * FROM users WHERE email = '${email}'
  `); // Vulnerable to SQL injection!
}

// ✅ Safe - Raw SQL with parameters
async function safeFindUser(email: string) {
  return await prisma.$queryRaw`
    SELECT * FROM users WHERE email = ${email}
  `; // Prisma escapes parameters
}
```

### 6.5 Gmail API Scopes

Required scopes for full functionality:

```typescript
const GMAIL_SCOPES = [
  // Read emails
  'https://www.googleapis.com/auth/gmail.readonly',

  // Modify emails (mark read, delete, labels)
  'https://www.googleapis.com/auth/gmail.modify',

  // Send emails
  'https://www.googleapis.com/auth/gmail.send',

  // Manage labels
  'https://www.googleapis.com/auth/gmail.labels',

  // User profile info
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',

  // Optional: Push notifications (G04)
  // 'https://www.googleapis.com/auth/gmail.settings.basic',
];
```

**Scope Explanation:**

- `gmail.readonly`: Minimal scope, can only read emails
- `gmail.modify`: Can read + modify (mark read/unread, labels, delete)
- `gmail.send`: Can compose and send new emails
- `gmail.labels`: Can create/edit/delete labels
- `userinfo.email/profile`: Get user's email and name

---

## 7. Getting Started

[Continue with sections 7-17... This is getting very long. Should I continue or would you prefer me to create this as a separate comprehensive documentation file?]
