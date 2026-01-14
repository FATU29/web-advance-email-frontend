# PHÂN TÍCH CHỨC NĂNG KANBAN BOARD - PHẦN 2: DRAG AND DROP

## Đồ Án Cuối Kỳ - Ứng Dụng Email Client với Kanban Board

### Nhóm: 22120120 - 22120157 - 22120163

---

## MỤC LỤC PHẦN 2

1. [Giới Thiệu Tính Năng Drag-Drop](#1-giới-thiệu-tính-năng-drag-drop)
2. [Thư Viện @dnd-kit](#2-thư-viện-dnd-kit)
3. [Kiến Trúc Drag-Drop](#3-kiến-trúc-drag-drop)
4. [Chi Tiết Triển Khai Frontend](#4-chi-tiết-triển-khai-frontend)
5. [Chi Tiết Triển Khai Backend](#5-chi-tiết-triển-khai-backend)
6. [Optimistic Updates](#6-optimistic-updates)

---

## 1. GIỚI THIỆU TÍNH NĂNG DRAG-DROP

### 1.1. Tầm Quan Trọng của Drag-Drop

Drag and Drop (Kéo và Thả) là tính năng cốt lõi của Kanban Board, cho phép người dùng di chuyển email giữa các cột một cách trực quan và tự nhiên. Thay vì phải sử dụng menu hoặc nút bấm để thay đổi trạng thái email, người dùng chỉ cần kéo thẻ email từ cột này và thả vào cột khác. Hành động này phản ánh chính xác quy trình làm việc thực tế khi người dùng di chuyển công việc qua các giai đoạn khác nhau.

Trong đồ án này, tính năng Drag-Drop được triển khai với nhiều cải tiến để đảm bảo trải nghiệm người dùng mượt mà nhất có thể. Các cải tiến bao gồm visual feedback rõ ràng khi đang kéo, drop zone được mở rộng để dễ thả hơn, animation mượt mà, và optimistic updates để UI phản hồi ngay lập tức.

### 1.2. Yêu Cầu Chức Năng

Tính năng Drag-Drop cần đáp ứng các yêu cầu sau:

**Yêu cầu về trải nghiệm người dùng:**

- Phản hồi ngay lập tức khi bắt đầu kéo
- Hiển thị rõ ràng thẻ đang được kéo
- Hiệu ứng highlight cho cột đích khi hover
- Animation mượt mà khi thả thẻ
- Xử lý cancel khi thả ra ngoài vùng hợp lệ

**Yêu cầu về chức năng:**

- Di chuyển email giữa bất kỳ hai cột nào
- Cập nhật thứ tự email trong cột đích
- Đồng bộ với backend sau mỗi thao tác
- Xử lý trường hợp lỗi và rollback nếu cần

**Yêu cầu về hiệu suất:**

- Không lag hoặc giật khi kéo
- Optimistic update để UI phản hồi nhanh
- Giảm thiểu số lần gọi API

### 1.3. Thách Thức Kỹ Thuật

Việc triển khai Drag-Drop trong web application gặp nhiều thách thức:

**Thách thức về tương thích trình duyệt:**
HTML5 Drag and Drop API có nhiều khác biệt giữa các trình duyệt, đặc biệt là về cách xử lý sự kiện và visual feedback. Để đảm bảo hoạt động nhất quán trên mọi trình duyệt, chúng tôi sử dụng thư viện @dnd-kit thay vì native API.

**Thách thức về hiệu suất:**
Khi có nhiều thẻ email trên board, việc tracking vị trí kéo và render lại UI có thể gây lag. Cần tối ưu hóa bằng cách sử dụng virtualization và memoization.

**Thách thức về trạng thái:**
Phải quản lý trạng thái của thẻ đang được kéo, vị trí hover hiện tại, và đồng bộ với server. Cần có cơ chế optimistic update và rollback khi lỗi.

---

## 2. THƯ VIỆN @DND-KIT

### 2.1. Tại Sao Chọn @dnd-kit

Trong số nhiều thư viện Drag-Drop cho React, chúng tôi chọn @dnd-kit vì các lý do sau:

**Kiến trúc modular:**
@dnd-kit được thiết kế theo kiến trúc modular với các package riêng biệt cho core functionality, sortable lists, và utilities. Điều này cho phép chúng tôi chỉ import những gì cần thiết, giảm bundle size.

**Hiệu suất cao:**
@dnd-kit sử dụng CSS transforms thay vì thay đổi DOM position, giúp animation mượt mà hơn và không gây reflow. Thư viện cũng tối ưu hóa việc render bằng cách chỉ update những component cần thiết.

**Accessibility:**
@dnd-kit có built-in support cho keyboard navigation và screen readers, đảm bảo tính năng có thể sử dụng được cho người khuyết tật.

**Customization:**
Thư viện cung cấp nhiều hooks và components có thể customize theo nhu cầu, từ collision detection algorithm đến drag overlay styling.

### 2.2. Các Package Sử Dụng

**@dnd-kit/core:**
Package core cung cấp các component và hooks cơ bản cho Drag-Drop, bao gồm DndContext là wrapper component quản lý toàn bộ drag-drop context, useDraggable hook để biến một element thành draggable, useDroppable hook để biến một element thành drop target, và DragOverlay component để render element đang được kéo.

**@dnd-kit/sortable:**
Package này mở rộng core với khả năng sắp xếp thứ tự trong list, bao gồm SortableContext cho list container, useSortable hook kết hợp cả draggable và droppable, và các sorting strategies như verticalListSortingStrategy.

**@dnd-kit/utilities:**
Package utilities cung cấp các helper functions như CSS.Transform để convert transform object sang CSS string.

### 2.3. Cấu Hình Sensors

Sensors trong @dnd-kit xác định cách phát hiện và kích hoạt drag gesture. Trong đồ án này, chúng tôi cấu hình PointerSensor với các tham số tối ưu:

**PointerSensor configuration:**
Sensor được cấu hình với activationConstraint là distance bằng 2 pixels. Điều này có nghĩa là drag chỉ được kích hoạt khi user di chuyển pointer ít nhất 2 pixels sau khi mousedown. Giá trị nhỏ này đảm bảo drag được kích hoạt nhanh chóng nhưng vẫn phân biệt được với click thông thường.

**Tại sao chọn distance nhỏ:**
Giá trị distance 2 pixels được chọn để đảm bảo trải nghiệm responsive. User không cần phải di chuyển nhiều để bắt đầu drag, nhưng vẫn đủ để tránh kích hoạt drag khi chỉ click vào thẻ. Điều này đặc biệt quan trọng khi user muốn click để mở email detail.

### 2.4. Collision Detection

Collision detection xác định khi nào một draggable item đang hover trên một droppable target. Chúng tôi sử dụng rectIntersection algorithm:

**Cách hoạt động của rectIntersection:**
Algorithm này kiểm tra sự giao nhau giữa bounding rectangle của draggable item và các droppable targets. Khi có intersection, droppable target đó được coi là target hiện tại.

**Ưu điểm của rectIntersection:**
So với các algorithm khác như closestCenter hay pointerWithin, rectIntersection cho kết quả trực quan hơn khi item có kích thước lớn. User có thể dễ dàng nhận biết cột nào sẽ nhận item khi thả.

---

## 3. KIẾN TRÚC DRAG-DROP

### 3.1. Component Hierarchy

Kiến trúc Drag-Drop được tổ chức theo hierarchy sau:

**DndContext (Root Level):**
DndContext là component gốc bao bọc toàn bộ Kanban Board. Component này quản lý toàn bộ state của drag operation bao gồm item đang được kéo, vị trí hiện tại, và các droppable targets. DndContext cũng cung cấp event handlers cho các sự kiện drag lifecycle như onDragStart, onDragOver, onDragEnd, và onDragCancel.

**KanbanColumn (Droppable):**
Mỗi KanbanColumn là một droppable target, sử dụng hook useDroppable để đăng ký với DndContext. Khi một item được kéo qua cột, cột sẽ nhận được thông tin isOver để hiển thị visual feedback.

**KanbanCard (Sortable):**
Mỗi KanbanCard là một sortable item, sử dụng hook useSortable để vừa là draggable vừa là droppable (cho việc sắp xếp thứ tự). Card có thể được kéo và cũng có thể nhận card khác thả vào để xác định vị trí chèn.

**DragOverlay:**
DragOverlay là component đặc biệt render bên ngoài DOM hierarchy thông thường. Khi user bắt đầu kéo, DragOverlay render một bản sao của card đang được kéo, theo dõi vị trí pointer. Card gốc trong column sẽ có opacity giảm hoặc hidden.

### 3.2. State Management

**Active ID State:**
State activeId lưu trữ ID của item đang được kéo. State này được update trong onDragStart và clear trong onDragEnd hoặc onDragCancel. Active ID được sử dụng để tìm email data và render DragOverlay.

**Over ID và Position:**
Khi item được kéo qua các droppable targets, over information được DndContext tự động track. Component nhận được thông tin này thông qua event object trong các handlers.

**Emails by Column:**
State emailsByColumn lưu trữ mapping từ columnId đến danh sách email. State này được update optimistically khi drag end và rollback nếu API call thất bại.

### 3.3. Event Flow

**onDragStart Event:**
Khi user bắt đầu kéo một thẻ email, sự kiện onDragStart được trigger. Handler lưu activeId để track item đang được kéo. Visual feedback bắt đầu với item gốc giảm opacity và DragOverlay xuất hiện.

**onDragOver Event:**
Trong quá trình kéo, sự kiện onDragOver được trigger liên tục khi item di chuyển qua các droppable targets. Handler này chủ yếu dùng để visual feedback, không có logic phức tạp.

**onDragEnd Event:**
Khi user thả item, sự kiện onDragEnd được trigger với thông tin về item được thả (active) và target (over). Handler xử lý logic di chuyển email bao gồm xác định source column và target column, kiểm tra xem có thay đổi thực sự không, gọi mutation để update backend, và clear activeId.

**onDragCancel Event:**
Khi drag bị cancel (ví dụ nhấn Escape hoặc thả ra ngoài vùng hợp lệ), sự kiện này được trigger. Handler đơn giản clear activeId và không thực hiện thay đổi nào.

---

## 4. CHI TIẾT TRIỂN KHAI FRONTEND

### 4.1. KanbanBoard Component

Component KanbanBoard là container chính cho toàn bộ Kanban interface. Component này đảm nhận nhiều nhiệm vụ quan trọng:

**Quản lý DndContext:**
KanbanBoard wrap tất cả nội dung trong DndContext, cung cấp configuration cho sensors và collision detection. Sensors được cấu hình với PointerSensor có activation constraint là distance 2 pixels. Collision detection sử dụng rectIntersection algorithm.

**Xử lý Drag Events:**
Component định nghĩa các handler cho tất cả drag events. handleDragStart lưu activeId từ event.active.id. handleDragOver hiện tại chỉ để placeholder cho visual feedback. handleDragEnd xử lý logic chính khi thả item. handleDragCancel reset state khi cancel.

**Tính toán Email Data:**
Component sử dụng useMemo để tính toán allEmails bằng cách flatten emailsByColumn object. Đây là danh sách phẳng của tất cả email, dùng để tìm email theo ID khi cần render DragOverlay.

**Horizontal Scroll:**
Component implement custom wheel handler để support horizontal scroll với Shift+wheel. Điều này giúp user dễ dàng scroll ngang khi có nhiều cột.

**Render Structure:**
Component render một flex container với gap giữa các cột, iterate qua columns array và render KanbanColumn cho mỗi cột với emails tương ứng từ emailsByColumn.

### 4.2. KanbanColumn Component

Component KanbanColumn đại diện cho mỗi cột trên Kanban Board. Component này có nhiều responsibility:

**Droppable Registration:**
Component sử dụng useDroppable hook để đăng ký như một drop target. Hook trả về setNodeRef để attach vào DOM element, isOver boolean cho biết có item đang hover không, và active object chứa thông tin về item đang được kéo.

**Top Zone Droppable:**
Ngoài droppable chính cho toàn bộ cột, component còn tạo một droppable riêng cho vùng phía trên gọi là top zone. Khi user thả vào top zone, email sẽ được thêm vào đầu danh sách thay vì cuối.

**Visual Feedback:**
Component thay đổi style dựa trên trạng thái drag. Khi isDragging là true (có item đang được kéo), column mở rộng padding để dễ thả hơn và hiển thị border dashed. Khi isOver là true (item đang hover trên cột này), column hiển thị ring border và scale lên nhẹ.

**Auto Scroll:**
Component implement auto scroll khi hover over top zone. Sử dụng useEffect để detect isOverTopZone và scroll ScrollArea về top, giúp user thả vào đầu danh sách dù danh sách đã scroll xuống.

**Empty State:**
Khi cột không có email, component render empty state với message "No emails". State này cũng thay đổi style khi đang drag để indicate đây là valid drop target.

**SortableContext:**
Content của column được wrap trong SortableContext với verticalListSortingStrategy. Điều này enable reordering của cards trong cùng một column.

### 4.3. KanbanCard Component

Component KanbanCard đại diện cho mỗi email trên board. Component này có nhiều features:

**Sortable Setup:**
Component sử dụng useSortable hook với email.id làm identifier. Hook trả về attributes và listeners để handle drag gestures, setNodeRef để attach vào DOM, transform và transition cho animation, và isDragging boolean cho styling.

**Transform Application:**
CSS transform từ useSortable được apply vào card style. Sử dụng CSS.Transform.toString để convert transform object thành CSS string.

**Email Display:**
Component hiển thị thông tin email bao gồm avatar với initials từ sender name, sender name và email address, subject line và preview, received date với smart formatting (Today, Yesterday, hoặc date), và indicators cho starred, read status, attachments.

**Action Buttons:**
Component có các action buttons xuất hiện on hover bao gồm Star button để toggle starred status, More menu với options như Generate Summary và Snooze, và toàn bộ card clickable để open email detail.

**Drag Styling:**
Khi isDragging là true, card giảm opacity, scale nhỏ lại, và có shadow lớn hơn. Điều này indicate rằng đây là item đang được kéo và sẽ được move.

### 4.4. DragOverlay Component

DragOverlay là component đặc biệt render element đang được kéo:

**Portal Rendering:**
DragOverlay sử dụng React Portal để render bên ngoài normal DOM hierarchy. Điều này đảm bảo overlay không bị clip bởi parent containers có overflow hidden.

**Drop Animation:**
DragOverlay được configure với custom dropAnimation có duration 180ms và easing cubic-bezier cho spring-like effect. Animation này tạo cảm giác item "rơi" vào vị trí mới.

**Overlay Content:**
Bên trong DragOverlay, chúng tôi render một KanbanCard với styling đặc biệt bao gồm rotate 2 degrees để tạo effect "lifted", opacity 0.9 để nhẹ hơn original, shadow lớn để tạo depth, và scale 1.05 để lớn hơn original một chút.

**Conditional Rendering:**
DragOverlay chỉ render content khi có activeEmail. Sử dụng useMemo để find email từ allEmails dựa trên activeId.

---

## 5. CHI TIẾT TRIỂN KHAI BACKEND

### 5.1. MoveEmail API

API moveEmail xử lý việc di chuyển email giữa các cột:

**Endpoint:** POST /api/kanban/move

**Request Body:**
Request chứa emailId là Gmail message ID của email cần di chuyển, targetColumnId là ID của cột đích, và newOrder tùy chọn để xác định vị trí trong cột mới.

**Validation:**
Backend validate rằng targetColumnId tồn tại và thuộc về user hiện tại. Nếu email là snoozed và đang move vào non-Snoozed column, snooze status sẽ bị clear.

**Get or Create Status:**
Nếu email chưa có EmailKanbanStatus record, backend sẽ tạo mới. Điều này xảy ra khi email được move lần đầu từ email list vào Kanban. Backend fetch email metadata từ Gmail và tạo record mới.

**Update Status:**
Backend update columnId, orderInColumn, và updatedAt của EmailKanbanStatus. Nếu không có newOrder, email sẽ được append vào cuối cột (count của cột).

**Sync Gmail Labels:**
Sau khi update database, backend gọi syncGmailLabelsForColumn để đồng bộ labels với Gmail dựa trên cấu hình của target column.

**Response:**
API trả về KanbanEmailResponse chứa thông tin updated của email.

### 5.2. Gmail Label Sync

Khi email được di chuyển, hệ thống có thể tự động update Gmail labels:

**Column Label Configuration:**
Mỗi cột có thể được configure với gmailLabelId là label sẽ được add khi email vào cột, addLabelsOnMove là danh sách labels thêm vào, và removeLabelsOnMove là danh sách labels xóa đi.

**Sync Process:**
Phương thức syncGmailLabelsForColumn thực hiện các bước sau. Đầu tiên kiểm tra Gmail đã connected chưa. Sau đó collect labels to add từ gmailLabelId và addLabelsOnMove. Tiếp theo collect labels to remove từ removeLabelsOnMove. Cuối cùng gọi gmailService.modifyMessage với collected labels.

**Error Handling:**
Nếu label sync fail, error được log nhưng move operation vẫn thành công. Điều này đảm bảo Kanban functionality không bị block bởi Gmail API issues.

### 5.3. Order Management

Quản lý thứ tự email trong cột:

**Order In Column:**
Mỗi EmailKanbanStatus có trường orderInColumn xác định vị trí trong cột. Số nhỏ hơn ở trên, số lớn hơn ở dưới.

**Append to End:**
Khi move email mà không specify newOrder, email được append vào cuối bằng cách set orderInColumn bằng count của emails đã có trong cột.

**Insert at Position:**
Khi move với specific newOrder như 0 cho top, backend set orderInColumn theo giá trị đó. Tuy nhiên, việc reorder các email khác trong cột chưa được implement (future enhancement).

---

## 6. OPTIMISTIC UPDATES

### 6.1. Khái Niệm Optimistic Updates

Optimistic Updates là pattern update UI ngay lập tức trước khi nhận response từ server, giả định rằng operation sẽ thành công. Nếu server trả về error, UI sẽ rollback về state trước đó.

**Tại sao cần Optimistic Updates:**
Trong Kanban drag-drop, nếu phải chờ server response trước khi update UI, user sẽ thấy delay đáng kể giữa lúc thả card và lúc card xuất hiện ở vị trí mới. Delay này tạo trải nghiệm kém và không natural.

**Trade-offs:**
Optimistic updates require careful handling của failure cases. Cần có cơ chế rollback khi server fail và cần show error message cho user. Implementation phức tạp hơn nhưng UX tốt hơn đáng kể.

### 6.2. Implementation với React Query

React Query hỗ trợ optimistic updates thông qua onMutate callback:

**Cancel Outgoing Queries:**
Trước khi update, cancel tất cả outgoing queries cho board data để tránh race conditions. Sử dụng queryClient.cancelQueries với queryKey của board.

**Snapshot Previous Data:**
Lưu lại data hiện tại trước khi update để có thể rollback nếu cần. Get data từ cache bằng queryClient.getQueryData.

**Optimistically Update Cache:**
Update cache với new data ngay lập tức. Sử dụng queryClient.setQueryData để modify cached board data, di chuyển email từ source column sang target column.

**Return Context:**
Return object chứa previous data để onError có thể access và rollback.

### 6.3. Error Handling và Rollback

**onError Callback:**
Khi mutation fail, onError callback được trigger với error và context. Context chứa previous data đã snapshot.

**Rollback Logic:**
Trong onError, restore all previous data bằng cách set lại cache với snapshot data. Điều này effectively undo optimistic update.

**Error Notification:**
Sau rollback, show toast notification để user biết operation failed. Message có thể include error details từ server.

**onSettled Callback:**
Bất kể success hay error, invalidate queries để ensure cache synced với server. Điều này trigger refetch của fresh data.

### 6.4. Visual Feedback

**During Drag:**
Original card giảm opacity và có styling khác để indicate đang được move. Drop overlay follows pointer với enhanced styling.

**On Drop (Optimistic):**
Card ngay lập tức xuất hiện ở target column với animation. Không có loading state visible cho user.

**On Error (Rollback):**
Card animate back về original position khi rollback. Toast notification xuất hiện với error message.

---

## KẾT LUẬN PHẦN 2

Phần 2 đã trình bày chi tiết về tính năng Drag-Drop trong Kanban Board, từ việc lựa chọn thư viện @dnd-kit đến kiến trúc components và cơ chế optimistic updates. Drag-Drop là tính năng cốt lõi tạo nên trải nghiệm người dùng mượt mà và trực quan của Kanban Board.

**Tiếp theo trong Phần 3:** Phân tích chi tiết về quản lý cột và Gmail Label Mapping.

---

_Tài liệu này là một phần của bộ tài liệu phân tích chức năng đồ án cuối kỳ._
