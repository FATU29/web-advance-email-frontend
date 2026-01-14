# PHÂN TÍCH CHỨC NĂNG KANBAN BOARD - PHẦN 3: QUẢN LÝ CỘT VÀ GMAIL LABEL MAPPING

## Đồ Án Cuối Kỳ - Ứng Dụng Email Client với Kanban Board

### Nhóm: 22120120 - 22120157 - 22120163

---

## MỤC LỤC PHẦN 3

1. [Hệ Thống Cột Kanban](#1-hệ-thống-cột-kanban)
2. [Các Loại Cột Mặc Định](#2-các-loại-cột-mặc-định)
3. [Quản Lý Cột Tùy Chỉnh](#3-quản-lý-cột-tùy-chỉnh)
4. [Gmail Label Mapping](#4-gmail-label-mapping)
5. [Đồng Bộ Hai Chiều](#5-đồng-bộ-hai-chiều)
6. [Luồng Xử Lý API](#6-luồng-xử-lý-api)

---

## 1. HỆ THỐNG CỘT KANBAN

### 1.1. Khái Niệm và Vai Trò

Cột Kanban đóng vai trò trung tâm trong việc tổ chức và phân loại email. Mỗi cột đại diện cho một giai đoạn hoặc trạng thái trong quy trình xử lý email. Hệ thống cho phép người dùng có các cột mặc định được tạo sẵn và cũng hỗ trợ tạo các cột tùy chỉnh theo nhu cầu riêng.

**Đặc điểm chính của cột:**
Mỗi cột có một tên hiển thị duy nhất trong phạm vi của user, giúp phân biệt rõ ràng các giai đoạn xử lý. Mỗi cột có một màu sắc đặc trưng được hiển thị trên border phía trên của cột, tạo visual distinction và giúp user nhanh chóng nhận biết. Mỗi cột có một thứ tự xác định vị trí hiển thị trên board, có thể được thay đổi theo preference của user.

**Tính linh hoạt:**
Hệ thống được thiết kế linh hoạt để phù hợp với nhiều workflow khác nhau. User có thể sử dụng workflow đơn giản chỉ với Inbox, To Do, và Done, hoặc workflow phức tạp với nhiều giai đoạn trung gian. User cũng có thể tạo các cột đặc biệt cho các loại email cụ thể như Urgent, Waiting for Reply, hoặc Reference.

### 1.2. Cấu Trúc Dữ Liệu Cột

Mỗi cột được lưu trữ với các thông tin sau:

**Thông tin định danh:**
Trường id là MongoDB ObjectId tự động generate, đảm bảo uniqueness. Trường userId link cột với user sở hữu, cho phép mỗi user có set cột riêng biệt.

**Thông tin hiển thị:**
Trường name là tên cột hiển thị cho user, phải unique trong scope của user. Trường color là mã màu hex như #4285F4 dùng để style cột. Trường order là số nguyên xác định thứ tự từ trái sang phải trên board.

**Thông tin phân loại:**
Trường type xác định loại cột, có thể là INBOX, BACKLOG, TODO, IN_PROGRESS, DONE, SNOOZED, hoặc CUSTOM. Trường isDefault boolean cho biết đây có phải cột mặc định của hệ thống hay không. Cột mặc định không thể bị xóa.

**Thông tin Gmail integration:**
Các trường gmailLabelId, gmailLabelName, addLabelsOnMove, và removeLabelsOnMove dùng cho việc đồng bộ với Gmail labels, sẽ được phân tích chi tiết ở phần sau.

### 1.3. Khởi Tạo Cột Cho User Mới

Khi user mới lần đầu truy cập Kanban Board, hệ thống tự động khởi tạo các cột mặc định:

**Quy trình kiểm tra:**
Khi service getColumns được gọi, trước tiên kiểm tra xem user đã có cột nào chưa bằng cách đếm số cột trong database. Nếu count bằng 0, gọi phương thức initializeDefaultColumns.

**Tạo cột mặc định:**
Phương thức initializeDefaultColumns tạo 6 cột mặc định với thông tin đã được định sẵn. Các cột được tạo theo thứ tự từ 0 đến 5, với màu sắc và type phù hợp với mục đích sử dụng.

**Lưu batch:**
Tất cả 6 cột được lưu cùng lúc sử dụng repository.saveAll(), tối ưu hóa database operations thay vì 6 lần save riêng lẻ.

**Idempotency:**
Phương thức có check đầu vào để đảm bảo không tạo duplicate khi được gọi nhiều lần. Nếu user đã có cột, simply return existing columns.

---

## 2. CÁC LOẠI CỘT MẶC ĐỊNH

### 2.1. Cột Inbox (Type: INBOX)

**Mục đích sử dụng:**
Cột Inbox được thiết kế để hiển thị những email mới nhất và quan trọng nhất từ Gmail Inbox. Đây thường là điểm bắt đầu khi user review email.

**Đặc điểm:**
Cột có màu xanh dương #4285F4 phản ánh màu chính của Gmail. Thứ tự mặc định là 0, hiển thị đầu tiên bên trái. Đây là cột mặc định nên không thể xóa.

**Workflow thông thường:**
User review email trong Inbox, sau đó di chuyển sang cột phù hợp. Email cần action ngay có thể chuyển sang To Do. Email cần xử lý sau có thể chuyển sang Backlog. Email chỉ cần đọc có thể chuyển thẳng sang Done.

### 2.2. Cột Backlog (Type: BACKLOG)

**Mục đích sử dụng:**
Cột Backlog chứa những email cần xử lý nhưng chưa được schedule cụ thể. Đây là nơi tập trung các email từ Gmail sync và email được defer từ Inbox.

**Đặc điểm:**
Cột có màu tím #9C27B0 để phân biệt với Inbox. Thứ tự mặc định là 1, đứng ngay sau Inbox. Đây cũng là cột mặc định không thể xóa.

**Vai trò trong sync:**
Khi hệ thống sync email mới từ Gmail, email sẽ được thêm vào Backlog thay vì Inbox. Điều này giúp phân biệt rõ email mới sync với email đã được user manually triage vào Inbox.

### 2.3. Cột To Do (Type: TODO)

**Mục đích sử dụng:**
Cột To Do chứa những email đã được user xác định cần action và đã schedule để xử lý. Đây là queue công việc chính của user.

**Đặc điểm:**
Cột có màu vàng #FBBC04 tạo sự chú ý. Thứ tự mặc định là 2. Email trong cột này thường được sắp xếp theo priority hoặc deadline.

**Best practices:**
User nên giữ cột To Do ở mức có thể quản lý được, thường không quá 10-15 email. Email quá nhiều trong To Do có thể gây overwhelm và giảm productivity.

### 2.4. Cột In Progress (Type: IN_PROGRESS)

**Mục đích sử dụng:**
Cột In Progress chứa những email đang được actively xử lý. Đây có thể là email user đang compose reply, đang research để trả lời, hoặc đang chờ input từ người khác.

**Đặc điểm:**
Cột có màu cam #FF6D01 thể hiện sự active. Thứ tự mặc định là 3. Số lượng email trong cột này thường ít hơn To Do.

**Work In Progress (WIP) limit:**
Một best practice của Kanban là giới hạn số items trong In Progress. Điều này giúp focus và tránh context switching. User được khuyến khích chỉ có 2-3 email trong In Progress cùng lúc.

### 2.5. Cột Done (Type: DONE)

**Mục đích sử dụng:**
Cột Done chứa những email đã được xử lý hoàn tất. Email ở đây không cần action thêm và chỉ giữ lại để reference nếu cần.

**Đặc điểm:**
Cột có màu xanh lá #34A853 thể hiện hoàn thành. Thứ tự mặc định là 4. Email trong Done có thể được archive hoặc xóa sau một thời gian.

**Satisfaction metrics:**
Số lượng email move vào Done mỗi ngày có thể là một metric để đo productivity. User có thể track trend này để đánh giá hiệu quả làm việc.

### 2.6. Cột Snoozed (Type: SNOOZED)

**Mục đích sử dụng:**
Cột Snoozed là cột đặc biệt chứa những email đã được user snooze (hoãn tạm thời). Email trong cột này sẽ tự động quay về cột cũ khi đến thời gian snooze.

**Đặc điểm:**
Cột có màu xám #9E9E9E thể hiện inactive status. Thứ tự mặc định là 5, thường ở cuối board. Cột này có logic đặc biệt liên quan đến snooze functionality.

**Tương tác đặc biệt:**
User không thể drag email trực tiếp vào Snoozed column. Phải sử dụng Snooze action với thời gian cụ thể. Email trong Snoozed hiển thị thời gian sẽ return.

---

## 3. QUẢN LÝ CỘT TÙY CHỈNH

### 3.1. Tạo Cột Mới

User có thể tạo thêm các cột tùy chỉnh ngoài 6 cột mặc định:

**API Endpoint:**
POST /api/kanban/columns với request body chứa name, color, và order tùy chọn.

**Validation:**
Backend kiểm tra name không trùng với cột đã tồn tại của user. Name không được để trống và nên có độ dài hợp lý. Color phải là valid hex color code.

**Default values:**
Nếu không specify order, cột mới sẽ được append vào cuối với order bằng count hiện tại. Nếu không specify color, có thể dùng default color hoặc random từ palette.

**Type assignment:**
Cột do user tạo luôn có type là CUSTOM và isDefault là false. Điều này cho phép phân biệt với system columns và cho phép xóa.

### 3.2. Sửa Đổi Cột

User có thể thay đổi thông tin của cột hiện có:

**API Endpoint:**
PUT /api/kanban/columns/{columnId} với request body chứa các fields cần update.

**Partial update:**
API hỗ trợ partial update, chỉ những fields có trong request mới được update. Các fields không có sẽ giữ nguyên giá trị cũ.

**Name uniqueness:**
Khi đổi name, backend phải kiểm tra name mới không conflict với cột khác của cùng user. Nếu conflict, trả về error.

**Default columns:**
Cột mặc định vẫn có thể được edit name và color, nhưng không thể thay đổi type. Điều này cho phép customization trong khi maintain core functionality.

### 3.3. Sắp Xếp Lại Thứ Tự

User có thể thay đổi thứ tự hiển thị của các cột:

**Cơ chế:**
Mỗi cột có trường order là số nguyên. Cột với order nhỏ hơn hiển thị bên trái. Khi thay đổi order, cần update order của các cột bị ảnh hưởng.

**Reorder logic:**
Khi move cột từ position A sang position B: Nếu A < B, các cột từ A+1 đến B giảm order đi 1. Nếu A > B, các cột từ B đến A-1 tăng order lên 1. Cột được move set order thành B.

**Batch update:**
Reorder có thể ảnh hưởng nhiều cột nên cần batch update trong single transaction để ensure consistency.

### 3.4. Xóa Cột

User có thể xóa các cột tùy chỉnh:

**API Endpoint:**
DELETE /api/kanban/columns/{columnId}

**Restriction:**
Chỉ có thể xóa cột có isDefault = false. Cột mặc định không thể xóa vì chúng essential cho core functionality.

**Email handling:**
Khi xóa cột, các email trong cột đó cần được di chuyển đi. Mặc định, email sẽ được move về cột Backlog. Nếu Backlog không tồn tại vì lý do nào đó, fallback về Inbox.

**Cascade considerations:**
Sau khi move email, cột được xóa khỏi database. Không cần update order của các cột khác vì gaps trong order sequence không ảnh hưởng đến rendering.

---

## 4. GMAIL LABEL MAPPING

### 4.1. Khái Niệm Label Mapping

Gmail Label Mapping là tính năng cho phép liên kết cột Kanban với Gmail labels. Khi email được di chuyển vào cột, labels tương ứng sẽ được thêm hoặc xóa trên Gmail, và ngược lại.

**Mục đích:**
Giữ Gmail và Kanban board đồng bộ. Thay đổi trên Kanban được reflect trên Gmail. User có thể sử dụng Gmail labels để filter và search. Email được tổ chức nhất quán giữa hai hệ thống.

**Use cases:**
User có thể map cột "In Progress" với label "Working On". User có thể map cột "Done" để remove label "INBOX" (archive). User có thể map cột custom "Client A" với label tương ứng trên Gmail.

### 4.2. Cấu Trúc Label Mapping

Mỗi cột có 4 trường liên quan đến label mapping:

**Trường gmailLabelId:**
Đây là ID của Gmail label chính được liên kết với cột. Khi email vào cột, label này sẽ được add. ID này là internal Gmail ID, không phải label name.

**Trường gmailLabelName:**
Đây là tên hiển thị của label, dùng để show trên UI. Lưu trữ riêng vì ID không human-readable.

**Trường addLabelsOnMove:**
Đây là danh sách các label IDs sẽ được add thêm khi email vào cột. Cho phép add multiple labels ngoài primary label.

**Trường removeLabelsOnMove:**
Đây là danh sách các label IDs sẽ được remove khi email vào cột. Ví dụ, remove INBOX để archive, remove UNREAD để mark as read.

### 4.3. Cấu Hình Label Mapping

User có thể configure label mapping cho mỗi cột:

**Lấy danh sách labels:**
API GET /api/kanban/gmail/labels trả về tất cả labels của user trên Gmail. Response bao gồm cả system labels như INBOX, STARRED và user-created labels.

**Set label mapping:**
API PUT /api/kanban/columns/{columnId} với các fields gmailLabelId, gmailLabelName, addLabelsOnMove, removeLabelsOnMove trong request body.

**Clear label mapping:**
Có thể clear mapping bằng cách set clearLabelMapping = true trong request. Điều này reset tất cả label-related fields về null.

**UI considerations:**
Frontend cần cung cấp UI để user select labels từ dropdown. Nên show preview của changes sẽ xảy ra khi email vào cột.

### 4.4. System Labels và User Labels

Gmail có hai loại labels với behavior khác nhau:

**System labels:**
Đây là labels tạo sẵn bởi Gmail như INBOX, SENT, TRASH, SPAM, STARRED, UNREAD. System labels có ý nghĩa đặc biệt và ảnh hưởng đến behavior của email. Ví dụ, remove INBOX = archive, remove UNREAD = mark as read.

**User labels:**
Đây là labels được user tạo để organize email. User labels có thể hierarchical với format "Parent/Child". User labels không ảnh hưởng đến email behavior, chỉ dùng để categorize.

**Mapping considerations:**
Khi configure mapping, cần cẩn thận với system labels. Add/remove TRASH có thể delete/restore email. Add SPAM có thể mess up spam filter. Recommend chỉ cho phép specific system labels trong removeLabelsOnMove.

---

## 5. ĐỒNG BỘ HAI CHIỀU

### 5.1. Kanban to Gmail Sync

Khi email được di chuyển trong Kanban, changes được sync sang Gmail:

**Trigger:**
Sync được trigger trong phương thức moveEmail sau khi database update thành công. Phương thức syncGmailLabelsForColumn được gọi với thông tin email và target column.

**Label collection:**
Phương thức collect tất cả labels cần add từ gmailLabelId và addLabelsOnMove. Collect tất cả labels cần remove từ removeLabelsOnMove.

**API call:**
Gọi gmailService.modifyMessage với emailId, labelsToAdd, và labelsToRemove. Gmail API supports batch add/remove trong single call.

**Error handling:**
Nếu Gmail API call fail, error được log nhưng Kanban move vẫn complete. Điều này đảm bảo Kanban usability không bị affected bởi Gmail issues. Failed sync có thể retry later hoặc notify user.

### 5.2. Gmail to Kanban Sync

Khi email được sync từ Gmail vào Kanban:

**Initial sync:**
Khi user lần đầu sử dụng Kanban hoặc khi manual sync, email được fetch từ Gmail và add vào Backlog column. Chỉ email chưa có trong EmailKanbanStatus mới được add.

**Incremental sync:**
Có thể implement incremental sync dựa trên Gmail history API. Watch for changes và update Kanban accordingly. Tuy nhiên, tính năng này complex và chưa được implement trong phiên bản hiện tại.

**Label-based placement:**
Future enhancement có thể place email vào column dựa trên Gmail labels. Ví dụ, email có label "In Progress" có thể được place thẳng vào In Progress column thay vì Backlog.

### 5.3. Conflict Resolution

Khi có conflicts giữa Kanban và Gmail:

**Last write wins:**
Current implementation sử dụng last write wins strategy. Thao tác cuối cùng sẽ override previous state.

**Kanban as primary:**
Kanban được coi là source of truth cho email organization. Gmail labels được update để match Kanban state, không ngược lại.

**Manual sync:**
User có thể trigger manual sync để refresh Kanban từ Gmail. Điều này hữu ích khi Gmail state thay đổi ngoài Kanban (ví dụ, từ mobile Gmail app).

### 5.4. Performance Considerations

**Batch operations:**
Khi sync nhiều email, nên batch Gmail API calls để reduce overhead. Gmail API hỗ trợ batch requests.

**Rate limiting:**
Gmail API có rate limits. Cần handle 429 errors gracefully với exponential backoff. Có thể queue sync operations và process gradually.

**Caching:**
Email metadata được cache trong EmailKanbanStatus để reduce Gmail API calls. Cache được update khi có changes.

---

## 6. LUỒNG XỬ LÝ API

### 6.1. API Lấy Columns

**Endpoint:** GET /api/kanban/columns

**Authentication:**
Request phải có valid JWT token. UserId được extract từ token.

**Processing:**
Controller gọi kanbanService.getColumns(userId). Service query columnRepository.findByUserIdOrderByOrderAsc(userId). Nếu empty, initializeDefaultColumns được gọi.

**Response:**
Trả về list of KanbanColumnResponse với tất cả fields bao gồm emailCount cho mỗi cột.

**Caching:**
Response có thể được cache ở frontend vì columns ít thay đổi. React Query cache với stale time phù hợp.

### 6.2. API Tạo Column

**Endpoint:** POST /api/kanban/columns

**Request body:**
JSON với name (required), color (optional), order (optional), và các label mapping fields (optional).

**Validation:**
Kiểm tra name không empty và không duplicate. Validate color format nếu provided.

**Processing:**
Service tạo mới KanbanColumn với type CUSTOM và isDefault false. Set order thành count nếu không provided. Save vào repository.

**Response:**
Trả về KanbanColumnResponse của column vừa tạo với status 201 Created.

### 6.3. API Cập Nhật Column

**Endpoint:** PUT /api/kanban/columns/{columnId}

**Path variable:**
columnId là ID của column cần update.

**Request body:**
JSON với các fields cần update. Có thể partial update.

**Processing:**
Service fetch column by id và userId. Verify column tồn tại và thuộc về user. Apply changes từ request. Save và return updated column.

**Label mapping update:**
Nếu request có clearLabelMapping = true, reset tất cả label fields. Nếu có specific label fields, update chúng.

### 6.4. API Xóa Column

**Endpoint:** DELETE /api/kanban/columns/{columnId}

**Validation:**
Verify column tồn tại, thuộc về user, và không phải default column.

**Processing:**
Move tất cả email trong column về Backlog hoặc Inbox. Delete column từ repository.

**Response:**
Trả về 204 No Content nếu thành công. 400 Bad Request nếu cố xóa default column. 404 Not Found nếu column không tồn tại.

### 6.5. API Lấy Gmail Labels

**Endpoint:** GET /api/kanban/gmail/labels

**Processing:**
Service gọi gmailService.listLabels(userId). Transform Gmail label objects thành simplified response.

**Response:**
List of label objects với id, name, type (system/user), và visibility settings.

**Use case:**
Frontend dùng để populate label dropdown khi configure column mapping.

---

## KẾT LUẬN PHẦN 3

Phần 3 đã trình bày chi tiết về hệ thống quản lý cột trong Kanban Board, từ các cột mặc định đến cột tùy chỉnh, và đặc biệt là tính năng Gmail Label Mapping cho phép đồng bộ giữa Kanban và Gmail. Tính năng này tạo nên sự liên kết mạnh mẽ giữa ứng dụng và Gmail của người dùng.

**Tiếp theo trong Phần 4:** Phân tích chi tiết về Filtering, Sorting và Email Card Display.

---

_Tài liệu này là một phần của bộ tài liệu phân tích chức năng đồ án cuối kỳ._
