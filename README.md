# Email AI - Advanced Email Frontend

A modern, feature-rich email management application built with Next.js, React, and TypeScript. This application provides an intuitive interface for managing emails with AI-powered features.

## 📸 Screenshots

### Login Page

![Login Page](./reports/images/login.png)

### Sign Up Page

![Sign Up Page](./reports/images/sign-up.png)

### Mail Inbox

![Mail Inbox](./reports/images/mail-inbox.png)

### AI Chatbox

![AI Chatbox](./reports/images/ai-chatbox.png)

## ✨ Features

- 🔐 **Authentication System**
  - User registration and login
  - OTP verification
  - Google OAuth integration
  - JWT token management with automatic refresh
  - Protected routes with client-side guards

- 📧 **Email Management**
  - View emails by folder (Inbox, Sent, Drafts, etc.)
  - Email detail view
  - Mark as read/unread
  - Star/unstar emails
  - Bulk actions
  - Email filtering and search

- 🤖 **AI-Powered Features**
  - AI chatbox for email assistance
  - Smart email suggestions
  - Automated email responses

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark mode support
  - Smooth animations with Framer Motion
  - Accessible components with Radix UI
  - Tailwind CSS styling

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Shadcn UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or **yarn** / **pnpm** / **bun**)

You can check your versions by running:

```bash
node --version
npm --version
```

## 🚀 First-Time Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web-advance-email-frontend
```

### 2. Install Dependencies

```bash
npm install
```

Or if you prefer other package managers:

```bash
# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Or create `.env.local` manually with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_INTERNAL_API_BASE_URL=http://localhost:8000/api/internal

# Optional: Add other environment variables as needed
```

**Note**: Replace the API URLs with your actual backend API endpoints.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

Open your browser and navigate to the URL to see the application.

## 📜 Available Scripts

### Development

```bash
# Start development server
npm run dev

# Start production server (after build)
npm run start
```

### Building

```bash
# Create production build
npm run build
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint:fix

# Type check without emitting files
npm run type-check

# Run both type check and lint
npm run validate
```

## 📁 Project Structure

```
web-advance-email-frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify-otp/
│   ├── (routes)/          # Protected routes
│   │   └── mail/          # Email management pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── authentication/    # Auth-related components
│   ├── email/             # Email-related components
│   ├── chat/              # AI chat components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Library code
│   ├── stores/           # Zustand stores
│   └── utils.ts          # Utility functions
├── services/              # API services
│   ├── axios.bi.ts       # Axios instance with interceptors
│   ├── auth.service.ts   # Authentication service
│   └── email.service.ts  # Email service
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
│   ├── constants/        # App constants
│   └── helpers/          # Helper functions
├── providers/             # React context providers
├── public/                # Static assets
└── middleware.ts          # Next.js middleware (currently disabled)
```

## 🔐 Authentication Flow

1. **Registration/Login**: Users can sign up or log in with email/password or Google OAuth
2. **OTP Verification**: New users must verify their email with OTP
3. **Token Management**: JWT tokens are stored in HTTP-only cookies
4. **Auto Refresh**: Access tokens are automatically refreshed when expired
5. **Route Protection**: Client-side route guards protect authenticated routes

## 🎯 Key Features Implementation

### Route Protection

The application uses `useAuthGuard` hook for client-side route protection:

- Automatically redirects unauthenticated users to login
- Redirects authenticated users away from auth pages
- Watches for real-time auth state changes (token expiration, logout)

### State Management

- **Zustand**: Global state management for authentication and email data
- **React Query**: Server state management and caching for API calls

### API Integration

- Axios interceptors handle:
  - Automatic token attachment to requests
  - Token refresh on 401 errors
  - Request queuing during token refresh

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
npm run dev -- -p 3001
```

### Environment Variables Not Loading

Make sure your `.env.local` file is in the root directory and restart the development server.

### Build Errors

If you encounter build errors:

1. Clear the `.next` folder: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npm run build`

## 📝 Code Conventions

This project follows specific code conventions:

- **Components**: PascalCase (e.g., `Button.tsx`, `FormLogin.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useAuth.ts`, `useBoolean.ts`)
- **API Files**: camelCase (e.g., `user.ts`, `email.ts`)
- **Types**: PascalCase (e.g., `User`, `IUserLoginParams`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

See the project's code conventions documentation for more details.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Make your changes
3. Run linting and type checking: `npm run validate`
4. Commit your changes: `git commit -m "feat: your feature description"`
5. Push to the branch: `git push origin feat/your-feature-name`
6. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues or questions, please contact the development team or create an issue in the repository.

---

**Happy Coding! 🚀**
