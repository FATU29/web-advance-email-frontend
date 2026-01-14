# 08. PHÂN TÍCH TÍNH NĂNG HÀNH ĐỘNG EMAIL (EMAIL ACTIONS)

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

1. [Tổng Quan Hệ Thống Email Actions](#1-tổng-quan-hệ-thống-email-actions)
2. [Compose Email - Soạn Email Mới](#2-compose-email---soạn-email-mới)
3. [Reply Email - Trả Lời Email](#3-reply-email---trả-lời-email)
4. [Forward Email - Chuyển Tiếp Email](#4-forward-email---chuyển-tiếp-email)
5. [Mark Read/Unread - Đánh Dấu Đã Đọc](#5-mark-readunread---đánh-dấu-đã-đọc)
6. [Star/Unstar - Gắn Sao Email](#6-starunstar---gắn-sao-email)
7. [Delete Email - Xóa Email](#7-delete-email---xóa-email)
8. [Archive Email - Lưu Trữ Email](#8-archive-email---lưu-trữ-email)
9. [ComposeEmailDialog Component](#9-composeemaildialog-component)
10. [Mutation Hooks Architecture](#10-mutation-hooks-architecture)
11. [Backend Implementation](#11-backend-implementation)
12. [Error Handling và Validation](#12-error-handling-và-validation)

---

## 1. TỔNG QUAN HỆ THỐNG EMAIL ACTIONS

### 1.1 Giới Thiệu

Hệ thống Email Actions trong ứng dụng Email Client cung cấp đầy đủ các chức năng cơ bản để người dùng quản lý và tương tác với email của họ. Tất cả các actions đều được tích hợp chặt chẽ với Gmail API, đảm bảo đồng bộ hai chiều giữa ứng dụng và tài khoản Gmail thực của người dùng.

Đây là tầng tương tác trực tiếp nhất với người dùng, nơi họ thực hiện các thao tác hàng ngày như soạn email mới, trả lời, chuyển tiếp, đánh dấu đã đọc, gắn sao và xóa email.

### 1.2 Các Action Chính

**Compose Actions (Soạn):**

- Compose New: Tạo email mới hoàn toàn
- Reply: Trả lời email cho người gửi
- Reply All: Trả lời tất cả người nhận
- Forward: Chuyển tiếp email cho người khác

**Status Actions (Trạng thái):**

- Mark as Read: Đánh dấu email đã đọc
- Mark as Unread: Đánh dấu email chưa đọc
- Star: Gắn sao email quan trọng
- Unstar: Bỏ gắn sao

**Management Actions (Quản lý):**

- Delete: Xóa email (chuyển vào Trash)
- Archive: Lưu trữ email (remove from Inbox)

### 1.3 Kiến Trúc Tổng Thể

**Frontend Layer:**

- ComposeEmailDialog: UI component cho compose/reply/forward
- Email Mutation Hooks: Custom hooks đóng gói logic gọi API
- Zustand Store: Quản lý state emails trong app

**Backend Layer:**

- EmailController: REST API endpoints
- EmailService: Business logic xử lý các actions
- GmailService: Tích hợp trực tiếp với Gmail API

**Gmail API Integration:**

- Sử dụng Gmail API v1 cho tất cả operations
- OAuth 2.0 authentication
- Real-time sync với Gmail

### 1.4 Design Principles

**Optimistic Updates:**
Nhiều actions sử dụng optimistic update - UI cập nhật ngay lập tức trước khi API hoàn thành, sau đó rollback nếu có lỗi. Điều này mang lại trải nghiệm mượt mà cho người dùng.

**Cache Invalidation:**
Sau mỗi mutation thành công, các related queries được invalidate để refetch data mới nhất.

**Error Recovery:**
Tất cả mutations đều có error handling với toast notifications cho người dùng.

---

## 2. COMPOSE EMAIL - SOẠN EMAIL MỚI

### 2.1 Chức Năng

Compose Email cho phép người dùng tạo và gửi một email hoàn toàn mới.

**Các Field:**

- To: Địa chỉ người nhận (bắt buộc, hỗ trợ nhiều người, cách nhau bằng dấu phẩy)
- Cc: Carbon Copy (tùy chọn, hiển thị khi click button "Cc")
- Bcc: Blind Carbon Copy (tùy chọn, hiển thị khi click button "Bcc")
- Subject: Tiêu đề email (bắt buộc)
- Body: Nội dung email (bắt buộc)

### 2.2 Frontend Flow

**Bước 1 - Mở Dialog:**
User click nút "Compose" → ComposeEmailDialog mở với mode = 'compose'.

**Bước 2 - Nhập Thông Tin:**
User điền các field. Cc và Bcc ẩn mặc định, hiển thị khi click button tương ứng.

**Bước 3 - Validation:**
Trước khi gửi, frontend validate:

- To field không được trống
- Subject không được trống
- Body không được trống
- Tất cả email addresses phải đúng format (regex check)

**Bước 4 - Gửi Email:**

- useSendEmailMutation được gọi với ISendEmailParams
- Loading state hiển thị trên button
- Keyboard shortcut: Ctrl+Enter để gửi nhanh

**Bước 5 - Kết Quả:**

- Success: Toast "Email sent successfully", dialog đóng
- Error: Toast error message, dialog giữ nguyên để user retry

### 2.3 Backend Implementation

**Endpoint:**

```
POST /api/emails/send
```

**Request Body (SendEmailRequest):**

- to: List<String> - danh sách người nhận
- cc: List<String> (optional)
- bcc: List<String> (optional)
- subject: String
- body: String

**Processing:**

1. Validate user có Gmail connected
2. Join danh sách recipients thành string
3. Gọi GmailService.sendMessage()
4. Gmail API thực hiện gửi email thực sự

### 2.4 Email Format Parsing

Frontend parse email addresses từ comma-separated string:

**Logic:**

1. Split string theo dấu phẩy
2. Trim whitespace từng email
3. Filter bỏ empty strings
4. Validate mỗi email với regex pattern

**Regex Pattern:**

```
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

Pattern này kiểm tra:

- Không có whitespace trước @
- Có đúng một ký tự @
- Có domain sau @
- Có TLD cuối cùng

---

## 3. REPLY EMAIL - TRẢ LỜI EMAIL

### 3.1 Chức Năng

Reply Email cho phép người dùng trả lời một email đã nhận. Hệ thống hỗ trợ hai modes:

**Reply (Trả lời):**
Chỉ gửi cho người gửi ban đầu.

**Reply All (Trả lời tất cả):**
Gửi cho người gửi và tất cả người nhận của email gốc.

### 3.2 Pre-fill Logic

Khi mở dialog ở mode 'reply' hoặc 'replyAll', các field được tự động điền:

**Reply Mode:**

- To: Email của người gửi ban đầu
- Subject: "Re: " + original subject (nếu chưa có prefix)
- To field: Disabled, không cho sửa
- Cc/Bcc: Hidden

**Reply All Mode:**

- To: Người gửi + tất cả recipients từ To và Cc
- Subject: "Re: " + original subject
- Cc: Giữ nguyên danh sách Cc gốc (nếu có)
- To field: Disabled

### 3.3 Backend Implementation

**Endpoint:**

```
POST /api/emails/{emailId}/reply
```

**Request Body (ReplyEmailRequest):**

- body: String - nội dung reply
- replyAll: boolean - true nếu reply all

**Processing:**

1. Validate Gmail connection
2. Fetch original email từ Gmail API
3. Extract sender address
4. Add "Re:" prefix nếu chưa có
5. Gọi GmailService.sendMessage() với recipient = original sender

### 3.4 Thread Handling

Khi reply, Gmail API tự động:

- Link reply với thread gốc
- Maintain conversation history
- Show trong cùng thread trên Gmail web/app

Điều này đảm bảo conversation được nhóm đúng cách.

---

## 4. FORWARD EMAIL - CHUYỂN TIẾP EMAIL

### 4.1 Chức Năng

Forward Email cho phép người dùng chuyển tiếp một email đã nhận cho người khác.

### 4.2 Pre-fill Logic

Khi mở dialog ở mode 'forward':

**To Field:**

- Trống, user phải nhập người nhận mới
- Không disabled như reply

**Subject:**

- "Fwd: " + original subject (nếu chưa có prefix)

**Body:**
Tự động include email gốc với format:

```
---------- Forwarded message ----------
From: {Sender Name} <{sender@email.com}>
Date: {Date/Time}
Subject: {Original Subject}
To: {Original Recipients}

{Original Body Content}
```

### 4.3 Backend Implementation

**Endpoint:**

```
POST /api/emails/{emailId}/forward
```

**Request Body (ForwardEmailRequest):**

- to: List<String> - danh sách người nhận mới
- additionalMessage: String (optional) - message thêm ở đầu

**Processing:**

1. Validate Gmail connection
2. Fetch original email
3. Build forward subject với "Fwd:" prefix
4. Build forwarded body với header và original content
5. Prepend additionalMessage nếu có
6. Gọi GmailService.sendMessage()

### 4.4 Forward Body Construction

Backend xây dựng body theo format chuẩn:

**Structure:**

1. Additional message (nếu có)
2. Separator "---------- Forwarded message ---------"
3. Original email metadata (From, Date, Subject, To)
4. Empty line
5. Original email body

**HTML Format:**
Sử dụng `<br>` tags để format, đảm bảo render đúng trong email clients.

---

## 5. MARK READ/UNREAD - ĐÁNH DẤU ĐÃ ĐỌC

### 5.1 Chức Năng

Cho phép người dùng đánh dấu email đã đọc hoặc chưa đọc.

**Mark as Read:**
Khi user mở xem email, tự động đánh dấu đã đọc.

**Mark as Unread:**
User có thể manually đánh dấu email là chưa đọc (useful cho reminders).

### 5.2 Frontend Implementation

**Mutation Hooks:**

- Không có dedicated hook cho mark read/unread trong current implementation
- Xử lý thông qua bulk action hoặc automatic khi view email

**Automatic Mark Read:**
Khi user click vào email để xem chi tiết, có thể trigger mark as read automatically.

### 5.3 Backend Endpoints

**Mark as Read:**

```
PATCH /api/emails/{emailId}/read
```

**Mark as Unread:**

```
PATCH /api/emails/{emailId}/unread
```

**Backend Processing:**

1. Get userId từ authentication
2. Gọi EmailService.markAsRead() hoặc markAsUnread()
3. Service gọi Gmail API để modify labels

### 5.4 Gmail Label Modification

Gmail sử dụng labels để track read status:

- UNREAD label: Email chưa đọc
- Remove UNREAD: Email đã đọc

**Mark as Read:**
Remove label "UNREAD" từ email.

**Mark as Unread:**
Add label "UNREAD" vào email.

---

## 6. STAR/UNSTAR - GẮN SAO EMAIL

### 6.1 Chức Năng

Cho phép người dùng đánh dấu email quan trọng bằng cách gắn sao (star).

**Star:**
Gắn sao để đánh dấu email quan trọng, cần follow-up.

**Unstar:**
Bỏ gắn sao khi đã xử lý xong.

### 6.2 Frontend Implementation

**useToggleEmailStarMutation Hook:**
Hook chuyên dụng cho toggle star với optimistic update.

**Optimistic Update Logic:**

1. Update Zustand store ngay lập tức (UI phản hồi instant)
2. Gọi API toggleEmailStar()
3. Nếu success: Invalidate related queries để sync
4. Nếu fail: Zustand state sẽ được overwrite khi refetch

**State Update:**
Cập nhật cả `emails` list và `selectedEmail` nếu email đang được xem.

### 6.3 Backend Endpoint

**Toggle Star:**

```
PATCH /api/emails/{emailId}/star?starred={true|false}
```

**Processing:**

1. Get userId và emailId
2. Gọi EmailService.toggleStar() với starred value
3. Gmail API modify labels: Add/Remove "STARRED"

### 6.4 Gmail Starred Label

Gmail sử dụng STARRED label:

- Add STARRED: Email được gắn sao
- Remove STARRED: Bỏ gắn sao

Starred emails xuất hiện trong folder "Starred" trên Gmail.

---

## 7. DELETE EMAIL - XÓA EMAIL

### 7.1 Chức Năng

Cho phép người dùng xóa email. Email bị xóa sẽ được chuyển vào Trash, không xóa vĩnh viễn ngay.

### 7.2 Frontend Implementation

**useDeleteEmailMutation Hook:**
Hook xử lý delete với state cleanup.

**State Cleanup:**

- Remove email từ `emails` array trong Zustand store
- Clear `selectedEmail` nếu email đang được xem là email bị xóa

**UI Flow:**

1. User click delete button
2. Confirmation dialog (optional, tùy implementation)
3. Mutation triggered
4. Email biến mất khỏi list ngay lập tức
5. Toast notification khi hoàn thành

### 7.3 Backend Endpoint

**Delete Email:**

```
DELETE /api/emails/{emailId}
```

**Processing:**

1. Get userId và emailId
2. Gọi EmailService.deleteEmails()
3. Gmail API: Move to Trash

### 7.4 Soft Delete vs Hard Delete

**Current Implementation (Soft Delete):**
Email được move vào TRASH folder, không bị xóa vĩnh viễn.

**Gmail Trash Behavior:**

- Emails trong Trash được giữ 30 ngày
- Sau 30 ngày, Gmail auto-delete permanently
- User có thể restore từ Trash trong thời gian này

---

## 8. ARCHIVE EMAIL - LƯU TRỮ EMAIL

### 8.1 Chức Năng

Archive cho phép người dùng ẩn email khỏi Inbox mà không xóa.

**Archive:**
Email vẫn tồn tại, có thể tìm kiếm được, nhưng không hiển thị trong Inbox.

**Useful For:**

- Email đã xử lý xong nhưng cần giữ lại
- Dọn dẹp Inbox mà không mất data
- Organize emails sau khi hoàn thành task

### 8.2 Backend Implementation

**Endpoint:**
Thông qua modify endpoint:

```
POST /api/emails/{emailId}/modify
{
  "action": "archive",
  "emailIds": ["{emailId}"]
}
```

**Processing:**

1. Gọi EmailService.archiveEmails()
2. Gmail API: Add "ARCHIVE" label, Remove "INBOX" label

### 8.3 Gmail Archive Behavior

**Labels Modified:**

- Remove: INBOX
- Add: ARCHIVE (nếu applicable)

**Result:**

- Email không còn trong Inbox
- Email vẫn có thể tìm qua search
- Email vẫn có thể access qua "All Mail"

---

## 9. COMPOSEEMAILDIALOG COMPONENT

### 9.1 Component Overview

ComposeEmailDialog là component React chính cho tất cả compose operations.

**Modes Supported:**

- 'compose': Tạo email mới
- 'reply': Trả lời người gửi
- 'replyAll': Trả lời tất cả
- 'forward': Chuyển tiếp

### 9.2 Props Interface

**Props:**

- `open`: boolean - Dialog đang mở hay không
- `onOpenChange`: (open: boolean) => void - Callback khi đóng/mở
- `mode`: ComposeMode - Chế độ compose
- `originalEmail`: IEmailDetail (optional) - Email gốc cho reply/forward

### 9.3 State Management

**Local States:**

- `to`: Địa chỉ người nhận
- `cc`: Carbon copy
- `bcc`: Blind carbon copy
- `subject`: Tiêu đề
- `body`: Nội dung
- `showCc`: Hiển thị field Cc
- `showBcc`: Hiển thị field Bcc

### 9.4 Effect Hooks

**Pre-fill Effect:**
useEffect chạy khi `open`, `mode`, hoặc `originalEmail` thay đổi:

- Reset tất cả fields khi dialog đóng
- Pre-fill fields dựa trên mode khi dialog mở

**Dependency Array:**
`[open, mode, originalEmail]`

### 9.5 UI Structure

**Header:**

- Title động theo mode (New Message, Reply, Reply All, Forward)
- Close button (X icon)

**Form Fields:**

- To field với Cc/Bcc toggle buttons
- Conditional Cc/Bcc fields với close buttons
- Subject field
- Body textarea (min-height 300px)
- Keyboard shortcut hint

**Footer:**

- Attachment button (disabled - future feature)
- Cancel button
- Send button với loading state

### 9.6 Keyboard Shortcuts

**Ctrl+Enter / Cmd+Enter:**
Gửi email nhanh mà không cần click button.

Implementation:

- onKeyDown handler trên DialogContent
- Check ctrlKey hoặc metaKey + key === 'Enter'
- Trigger handleSend()

---

## 10. MUTATION HOOKS ARCHITECTURE

### 10.1 Query Keys Structure

Hệ thống sử dụng hierarchical query keys:

**Structure:**

```
emailQueryKeys = {
  all: ['email']
  mailboxes: ['email', 'mailboxes']
  mailbox: (id) => ['email', 'mailboxes', id]
  emails: ['email', 'emails']
  emailsByMailbox: (mailboxId, params) => ['email', 'emails', mailboxId, page, size]
  email: (id) => ['email', 'email', id]
}
```

**Benefits:**

- Hierarchical invalidation (invalidate 'email' → invalidate all sub-keys)
- Granular caching
- Easy to manage related data

### 10.2 Mutation Pattern

Tất cả mutations follow pattern tương tự:

**Structure:**

1. useMutation hook với mutationFn
2. mutationFn gọi API function
3. Check response.data.success
4. Update Zustand store (optimistic update)
5. Return response hoặc throw error
6. onSuccess: Invalidate related queries

### 10.3 useSendEmailMutation

**Purpose:**
Gửi email mới hoặc forward.

**MutationFn:**

```
(params: ISendEmailParams) => sendEmail(params)
```

**onSuccess:**

- Invalidate emails query (refresh sent folder)
- Invalidate mailboxes query (update counts)

### 10.4 useReplyEmailMutation

**Purpose:**
Trả lời email (reply hoặc reply all).

**MutationFn:**

```
({ emailId, params }) => replyEmail(emailId, params)
```

**onSuccess:**

- Invalidate emails và mailboxes queries

### 10.5 useToggleEmailStarMutation

**Purpose:**
Toggle star status của email.

**MutationFn với Optimistic Update:**

1. Gọi toggleEmailStar(emailId, starred)
2. Update useEmail store:
   - Map emails, update isStarred cho matching emailId
   - Update selectedEmail nếu đang xem email đó

**onSuccess:**

- Invalidate email(emailId) query
- Invalidate emails và mailboxes queries

### 10.6 useDeleteEmailMutation

**Purpose:**
Xóa email.

**MutationFn:**

1. Gọi deleteEmail(emailId)
2. Filter email khỏi emails array trong store
3. Clear selectedEmail nếu đang xem email bị xóa

**onSuccess:**

- Invalidate emails và mailboxes queries

---

## 11. BACKEND IMPLEMENTATION

### 11.1 EmailController

Controller xử lý tất cả email-related endpoints.

**Key Endpoints:**

- POST /api/emails/send
- POST /api/emails/{emailId}/reply
- POST /api/emails/{emailId}/forward
- PATCH /api/emails/{emailId}/read
- PATCH /api/emails/{emailId}/unread
- PATCH /api/emails/{emailId}/star
- DELETE /api/emails/{emailId}
- POST /api/emails/{emailId}/modify (bulk actions)

### 11.2 EmailService

Service layer chứa business logic cho email operations.

**Key Methods:**

- `sendEmail(userId, request)`: Gửi email mới
- `replyToEmail(userId, emailId, request)`: Reply email
- `forwardEmail(userId, emailId, request)`: Forward email
- `markAsRead(userId, emailIds)`: Mark emails as read
- `markAsUnread(userId, emailIds)`: Mark as unread
- `toggleStar(userId, emailIds, starred)`: Toggle star
- `deleteEmails(userId, emailIds)`: Delete emails
- `archiveEmails(userId, emailIds)`: Archive emails

### 11.3 GmailService Integration

Tất cả operations cuối cùng đều thông qua GmailService:

**Key Methods:**

- `sendMessage(userId, to, subject, body)`: Gửi email
- `getMessage(userId, emailId)`: Get email details
- `modifyMessage(userId, emailId, addLabels, removeLabels)`: Modify labels
- `trashMessage(userId, emailId)`: Move to trash

### 11.4 Transaction Handling

Các methods trong EmailService được annotate với @Transactional:

- Đảm bảo atomicity
- Rollback nếu có exception
- Consistency giữa local state và Gmail

### 11.5 Gmail Connection Check

Mỗi operation đều bắt đầu bằng việc check Gmail connection:

**Check:**

```java
if (!gmailService.isGmailConnected(userId)) {
    throw new ResourceNotFoundException("Gmail not connected...");
}
```

Điều này đảm bảo:

- User đã authenticate với Gmail
- Token còn valid
- Proper error message nếu không connected

---

## 12. ERROR HANDLING VÀ VALIDATION

### 12.1 Frontend Validation

**Email Address Validation:**

- Regex check format
- Display invalid emails trong error toast

**Required Fields:**

- To (required cho compose/forward)
- Subject (required)
- Body (required)

**Mode-Specific Validation:**

- Reply/ReplyAll: To field auto-filled, không validate
- Forward/Compose: Validate To field

### 12.2 Error Toast Messages

Sử dụng Sonner toast library:

**Success Messages:**

- "Email sent successfully"
- "Email forwarded successfully"
- "Reply sent successfully"

**Error Messages:**

- Hiển thị error.message từ caught error
- Fallback message nếu không có specific message

### 12.3 Backend Validation

**DTO Validation:**
Sử dụng @Valid annotation với Jakarta Validation:

- @NotNull
- @NotEmpty
- @Email (format validation)

**Business Validation:**

- Gmail connection check
- Email existence check
- User authorization check

### 12.4 Error Response Format

**ApiResponse wrapper:**

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### 12.5 Common Error Scenarios

**Gmail Not Connected:**

- Message: "Gmail not connected. Please connect your Gmail account first."
- Solution: Redirect to Gmail OAuth flow

**Invalid Email Format:**

- Frontend catch với regex before sending
- Display: "Invalid email address: xxx@invalid"

**Network Error:**

- React Query retry mechanism
- Toast error for user awareness

**API Rate Limiting:**

- Gmail API có quotas
- Backend có thể implement retry logic

---

## 📊 TỔNG KẾT

### Thành Tựu

Hệ thống Email Actions đã đạt được các mục tiêu:

1. **Full Gmail Integration**: Tất cả actions sync với Gmail thực
2. **Optimistic Updates**: UI responsive với instant feedback
3. **Comprehensive Validation**: Frontend và backend validation
4. **Mode Flexibility**: Single component cho nhiều compose modes
5. **Keyboard Shortcuts**: Power user support với Ctrl+Enter

### Điểm Có Thể Cải Thiện

1. **Attachments Support**: Hiện chưa implement gửi file đính kèm

2. **Draft Saving**: Auto-save draft khi đang compose

3. **Rich Text Editor**: WYSIWYG editor thay vì plain textarea

4. **Undo Send**: Delayed send với option hủy

5. **Templates**: Email templates cho common responses

6. **Bulk Actions UI**: UI cho select nhiều emails và bulk action

---

**Tài liệu được tạo cho mục đích học thuật và phát triển dự án.**

_© 2025 - Nhóm 22120120 - 22120157 - 22120163_
