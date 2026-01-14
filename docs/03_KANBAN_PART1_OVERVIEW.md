# PHÂN TÍCH CHỨC NĂNG KANBAN BOARD - PHẦN 1: TỔNG QUAN VÀ KIẾN TRÚC

## Đồ Án Cuối Kỳ - Ứng Dụng Email Client với Kanban Board

### Nhóm: 22120120 - 22120157 - 22120163

---

## MỤC LỤC PHẦN 1

1. [Giới Thiệu Tổng Quan](#1-giới-thiệu-tổng-quan)
2. [Mục Đích và Ý Nghĩa](#2-mục-đích-và-ý-nghĩa)
3. [Kiến Trúc Tổng Thể](#3-kiến-trúc-tổng-thể)
4. [Mô Hình Dữ Liệu](#4-mô-hình-dữ-liệu)
5. [Luồng Dữ Liệu Cơ Bản](#5-luồng-dữ-liệu-cơ-bản)

---

## 1. GIỚI THIỆU TỔNG QUAN

### 1.1. Kanban Board là gì?

Kanban Board là một công cụ quản lý trực quan được phát triển từ hệ thống sản xuất của Toyota vào những năm 1940. Trong bối cảnh phần mềm hiện đại, Kanban Board đã trở thành một phương pháp quản lý công việc phổ biến, cho phép người dùng theo dõi tiến độ công việc thông qua các cột trạng thái khác nhau.

Trong đồ án này, chúng tôi đã sáng tạo kết hợp phương pháp Kanban với hệ thống quản lý email, tạo ra một giải pháp độc đáo giúp người dùng không chỉ đọc email mà còn có thể quản lý và theo dõi tiến độ xử lý email một cách trực quan và hiệu quả.

### 1.2. Tại Sao Cần Kanban Board cho Email?

Trong môi trường làm việc hiện đại, email không chỉ đơn thuần là công cụ giao tiếp mà còn là nơi chứa đựng các nhiệm vụ, yêu cầu, và thông tin quan trọng cần được xử lý. Vấn đề phổ biến mà người dùng gặp phải bao gồm:

**Vấn đề thứ nhất - Inbox Overload (Quá tải hộp thư):**
Người dùng thường nhận hàng trăm email mỗi ngày, trong đó có nhiều email quan trọng cần được xử lý nhưng dễ bị chìm trong biển email không quan trọng. Khi số lượng email tăng lên, việc theo dõi những email nào đã đọc, những email nào cần phản hồi, và những email nào đang chờ xử lý trở nên vô cùng khó khăn.

**Vấn đề thứ hai - Thiếu cơ chế theo dõi tiến độ:**
Email truyền thống chỉ cung cấp hai trạng thái cơ bản là đã đọc và chưa đọc, điều này hoàn toàn không đủ để phản ánh trạng thái thực sự của công việc. Một email có thể đã được đọc nhưng vẫn cần được xử lý, hoặc đang trong quá trình chờ phản hồi từ người khác, hoặc đã hoàn thành xong nhiệm vụ liên quan.

**Vấn đề thứ ba - Khó khăn trong việc ưu tiên:**
Không có công cụ trực quan nào giúp người dùng sắp xếp và ưu tiên email theo mức độ quan trọng và khẩn cấp. Người dùng thường phải dựa vào trí nhớ hoặc ghi chú riêng để theo dõi công việc.

**Giải pháp của chúng tôi:**
Kanban Board cho email giải quyết tất cả các vấn đề trên bằng cách cung cấp một giao diện trực quan cho phép người dùng phân loại email vào các cột trạng thái khác nhau, theo dõi tiến độ xử lý thông qua việc di chuyển email giữa các cột, và quản lý khối lượng công việc một cách hiệu quả thông qua việc nhìn tổng quan toàn bộ email cần xử lý.

### 1.3. Các Tính Năng Chính của Kanban Board

Hệ thống Kanban Board trong đồ án bao gồm các tính năng chính sau:

**Tính năng cốt lõi:**

- Hiển thị email theo các cột trạng thái khác nhau
- Kéo thả email giữa các cột để thay đổi trạng thái
- Đồng bộ tự động với Gmail labels
- Tùy chỉnh cột theo nhu cầu người dùng

**Tính năng nâng cao:**

- Snooze email (tạm hoãn) đến thời điểm cụ thể
- Tạo AI summary cho email
- Lọc và sắp xếp email trong board
- Tìm kiếm email trên Kanban

---

## 2. MỤC ĐÍCH VÀ Ý NGHĨA

### 2.1. Mục Đích Phát Triển

Mục đích chính của việc tích hợp Kanban Board vào ứng dụng email client bao gồm:

**Nâng cao hiệu suất làm việc:**
Kanban Board giúp người dùng có cái nhìn tổng quan về tất cả email cần xử lý, từ đó có thể lập kế hoạch và ưu tiên công việc hiệu quả hơn. Thay vì phải mở từng email để nhớ nội dung và trạng thái, người dùng có thể nhìn vào board và ngay lập tức biết được công việc nào đang ở giai đoạn nào.

**Giảm stress và cognitive load:**
Khi email được tổ chức một cách có hệ thống, người dùng không còn phải lo lắng về việc quên xử lý email quan trọng. Mọi thứ được hiển thị rõ ràng trên board, giúp giảm áp lực tinh thần và tăng sự tập trung vào công việc đang làm.

**Tạo thói quen làm việc có kỷ luật:**
Kanban Board khuyến khích người dùng xử lý email theo quy trình, từ việc nhận email mới vào Backlog, chuyển sang To Do khi xác định cần xử lý, tiến hành In Progress khi đang làm việc, và cuối cùng là Done khi hoàn thành. Quy trình này giúp tạo thói quen làm việc có hệ thống.

### 2.2. Đối Tượng Sử Dụng

**Nhân viên văn phòng:**
Những người thường xuyên phải xử lý email công việc, quản lý nhiều dự án và giao tiếp với nhiều đối tác. Kanban Board giúp họ không bỏ sót email quan trọng và theo dõi được tiến độ các công việc liên quan đến email.

**Freelancer và người làm việc tự do:**
Những người cần quản lý nhiều khách hàng và dự án cùng lúc. Kanban Board giúp họ phân loại email theo dự án hoặc khách hàng và theo dõi tiến độ công việc.

**Sinh viên và học viên:**
Những người cần theo dõi email từ giảng viên, bạn học, và các tổ chức. Kanban Board giúp họ không bỏ lỡ deadline và quản lý các nhiệm vụ học tập.

### 2.3. Lợi Ích Cụ Thể

**Đối với cá nhân:**

- Tăng năng suất làm việc thông qua việc tổ chức email khoa học
- Giảm thời gian tìm kiếm và xử lý email
- Không bỏ sót email quan trọng nhờ hệ thống theo dõi trực quan
- Có thể đánh giá được khối lượng công việc còn lại

**Đối với nhóm làm việc:**

- Dễ dàng chia sẻ trạng thái công việc với đồng nghiệp
- Chuẩn hóa quy trình xử lý email trong tổ chức
- Tăng tính minh bạch trong việc theo dõi tiến độ

---

## 3. KIẾN TRÚC TỔNG THỂ

### 3.1. Kiến Trúc Hệ Thống Kanban

Hệ thống Kanban Board được xây dựng theo kiến trúc ba tầng (three-tier architecture) bao gồm:

**Tầng Giao Diện (Presentation Layer):**
Đây là tầng frontend được xây dựng bằng React và Next.js, chịu trách nhiệm hiển thị giao diện Kanban Board cho người dùng. Tầng này sử dụng thư viện @dnd-kit để thực hiện chức năng kéo thả, React Query để quản lý trạng thái dữ liệu từ server, và các component UI được thiết kế tối ưu cho trải nghiệm người dùng.

**Tầng Xử Lý Logic (Business Logic Layer):**
Đây là tầng backend được xây dựng bằng Java Spring Boot, chịu trách nhiệm xử lý tất cả logic nghiệp vụ của Kanban Board. Tầng này bao gồm KanbanService xử lý các thao tác với board và email, KanbanController cung cấp RESTful API cho frontend, và các service phụ trợ như AISummarizationService cho việc tạo tóm tắt email.

**Tầng Lưu Trữ (Data Layer):**
Đây là tầng database sử dụng MongoDB để lưu trữ thông tin về cột Kanban và trạng thái email. MongoDB được chọn vì tính linh hoạt của schema, cho phép dễ dàng mở rộng các thuộc tính của cột và email status mà không cần migration phức tạp.

### 3.2. Các Thành Phần Chính

**Frontend Components:**

Thành phần KanbanBoard là component cha chứa toàn bộ board, quản lý context cho drag-drop và điều phối các sự kiện giữa các cột. Component này sử dụng DndContext từ thư viện @dnd-kit để bao bọc tất cả các cột và thẻ email, đảm bảo việc kéo thả hoạt động mượt mà.

Thành phần KanbanColumn đại diện cho mỗi cột trên board, nhận danh sách email thuộc cột đó và render các thẻ email. Mỗi cột có thể nhận email được thả vào thông qua hook useDroppable.

Thành phần KanbanCard đại diện cho mỗi email trên board, hiển thị thông tin tóm tắt của email và có thể được kéo thả. Component này sử dụng hook useSortable để có thể được di chuyển.

Thành phần KanbanFilters cung cấp giao diện lọc và sắp xếp email trên board theo các tiêu chí khác nhau như ngày nhận, người gửi, trạng thái đọc.

**Backend Services:**

KanbanService là service chính xử lý tất cả logic nghiệp vụ của Kanban Board. Service này bao gồm các phương thức để lấy board với tất cả email, di chuyển email giữa các cột, đồng bộ email từ Gmail, và quản lý cột tùy chỉnh.

KanbanColumnRepository là repository interface để tương tác với collection kanban_columns trong MongoDB, cung cấp các phương thức truy vấn cột theo userId, theo type, và theo thứ tự.

EmailKanbanStatusRepository là repository interface để tương tác với collection email_kanban_status trong MongoDB, quản lý trạng thái của email trên Kanban board.

### 3.3. Luồng Giao Tiếp

Khi người dùng mở trang Kanban, frontend gửi request GET đến endpoint /api/kanban/board. Backend nhận request, kiểm tra authentication, và gọi KanbanService.getBoard() để lấy dữ liệu. Service truy vấn các cột từ KanbanColumnRepository và email status từ EmailKanbanStatusRepository, sau đó kết hợp và trả về cho frontend. Frontend nhận dữ liệu và render board với các cột và email tương ứng.

Khi người dùng kéo thả email từ cột này sang cột khác, frontend gửi request POST đến endpoint /api/kanban/move với thông tin emailId và targetColumnId. Backend cập nhật columnId của email trong database và đồng bộ labels với Gmail nếu được cấu hình. Sau khi thành công, frontend cập nhật UI để phản ánh thay đổi.

---

## 4. MÔ HÌNH DỮ LIỆU

### 4.1. Collection kanban_columns

Collection này lưu trữ thông tin về các cột trên Kanban Board của mỗi người dùng. Mỗi document trong collection đại diện cho một cột và chứa các thông tin sau:

**Các trường cơ bản:**

- Trường id là định danh duy nhất của cột, được MongoDB tự động tạo
- Trường userId lưu ID của người dùng sở hữu cột này
- Trường name là tên hiển thị của cột như Inbox, To Do, In Progress
- Trường type xác định loại cột, có thể là INBOX, BACKLOG, TODO, IN_PROGRESS, DONE, SNOOZED hoặc CUSTOM
- Trường order xác định thứ tự hiển thị của cột trên board
- Trường color là mã màu hex để phân biệt các cột
- Trường isDefault cho biết đây có phải là cột mặc định của hệ thống hay không

**Các trường liên quan đến Gmail Label Mapping:**

- Trường gmailLabelId lưu ID của Gmail label được liên kết với cột
- Trường gmailLabelName lưu tên hiển thị của Gmail label
- Trường addLabelsOnMove là danh sách các label sẽ được thêm khi email được di chuyển vào cột
- Trường removeLabelsOnMove là danh sách các label sẽ bị xóa khi email được di chuyển vào cột

**Các trường metadata:**

- Trường createdAt lưu thời điểm tạo cột
- Trường updatedAt lưu thời điểm cập nhật cột gần nhất

**Index được tạo:**
Một compound index được tạo trên các trường userId và order để tối ưu hóa việc truy vấn các cột theo thứ tự cho mỗi người dùng.

### 4.2. Collection email_kanban_status

Collection này lưu trữ trạng thái của mỗi email trên Kanban Board. Mỗi document đại diện cho một email và vị trí của nó trên board.

**Các trường định danh:**

- Trường id là định danh duy nhất của record
- Trường userId lưu ID của người dùng
- Trường emailId lưu Gmail message ID của email
- Trường columnId lưu ID của cột mà email đang thuộc về

**Các trường vị trí:**

- Trường orderInColumn xác định vị trí của email trong cột, giúp sắp xếp thứ tự hiển thị

**Các trường Snooze:**

- Trường snoozed là boolean cho biết email có đang bị hoãn hay không
- Trường snoozeUntil lưu thời điểm email sẽ được khôi phục
- Trường previousColumnId lưu ID của cột trước khi snooze để khôi phục về đúng vị trí

**Các trường AI Summary:**

- Trường summary lưu nội dung tóm tắt do AI tạo
- Trường summaryGeneratedAt lưu thời điểm tạo tóm tắt

**Các trường metadata email (cache):**

- Trường subject lưu tiêu đề email
- Trường fromEmail lưu địa chỉ email người gửi
- Trường fromName lưu tên người gửi
- Trường preview lưu đoạn xem trước nội dung email
- Trường receivedAt lưu thời điểm nhận email
- Trường isRead lưu trạng thái đã đọc
- Trường isStarred lưu trạng thái đánh dấu sao
- Trường hasAttachments cho biết email có file đính kèm hay không

**Các trường Semantic Search:**

- Trường embedding lưu vector embedding của email cho tìm kiếm ngữ nghĩa
- Trường embeddingGeneratedAt lưu thời điểm tạo embedding

**Các trường thời gian:**

- Trường createdAt lưu thời điểm tạo record
- Trường updatedAt lưu thời điểm cập nhật gần nhất

**Indexes được tạo:**
Một compound unique index được tạo trên userId và emailId để đảm bảo mỗi email chỉ có một trạng thái cho mỗi người dùng. Một compound index trên userId và columnId để tối ưu hóa việc truy vấn email theo cột.

### 4.3. Mối Quan Hệ Giữa Các Collection

**Quan hệ giữa User và KanbanColumn:**
Mỗi user có thể có nhiều cột Kanban (quan hệ one-to-many). Các cột mặc định được tạo tự động khi user lần đầu truy cập Kanban board.

**Quan hệ giữa KanbanColumn và EmailKanbanStatus:**
Mỗi cột có thể chứa nhiều email (quan hệ one-to-many). Trường columnId trong EmailKanbanStatus tham chiếu đến id của KanbanColumn.

**Quan hệ giữa Gmail Message và EmailKanbanStatus:**
Mỗi Gmail message có thể có một trạng thái Kanban (quan hệ one-to-one). Trường emailId trong EmailKanbanStatus lưu Gmail message ID.

---

## 5. LUỒNG DỮ LIỆU CƠ BẢN

### 5.1. Khởi Tạo Board Cho User Mới

Khi một user mới lần đầu tiên truy cập vào trang Kanban, hệ thống sẽ tự động tạo các cột mặc định cho user đó. Quy trình khởi tạo diễn ra như sau:

**Bước 1 - Kiểm tra cột hiện có:**
Khi frontend gọi API getBoard, backend sẽ gọi phương thức getColumns trong KanbanService. Phương thức này trước tiên kiểm tra xem user đã có cột nào chưa bằng cách truy vấn KanbanColumnRepository.

**Bước 2 - Khởi tạo cột mặc định:**
Nếu user chưa có cột nào, phương thức initializeDefaultColumns sẽ được gọi. Phương thức này tạo ra 6 cột mặc định bao gồm: Inbox với màu xanh dương làm nơi chứa email mới nhất, Backlog với màu tím làm nơi chứa email cần xử lý sau, To Do với màu vàng cho các email đã xác định cần làm, In Progress với màu cam cho email đang xử lý, Done với màu xanh lá cho email đã hoàn thành, và Snoozed với màu xám cho email bị hoãn tạm thời.

**Bước 3 - Lưu vào database:**
Tất cả các cột mặc định được lưu vào MongoDB thông qua KanbanColumnRepository.saveAll().

**Bước 4 - Đồng bộ email từ Gmail:**
Sau khi có cột, nếu user đã kết nối Gmail, hệ thống sẽ tự động đồng bộ một số lượng email nhất định (mặc định 50) từ Gmail vào cột Backlog.

### 5.2. Tải Board Hiện Có

Khi user đã có board và quay lại sử dụng, quy trình tải board diễn ra như sau:

**Bước 1 - Frontend gọi API:**
Component KanbanPage sử dụng hook useKanbanFilteredBoardQuery để gọi API lấy board. Hook này sử dụng React Query để quản lý cache và trạng thái loading.

**Bước 2 - Backend lấy dữ liệu cột:**
KanbanService.getColumns() truy vấn tất cả các cột của user từ database, sắp xếp theo trường order tăng dần.

**Bước 3 - Backend lấy dữ liệu email:**
KanbanService tiếp tục truy vấn EmailKanbanStatusRepository để lấy tất cả email status của user. Dữ liệu email được cache trong MongoDB nên không cần gọi Gmail API cho mỗi lần tải board.

**Bước 4 - Phân loại email theo cột:**
Backend tạo một Map với key là columnId và value là danh sách email thuộc cột đó. Email được sắp xếp theo orderInColumn trong mỗi cột.

**Bước 5 - Trả về response:**
Backend trả về KanbanBoardResponse chứa danh sách columns và emailsByColumn cho frontend.

**Bước 6 - Render UI:**
Frontend nhận dữ liệu và render KanbanBoard component với các KanbanColumn và KanbanCard tương ứng.

### 5.3. Đồng Bộ Email Từ Gmail

Hệ thống hỗ trợ đồng bộ email từ Gmail vào Kanban Board theo hai cơ chế:

**Đồng bộ tự động khi tải board:**
Khi gọi API getBoard với tham số sync=true, backend sẽ tự động kiểm tra và đồng bộ email mới từ Gmail. Chỉ những email chưa có trong EmailKanbanStatus mới được thêm vào, tránh duplicate.

**Đồng bộ thủ công:**
User có thể nhấn nút Sync trên giao diện để trigger đồng bộ email mới. Frontend gọi API syncGmail và backend sẽ fetch email mới từ Gmail, so sánh với danh sách đã có, và chỉ thêm những email mới vào cột Backlog.

### 5.4. Cập Nhật Trạng Thái Email

Khi user thực hiện các thao tác trên email như di chuyển giữa cột, snooze, hoặc đánh dấu sao, hệ thống cập nhật trạng thái như sau:

**Bước 1 - Frontend capture sự kiện:**
Event handler trong component bắt sự kiện từ user như onDragEnd cho kéo thả, onClick cho các nút hành động.

**Bước 2 - Optimistic update:**
Frontend ngay lập tức cập nhật UI để phản ánh thay đổi, không chờ đợi response từ server. Điều này giúp giao diện phản hồi nhanh và mượt mà.

**Bước 3 - Gọi API:**
Frontend gọi API tương ứng với thao tác, ví dụ POST /api/kanban/move cho di chuyển email.

**Bước 4 - Backend xử lý:**
Backend cập nhật record trong EmailKanbanStatusRepository và đồng bộ với Gmail nếu cần (như thay đổi labels).

**Bước 5 - Xử lý kết quả:**
Nếu thành công, optimistic update được giữ nguyên. Nếu thất bại, frontend rollback về trạng thái trước đó và hiển thị thông báo lỗi.

---

## KẾT LUẬN PHẦN 1

Phần 1 đã trình bày tổng quan về hệ thống Kanban Board trong ứng dụng email client, bao gồm mục đích, kiến trúc, mô hình dữ liệu, và các luồng dữ liệu cơ bản. Đây là nền tảng để hiểu các phần tiếp theo sẽ đi sâu vào chi tiết kỹ thuật của từng tính năng.

**Tiếp theo trong Phần 2:** Phân tích chi tiết về giao diện Drag-Drop và cơ chế hoạt động.

---

_Tài liệu này là một phần của bộ tài liệu phân tích chức năng đồ án cuối kỳ._
