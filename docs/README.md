# 📚 TÀI LIỆU PHÂN TÍCH DỰ ÁN

## React Email Client với Gmail Integration & AI-Powered Kanban

**Nhóm thực hiện:** 22120120 - 22120157 - 22120163

---

## 📋 MỤC LỤC TÀI LIỆU

### 🔐 1. Xác Thực & Bảo Mật

| Tài liệu                                                         | Mô tả                                                 | Trạng thái    |
| ---------------------------------------------------------------- | ----------------------------------------------------- | ------------- |
| [01_AUTHENTICATION_ANALYSIS.md](./01_AUTHENTICATION_ANALYSIS.md) | Phân tích hệ thống đăng nhập, OAuth 2.0, JWT, bảo mật | ✅ Hoàn thành |

### 📧 2. Đồng Bộ Email

| Tài liệu                                                 | Mô tả                                                       | Trạng thái    |
| -------------------------------------------------------- | ----------------------------------------------------------- | ------------- |
| [02_EMAIL_SYNC_ANALYSIS.md](./02_EMAIL_SYNC_ANALYSIS.md) | Gmail API integration, fetch on demand, caching, pagination | ✅ Hoàn thành |

### 📋 3. Kanban Board (4 phần)

| Tài liệu                                                                   | Mô tả                                        | Trạng thái    |
| -------------------------------------------------------------------------- | -------------------------------------------- | ------------- |
| [03_KANBAN_PART1_OVERVIEW.md](./03_KANBAN_PART1_OVERVIEW.md)               | Tổng quan Kanban, kiến trúc, data model      | ✅ Hoàn thành |
| [03_KANBAN_PART2_DRAGDROP.md](./03_KANBAN_PART2_DRAGDROP.md)               | Drag & Drop với @dnd-kit, optimistic updates | ✅ Hoàn thành |
| [03_KANBAN_PART3_COLUMNS_LABELS.md](./03_KANBAN_PART3_COLUMNS_LABELS.md)   | Quản lý columns, Gmail labels mapping        | ✅ Hoàn thành |
| [03_KANBAN_PART4_FILTERING_CARDS.md](./03_KANBAN_PART4_FILTERING_CARDS.md) | Filter, sort, email cards trong Kanban       | ✅ Hoàn thành |

### ⏰ 4. Snooze Email

| Tài liệu                                         | Mô tả                                     | Trạng thái    |
| ------------------------------------------------ | ----------------------------------------- | ------------- |
| [04_SNOOZE_ANALYSIS.md](./04_SNOOZE_ANALYSIS.md) | Tạm ẩn email, scheduler, unsnooze tự động | ✅ Hoàn thành |

### 🤖 5. AI Features

| Tài liệu                                                   | Mô tả                                         | Trạng thái    |
| ---------------------------------------------------------- | --------------------------------------------- | ------------- |
| [05_AI_FEATURES_ANALYSIS.md](./05_AI_FEATURES_ANALYSIS.md) | AI summarization, smart reply, classification | ✅ Hoàn thành |

### 🔍 6. Search & Filter

| Tài liệu                                                           | Mô tả                                           | Trạng thái    |
| ------------------------------------------------------------------ | ----------------------------------------------- | ------------- |
| [06_SEARCH_FEATURES_ANALYSIS.md](./06_SEARCH_FEATURES_ANALYSIS.md) | Fuzzy search, semantic search, auto-suggestions | ✅ Hoàn thành |
| [07_FILTER_SORT_ANALYSIS.md](./07_FILTER_SORT_ANALYSIS.md)         | Bộ lọc, sắp xếp email trong Kanban              | ✅ Hoàn thành |

### ✉️ 7. Email Actions

| Tài liệu                                                       | Mô tả                                          | Trạng thái    |
| -------------------------------------------------------------- | ---------------------------------------------- | ------------- |
| [08_EMAIL_ACTIONS_ANALYSIS.md](./08_EMAIL_ACTIONS_ANALYSIS.md) | Compose, Reply, Forward, Star, Delete, Archive | ✅ Hoàn thành |

### 🏗️ 8. Kiến Trúc Hệ Thống

| Tài liệu                                                     | Mô tả                                                | Trạng thái    |
| ------------------------------------------------------------ | ---------------------------------------------------- | ------------- |
| [09_ARCHITECTURE_ANALYSIS.md](./09_ARCHITECTURE_ANALYSIS.md) | Microservices, deployment, database schema, security | ✅ Hoàn thành |

---

## 📖 TÀI LIỆU BỔ SUNG (Week 4)

| Tài liệu                                                           | Mô tả                    |
| ------------------------------------------------------------------ | ------------------------ |
| [WEEK4_REQUIREMENTS_ANALYSIS.md](./WEEK4_REQUIREMENTS_ANALYSIS.md) | Phân tích yêu cầu tuần 4 |
| [WEEK4_TESTING_GUIDE.md](./WEEK4_TESTING_GUIDE.md)                 | Hướng dẫn kiểm thử       |
| [WEEK4_UI_ENHANCEMENTS.md](./WEEK4_UI_ENHANCEMENTS.md)             | Cải tiến giao diện       |
| [WEEK4_VISUAL_GUIDE.md](./WEEK4_VISUAL_GUIDE.md)                   | Hướng dẫn trực quan      |

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend

- **Framework:** Next.js 15, React 19
- **Language:** TypeScript
- **State Management:** TanStack Query, Zustand
- **UI Components:** Shadcn/UI, Tailwind CSS
- **Drag & Drop:** @dnd-kit

### Backend

- **Framework:** Spring Boot 3.5
- **Language:** Java 21
- **Database:** MongoDB
- **Authentication:** JWT, OAuth 2.0
- **API:** Gmail API

### AI Service

- **Framework:** FastAPI
- **Language:** Python 3.12
- **AI Provider:** OpenAI API
- **Models:** gpt-4o-mini, text-embedding-3-small

### Infrastructure

- **Containerization:** Docker, Docker Compose
- **Deployment:** Railway (có thể mở rộng)

---

## 📊 TỔNG QUAN CHỨC NĂNG

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL CLIENT APPLICATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   AUTH       │  │   EMAIL      │  │   KANBAN     │           │
│  │   ────────   │  │   ────────   │  │   ────────   │           │
│  │ • Login      │  │ • Sync       │  │ • Columns    │           │
│  │ • Register   │  │ • List       │  │ • Drag/Drop  │           │
│  │ • OAuth 2.0  │  │ • Detail     │  │ • Labels     │           │
│  │ • JWT        │  │ • Actions    │  │ • Filter     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   SEARCH     │  │   SNOOZE     │  │   AI         │           │
│  │   ────────   │  │   ────────   │  │   ────────   │           │
│  │ • Fuzzy      │  │ • Schedule   │  │ • Summary    │           │
│  │ • Semantic   │  │ • Auto-wake  │  │ • Reply      │           │
│  │ • Suggest    │  │ • Presets    │  │ • Classify   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 THỐNG KÊ TÀI LIỆU

| Metric                         | Giá trị    |
| ------------------------------ | ---------- |
| Tổng số tài liệu phân tích     | 12 files   |
| Tổng số tài liệu bổ sung       | 4 files    |
| Chức năng chính được phân tích | 9 modules  |
| Ngôn ngữ tài liệu              | Tiếng Việt |

---

## 🚀 HƯỚNG DẪN SỬ DỤNG TÀI LIỆU

### Đọc theo thứ tự đề xuất:

1. **Bắt đầu với Authentication** (01) - Hiểu cách hệ thống xác thực
2. **Email Sync** (02) - Cách đồng bộ với Gmail
3. **Kanban Overview** (03 Part 1) - Tổng quan Kanban board
4. **Kanban Details** (03 Part 2-4) - Chi tiết từng tính năng
5. **AI Features** (05) - Các tính năng AI
6. **Search & Filter** (06, 07) - Tìm kiếm và lọc
7. **Email Actions** (08) - Các thao tác email
8. **Architecture** (09) - Kiến trúc tổng thể

### Tìm kiếm nhanh theo chủ đề:

- **OAuth/JWT:** → 01_AUTHENTICATION
- **Gmail API:** → 02_EMAIL_SYNC
- **Drag & Drop:** → 03_KANBAN_PART2
- **OpenAI Integration:** → 05_AI_FEATURES
- **Semantic Search:** → 06_SEARCH_FEATURES
- **Microservices:** → 09_ARCHITECTURE

---

_Tài liệu được tạo tự động - Cập nhật lần cuối: Tháng 1/2026_
