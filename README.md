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

- G03 (Core Email Functionality): https://www.youtube.com/watch?v=1_uFQTqI6d4
- G04 (Advanced Features): https://youtu.be/c7dfVpS_bow
- G05 (Kanban Board & AI Integration): https://youtu.be/RN56GGeU3c0

### Feature Demonstrations

| Group   | Feature                     | Status | Demo Link                                            |
| ------- | --------------------------- | ------ | ---------------------------------------------------- |
| **G03** | Core Email Functionality    | ✅     | [Watch](https://www.youtube.com/watch?v=1_uFQTqI6d4) |
|         | - Gmail OAuth2 Login        | ✅     |                                                      |
|         | - Inbox with Real Emails    | ✅     |                                                      |
|         | - Compose & Send            | ✅     |                                                      |
|         | - Reply & Forward           | ✅     |                                                      |
| **G04** | Advanced Features           | ✅     | [Watch](https://youtu.be/c7dfVpS_bow)                |
|         | - Search & Filter           | ✅     |                                                      |
|         | - Push Notifications        | ✅     |                                                      |
| **G05** | Kanban Board & AI Features  | ✅     | [Watch](https://youtu.be/RN56GGeU3c0)                |
|         | - Kanban Interface          | ✅     |                                                      |
|         | - Drag-and-Drop Workflow    | ✅     |                                                      |
|         | - Snooze/Deferral Mechanism | ✅     |                                                      |
|         | - AI Content Summarization  | ✅     |                                                      |

### Screenshots

![Login](./reports/images/login.png)
![Inbox](./reports/images/mail-inbox.png)

---

## ✨ Features

### Core Email Functionality (G03)

- ✅ Email/Password + Google OAuth2
- ✅ Multiple mailboxes (Inbox, Sent, Drafts)
- ✅ Token-based pagination
- ✅ Compose, Reply, Forward
- ✅ HTML & Markdown rendering
- ✅ Dark mode support

### Advanced Features (G04)

- ✅ Advanced search and filtering
- ✅ Real-time notifications
- ✅ Email categories and labels

### Kanban Board & AI (G05)

- ✅ **Kanban Interface**: Organize emails into customizable columns (Inbox, To Do, In Progress, Done, Backlog, Snoozed)
- ✅ **Drag-and-Drop Workflow**: Intuitive email management by dragging cards between columns
- ✅ **Snooze Mechanism**: Temporarily hide emails and automatically restore them after a set time
- ✅ **AI Summarization**: Real-time email content summarization using LLM API (OpenAI/Gemini)

---

## 📊 Evaluation Rubric

### G03 & G04 Evaluation

| Criteria                     | Weight | Status |
| ---------------------------- | ------ | ------ |
| Gmail Correctness & Security | 30%    | ✅     |
| Token Handling & Refresh     | 25%    | ✅     |
| Backend API Correctness      | 15%    | ✅     |
| Frontend UI                  | 15%    | ✅     |
| Deployment + Demo            | 10%    | ✅     |
| Code Quality                 | 5%     | ✅     |

**Total: 100%** ✅

### G05 Evaluation (Kanban Board & AI Integration)

> **TL;DR**: We are not focusing on building a standard Email Client (e.g., displaying content, replying), as Gmail handles this perfectly. Instead, we focus on **AI aspects**: summarization and semantic search to retrieve relevant emails. The UI emphasizes workflow management through a Kanban interface.

| Feature                                     | Grading Criteria                                                                                                                                                                                                                                                                    | Max Score | Status |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| **I. Kanban Interface Visualization**       | • The interface renders the board with distinct columns (flexible configuration: Inbox, To Do, Done, Backlog, Snoozed)<br>• Cards display real email data fetched from backend (Sender, Subject, Content snippet)<br>• The layout is organized and visually readable (Kanban style) | 25        | ✅     |
| **II. Workflow Management (Drag-and-Drop)** | • Users can successfully drag a Card from one column to another<br>• Dropping a Card triggers Backend update to change email status<br>• UI updates Card position immediately without full page refresh                                                                             | 25        | ✅     |
| **III. Snooze/Deferral Mechanism**          | • Selecting "Snooze" correctly removes/hides the Card from active column<br>• Card is successfully moved to "Snoozed" state/column<br>• Logic implemented to "wake up" (restore) email to active view after time passes                                                             | 25        | ✅     |
| **IV. Content Summarization Integration**   | • Backend successfully sends real email text to LLM API (OpenAI/Gemini)<br>• System returns dynamically generated summary (no hardcoded/mock text)<br>• Summary is clearly displayed on Card with option to view full content                                                       | 25        | ✅     |

**Total: 100/100** ✅

### Key Implementation Details

#### I. Kanban Interface

- Dynamic columns fetched from backend API
- Real-time email data display with sender, subject, and AI summary
- Responsive design with full-width layout
- Color-coded columns for visual organization
- Gmail sync integration with status indicators

#### II. Drag-and-Drop

- Implemented using @dnd-kit library
- Real-time backend updates via REST API
- Optimistic UI updates with React Query
- Smooth animations and visual feedback

#### III. Snooze Mechanism

- Custom snooze dialog with date/time picker
- Backend job scheduler for automatic email restoration
- Visual indicators for snoozed emails
- Support for custom snooze durations

#### IV. AI Summarization

- Integration with OpenAI/Gemini LLM APIs
- Real-time summary generation for incoming emails
- Expandable dialog to view full AI-generated summaries
- Regenerate summary option for updated analysis
- Compact card view with 3-line preview and full-screen modal

---

**Built with ❤️ by FATU29**
