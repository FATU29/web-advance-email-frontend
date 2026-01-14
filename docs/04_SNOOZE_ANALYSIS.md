# PHÂN TÍCH CHỨC NĂNG SNOOZE (TẠM HOÃN EMAIL)

## Đồ Án Cuối Kỳ - Ứng Dụng Email Client với Kanban Board

### Nhóm: 22120120 - 22120157 - 22120163

---

## MỤC LỤC

1. [Giới Thiệu Tính Năng Snooze](#1-giới-thiệu-tính-năng-snooze)
2. [Kiến Trúc và Luồng Dữ Liệu](#2-kiến-trúc-và-luồng-dữ-liệu)
3. [Triển Khai Frontend](#3-triển-khai-frontend)
4. [Triển Khai Backend](#4-triển-khai-backend)
5. [Cơ Chế Tự Động Khôi Phục](#5-cơ-chế-tự-động-khôi-phục)
6. [Xử Lý Lỗi và Edge Cases](#6-xử-lý-lỗi-và-edge-cases)

---

## 1. GIỚI THIỆU TÍNH NĂNG SNOOZE

### 1.1. Snooze là gì?

Snooze (Tạm hoãn) là tính năng cho phép người dùng ẩn tạm thời một email khỏi luồng công việc hiện tại và tự động đưa email đó trở lại vào một thời điểm được chỉ định trong tương lai. Đây là một trong những tính năng quan trọng nhất trong việc quản lý email hiệu quả, giúp người dùng tập trung vào công việc hiện tại mà không lo bỏ quên những email cần xử lý sau.

**Nguồn gốc tính năng:**
Tính năng Snooze được phổ biến bởi Google Inbox và sau đó được tích hợp vào Gmail. Trong đồ án này, chúng tôi đã triển khai tính năng tương tự với khả năng tích hợp chặt chẽ với Kanban Board.

### 1.2. Tại Sao Cần Tính Năng Snooze?

Trong quy trình làm việc hàng ngày, người dùng thường gặp các tình huống sau:

**Tình huống thứ nhất - Email cần xử lý nhưng chưa phải lúc này:**
Một email yêu cầu phản hồi nhưng người dùng cần thêm thông tin hoặc cần hoàn thành công việc khác trước. Thay vì để email nằm trong inbox và có nguy cơ bị quên, user có thể snooze đến thời điểm phù hợp.

**Tình huống thứ hai - Email nhắc nhở cho tương lai:**
Email chứa thông tin về cuộc họp tuần sau, deadline của dự án, hoặc sự kiện sắp tới. User có thể snooze để email xuất hiện lại đúng thời điểm cần thiết, đóng vai trò như một reminder tự động.

**Tình huống thứ ba - Giảm tải inbox:**
Inbox quá nhiều email gây overwhelm. User có thể snooze những email ít quan trọng để tập trung vào email cần xử lý ngay, sau đó xử lý email đã snooze vào thời điểm rảnh hơn.

### 1.3. Quy Trình Sử Dụng Snooze

**Bước 1 - Chọn email cần snooze:**
User xác định email muốn tạm hoãn từ Kanban Board hoặc Email List. Email có thể đang ở bất kỳ cột nào trên board như Inbox, Backlog, To Do, hoặc In Progress.

**Bước 2 - Mở Snooze Dialog:**
User click vào menu More (ba chấm) trên email card và chọn option Snooze. Dialog sẽ hiển thị các tùy chọn thời gian snooze.

**Bước 3 - Chọn thời gian snooze:**
User chọn một trong các preset options như 1 giờ, 3 giờ, ngày mai, hoặc tuần sau. Mỗi option hiển thị rõ ngày giờ cụ thể email sẽ trở lại.

**Bước 4 - Xác nhận snooze:**
User click nút Snooze để xác nhận. Email ngay lập tức được chuyển sang cột Snoozed và biến mất khỏi luồng công việc chính.

**Bước 5 - Email tự động trở lại:**
Khi đến thời gian đã chọn, email tự động được chuyển về cột trước đó và xuất hiện lại trong luồng công việc của user.

### 1.4. Các Tùy Chọn Thời Gian

Hệ thống cung cấp 4 preset options cho thời gian snooze:

**Option 1 - 1 hour (1 giờ):**
Snooze trong 1 giờ, phù hợp khi cần hoàn thành một task ngắn trước khi xử lý email. Thời gian trở lại được tính bằng cách cộng 1 giờ vào thời điểm hiện tại.

**Option 2 - 3 hours (3 giờ):**
Snooze trong 3 giờ, phù hợp cho buổi làm việc nửa ngày. Email sẽ trở lại sau khi user hoàn thành một số công việc quan trọng.

**Option 3 - Tomorrow (Ngày mai):**
Snooze đến ngày mai, phù hợp khi email không urgent và có thể xử lý vào ngày hôm sau. Thời gian được tính bằng cách cộng 1 ngày.

**Option 4 - Next week (Tuần sau):**
Snooze đến tuần sau, phù hợp cho các email có deadline xa hoặc chỉ cần review định kỳ. Thời gian được tính bằng cách cộng 1 tuần.

### 1.5. Tích Hợp với Kanban Board

Tính năng Snooze được tích hợp chặt chẽ với Kanban Board:

**Cột Snoozed đặc biệt:**
Tất cả email đã snooze được chuyển vào cột Snoozed. Cột này có màu xám để phân biệt với các cột active khác. User có thể xem tất cả email đang bị snooze tại đây.

**Lưu trữ cột trước đó:**
Khi snooze, hệ thống lưu lại columnId hiện tại vào trường previousColumnId. Khi email được khôi phục, nó sẽ trở về đúng cột mà nó đang ở trước khi bị snooze.

**Không cho phép drag vào Snoozed:**
User không thể kéo thả email trực tiếp vào cột Snoozed. Phải sử dụng Snooze action với thời gian cụ thể để đảm bảo mọi email trong Snoozed đều có snoozeUntil time.

---

## 2. KIẾN TRÚC VÀ LUỒNG DỮ LIỆU

### 2.1. Kiến Trúc Tổng Quan

Tính năng Snooze được triển khai theo kiến trúc sau:

**Tầng Frontend:**
Giao diện người dùng bao gồm SnoozeDialog component để chọn thời gian, Kanban card với Snooze action trong menu, và useSnoozeEmailKanbanMutation hook để gọi API. Frontend cũng có cơ chế kiểm tra snooze hết hạn định kỳ.

**Tầng Backend:**
API endpoints bao gồm POST /api/kanban/emails/snooze để snooze email và POST /api/kanban/emails/{emailId}/unsnooze để khôi phục. KanbanService xử lý logic nghiệp vụ và SchedulerConfig chạy job định kỳ để xử lý snooze hết hạn.

**Tầng Database:**
Collection email_kanban_status lưu trữ thông tin snooze với các trường snoozed (boolean), snoozeUntil (LocalDateTime), và previousColumnId (String).

### 2.2. Luồng Snooze Email

Khi user snooze một email, luồng xử lý diễn ra như sau:

**Bước 1 - User action:**
User click Snooze trong menu và chọn thời gian từ SnoozeDialog. Frontend tính toán snoozeUntil time dựa trên option được chọn và convert sang ISO string.

**Bước 2 - API call:**
Frontend gọi useSnoozeEmailKanbanMutation với request chứa emailId và snoozeUntil. Request được gửi đến POST /api/kanban/emails/snooze.

**Bước 3 - Backend processing:**
KanbanController nhận request và gọi KanbanService.snoozeEmail(). Service tìm hoặc tạo EmailKanbanStatus record cho email.

**Bước 4 - Update status:**
Service cập nhật các trường: set previousColumnId bằng columnId hiện tại, set columnId bằng ID của cột Snoozed, set snoozed = true, set snoozeUntil bằng thời gian từ request.

**Bước 5 - Persist và response:**
Record được lưu vào database. Response trả về cho frontend với thông tin email đã được update.

**Bước 6 - UI update:**
Frontend invalidate queries để refresh board. Email biến mất khỏi cột hiện tại và xuất hiện trong cột Snoozed.

### 2.3. Luồng Unsnooze Email

Khi email được khôi phục (thủ công hoặc tự động):

**Bước 1 - Trigger unsnooze:**
Có thể được trigger bởi user click Unsnooze hoặc bởi scheduler khi snoozeUntil time đã qua.

**Bước 2 - API call:**
POST /api/kanban/emails/{emailId}/unsnooze được gọi với emailId.

**Bước 3 - Backend processing:**
KanbanService.unsnoozeEmail() tìm EmailKanbanStatus và verify email đang ở trạng thái snoozed.

**Bước 4 - Restore column:**
Service đọc previousColumnId để xác định cột đích. Nếu previousColumnId null, fallback về cột Inbox.

**Bước 5 - Update status:**
Set columnId bằng targetColumnId (previousColumnId hoặc Inbox), clear snoozed = false, clear snoozeUntil = null, clear previousColumnId = null.

**Bước 6 - Persist và notify:**
Record được lưu. Nếu là auto-unsnooze, log được ghi. Nếu là manual, response trả về cho frontend.

### 2.4. Mô Hình Dữ Liệu Snooze

Các trường trong EmailKanbanStatus liên quan đến snooze:

**Trường snoozed:**
Đây là boolean flag cho biết email có đang bị snooze hay không. True khi đang snooze, false khi bình thường.

**Trường snoozeUntil:**
Đây là LocalDateTime lưu thời điểm email sẽ được khôi phục. Null khi không snooze. Scheduler sử dụng trường này để query các snooze hết hạn.

**Trường previousColumnId:**
Đây là String lưu ID của cột mà email đang ở trước khi bị snooze. Dùng để khôi phục về đúng cột. Null khi không snooze hoặc nếu email mới được tạo trong quá trình snooze.

---

## 3. TRIỂN KHAI FRONTEND

### 3.1. SnoozeDialog Component

Component SnoozeDialog cung cấp giao diện để user chọn thời gian snooze:

**Props interface:**
Component nhận các props bao gồm open boolean để control dialog visibility, email object chứa thông tin email cần snooze, onOpenChange callback khi dialog open state thay đổi, và onConfirm callback với snoozeUntil string khi user xác nhận.

**Snooze options:**
Component định nghĩa mảng SNOOZE_OPTIONS với 4 preset options. Mỗi option có label hiển thị, value để identify, và getDate function trả về Date object của thời gian snooze.

**Option 1 hour:** getDate sử dụng addHours(new Date(), 1) để cộng 1 giờ vào thời điểm hiện tại.

**Option 3 hours:** getDate sử dụng addHours(new Date(), 3) để cộng 3 giờ.

**Option Tomorrow:** getDate sử dụng addDays(new Date(), 1) để cộng 1 ngày.

**Option Next week:** getDate sử dụng addWeeks(new Date(), 1) để cộng 1 tuần.

**State management:**
Component sử dụng useState để track selectedOption, default là '1h'. User có thể change option thông qua RadioGroup.

**Confirm handler:**
Khi user click Snooze button, handleConfirm tìm option được chọn, gọi getDate() để lấy Date, convert sang ISO string, và gọi onConfirm callback. Sau đó close dialog bằng onOpenChange(false).

**UI structure:**
Dialog hiển thị title "Snooze Email" và description. Body chứa RadioGroup với các RadioGroupItem cho mỗi option. Mỗi item hiển thị label và formatted datetime preview. Footer có Cancel và Snooze buttons.

### 3.2. Integration với Kanban Card

Snooze action được tích hợp vào KanbanCard menu:

**Menu structure:**
Trong DropdownMenu của card, có DropdownMenuItem cho Snooze action. Item có Clock icon và text "Snooze".

**Click handler:**
Khi click Snooze menu item, handler gọi onSnooze callback được truyền từ parent với email object.

**Parent handling:**
Trong KanbanPage, onCardSnooze handler được định nghĩa. Handler set emailToSnooze state với email object và set snoozeDialogOpen = true để mở dialog.

### 3.3. Snooze Mutations

React Query mutations cho snooze operations:

**useSnoozeEmailKanbanMutation:**
Mutation này gọi KanbanService.snoozeEmail(request) với request chứa emailId và snoozeUntil. onSuccess callback invalidate board queries để refresh UI.

**useUnsnoozeEmailMutation:**
Mutation này gọi KanbanService.unsnoozeEmail(emailId). onSuccess cũng invalidate board queries.

**API service:**
KanbanService.snoozeEmail() gửi POST request đến /api/kanban/emails/snooze với request body. KanbanService.unsnoozeEmail() gửi POST đến /api/kanban/emails/{emailId}/unsnooze.

### 3.4. Snooze Confirmation Flow

Flow hoàn chỉnh khi user snooze email:

**Step 1:** User click Snooze trong card menu. onCardSnooze được gọi với email.

**Step 2:** KanbanPage set emailToSnooze và mở SnoozeDialog.

**Step 3:** User chọn time option trong dialog và click Snooze button.

**Step 4:** SnoozeDialog gọi onConfirm với snoozeUntil string.

**Step 5:** KanbanPage handleSnoozeConfirm được gọi. Gọi snoozeEmailKanbanMutation.mutate với emailId và snoozeUntil.

**Step 6:** Mutation gửi API request và nhận response.

**Step 7:** onSuccess invalidate queries, toast success message.

**Step 8:** Board re-render với email đã được move sang Snoozed column.

### 3.5. Hiển Thị Snooze Time

Email trong Snoozed column hiển thị thông tin snooze:

**snoozeUntil display:**
Email có snoozeUntil time được hiển thị trên card. Format friendly như "Returns in 2 hours" hoặc "Returns tomorrow at 3:00 PM".

**Visual indicator:**
Card có thể có clock icon hoặc background color khác để indicate snooze status.

---

## 4. TRIỂN KHAI BACKEND

### 4.1. SnoozeEmailRequest DTO

Request body cho snooze API:

**Trường emailId:**
String chứa Gmail message ID của email cần snooze. Đây là required field và được validate not blank.

**Trường snoozeUntil:**
LocalDateTime chứa thời điểm email sẽ được khôi phục. Được parse từ ISO date string gửi từ frontend. Cũng là required field.

### 4.2. KanbanController Snooze Endpoints

**Snooze endpoint:**
POST /api/kanban/emails/snooze nhận SnoozeEmailRequest trong body. Extract userId từ Authentication. Gọi kanbanService.snoozeEmail(userId, request). Trả về ApiResponse với KanbanEmailResponse.

**Unsnooze endpoint:**
POST /api/kanban/emails/{emailId}/unsnooze nhận emailId từ path. Extract userId từ Authentication. Gọi kanbanService.unsnoozeEmail(userId, emailId). Trả về ApiResponse với KanbanEmailResponse.

### 4.3. KanbanService Snooze Logic

**snoozeEmail method:**
Method này xử lý logic snooze email hoàn chỉnh:

_Bước 1 - Lấy Snoozed column:_ Query columnRepository để tìm column có type SNOOZED. Nếu không tìm thấy, gọi initializeDefaultColumns và query lại.

_Bước 2 - Lấy Backlog column:_ Query để lấy Backlog column ID làm fallback cho previousColumnId khi tạo mới status.

_Bước 3 - Get or create status:_ Query emailStatusRepository để tìm status của email. Nếu không tìm thấy, tạo mới bằng cách fetch email từ Gmail để lấy metadata.

_Bước 4 - Update snooze fields:_ Set previousColumnId = current columnId, set columnId = snoozed column id, set snoozed = true, set snoozeUntil từ request.

_Bước 5 - Calculate order:_ Set orderInColumn bằng count của emails đã có trong Snoozed column.

_Bước 6 - Save và return:_ Lưu status vào database và trả về response.

**unsnoozeEmail method:**
Method này khôi phục email từ snooze:

_Bước 1 - Find status:_ Query emailStatusRepository và throw exception nếu không tìm thấy.

_Bước 2 - Validate:_ Kiểm tra status.isSnoozed(), throw BadRequestException nếu email không đang snooze.

_Bước 3 - Determine target:_ Lấy targetColumnId từ previousColumnId. Nếu null, fallback về Inbox column.

_Bước 4 - Clear snooze:_ Set columnId = targetColumnId, set snoozed = false, set snoozeUntil = null, set previousColumnId = null.

_Bước 5 - Save và return:_ Lưu và trả về response.

### 4.4. Transaction Management

Snooze operations được wrap trong @Transactional:

**Atomicity:**
Tất cả database operations trong một snooze/unsnooze call được execute trong single transaction. Nếu bất kỳ step nào fail, toàn bộ transaction rollback.

**Consistency:**
Đảm bảo dữ liệu luôn consistent. Không có trường hợp email ở Snoozed column mà snoozed = false hoặc ngược lại.

**Isolation:**
Concurrent snooze operations trên cùng email được serialize. Tránh race conditions.

---

## 5. CƠ CHẾ TỰ ĐỘNG KHÔI PHỤC

### 5.1. Backend Scheduler

Hệ thống sử dụng Spring Scheduler để tự động xử lý snooze hết hạn:

**SchedulerConfig:**
Configuration class enable scheduling với @EnableScheduling annotation. Inject KanbanService để gọi processExpiredSnoozes.

**Scheduled method:**
Phương thức processExpiredSnoozes() được annotate với @Scheduled(fixedRate = 60000). Điều này có nghĩa method chạy mỗi 60 giây (1 phút).

**Error handling:**
Method wrap trong try-catch để log error mà không crash scheduler. Scheduler tiếp tục chạy ngay cả khi có lỗi.

### 5.2. Process Expired Snoozes

Logic xử lý snooze hết hạn trong KanbanService:

**Query expired:**
Method query emailStatusRepository.findBySnoozedTrueAndSnoozeUntilBefore(LocalDateTime.now()). Trả về list các EmailKanbanStatus có snoozed = true AND snoozeUntil < now.

**Process each:**
Iterate qua mỗi expired snooze và gọi unsnoozeEmail() để khôi phục. Wrap trong try-catch per email để một lỗi không ảnh hưởng các email khác.

**Logging:**
Log mỗi email được auto-unsnooze với emailId và userId. Log tổng số snoozes được xử lý.

### 5.3. Frontend Polling

Ngoài backend scheduler, frontend cũng có cơ chế kiểm tra snooze hết hạn:

**useEffect với interval:**
KanbanPage có useEffect setup interval chạy mỗi 60 giây. Interval call checkSnoozes function.

**checkSnoozes logic:**
Function filter emails có kanbanStatus = 'SNOOZED' AND snoozeUntil <= now. Đây là những email đã hết hạn snooze.

**Process expired:**
Với mỗi expired email, gọi unsnoozeEmailMutation để trigger unsnooze. onSuccess show toast notification.

**Fallback:**
Nếu unsnooze mutation fail, fallback bằng cách move email về Inbox column.

### 5.4. Tại Sao Cần Cả Backend và Frontend?

**Backend scheduler advantages:**
Đảm bảo snooze được xử lý ngay cả khi user không online. Xử lý cho tất cả users cùng lúc. Là source of truth cho snooze expiration.

**Frontend polling advantages:**
Cập nhật UI ngay lập tức khi user đang xem. Không phải chờ đến lần query tiếp theo. Provide instant feedback với toast notification.

**Redundancy:**
Cả hai cơ chế cùng chạy nhưng idempotent. Nếu backend đã unsnooze, frontend poll sẽ không tìm thấy expired snooze. Ngược lại, nếu frontend unsnooze trước, backend scheduler không có gì để xử lý.

### 5.5. Timing Considerations

**Scheduler frequency:**
60 giây là trade-off giữa responsiveness và performance. Frequent hơn gây load nhưng user expect snooze chính xác.

**Frontend frequency:**
Cũng 60 giây để consistent. Không poll quá frequent để tránh unnecessary API calls.

**Timezone handling:**
Tất cả times được store và compare trong UTC. Frontend convert local time sang UTC khi send. Backend compare với UTC now.

---

## 6. XỬ LÝ LỖI VÀ EDGE CASES

### 6.1. Email Không Tồn Tại

**Trường hợp:**
User cố snooze email đã bị delete trên Gmail.

**Xử lý:**
Khi tạo mới EmailKanbanStatus, gmailService.getMessage() được gọi. Nếu email không tồn tại, throw ResourceNotFoundException. Frontend nhận error và show toast.

### 6.2. Column Bị Xóa

**Trường hợp:**
User snooze email từ custom column, sau đó delete column đó. Khi unsnooze, previousColumnId reference column không tồn tại.

**Xử lý:**
Trong unsnoozeEmail, sau khi lấy previousColumnId, verify column tồn tại. Nếu không, fallback về Inbox column. Điều này đảm bảo email luôn có chỗ để về.

### 6.3. Concurrent Snooze

**Trường hợp:**
Hai browser tabs cùng snooze một email gần như cùng lúc.

**Xử lý:**
Database operations là transactional. Second snooze sẽ update lại snoozeUntil time. Không có duplicate records vì sử dụng findByUserIdAndEmailId.

### 6.4. Snooze Expired Email

**Trường hợp:**
User cố snooze email đã ở trong Snoozed column (đang snooze).

**Xử lý:**
Current implementation cho phép re-snooze bằng cách update snoozeUntil. previousColumnId được update thành Snoozed column ID. Khi unsnooze, email về Snoozed column (không ideal). Có thể improve bằng cách check và reject re-snooze.

### 6.5. Scheduler Downtime

**Trường hợp:**
Backend server restart hoặc down trong khi có snooze hết hạn.

**Xử lý:**
Khi server start lại, scheduler resume. Trên lần chạy đầu tiên, nó sẽ query tất cả expired snoozes (including những cái đã miss) và process chúng. User có thể experience delay nhưng không mất email.

### 6.6. Invalid Snooze Time

**Trường hợp:**
Request với snoozeUntil time trong quá khứ.

**Xử lý:**
Backend có thể validate snoozeUntil > now. Hiện tại không có explicit validation, email sẽ được snooze và immediately unsnooze bởi scheduler. Có thể improve với validation.

### 6.7. Unsnooze Non-Snoozed Email

**Trường hợp:**
API call unsnooze cho email không đang snooze.

**Xử lý:**
unsnoozeEmail method check status.isSnoozed(). Nếu false, throw BadRequestException("Email is not snoozed"). Frontend handle error và show message.

---

## KẾT LUẬN

Tính năng Snooze là một component quan trọng trong hệ thống quản lý email Kanban, cho phép người dùng tạm hoãn email và tự động nhận lại vào thời điểm phù hợp. Các điểm nổi bật của implementation bao gồm:

**Về mặt chức năng:**

- Hỗ trợ 4 preset options cho thời gian snooze phổ biến
- Tích hợp chặt chẽ với Kanban Board thông qua cột Snoozed đặc biệt
- Lưu trữ cột trước đó để khôi phục chính xác vị trí

**Về mặt kỹ thuật:**

- Dual mechanism với cả backend scheduler và frontend polling
- Transaction management đảm bảo data consistency
- Error handling robust cho các edge cases

**Về mặt trải nghiệm người dùng:**

- UI trực quan với SnoozeDialog dễ sử dụng
- Toast notifications cho feedback ngay lập tức
- Snooze time preview giúp user biết chính xác khi nào email trở lại

---

_Tài liệu này là một phần của bộ tài liệu phân tích chức năng đồ án cuối kỳ._
