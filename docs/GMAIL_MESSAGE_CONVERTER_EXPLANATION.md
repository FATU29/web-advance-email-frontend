# GIẢI THÍCH: GMAIL MESSAGE CONVERTER

## Tổng Quan

`GmailMessageConverter` là component chịu trách nhiệm chuyển đổi dữ liệu email từ định dạng phức tạp của Gmail API sang định dạng đơn giản, dễ sử dụng cho frontend. Đây là cầu nối quan trọng giữa Gmail API và ứng dụng, đảm bảo dữ liệu được chuẩn hóa và dễ dàng hiển thị trên giao diện người dùng.

## Chức Năng Chính

Converter thực hiện các nhiệm vụ quan trọng sau:

**1. Trích Xuất Thông Tin Headers**

Converter đọc các header từ Gmail message (như From, To, Subject) và chuyển đổi thành Map để dễ dàng truy xuất. Headers trong Gmail API được lưu dưới dạng mảng các object, converter biến đổi chúng thành cấu trúc key-value đơn giản hơn.

**2. Phân Tích Thông Tin Người Gửi**

Địa chỉ email người gửi trong Gmail có định dạng phức tạp như "John Doe &lt;john@example.com&gt;". Converter tách riêng tên hiển thị ("John Doe") và địa chỉ email thực ("john@example.com") để frontend có thể hiển thị linh hoạt theo nhu cầu giao diện.

**3. Xử Lý Trạng Thái Email**

Gmail sử dụng hệ thống labels để đánh dấu trạng thái email. Converter chuyển đổi các label như "UNREAD", "STARRED", "IMPORTANT" thành các boolean flags rõ ràng (isRead, isStarred, isImportant), giúp frontend dễ dàng hiển thị các icon và styling tương ứng.

**4. Kiểm Tra File Đính Kèm**

Converter duyệt đệ quy qua cấu trúc phức tạp của message parts để phát hiện xem email có file đính kèm hay không. Gmail message có thể có nhiều lớp parts lồng nhau, converter kiểm tra từng part để đảm bảo không bỏ sót attachment nào.

**5. Chuyển Đổi Timestamp**

Gmail API trả về thời gian dưới dạng milliseconds kể từ epoch. Converter chuyển đổi sang LocalDateTime của Java với timezone phù hợp, giúp frontend hiển thị thời gian chính xác theo múi giờ của người dùng.

## Quy Trình Hoạt Động

Khi một Gmail message được fetch từ API, nó trải qua quy trình chuyển đổi sau:

1. **Extract Headers**: Đọc tất cả headers từ payload và tổ chức thành Map
2. **Parse Sender**: Phân tích trường "From" để tách tên và email
3. **Process Labels**: Chuyển đổi danh sách label IDs thành các boolean flags
4. **Check Attachments**: Duyệt đệ quy message parts để tìm attachments
5. **Format Timestamp**: Chuyển đổi internal date sang LocalDateTime
6. **Build Response**: Tổng hợp tất cả thông tin vào EmailListResponse object

## Kết Quả Đầu Ra

Sau khi chuyển đổi, frontend nhận được object EmailListResponse với cấu trúc rõ ràng, bao gồm:

- ID email và thông tin người gửi (tên + email)
- Tiêu đề và đoạn preview nội dung
- Các trạng thái boolean (đã đọc, đánh dấu sao, quan trọng, có file đính kèm)
- Thời gian nhận email đã được format chuẩn

Dữ liệu này được đóng gói trong response JSON với pagination metadata (page, size, totalElements, nextPageToken), cho phép frontend dễ dàng implement infinite scroll và hiển thị danh sách email một cách mượt mà.

## Ý Nghĩa Trong Kiến Trúc

GmailMessageConverter đóng vai trò tầng trung gian (adapter layer) giúp tách biệt logic nghiệp vụ khỏi chi tiết implementation của Gmail API. Nhờ đó, nếu Gmail API thay đổi format hoặc cần chuyển sang email provider khác, chỉ cần chỉnh sửa converter mà không ảnh hưởng đến frontend và các layer khác của ứng dụng.
