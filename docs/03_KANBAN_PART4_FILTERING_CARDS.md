# PHÂN TÍCH CHỨC NĂNG KANBAN BOARD - PHẦN 4: FILTERING, SORTING VÀ EMAIL CARD

## Đồ Án Cuối Kỳ - Ứng Dụng Email Client với Kanban Board

### Nhóm: 22120120 - 22120157 - 22120163

---

## MỤC LỤC PHẦN 4

1. [Hệ Thống Filtering](#1-hệ-thống-filtering)
2. [Hệ Thống Sorting](#2-hệ-thống-sorting)
3. [Email Card Display](#3-email-card-display)
4. [Tương Tác với Email Card](#4-tương-tác-với-email-card)
5. [Performance Optimization](#5-performance-optimization)
6. [Responsive Design](#6-responsive-design)

---

## 1. HỆ THỐNG FILTERING

### 1.1. Tổng Quan Về Filtering

Filtering cho phép người dùng lọc email trên Kanban Board theo các tiêu chí khác nhau, giúp tập trung vào những email quan trọng và giảm visual clutter. Hệ thống hỗ trợ nhiều loại filter có thể kết hợp với nhau.

**Mục đích của filtering:**
Trong một board có nhiều email, việc filtering giúp user nhanh chóng tìm được email cần xử lý. Ví dụ, user có thể filter chỉ hiển thị email chưa đọc để ưu tiên, hoặc filter email có attachment để tìm tài liệu cần thiết.

**Các loại filter hỗ trợ:**
Hệ thống hỗ trợ filter theo trạng thái đọc bao gồm tất cả, chỉ chưa đọc, hoặc chỉ đã đọc. Hệ thống cũng hỗ trợ filter theo attachment là có file đính kèm hay không. Ngoài ra còn có filter theo người gửi với tìm kiếm partial match trên tên hoặc email address.

### 1.2. Filter Theo Trạng Thái Đọc

**Unread Only Filter:**
Đây là filter phổ biến nhất, cho phép user chỉ xem những email chưa đọc. Điều này hữu ích khi user muốn đảm bảo không bỏ sót email mới.

**Cách hoạt động:**
Khi unreadOnly được set true trong filter params, backend filter EmailKanbanStatus records có isRead = false. Chỉ những email thỏa điều kiện mới được include trong response.

**UI integration:**
Frontend có toggle button hoặc checkbox cho unread filter. Khi activated, board chỉ hiển thị email chưa đọc trên tất cả các cột.

### 1.3. Filter Theo Attachment

**Has Attachments Filter:**
Filter này cho phép user chỉ xem email có file đính kèm. Hữu ích khi cần tìm email chứa tài liệu, hình ảnh, hoặc file.

**Cách hoạt động:**
Khi hasAttachmentsOnly được set true, backend filter records có hasAttachments = true. Trường hasAttachments được cache từ Gmail message metadata.

**Use cases:**
User có thể sử dụng filter này khi cần tìm một file được gửi qua email. Hoặc khi muốn review tất cả email có document để archive hoặc download.

### 1.4. Filter Theo Người Gửi

**Sender Filter:**
Filter này cho phép user tìm email từ một người gửi cụ thể. Hỗ trợ partial match trên cả email address và sender name.

**Cách hoạt động:**
User nhập search term vào filter input. Backend filter records có fromEmail hoặc fromName chứa search term (case-insensitive). Sử dụng contains match thay vì exact match.

**Matching logic:**
Search term được lowercase trước khi compare. So sánh với cả fromEmail và fromName. Email match nếu một trong hai chứa search term.

### 1.5. Filter Theo Column

**Column Filter:**
Cho phép user focus vào một column cụ thể. Chỉ email trong column được chọn mới được hiển thị.

**Cách hoạt động:**
Khi columnId được specify trong filter params, backend chỉ include email có columnId matching.

**UI integration:**
Có thể implement như column selector dropdown. Hoặc click vào column header để filter.

### 1.6. Kết Hợp Nhiều Filters

**Logical AND:**
Khi multiple filters được apply, chúng được combine với AND logic. Email phải thỏa mãn tất cả điều kiện để được hiển thị.

**Ví dụ:**
unreadOnly = true AND hasAttachmentsOnly = true sẽ chỉ hiển thị email vừa chưa đọc vừa có attachment. Đây là cách để tìm email quan trọng cần xử lý ngay.

**Backend implementation:**
Filters được apply sequentially trong stream pipeline. Mỗi filter condition là một predicate trong filter() operation.

---

## 2. HỆ THỐNG SORTING

### 2.1. Tổng Quan Về Sorting

Sorting cho phép user sắp xếp email trong board theo thứ tự mong muốn. Hệ thống hỗ trợ nhiều tiêu chí sắp xếp khác nhau.

**Mục đích của sorting:**
Sorting giúp user nhanh chóng tìm được email theo logic mong muốn. Ví dụ, sort theo date newest để xem email mới nhất, hoặc sort theo sender name để group email theo người gửi.

**Các tiêu chí sorting:**
Hệ thống hỗ trợ sort theo ngày nhận với hai chiều là newest first hoặc oldest first. Hệ thống cũng hỗ trợ sort theo tên người gửi theo thứ tự alphabetical.

### 2.2. Sort Theo Ngày - Newest First

**Mô tả:**
Đây là sort order mặc định, hiển thị email mới nhất ở đầu mỗi column. Phù hợp với workflow xử lý email theo thứ tự thời gian.

**Cách hoạt động:**
Backend sử dụng Comparator với Comparator.reverseOrder() trên receivedAt field. Email có receivedAt gần nhất sẽ ở trên cùng.

**Use case:**
Phù hợp cho user muốn xử lý email theo thứ tự nhận được. Email mới có thể urgent hơn nên cần được thấy trước.

### 2.3. Sort Theo Ngày - Oldest First

**Mô tả:**
Hiển thị email cũ nhất ở đầu mỗi column. Phù hợp khi cần xử lý backlog theo thứ tự FIFO (First In First Out).

**Cách hoạt động:**
Backend sử dụng Comparator với Comparator.naturalOrder() trên receivedAt field. Email có receivedAt xa nhất sẽ ở trên cùng.

**Use case:**
Phù hợp cho user muốn clear backlog. Email cũ có thể đã chờ lâu và cần được xử lý trước.

### 2.4. Sort Theo Tên Người Gửi

**Mô tả:**
Sắp xếp email theo tên người gửi theo thứ tự alphabetical. Giúp group email từ cùng một người.

**Cách hoạt động:**
Backend sử dụng Comparator trên fromName field với lowercase transformation. Email từ cùng sender sẽ ở gần nhau.

**Use case:**
Hữu ích khi cần xử lý email theo sender. Ví dụ, trả lời tất cả email từ một client cùng lúc.

### 2.5. Null Handling trong Sorting

**Vấn đề:**
Một số email có thể có null values cho các field dùng để sort. Ví dụ, receivedAt có thể null nếu parse fail, hoặc fromName có thể null.

**Giải pháp:**
Sử dụng Comparator.nullsLast() hoặc Comparator.nullsFirst() để handle null values. Nulls được đặt ở cuối hoặc đầu tùy theo logic mong muốn.

**Implementation:**
Với date_newest, null dates được đặt ở cuối (nullsFirst với reverseOrder). Với sender_name, null names được đặt ở cuối (nullsLast).

### 2.6. Sort Apply Per Column

**Cách hoạt động:**
Sorting được apply riêng cho mỗi column. Tất cả columns sử dụng cùng sort criteria nhưng sort độc lập.

**Lý do:**
Mỗi column là một unit độc lập. Email position trong column reflects priority của user. Sort giúp maintain consistency trong viewing order.

---

## 3. EMAIL CARD DISPLAY

### 3.1. Cấu Trúc Email Card

Email Card là component hiển thị thông tin tóm tắt của một email trên Kanban board. Mỗi card được thiết kế để cung cấp đủ thông tin cần thiết mà không overwhelming.

**Layout tổng quan:**
Card có layout vertical với header chứa sender info và actions, content area chứa subject và preview, và footer với metadata. Card có border và shadow để tạo depth và separation.

**Responsive sizing:**
Card width adapt theo column width. Content được truncate nếu quá dài. Touch targets đủ lớn cho mobile devices.

### 3.2. Sender Information

**Avatar:**
Card hiển thị avatar của sender ở góc trái trên. Avatar sử dụng initials từ sender name vì không có actual image. Background color được generate deterministically từ name/email để consistent.

**Tính toán initials:**
Nếu có sender name, lấy first letter của mỗi word, join và uppercase, limit 2 characters. Nếu chỉ có email, lấy first character và uppercase.

**Avatar color:**
Color được tính từ hash của name hoặc email. Hash được mod với số lượng predefined colors. Đảm bảo same sender luôn có same color.

**Sender name và email:**
Hiển thị sender name nếu có, fallback sang email local part (trước @). Full email address có thể hiển thị on hover hoặc trong tooltip.

### 3.3. Email Metadata

**Received time:**
Hiển thị thời gian nhận email với smart formatting. Nếu trong 24 giờ, hiển thị time như "3:45 PM". Nếu 24-48 giờ, hiển thị "Yesterday". Nếu xa hơn, hiển thị date như "Jan 14".

**Subject line:**
Hiển thị subject của email, truncate nếu quá dài. Sử dụng font weight khác để distinguish với preview.

**Preview text:**
Hiển thị snippet hoặc first few lines của email body. Giới hạn số lines hiển thị (thường 2-3 lines). Text color nhạt hơn subject để hierarchy rõ ràng.

### 3.4. Status Indicators

**Unread indicator:**
Email chưa đọc có border left với primary color. Đây là visual cue nổi bật cho unread status.

**Starred indicator:**
Email đã star có star icon filled với yellow color. Icon hiển thị cạnh sender name.

**Attachment indicator:**
Email có attachment có thể có paperclip icon. Hoặc hiển thị trong metadata area.

**Snoozed indicator:**
Email đang snoozed có clock icon hoặc snooze time hiển thị. Indicator này prominent vì snooze là temporary state.

### 3.5. AI Summary

**Display condition:**
Nếu email có AI-generated summary, summary được hiển thị thay vì hoặc cùng với preview.

**Visual distinction:**
Summary có styling khác để distinguish từ original content. Có thể có icon hoặc label "AI Summary".

**Expandable:**
Summary có thể expandable để xem full hoặc collapse để tiết kiệm space. Click để toggle expand state.

---

## 4. TƯƠNG TÁC VỚI EMAIL CARD

### 4.1. Click để Mở Email

**Behavior:**
Click vào card body mở email detail view. Nếu trong modal mode, opens modal với full email content. Nếu trong page mode, navigate tới email detail page.

**Click target:**
Toàn bộ card là clickable ngoại trừ action buttons. Action buttons có riêng click handlers.

**Loading state:**
Sau click, có thể show loading indicator trong khi fetch email content. Email content được fetch từ Gmail API nếu chưa cached.

### 4.2. Star/Unstar Email

**Button location:**
Star button nằm trong header area của card. Button hiển thị on hover để reduce visual clutter.

**Toggle behavior:**
Click toggle starred status. Star icon filled = starred, outline = unstarred. State update optimistically.

**Backend sync:**
Mutation gọi API để update starred status. API sync với Gmail starred label. Rollback nếu API fail.

### 4.3. Snooze Email

**Access method:**
Snooze accessible qua More menu (three dots button). Click opens dropdown với Snooze option.

**Snooze dialog:**
Clicking Snooze opens dialog để pick snooze time. Options có thể include preset times (1 hour, tomorrow, next week) hoặc custom datetime picker.

**Effect:**
Email được move tới Snoozed column. Snooze time được store. Email auto-return khi time reached.

### 4.4. Generate AI Summary

**Access method:**
Generate Summary option trong More menu. Chỉ hiển thị nếu email chưa có summary.

**Loading state:**
Button disabled và show loading indicator khi generating. Process có thể take vài seconds.

**Result:**
Summary được display trong card sau khi generated. Summary stored trong database cho future views.

### 4.5. Dropdown Menu Options

**Menu items:**
More menu có thể include các options như Generate Summary nếu chưa có summary, Snooze để defer email, Open in Gmail để view trong Gmail web, và các actions khác tùy theo requirements.

**Menu behavior:**
Menu opens on click, không hover để avoid accidental triggers. Click outside closes menu. Menu positioned để không bị cut off by screen edge.

### 4.6. Drag Handle

**Location:**
Toàn bộ card content area đóng vai trò drag handle. User có thể grab từ bất kỳ đâu trên card để drag.

**Cursor:**
Cursor changes thành grab cursor khi hover card. Changes thành grabbing cursor khi đang drag.

**Activation:**
Drag activates sau khi move 2 pixels từ initial position. Điều này distinguishes drag từ click.

---

## 5. PERFORMANCE OPTIMIZATION

### 5.1. Virtualization

**Vấn đề:**
Khi có nhiều email trên board, rendering tất cả cards cùng lúc gây lag. Mỗi column có thể có hàng chục hoặc hàng trăm email.

**Giải pháp:**
Sử dụng virtualization để chỉ render visible cards. Cards ngoài viewport không được render. Cards được recycled khi scroll.

**Implementation considerations:**
Trong phiên bản hiện tại, virtualization chưa được implement do complexity với drag-drop. Thay vào đó, giới hạn số email per column (mặc định 50).

### 5.2. Memoization

**Component memoization:**
KanbanCard component được wrap với React.memo để avoid unnecessary re-renders. Card chỉ re-render khi props thực sự thay đổi.

**Computed values:**
Các computed values như allEmails được memoize với useMemo. Chỉ recalculate khi dependencies thay đổi.

**Callback memoization:**
Event handlers được memoize với useCallback để không create new functions mỗi render.

### 5.3. Query Optimization

**React Query caching:**
Board data được cache bởi React Query. Subsequent loads dùng cache, chỉ refetch khi stale.

**Stale time configuration:**
staleTime được set phù hợp để balance freshness và performance. Có thể set vài phút vì board data ít thay đổi external.

**Query invalidation:**
Sau mỗi mutation như move email, chỉ invalidate affected queries. Avoid invalidating toàn bộ cache.

### 5.4. Optimistic Updates

**Benefit:**
UI phản hồi ngay lập tức không chờ server. Tạo trải nghiệm mượt mà hơn.

**Implementation:**
Trong onMutate, update cache trước khi API call. Trong onError, rollback cache về previous state. Trong onSettled, invalidate để ensure fresh data.

### 5.5. Database Indexing

**Indexes trên kanban_columns:**
Compound index trên userId và order để optimize fetch columns by user.

**Indexes trên email_kanban_status:**
Unique compound index trên userId và emailId để ensure uniqueness và fast lookup. Compound index trên userId và columnId để optimize fetch emails by column.

### 5.6. Caching Email Metadata

**Tại sao cache:**
Email metadata như subject, from, preview không thay đổi. Cache trong EmailKanbanStatus tránh phải call Gmail API mỗi lần load board.

**Cache update:**
Metadata được fetch và cache khi email đầu tiên được add vào Kanban. Cache được update nếu user trigger refresh.

---

## 6. RESPONSIVE DESIGN

### 6.1. Desktop Layout

**Column sizing:**
Trên desktop, columns có fixed width (350px) để comfortable viewing. Horizontal scroll cho phép view nhiều columns.

**Card density:**
Cards có comfortable padding và spacing. All information visible without truncation quá nhiều.

**Interaction:**
Full hover states và tooltips available. Drag-drop optimized cho mouse.

### 6.2. Tablet Layout

**Column sizing:**
Trên tablet, columns có medium width (320px). Có thể view 2-3 columns cùng lúc.

**Touch optimization:**
Touch targets larger hơn desktop. Swipe gestures cho horizontal scroll.

**Reduced density:**
Có thể reduce số items hiển thị per screen để improve performance.

### 6.3. Mobile Layout

**Column sizing:**
Trên mobile, columns có smaller width (280px). Thường view 1-1.5 columns cùng lúc.

**Touch-first:**
Tất cả interactions optimized cho touch. Drag-drop adapted cho touch gestures. Action buttons visible by default không cần hover.

**Simplified cards:**
Cards có thể simplified trên mobile. Show essential info, hide secondary details. Expand card để see more.

### 6.4. Scroll Behavior

**Horizontal scroll:**
Board scrollable horizontally để navigate between columns. On desktop, Shift + scroll wheel enables horizontal scroll. On touch devices, horizontal swipe.

**Vertical scroll:**
Mỗi column scrollable vertically independently. Scroll trong column không affect other columns hoặc board scroll.

**Auto-scroll during drag:**
Khi drag card gần edge của viewport, auto-scroll để reveal more content. Điều này cho phép drag qua nhiều columns.

### 6.5. Breakpoints

**Breakpoint values:**
Mobile: dưới 768px. Tablet: 768px đến 1024px. Desktop: trên 1024px.

**Tailwind implementation:**
Sử dụng Tailwind responsive prefixes như md: và lg:. Component styles adapt based on screen size.

---

## KẾT LUẬN PHẦN 4

Phần 4 đã trình bày chi tiết về hệ thống filtering và sorting cho phép user tùy chỉnh cách xem email trên board, email card display với các thành phần thông tin và visual indicators, tương tác với email cards bao gồm các actions như star, snooze, generate summary, performance optimization techniques để đảm bảo board hoạt động mượt mà với nhiều email, và responsive design để hỗ trợ nhiều loại thiết bị.

Phần này hoàn thành bộ tài liệu phân tích Kanban Board với 4 phần:

- Phần 1: Tổng quan và Kiến trúc
- Phần 2: Drag and Drop
- Phần 3: Quản lý Cột và Gmail Label Mapping
- Phần 4: Filtering, Sorting và Email Card (phần hiện tại)

---

_Tài liệu này là một phần của bộ tài liệu phân tích chức năng đồ án cuối kỳ._
