# React Email Client with Gmail API Integration

A full-featured email client built with React and Next.js, integrated with Gmail API for real-time email management.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/React-19.2.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black.svg)

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Demo & Videos](#-demo--videos)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Security & Token Management](#-security--token-management)
- [Getting Started](#-getting-started)
- [Gmail API Setup](#-gmail-api-setup)
- [Evaluation Rubric](#-evaluation-rubric)

---

## 🎯 Project Overview

This project implements a modern email client that connects to Gmail via OAuth2 and the Gmail REST API.

### Key Highlights

- ✅ **Secure OAuth2 Flow**: Complete Authorization Code flow
- ✅ **Token Management**: HttpOnly cookies + in-memory tokens
- ✅ **Real-time Sync**: Gmail API pagination
- ✅ **Responsive UI**: 3-column layout
- ✅ **Rich Rendering**: HTML sanitization, Markdown support
- ✅ **Accessibility**: WCAG 2.1 AA compliant

---

## 🎥 Demo & Videos

### Feature Demonstrations

| Group   | Feature                  | Status  | Demo Link                                            |
| ------- | ------------------------ | ------- | ---------------------------------------------------- |
| **G03** | Core Email Functionality | ✅      | [Watch](https://www.youtube.com/watch?v=1_uFQTqI6d4) |
|         | - Gmail OAuth2 Login     | ✅      |                                                      |
|         | - Inbox with Real Emails | ✅      |                                                      |
|         | - Compose & Send         | ✅      |                                                      |
|         | - Reply & Forward        | ✅      |                                                      |
| **G04** | Advanced Features        | 🚧 Soon | TBA                                                  |
|         | - Search & Filter        | 🚧      |                                                      |
|         | - Push Notifications     | 🚧      |                                                      |
| **G04** | Advanced Features        | 🚧 Soon | [Watch](https://youtu.be/c7dfVpS_bow)                |

### Screenshots

![Login](./reports/images/login.png)
![Inbox](./reports/images/mail-inbox.png)

---

## ✨ Features

- ✅ Email/Password + Google OAuth2
- ✅ Multiple mailboxes (Inbox, Sent, Drafts)
- ✅ Token-based pagination
- ✅ Compose, Reply, Forward
- ✅ HTML & Markdown rendering
- ✅ Dark mode support

---

## 📊 Evaluation Rubric

| Criteria                     | Weight | Status |
| ---------------------------- | ------ | ------ |
| Gmail Correctness & Security | 30%    | ✅     |
| Token Handling & Refresh     | 25%    | ✅     |
| Backend API Correctness      | 15%    | ✅     |
| Frontend UI                  | 15%    | ✅     |
| Deployment + Demo            | 10%    | ✅     |
| Code Quality                 | 5%     | ✅     |

**Total: 100%** ✅

---

**Built with ❤️ by FATU29**
