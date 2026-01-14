# 07. PHÂN TÍCH TÍNH NĂNG LỌC VÀ SẮP XẾP (FILTER & SORT FEATURES)

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

1. [Tổng Quan Hệ Thống Filter & Sort](#1-tổng-quan-hệ-thống-filter--sort)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Sort Options - Tùy Chọn Sắp Xếp](#3-sort-options---tùy-chọn-sắp-xếp)
4. [Filter Options - Tùy Chọn Lọc](#4-filter-options---tùy-chọn-lọc)
5. [KanbanFilters Component](#5-kanbanfilters-component)
6. [Backend Filter Implementation](#6-backend-filter-implementation)
7. [Tích Hợp Frontend-Backend](#7-tích-hợp-frontend-backend)
8. [State Management](#8-state-management)
9. [Luồng Xử Lý Dữ Liệu](#9-luồng-xử-lý-dữ-liệu)
10. [UI/UX Design Patterns](#10-uiux-design-patterns)
11. [Performance Considerations](#11-performance-considerations)
12. [Edge Cases và Error Handling](#12-edge-cases-và-error-handling)

---

## 1. TỔNG QUAN HỆ THỐNG FILTER & SORT

### 1.1 Giới Thiệu

Hệ thống Filter & Sort trong ứng dụng Email Client cho phép người dùng tổ chức và tìm kiếm email trên Kanban Board một cách hiệu quả. Đây là tính năng quan trọng giúp người dùng nhanh chóng định vị các email cần xử lý trong số lượng lớn email.

Hệ thống được thiết kế với nguyên tắc chia sẻ trách nhiệm giữa Frontend và Backend:

- **Backend**: Xử lý các filter phức tạp cần truy vấn database (unread, attachments, sorting)
- **Frontend**: Xử lý các filter đơn giản có thể thực hiện client-side (starred filter)

### 1.2 Các Tính Năng Chính

**Sort Options (Sắp Xếp):**

- Date: Newest First - Sắp xếp theo ngày nhận, mới nhất trước
- Date: Oldest First - Sắp xếp theo ngày nhận, cũ nhất trước
- Sender Name - Sắp xếp theo tên người gửi theo alphabet

**Filter Options (Lọc):**

- Unread Only - Chỉ hiển thị email chưa đọc
- With Attachments - Chỉ hiển thị email có file đính kèm
- Starred Only - Chỉ hiển thị email đã gắn sao (client-side)

### 1.3 Mục Tiêu Thiết Kế

Hệ thống Filter & Sort được thiết kế với các mục tiêu sau:

**Trực Quan và Dễ Sử Dụng:**

- Dropdown menu với labels rõ ràng
- Badge hiển thị số lượng filter đang active
- Active filters hiển thị dạng chips có thể xóa từng cái

**Hiệu Năng Cao:**

- Filter phức tạp được xử lý ở backend
- Memoization để tránh re-render không cần thiết
- Chỉ fetch data khi filter params thay đổi

**Linh Hoạt:**

- Có thể kết hợp nhiều filter cùng lúc
- Clear All để xóa tất cả filter nhanh chóng
- Giữ trạng thái filter khi navigate

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Component Architecture

Hệ thống Filter & Sort được tổ chức theo kiến trúc component rõ ràng:

**KanbanFilters Component:**
Component chính chứa UI cho filter và sort. Đây là controlled component nhận state và callbacks từ parent.

**Kanban Page:**
Container component quản lý state của filter và sort, đồng thời fetch data từ backend dựa trên filter params.

**useKanbanFilteredBoardQuery Hook:**
Custom hook đóng gói logic fetch data với filter params, sử dụng React Query để caching và state management.

### 2.2 Data Flow

Luồng dữ liệu trong hệ thống Filter & Sort:

**Bước 1 - User Interaction:**
Người dùng tương tác với KanbanFilters component (chọn sort option hoặc toggle filter).

**Bước 2 - State Update:**
Parent component (Kanban Page) cập nhật state (sortBy, activeFilters).

**Bước 3 - Params Transform:**
Frontend mapping state sang backend format (date-desc → date_newest).

**Bước 4 - API Call:**
useKanbanFilteredBoardQuery gọi API với filter params mới.

**Bước 5 - Backend Processing:**
Backend service áp dụng filter và sort, trả về kết quả.

**Bước 6 - UI Update:**
Frontend nhận data mới và re-render Kanban board.

### 2.3 Filter Params Interface

Hệ thống sử dụng interface chuẩn hóa cho filter params:

**Frontend Interface (IKanbanFilterParams):**

- `sortBy`: 'date_newest' | 'date_oldest' | 'sender_name'
- `unreadOnly`: boolean (optional)
- `hasAttachmentsOnly`: boolean (optional)
- `fromSender`: string (optional) - filter theo người gửi
- `columnId`: string (optional) - filter theo column cụ thể
- `maxEmailsPerColumn`: number (optional) - giới hạn số email mỗi column

**Backend DTO (KanbanFilterRequest):**
Tương tự frontend interface, đảm bảo consistency giữa hai tầng.

---

## 3. SORT OPTIONS - TÙY CHỌN SẮP XẾP

### 3.1 Các Tùy Chọn Sắp Xếp

Hệ thống hỗ trợ ba tùy chọn sắp xếp:

**Date: Newest First (date-desc / date_newest):**

- Mặc định khi load trang
- Email mới nhận sẽ hiển thị đầu tiên trong mỗi column
- Phù hợp với workflow thông thường: xử lý email mới trước

**Date: Oldest First (date-asc / date_oldest):**

- Email cũ nhất hiển thị đầu tiên
- Hữu ích khi muốn xử lý backlog theo thứ tự nhận
- Đảm bảo không bỏ sót email cũ

**Sender Name (sender / sender_name):**

- Sắp xếp theo tên người gửi theo thứ tự alphabet
- Hữu ích khi muốn nhóm email từ cùng một người/tổ chức
- Case-insensitive comparison

### 3.2 Frontend-Backend Mapping

Do naming convention khác nhau, frontend cần mapping:

**Frontend Values → Backend Values:**

- 'date-desc' → 'date_newest'
- 'date-asc' → 'date_oldest'
- 'sender' → 'sender_name'

Mapping được thực hiện thông qua useMemo để tránh re-compute không cần thiết.

### 3.3 Backend Comparator Implementation

Backend sử dụng Java Comparator để sort emails:

**Date Newest (Default):**
So sánh receivedAt theo thứ tự giảm dần (reverseOrder), null values được đưa lên đầu (nullsFirst) để đảm bảo consistency.

**Date Oldest:**
So sánh receivedAt theo thứ tự tự nhiên (natural order), null values được đưa xuống cuối (nullsLast).

**Sender Name:**
So sánh fromName sau khi lowercase, null values được đưa xuống cuối. Điều này đảm bảo:

- Case-insensitive sorting
- Emails không có tên người gửi sẽ ở cuối danh sách

### 3.4 Sort Application

Sort được áp dụng cho mỗi column riêng biệt, không phải toàn bộ board. Điều này có nghĩa:

- Emails trong column "To Do" được sort độc lập
- Emails trong column "In Progress" được sort độc lập
- Thứ tự giữa các columns không bị ảnh hưởng

---

## 4. FILTER OPTIONS - TÙY CHỌN LỌC

### 4.1 Unread Only Filter

**Mục Đích:**
Chỉ hiển thị các email chưa đọc, giúp người dùng focus vào những email cần xử lý.

**Backend Implementation:**
Khi `unreadOnly = true`, backend filter loại bỏ tất cả email có `status.isRead() = true`.

**Use Cases:**

- Kiểm tra nhanh xem có email mới cần trả lời không
- Focus vào inbox khi có nhiều email
- Tránh bị distract bởi email đã xử lý

### 4.2 With Attachments Filter

**Mục Đích:**
Chỉ hiển thị các email có file đính kèm (attachments).

**Backend Implementation:**
Khi `hasAttachmentsOnly = true`, backend filter loại bỏ email có `status.isHasAttachments() = false`.

**Use Cases:**

- Tìm email có document quan trọng
- Download attachments hàng loạt
- Quản lý files từ email

### 4.3 Starred Only Filter

**Mục Đích:**
Chỉ hiển thị các email đã được gắn sao (starred/important).

**Implementation:**
Đây là client-side filter vì backend không support filter starred qua API hiện tại.

**Client-Side Logic:**
Sau khi nhận data từ backend, frontend filter thêm một lần nữa:

- Nếu starred filter active, chỉ giữ emails có `isStarred = true`
- Filter được apply trong useMemo trên emailsByColumn data

**Use Cases:**

- Xem nhanh các email quan trọng đã đánh dấu
- Theo dõi emails cần follow-up
- Tạo "virtual folder" cho starred emails

### 4.4 From Sender Filter

**Mục Đích:**
Lọc email từ một người gửi cụ thể (partial match supported).

**Backend Implementation:**
So sánh `fromSender` với cả `fromEmail` và `fromName`, case-insensitive, partial match.

Ví dụ: Filter "john@" sẽ match:

- john@example.com
- john@company.org
- johnny@domain.com (vì contains "john@")

**Use Cases:**

- Tìm tất cả email từ một người
- Quản lý conversation với một contact
- Tracking communication với client/partner

### 4.5 Kết Hợp Nhiều Filters

Các filter có thể được kết hợp với nhau:

**Logic Kết Hợp:**
Tất cả filters sử dụng AND logic - email phải thỏa mãn TẤT CẢ điều kiện filter.

**Ví Dụ:**
Nếu active cả "Unread Only" và "With Attachments":
→ Chỉ hiển thị email CHƯA ĐỌC VÀ có ATTACHMENTS

**Filter Chain:**

1. Backend apply: unreadOnly, hasAttachmentsOnly, fromSender
2. Frontend apply: starred (client-side)
3. Kết quả cuối cùng là intersection của tất cả filters

---

## 5. KANBANFILTERS COMPONENT

### 5.1 Component Interface

KanbanFilters là controlled component với interface rõ ràng:

**Props:**

- `sortBy`: SortOption hiện tại ('date-desc' | 'date-asc' | 'sender')
- `onSortChange`: Callback khi thay đổi sort
- `activeFilters`: Set các filter đang active
- `onFiltersChange`: Callback khi thay đổi filters
- `className`: CSS class bổ sung (optional)

**Type Definitions:**

- `SortOption`: 'date-desc' | 'date-asc' | 'sender'
- `FilterType`: 'unread' | 'attachments' | 'starred'

### 5.2 Sort Dropdown

Sort dropdown sử dụng Radix UI DropdownMenu với radio group:

**Structure:**

- Trigger button với icon ArrowUpDown và text "Sort"
- Dropdown content với label "Sort By"
- Radio group cho 3 options

**Behavior:**

- Chỉ một option được chọn tại một thời điểm
- Khi chọn option mới, callback onSortChange được gọi
- Current sort hiển thị ở góc phải (desktop only)

### 5.3 Filter Dropdown

Filter dropdown sử dụng checkbox items cho multi-select:

**Structure:**

- Trigger button với icon Filter và text "Filter"
- Badge hiển thị số lượng active filters (nếu > 0)
- Checkbox items cho từng filter option
- "Clear All Filters" button (khi có filter active)

**Visual Feedback:**

- Button có border và background khác khi có filter active
- Badge với số lượng giúp user biết đang có filter

### 5.4 Active Filters Display

Khi có filter active, các badge được hiển thị inline:

**Features:**

- Mỗi filter hiển thị như một chip/badge
- Click vào badge để toggle off filter đó
- Icon X nhỏ trong badge để remove
- Animation fade-in khi xuất hiện

**Styling:**

- Background màu primary nhẹ
- Border màu primary
- Hover effect scale và color change
- Transition smooth

### 5.5 Toggle Filter Logic

Toggle filter được implement với Set manipulation:

**Algorithm:**

1. Clone Set hiện tại: `new Set(activeFilters)`
2. Check xem filter đã có trong Set chưa
3. Nếu có → delete; Nếu chưa → add
4. Gọi callback với Set mới

Sử dụng Set thay vì Array để:

- O(1) lookup/add/delete
- Tự động đảm bảo uniqueness
- Dễ dàng check existence với `.has()`

---

## 6. BACKEND FILTER IMPLEMENTATION

### 6.1 KanbanFilterRequest DTO

DTO định nghĩa các field cho filter request:

**Fields:**

- `sortBy`: String - "date_newest" | "date_oldest" | "sender_name"
- `unreadOnly`: Boolean - null hoặc true
- `hasAttachmentsOnly`: Boolean - null hoặc true
- `fromSender`: String - partial match filter
- `columnId`: String - filter specific column
- `maxEmailsPerColumn`: Integer - limit emails (default 50, max 100)

**Default Values:**

- sortBy: "date_newest" nếu null
- unreadOnly: false nếu null
- hasAttachmentsOnly: false nếu null
- maxEmailsPerColumn: 50 nếu null

### 6.2 KanbanService Filter Logic

KanbanService xử lý filter trong method `getFilteredBoard`:

**Step 1 - Fetch All Statuses:**
Load tất cả EmailKanbanStatus của user từ database.

**Step 2 - Apply Filters:**
Gọi `applyFilters()` method để filter danh sách.

**Step 3 - Group By Column:**
Phân loại emails vào các columns tương ứng.

**Step 4 - Apply Sort:**
Với mỗi column, apply sort comparator.

**Step 5 - Apply Limit:**
Giới hạn số email mỗi column theo maxEmailsPerColumn.

**Step 6 - Build Response:**
Tạo KanbanBoardResponse với columns và emailsByColumn.

### 6.3 Apply Filters Method

Method `applyFilters()` sử dụng Java Stream để filter:

**Logic:**
Với mỗi EmailKanbanStatus, check các điều kiện:

1. **Unread Filter:**
   - Nếu `unreadOnly = true` và `status.isRead() = true` → loại bỏ

2. **Attachments Filter:**
   - Nếu `hasAttachmentsOnly = true` và `status.isHasAttachments() = false` → loại bỏ

3. **Sender Filter:**
   - Nếu `fromSender` không null, check partial match với fromEmail và fromName
   - Case-insensitive comparison

**Return:**
Danh sách EmailKanbanStatus đã được filter.

### 6.4 Sort Comparator

Method `getSortComparator()` trả về Comparator phù hợp:

**Date Newest (Default):**
So sánh `receivedAt` reverse order, null values first.

**Date Oldest:**
So sánh `receivedAt` natural order, null values last.

**Sender Name:**
So sánh `fromName` lowercase, null values last.

**Usage:**
Comparator được áp dụng cho list emails trong mỗi column trước khi limit.

### 6.5 Logging và Monitoring

Service log thông tin filter để debug và monitoring:

**Log Format:**

```
Loaded filtered Kanban board for user {userId} with {count} total emails
(sortBy: {sortBy}, unreadOnly: {unreadOnly}, hasAttachmentsOnly: {hasAttachmentsOnly})
```

Điều này giúp:

- Debug issues với filter
- Monitor usage patterns
- Performance tracking

---

## 7. TÍCH HỢP FRONTEND-BACKEND

### 7.1 API Endpoint

Filter API được expose qua KanbanController:

**Endpoint:**

```
POST /api/kanban/board/filtered
```

**Request Body:**
KanbanFilterRequest DTO

**Response:**
KanbanBoardResponse chứa columns và emailsByColumn

### 7.2 KanbanService Frontend

Frontend service đóng gói API call:

**Method:**
`getFilteredBoard(params: IKanbanFilterParams)`

**Implementation:**
Gọi POST request với params, return AxiosResponse với ApiResponse wrapper.

### 7.3 useKanbanFilteredBoardQuery Hook

Hook đóng gói logic fetch với React Query:

**Query Key:**
`['kanban', 'board', 'filtered', params]`

Params được include trong key để:

- Automatic refetch khi params thay đổi
- Separate cache cho mỗi combination của params

**QueryFn:**
Gọi KanbanService.getFilteredBoard() và extract data từ response.

**Options:**

- refetchOnWindowFocus: false - tránh spam API
- refetchOnMount: true - đảm bảo data fresh
- refetchInterval: false - không auto-refetch

### 7.4 Filter Params Building

Trong Kanban Page, filter params được build từ state:

**Mapping Logic:**

1. Map sortBy từ frontend format sang backend format
2. Check activeFilters Set và set boolean flags
3. Chỉ include params có giá trị (undefined = không filter)

**Memoization:**
Sử dụng `useMemo` để avoid recreate object mỗi render:

- Dependency: [backendSortBy, activeFilters]
- Chỉ recompute khi dependencies thay đổi

---

## 8. STATE MANAGEMENT

### 8.1 Local State

Kanban Page quản lý filter state với useState:

**sortBy State:**

- Type: 'date-desc' | 'date-asc' | 'sender'
- Default: 'date-desc'

**activeFilters State:**

- Type: Set<'unread' | 'attachments' | 'starred'>
- Default: new Set() (empty)

### 8.2 State Lifting

State được lift lên Kanban Page (container component) để:

- Single source of truth
- KanbanFilters là pure presentational component
- Easy to persist/restore state nếu cần

### 8.3 Derived State

Một số state được derive từ primary state:

**backendSortBy:**
Derived từ sortBy qua mapping function.

**filterParams:**
Derived từ backendSortBy và activeFilters.

**filteredAndSortedEmailsByColumn:**
Derived từ emailsByColumn + client-side starred filter.

Sử dụng `useMemo` cho derived state để optimize performance.

### 8.4 State Persistence (Future)

Hiện tại state không được persist, có thể mở rộng:

- localStorage để remember user preferences
- URL params để shareable filtered views
- User settings API để sync across devices

---

## 9. LUỒNG XỬ LÝ DỮ LIỆU

### 9.1 Initial Load

**Bước 1:**
Component mount với default state (date-desc, no filters).

**Bước 2:**
useKanbanFilteredBoardQuery trigger với default params.

**Bước 3:**
Backend load all emails, apply default sort (date_newest).

**Bước 4:**
Response populate emailsByColumn state.

**Bước 5:**
Kanban board render với sorted emails.

### 9.2 Sort Change Flow

**Bước 1:**
User click sort dropdown, chọn option mới.

**Bước 2:**
onSortChange callback được gọi với new sort value.

**Bước 3:**
setSortBy update state → trigger re-render.

**Bước 4:**
useMemo recalculate backendSortBy và filterParams.

**Bước 5:**
useKanbanFilteredBoardQuery detect params change, refetch.

**Bước 6:**
Backend apply new sort, return re-sorted data.

**Bước 7:**
UI update với new data.

### 9.3 Filter Toggle Flow

**Bước 1:**
User click filter checkbox (e.g., "Unread Only").

**Bước 2:**
toggleFilter function create new Set với/without filter.

**Bước 3:**
onFiltersChange callback với new Set.

**Bước 4:**
setActiveFilters update state.

**Bước 5:**
filterParams recompute với new flags.

**Bước 6:**
API call với new filter params.

**Bước 7:**
Backend apply filters, return filtered data.

**Bước 8:**
UI update showing only matching emails.

### 9.4 Client-Side Filter (Starred)

**Sau Backend Response:**

1. emailsByColumn được populate từ API
2. useMemo check nếu starred filter active
3. Nếu active, filter mỗi column chỉ giữ isStarred = true
4. filteredAndSortedEmailsByColumn được sử dụng cho render

**Tại Sao Client-Side:**

- Backend hiện không support starred filter
- Starred status đã có trong response data
- Filtering small dataset không ảnh hưởng performance

---

## 10. UI/UX DESIGN PATTERNS

### 10.1 Dropdown Menu Pattern

Sử dụng dropdown menu cho sort và filter:

**Ưu Điểm:**

- Compact UI, không chiếm nhiều space
- Familiar pattern cho users
- Easy to add more options

**Implementation:**

- Radix UI DropdownMenu component
- Trigger là Button với icon
- Content aligned to start

### 10.2 Badge Notification Pattern

Badge hiển thị số lượng active filters:

**Visual Design:**

- Small badge attached to Filter button
- Primary color to draw attention
- Number inside badge

**Purpose:**

- Instant visibility of active filters
- Reminder để user biết view đang filtered

### 10.3 Chip/Tag Pattern

Active filters hiển thị như chips:

**Features:**

- Each filter is a removable chip
- Click anywhere on chip to remove
- X icon for explicit remove action

**Benefits:**

- Clear visibility of what's filtered
- Easy one-click removal
- Scannable list of filters

### 10.4 Animation và Feedback

Animations cải thiện UX:

**Active Filters Animation:**

- fade-in khi appear
- slide-in-from-left-2 cho entrance
- duration-300 cho smooth transition

**Hover Effects:**

- scale-105 on hover
- scale-95 on active/click
- Color transitions

### 10.5 Responsive Design

Component responsive cho các screen sizes:

**Mobile:**

- Buttons stacked vertically nếu cần
- Dropdowns full-width
- Touch-friendly tap targets

**Desktop:**

- Horizontal layout
- Current sort displayed on right
- More padding/spacing

---

## 11. PERFORMANCE CONSIDERATIONS

### 11.1 Memoization

Extensive use of useMemo và useCallback:

**backendSortBy Memo:**
Avoid string mapping on every render.

**filterParams Memo:**
Avoid object recreation.

**filteredAndSortedEmailsByColumn Memo:**
Avoid re-filtering unchanged data.

### 11.2 Query Key Optimization

React Query key includes params:

**Benefits:**

- Automatic cache separation per filter combination
- Background refetch khi revisit same params
- Stale data shown instantly while refetching

### 11.3 Backend Efficiency

**Stream Processing:**
Java Streams cho filtering efficient với lazy evaluation.

**Early Termination:**
Filter conditions checked with short-circuit logic.

**Limit Application:**
Limit applied after sort để ensure correct top N.

### 11.4 Avoiding Unnecessary Refetches

**refetchOnWindowFocus: false**
Prevent refetch khi switch tabs.

**refetchInterval: false**
No polling, only refetch on param change.

### 11.5 Set vs Array for Filters

Using Set for activeFilters:

**Performance:**

- O(1) has/add/delete vs O(n) for Array
- Automatic uniqueness

**Trade-off:**

- Need to convert to Array for iteration với map()
- Set not JSON serializable directly

---

## 12. EDGE CASES VÀ ERROR HANDLING

### 12.1 Empty Results

Khi filter trả về 0 results:

**UI Handling:**

- Kanban columns vẫn hiển thị
- Empty state message trong mỗi column
- Filter chips vẫn visible để user có thể remove

**UX Consideration:**

- Không auto-clear filters
- User explicitly removes filters nếu muốn

### 12.2 All Emails Filtered Out

Khi kết hợp filters loại bỏ tất cả emails:

**Behavior:**

- Mỗi column empty
- Clear All Filters option prominent
- Consider showing "No emails match your filters" message

### 12.3 Invalid Sort Value

Nếu sortBy không hợp lệ:

**Backend Fallback:**
Default case trong switch statement → "date_newest"

**Frontend Validation:**
TypeScript type checking prevent invalid values.

### 12.4 Network Error During Filter

**React Query Handling:**

- Previous data shown (stale-while-revalidate)
- Error state available via query
- Retry mechanism built-in

**User Experience:**

- Data không mất khi filter fail
- Toast error có thể được hiển thị
- Retry button nếu cần

### 12.5 Large Dataset

Khi user có nhiều emails:

**Mitigation:**

- maxEmailsPerColumn limit (default 50, max 100)
- Pagination có thể được implement
- Backend efficient với Stream processing

### 12.6 Rapid Filter Changes

User toggle filters nhanh liên tiếp:

**Handling:**

- React Query automatically cancels previous request
- Latest params được sử dụng
- UI remains responsive

---

## 📊 TỔNG KẾT

### Thành Tựu

Hệ thống Filter & Sort đã đạt được các mục tiêu đề ra:

1. **Flexibility**: Nhiều sort và filter options đáp ứng đa dạng use cases

2. **Performance**: Backend processing cho filters phức tạp, memoization cho frontend

3. **UX Excellence**: Visual feedback rõ ràng, animations smooth, easy removal

4. **Maintainability**: Clean separation giữa presentation và logic

5. **Type Safety**: TypeScript interfaces đảm bảo consistency

### Điểm Có Thể Cải Thiện

1. **Starred Filter Backend**: Move starred filter lên backend để consistency

2. **Advanced Filters**: Date range, subject contains, etc.

3. **Saved Filters**: Cho phép user save filter combinations

4. **Filter Presets**: Quick filters như "This Week", "From VIPs"

5. **URL Persistence**: Shareable filtered views qua URL params

---

**Tài liệu được tạo cho mục đích học thuật và phát triển dự án.**

_© 2025 - Nhóm 22120120 - 22120157 - 22120163_
