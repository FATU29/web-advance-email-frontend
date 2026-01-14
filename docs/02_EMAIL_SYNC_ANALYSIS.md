# PHÂN TÍCH CHI TIẾT: ĐỒNG BỘ VÀ HIỂN THỊ EMAIL

## 1. TỔNG QUAN HỆ THỐNG ĐỒNG BỘ EMAIL

Hệ thống đồng bộ email của dự án được xây dựng dựa trên **Gmail API**, cho phép kết nối trực tiếp với hộp thư Gmail của người dùng và đồng bộ emails theo thời gian thực. Thay vì lưu trữ toàn bộ emails trong database nội bộ, hệ thống áp dụng chiến lược **"fetch on demand"** - chỉ lấy dữ liệu khi cần thiết, giảm thiểu storage và luôn đảm bảo dữ liệu mới nhất.

### 1.1. Kiến Trúc Tổng Thể

```
┌──────────────────────────────────────────────────────┐
│                   Gmail Servers                      │
│            (Google Infrastructure)                   │
└───────────────────┬──────────────────────────────────┘
                    │ Gmail API
                    │ (OAuth 2.0 Authentication)
                    ▼
┌──────────────────────────────────────────────────────┐
│              Backend Service (Java)                  │
│  ┌────────────────────────────────────────────────┐  │
│  │  GmailService                                  │  │
│  │  - Token management & auto-refresh            │  │
│  │  - API calls: listMessages, getMessage        │  │
│  │  - Rate limiting & error handling             │  │
│  └────────────────┬───────────────────────────────┘  │
│                   │                                   │
│  ┌────────────────▼───────────────────────────────┐  │
│  │  GmailMessageConverter                        │  │
│  │  - Parse Gmail message format                 │  │
│  │  - Extract headers, body, attachments        │  │
│  │  - Convert to DTO (Data Transfer Objects)    │  │
│  └────────────────┬───────────────────────────────┘  │
│                   │                                   │
│  ┌────────────────▼───────────────────────────────┐  │
│  │  EmailService                                  │  │
│  │  - Business logic for email operations        │  │
│  │  - Pagination handling                        │  │
│  │  - Filter & sort logic                        │  │
│  └────────────────┬───────────────────────────────┘  │
│                   │                                   │
│  ┌────────────────▼───────────────────────────────┐  │
│  │  EmailController                               │  │
│  │  - REST API endpoints                         │  │
│  │  - Request validation                         │  │
│  │  - Response formatting                        │  │
│  └────────────────────────────────────────────────┘  │
└───────────────────┬──────────────────────────────────┘
                    │ HTTP/JSON
                    ▼
┌──────────────────────────────────────────────────────┐
│           Frontend (React/Next.js)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  React Query (TanStack Query)                 │  │
│  │  - Data fetching & caching                    │  │
│  │  - Infinite scroll pagination                 │  │
│  │  - Optimistic updates                         │  │
│  └────────────────┬───────────────────────────────┘  │
│                   │                                   │
│  ┌────────────────▼───────────────────────────────┐  │
│  │  Zustand Store (use-email)                    │  │
│  │  - Global email state                         │  │
│  │  - Selected email tracking                    │  │
│  │  - Mailbox list                               │  │
│  └────────────────┬───────────────────────────────┘  │
│                   │                                   │
│  ┌────────────────▼───────────────────────────────┐  │
│  │  UI Components                                 │  │
│  │  - Email list (virtualized)                   │  │
│  │  - Email detail view                          │  │
│  │  - Mailbox sidebar                            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 1.2. Chiến Lược "Fetch On Demand"

**Tại sao không lưu emails vào database?**

Dự án sử dụng chiến lược **fetch on demand** vì các lý do sau:

#### Ưu Điểm:

1. **Luôn có dữ liệu mới nhất**: Mọi thay đổi trên Gmail (đọc, xóa, gắn sao) được phản ánh ngay lập tức
2. **Tiết kiệm storage**: Không cần lưu trữ hàng nghìn emails trong database
3. **Đồng bộ đa thiết bị**: User có thể dùng Gmail app và web app đồng thời mà không bị conflict
4. **Compliance**: Emails nhạy cảm không bị lưu trữ lâu dài trên server bên thứ ba
5. **Scalability**: Không cần lo về việc database phình to khi có nhiều users

#### Nhược Điểm (Và Cách Khắc Phục):

1. **Phụ thuộc vào Gmail API**:
   - Khắc phục: Implement caching layer (React Query) trên frontend
   - Fallback: Hiển thị cached data khi offline

2. **Rate Limiting**:
   - Gmail API limit: 250 quota units/user/second
   - Khắc phục: Pagination, lazy loading, debounce search

3. **Latency cao**:
   - Mỗi request cần gọi Gmail API
   - Khắc phục: Background prefetch, stale-while-revalidate strategy

4. **Không có full-text search offline**:
   - Khắc phục: Semantic search sử dụng embeddings (lưu trong database)

---

## 2. MAILBOX/LABELS SYNCHRONIZATION

### 2.1. Gmail Labels Là Gì?

Gmail **không có folders** như email clients truyền thống. Thay vào đó, Gmail sử dụng **labels** (nhãn) để tổ chức emails. Mỗi email có thể có nhiều labels.

#### Các Loại Labels:

**A. System Labels** (Labels hệ thống)
Gmail cung cấp sẵn các system labels:

- `INBOX`: Hộp thư đến
- `SENT`: Thư đã gửi
- `DRAFT`: Thư nháp
- `TRASH`: Thùng rác
- `SPAM`: Thư rác
- `STARRED`: Thư đánh dấu sao
- `IMPORTANT`: Thư quan trọng
- `UNREAD`: Label đặc biệt (không hiển thị trong list, dùng để filter)

**B. User Labels** (Labels do người dùng tạo)

- User có thể tạo labels tùy chỉnh: "Work", "Personal", "Family", v.v.
- Labels có thể có hierarchy (nested labels): "Work/Projects", "Work/Meetings"

### 2.2. Backend: Fetching Labels From Gmail API

#### API Endpoint:

```
GET /api/mailboxes
```

**Mô tả**: Lấy danh sách tất cả labels/mailboxes từ Gmail.

#### Backend Implementation:

**Controller:**

```java
@RestController
@RequestMapping("/api")
public class MailboxController {

    @Autowired
    private MailboxService mailboxService;

    @GetMapping("/mailboxes")
    public ResponseEntity<ApiResponse<List<MailboxResponse>>> getMailboxes(
            Authentication authentication) {
        String userId = (String) authentication.getPrincipal();

        List<MailboxResponse> mailboxes = mailboxService.getUserMailboxes(userId);

        return ResponseEntity.ok(ApiResponse.success(mailboxes));
    }
}
```

**Service Logic:**

```java
@Service
public class MailboxService {

    @Autowired
    private GmailService gmailService;

    public List<MailboxResponse> getUserMailboxes(String userId) {
        // Check if Gmail is connected
        if (!gmailService.isGmailConnected(userId)) {
            throw new ResourceNotFoundException(
                "Gmail not connected. Please connect your Gmail account first."
            );
        }

        return getMailboxesFromGmail(userId);
    }

    private List<MailboxResponse> getMailboxesFromGmail(String userId) {
        // Fetch labels from Gmail API
        List<Label> labels = gmailService.listLabels(userId);

        List<MailboxResponse> mailboxes = new ArrayList<>();

        // Filter and convert Gmail labels to mailboxes
        for (Label label : labels) {
            // Only include system labels and user labels
            if (label.getType() != null &&
                (label.getType().equals("system") || label.getType().equals("user"))) {

                MailboxResponse mailbox = MailboxResponse.builder()
                    .id(label.getId())  // Gmail label ID (e.g., "INBOX", "Label_123")
                    .name(label.getName())  // Display name (e.g., "Inbox", "Work")
                    .type(mapGmailLabelToType(label.getId()))
                    .unreadCount(label.getMessagesUnread() != null ?
                        label.getMessagesUnread() : 0)
                    .totalCount(label.getMessagesTotal() != null ?
                        label.getMessagesTotal() : 0)
                    .build();

                mailboxes.add(mailbox);
            }
        }

        return mailboxes;
    }

    private Mailbox.MailboxType mapGmailLabelToType(String labelId) {
        // Map Gmail label IDs to our internal MailboxType enum
        return switch (labelId) {
            case "INBOX" -> Mailbox.MailboxType.INBOX;
            case "SENT" -> Mailbox.MailboxType.SENT;
            case "DRAFT" -> Mailbox.MailboxType.DRAFT;
            case "TRASH" -> Mailbox.MailboxType.TRASH;
            case "SPAM" -> Mailbox.MailboxType.SPAM;
            case "STARRED" -> Mailbox.MailboxType.STARRED;
            case "IMPORTANT" -> Mailbox.MailboxType.IMPORTANT;
            default -> Mailbox.MailboxType.CUSTOM;
        };
    }
}
```

**GmailService Implementation:**

```java
@Service
@Slf4j
public class GmailService {

    public List<Label> listLabels(String userId) {
        try {
            Gmail service = getGmailService(userId);

            ListLabelsResponse response = service.users().labels()
                .list("me")
                .execute();

            return response.getLabels();

        } catch (IOException e) {
            log.error("Failed to list Gmail labels", e);
            throw new BadRequestException("Failed to fetch mailboxes: " + e.getMessage());
        }
    }
}
```

**Response Example:**

```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": "INBOX",
      "name": "Inbox",
      "type": "INBOX",
      "unreadCount": 42,
      "totalCount": 1523
    },
    {
      "id": "SENT",
      "name": "Sent",
      "type": "SENT",
      "unreadCount": 0,
      "totalCount": 345
    },
    {
      "id": "Label_5823947264738492",
      "name": "Work",
      "type": "CUSTOM",
      "unreadCount": 5,
      "totalCount": 89
    }
  ]
}
```

### 2.3. Frontend: Displaying Mailbox List

Frontend sử dụng **React Query** để fetch và cache mailboxes:

**React Query Hook:**

```typescript
export const useMailboxesQuery = (options?) => {
  return useQuery({
    queryKey: emailQueryKeys.mailboxes(),
    queryFn: async () => {
      const response = await getMailboxes();

      if (response.data.success && response.data.data) {
        // Update Zustand store
        useEmail.setState({ mailboxes: response.data.data });
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to fetch mailboxes');
    },
    ...options,
  });
};
```

**Usage trong Component:**

```typescript
const KanbanPage = () => {
  const { data: mailboxesData = [] } = useMailboxesQuery({
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const mailboxes = React.useMemo(() => {
    return mailboxesData || [];
  }, [mailboxesData]);

  // Find INBOX mailbox
  const inboxMailbox = React.useMemo(() => {
    return mailboxes.find((m) => m.type === "INBOX" || m.id === "INBOX");
  }, [mailboxes]);

  return <Sidebar mailboxes={mailboxes} activeFolder={inboxMailbox?.id} />;
};
```

**Sidebar Component (Display Mailboxes):**

```typescript
interface SidebarProps {
  mailboxes: IMailbox[];
  activeFolder?: string;
  onFolderSelect?: (folderId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  mailboxes,
  activeFolder,
  onFolderSelect,
}) => {
  // Group mailboxes by type
  const systemMailboxes = mailboxes.filter((m) => m.type !== "CUSTOM");
  const customMailboxes = mailboxes.filter((m) => m.type === "CUSTOM");

  return (
    <div className="sidebar">
      {/* System Folders */}
      <div className="mailbox-group">
        <h3>System Folders</h3>
        {systemMailboxes.map((mailbox) => (
          <MailboxItem
            key={mailbox.id}
            mailbox={mailbox}
            isActive={activeFolder === mailbox.id}
            onClick={() => onFolderSelect?.(mailbox.id)}
          />
        ))}
      </div>

      {/* Custom Labels */}
      {customMailboxes.length > 0 && (
        <div className="mailbox-group">
          <h3>Labels</h3>
          {customMailboxes.map((mailbox) => (
            <MailboxItem
              key={mailbox.id}
              mailbox={mailbox}
              isActive={activeFolder === mailbox.id}
              onClick={() => onFolderSelect?.(mailbox.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 3. EMAIL LIST SYNCHRONIZATION

### 3.1. Backend: Fetching Emails With Gmail API

#### API Endpoint:

```
GET /api/mailboxes/{mailboxId}/emails?page=0&size=20&pageToken=xxx
```

**Parameters:**

- `mailboxId`: Gmail label ID (e.g., "INBOX", "Label_123")
- `page`: Page number (0-indexed, for compatibility với pagination UI)
- `size`: Number of emails per page (default: 20, max: 100)
- `pageToken`: Gmail's next page token (optional, for pagination)

#### Backend Implementation:

**Controller:**

```java
@RestController
@RequestMapping("/api")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/mailboxes/{mailboxId}/emails")
    public ResponseEntity<ApiResponse<PageResponse<EmailListResponse>>> getEmails(
            Authentication authentication,
            @PathVariable String mailboxId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String pageToken) {

        String userId = (String) authentication.getPrincipal();

        log.info("📧 Get emails | user: {} | mailbox: {} | page: {} | size: {}",
                userId, mailboxId, page, size);

        PageResponse<EmailListResponse> emails =
            emailService.getEmailsByMailbox(userId, mailboxId, page, size, pageToken);

        return ResponseEntity.ok(ApiResponse.success(emails));
    }
}
```

**Service Logic:**

```java
@Service
public class EmailService {

    @Autowired
    private GmailService gmailService;

    @Autowired
    private GmailMessageConverter gmailMessageConverter;

    public PageResponse<EmailListResponse> getEmailsByMailbox(
            String userId, String mailboxId, int page, int size, String pageToken) {

        // Check if Gmail is connected
        if (!gmailService.isGmailConnected(userId)) {
            throw new ResourceNotFoundException(
                "Gmail not connected. Please connect your Gmail account first."
            );
        }

        return getEmailsFromGmail(userId, mailboxId, page, size, pageToken);
    }

    private PageResponse<EmailListResponse> getEmailsFromGmail(
            String userId, String mailboxId, int page, int size, String pageToken) {

        log.debug("🔍 Fetching emails from Gmail | mailboxId: {} | size: {} | pageToken: {}",
                mailboxId, size, pageToken != null ? pageToken : "null (first page)");

        // Call Gmail API to list messages
        MessageListResult result = gmailService.listMessages(
            userId,
            mailboxId,
            (long) size,
            pageToken
        );

        log.debug("📊 Gmail API response | messages: {} | nextPageToken: {} | totalEstimate: {}",
                result.getMessages().size(),
                result.getNextPageToken() != null ? "present" : "null (last page)",
                result.getResultSizeEstimate());

        // Convert Gmail messages to EmailListResponse DTOs
        List<EmailListResponse> content = result.getMessages().stream()
            .map(gmailMessageConverter::toEmailListResponse)
            .collect(Collectors.toList());

        // Calculate pagination metadata
        long totalElements = result.getResultSizeEstimate() != null ?
            result.getResultSizeEstimate() : content.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        boolean isLast = result.getNextPageToken() == null;

        log.debug("✅ Returning page response | page: {} | size: {} | total: {} | hasNext: {}",
                page, size, totalElements, !isLast);

        return PageResponse.<EmailListResponse>builder()
            .content(content)
            .page(page)
            .size(size)
            .totalElements(totalElements)
            .totalPages(totalPages)
            .last(isLast)
            .nextPageToken(result.getNextPageToken())  // Pass Gmail's pageToken to frontend
            .build();
    }
}
```

**GmailService Implementation:**

```java
@Service
@Slf4j
public class GmailService {

    /**
     * List messages in a label/mailbox
     * Returns MessageListResult with messages, nextPageToken, and resultSizeEstimate
     */
    public MessageListResult listMessages(
            String userId, String labelId, Long maxResults, String pageToken) {

        try {
            log.debug("📧 Gmail API listMessages | labelId: {} | maxResults: {} | pageToken: {}",
                    labelId, maxResults, pageToken != null ? pageToken : "null");

            Gmail service = getGmailService(userId);

            // Build request
            Gmail.Users.Messages.List request = service.users().messages().list("me");

            // Filter by label
            if (labelId != null && !labelId.isEmpty()) {
                request.setLabelIds(Collections.singletonList(labelId));
            }

            // Set max results
            if (maxResults != null) {
                request.setMaxResults(maxResults);
            }

            // Set page token for pagination
            if (pageToken != null && !pageToken.isEmpty()) {
                request.setPageToken(pageToken);
            }

            // Execute request
            ListMessagesResponse response = request.execute();

            log.debug("📬 Gmail API response | messages: {} | nextPageToken: {} | estimate: {}",
                    response.getMessages() != null ? response.getMessages().size() : 0,
                    response.getNextPageToken() != null ? "present" : "null",
                    response.getResultSizeEstimate());

            // Handle empty response
            if (response.getMessages() == null) {
                return MessageListResult.builder()
                    .messages(Collections.emptyList())
                    .nextPageToken(null)
                    .resultSizeEstimate(0L)
                    .build();
            }

            // Fetch full message details (Gmail API returns only message IDs initially)
            // This requires ADDITIONAL API calls for each message!
            List<Message> messages = response.getMessages().stream()
                .map(msg -> {
                    try {
                        return service.users().messages().get("me", msg.getId())
                            .setFormat("full")  // Get full message with headers & body
                            .execute();
                    } catch (IOException e) {
                        log.error("Failed to fetch message: " + msg.getId(), e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

            return MessageListResult.builder()
                .messages(messages)
                .nextPageToken(response.getNextPageToken())
                .resultSizeEstimate(response.getResultSizeEstimate())
                .build();

        } catch (IOException e) {
            log.error("Failed to list Gmail messages", e);
            throw new BadRequestException("Failed to fetch emails: " + e.getMessage());
        }
    }
}
```

**⚠️ Performance Note:**

Việc fetch full message details cho mỗi email trong list là **rất tốn kém**:

- Gmail API list endpoint chỉ trả về message IDs và thread IDs
- Phải gọi thêm `messages.get()` cho mỗi message để lấy headers, body, etc.
- Nếu page size = 20, cần tổng cộng **21 API calls** (1 list + 20 get)

**Optimization đã áp dụng:**

- Sử dụng `setFormat("metadata")` cho email list (chỉ lấy headers, không lấy body)
- Body chỉ được fetch khi user click vào email detail
- Frontend cache kết quả với React Query

### 3.2. Gmail Message Conversion

Gmail API trả về messages ở định dạng phức tạp. `GmailMessageConverter` chịu trách nhiệm parse và convert sang DTOs đơn giản hơn.

#### Gmail Message Structure:

```json
{
  "id": "18d4c5f2a3b1c9e7",
  "threadId": "18d4c5f2a3b1c9e7",
  "labelIds": ["INBOX", "UNREAD", "IMPORTANT"],
  "snippet": "This is a preview of the email content...",
  "internalDate": "1705238400000",
  "payload": {
    "headers": [
      { "name": "From", "value": "sender@example.com" },
      { "name": "To", "value": "recipient@example.com" },
      { "name": "Subject", "value": "Meeting Tomorrow" },
      { "name": "Date", "value": "Sun, 14 Jan 2024 10:00:00 +0700" }
    ],
    "mimeType": "multipart/alternative",
    "body": { "size": 0 },
    "parts": [
      {
        "mimeType": "text/plain",
        "body": { "data": "VGhpcyBpcyB0aGUgcGxhaW4gdGV4dCBib2R5" }
      },
      {
        "mimeType": "text/html",
        "body": {
          "data": "PGh0bWw+PGJvZHk+VGhpcyBpcyB0aGUgSFRNTCBib2R5PC9ib2R5PjwvaHRtbD4="
        }
      }
    ]
  }
}
```

#### Converter Implementation:

```java
@Component
public class GmailMessageConverter {

    /**
     * Convert Gmail Message to EmailListResponse (for email list)
     */
    public EmailListResponse toEmailListResponse(Message message) {
        // Extract headers
        Map<String, String> headers = extractHeaders(message);

        // Parse "From" header
        String from = headers.getOrDefault("From", "");
        String fromName = extractName(from);  // "John Doe <john@example.com>" -> "John Doe"
        String fromEmail = extractEmail(from);  // "John Doe <john@example.com>" -> "john@example.com"

        String subject = headers.getOrDefault("Subject", "(No Subject)");
        String snippet = message.getSnippet() != null ? message.getSnippet() : "";

        // Check if message has attachments
        boolean hasAttachments = hasAttachments(message);

        // Parse labels for status flags
        List<String> labelIds = message.getLabelIds() != null ?
            message.getLabelIds() : Collections.emptyList();

        boolean isRead = !labelIds.contains("UNREAD");
        boolean isStarred = labelIds.contains("STARRED");
        boolean isImportant = labelIds.contains("IMPORTANT");

        // Convert timestamp (Gmail uses milliseconds since epoch)
        LocalDateTime receivedAt = LocalDateTime.ofInstant(
            Instant.ofEpochMilli(message.getInternalDate()),
            ZoneId.systemDefault()
        );

        return EmailListResponse.builder()
            .id(message.getId())
            .from(fromEmail)
            .fromName(fromName)
            .subject(subject)
            .preview(snippet)
            .isRead(isRead)
            .isStarred(isStarred)
            .isImportant(isImportant)
            .hasAttachments(hasAttachments)
            .receivedAt(receivedAt)
            .build();
    }

    /**
     * Extract headers from Gmail message
     */
    private Map<String, String> extractHeaders(Message message) {
        Map<String, String> headers = new HashMap<>();

        if (message.getPayload() != null && message.getPayload().getHeaders() != null) {
            for (MessagePartHeader header : message.getPayload().getHeaders()) {
                headers.put(header.getName(), header.getValue());
            }
        }

        return headers;
    }

    /**
     * Extract name from "From" header
     * "John Doe <john@example.com>" -> "John Doe"
     */
    private String extractName(String fromHeader) {
        if (fromHeader == null || fromHeader.isEmpty()) {
            return "";
        }

        // Check if format is "Name <email>"
        int angleStart = fromHeader.indexOf('<');
        if (angleStart > 0) {
            return fromHeader.substring(0, angleStart).trim();
        }

        // Otherwise, use email as name
        return fromHeader.trim();
    }

    /**
     * Extract email from "From" header
     * "John Doe <john@example.com>" -> "john@example.com"
     */
    private String extractEmail(String fromHeader) {
        if (fromHeader == null || fromHeader.isEmpty()) {
            return "";
        }

        // Check if format is "Name <email>"
        int angleStart = fromHeader.indexOf('<');
        int angleEnd = fromHeader.indexOf('>');

        if (angleStart >= 0 && angleEnd > angleStart) {
            return fromHeader.substring(angleStart + 1, angleEnd).trim();
        }

        // Otherwise, use entire string as email
        return fromHeader.trim();
    }

    /**
     * Check if message has attachments
     */
    private boolean hasAttachments(Message message) {
        if (message.getPayload() == null) {
            return false;
        }

        return hasAttachmentsPart(message.getPayload());
    }

    private boolean hasAttachmentsPart(MessagePart part) {
        // Check if this part is an attachment
        if (part.getFilename() != null && !part.getFilename().isEmpty() &&
            part.getBody() != null && part.getBody().getAttachmentId() != null) {
            return true;
        }

        // Recursively check sub-parts
        if (part.getParts() != null) {
            for (MessagePart subPart : part.getParts()) {
                if (hasAttachmentsPart(subPart)) {
                    return true;
                }
            }
        }

        return false;
    }
}
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "18d4c5f2a3b1c9e7",
        "from": "john@example.com",
        "fromName": "John Doe",
        "subject": "Meeting Tomorrow",
        "preview": "Hi, I wanted to confirm our meeting scheduled for tomorrow...",
        "isRead": false,
        "isStarred": true,
        "isImportant": true,
        "hasAttachments": false,
        "receivedAt": "2026-01-14T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1523,
    "totalPages": 77,
    "last": false,
    "nextPageToken": "08234759234875923847"
  }
}
```

### 3.3. Gmail Pagination Strategy

Gmail API sử dụng **cursor-based pagination** với `nextPageToken` thay vì offset-based pagination.

#### Tại sao không dùng offset pagination?

**Vấn đề với offset pagination:**

```
Page 1: emails 1-20
Page 2: emails 21-40  <- Nếu có email mới vào INBOX...
Page 3: emails 41-60  <- Có thể bị duplicate hoặc skip emails!
```

**Cursor-based pagination với pageToken:**

```
Request 1: GET /emails?size=20
Response: { emails: [...], nextPageToken: "ABC123" }

Request 2: GET /emails?size=20&pageToken=ABC123
Response: { emails: [...], nextPageToken: "DEF456" }

Request 3: GET /emails?size=20&pageToken=DEF456
Response: { emails: [...], nextPageToken: null }  // Last page
```

**Ưu điểm:**

- Không bị duplicate hoặc skip emails khi có emails mới
- Performance tốt hơn (không cần count total)
- Consistent với Gmail API design

**Nhược điểm:**

- Không thể jump to specific page (e.g., page 5)
- Không biết chính xác tổng số pages (chỉ có estimate)

### 3.4. Frontend: Infinite Scroll With React Query

Frontend sử dụng **React Query's useInfiniteQuery** để implement infinite scroll pagination.

#### React Query Hook:

```typescript
export const useEmailsInfiniteQuery = (
  mailboxId: string,
  params?: Omit<IGetEmailsParams, 'page' | 'pageToken'>,
  options?: UseInfiniteQueryOptions
) => {
  return useInfiniteQuery({
    queryKey: ['emails', 'infinite', mailboxId, params],

    queryFn: async ({ pageParam }) => {
      // pageParam is the nextPageToken from previous page
      const response = await getEmails(mailboxId, {
        ...params,
        size: params?.size || 20,
        pageToken: pageParam, // Pass pageToken to backend
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to fetch emails');
    },

    // Get next page token from previous page's response
    getNextPageParam: (lastPage) => {
      return lastPage.nextPageToken ?? undefined;
    },

    // Initial page param is undefined (first page)
    initialPageParam: undefined,

    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};
```

#### Usage trong Component với Infinite Scroll:

```typescript
const EmailList: React.FC<{ mailboxId: string }> = ({ mailboxId }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useEmailsInfiniteQuery(mailboxId, { size: 50 });

  // Flatten all pages into single array
  const emails = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  // Intersection Observer for infinite scroll
  const { ref: loadMoreRef } = useIntersectionObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  return (
    <div className="email-list">
      {emails.map((email) => (
        <EmailCard key={email.id} email={email} />
      ))}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {isFetchingNextPage ? <Spinner /> : null}
        </div>
      )}

      {!hasNextPage && <div className="end-message">No more emails</div>}
    </div>
  );
};
```

#### Intersection Observer Hook:

```typescript
const useIntersectionObserver = (options: {
  onIntersect: () => void;
  threshold?: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          options.onIntersect();
        }
      },
      { threshold: options.threshold || 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options.onIntersect, options.threshold]);

  return { ref };
};
```

---

## 4. EMAIL DETAIL SYNCHRONIZATION

### 4.1. Backend: Fetching Single Email

#### API Endpoint:

```
GET /api/emails/{emailId}
```

**Mô tả**: Lấy chi tiết đầy đủ của một email, bao gồm body, attachments, headers đầy đủ.

#### Backend Implementation:

**Controller:**

```java
@RestController
@RequestMapping("/api")
public class EmailController {

    @GetMapping("/emails/{emailId}")
    public ResponseEntity<ApiResponse<EmailDetailResponse>> getEmail(
            Authentication authentication,
            @PathVariable String emailId) {

        String userId = (String) authentication.getPrincipal();

        log.info("📧 Get email detail | user: {} | emailId: {}", userId, emailId);

        EmailDetailResponse email = emailService.getEmailById(userId, emailId);

        return ResponseEntity.ok(ApiResponse.success(email));
    }
}
```

**Service Logic:**

```java
@Service
public class EmailService {

    public EmailDetailResponse getEmailById(String userId, String emailId) {
        // Check Gmail connection
        if (!gmailService.isGmailConnected(userId)) {
            throw new ResourceNotFoundException(
                "Gmail not connected. Please connect your Gmail account first."
            );
        }

        // Fetch full message from Gmail API
        Message gmailMessage = gmailService.getMessage(userId, emailId);

        // Convert to EmailDetailResponse
        return gmailMessageConverter.toEmailDetailResponse(gmailMessage);
    }
}
```

**GmailService Implementation:**

```java
@Service
@Slf4j
public class GmailService {

    /**
     * Get a single message by ID with full details
     */
    public Message getMessage(String userId, String messageId) {
        try {
            Gmail service = getGmailService(userId);

            return service.users().messages().get("me", messageId)
                .setFormat("full")  // Full message with headers and body
                .execute();

        } catch (IOException e) {
            log.error("Failed to get Gmail message: " + messageId, e);
            throw new BadRequestException("Failed to fetch email: " + e.getMessage());
        }
    }
}
```

**GmailMessageConverter - toEmailDetailResponse:**

```java
public EmailDetailResponse toEmailDetailResponse(Message message) {
    Map<String, String> headers = extractHeaders(message);

    // Parse sender
    String from = headers.getOrDefault("From", "");
    String fromName = extractName(from);
    String fromEmail = extractEmail(from);

    String subject = headers.getOrDefault("Subject", "(No Subject)");

    // Parse recipients
    List<String> to = parseEmailList(headers.getOrDefault("To", ""));
    List<String> cc = parseEmailList(headers.getOrDefault("Cc", ""));
    List<String> bcc = parseEmailList(headers.getOrDefault("Bcc", ""));

    // Extract body (plain text or HTML)
    String body = extractBody(message);

    // Extract attachments
    List<Attachment> attachments = extractAttachments(message);

    // Parse labels
    List<String> labelIds = message.getLabelIds() != null ?
        message.getLabelIds() : Collections.emptyList();
    boolean isRead = !labelIds.contains("UNREAD");
    boolean isStarred = labelIds.contains("STARRED");
    boolean isImportant = labelIds.contains("IMPORTANT");

    // Convert timestamps
    LocalDateTime receivedAt = LocalDateTime.ofInstant(
        Instant.ofEpochMilli(message.getInternalDate()),
        ZoneId.systemDefault()
    );

    return EmailDetailResponse.builder()
        .id(message.getId())
        .from(fromEmail)
        .fromName(fromName)
        .to(to)
        .cc(cc)
        .bcc(bcc)
        .subject(subject)
        .body(body)
        .isRead(isRead)
        .isStarred(isStarred)
        .isImportant(isImportant)
        .attachments(attachments)
        .receivedAt(receivedAt)
        .sentAt(receivedAt)
        .build();
}
```

**Body Extraction Logic:**

```java
private String extractBody(Message message) {
    if (message.getPayload() == null) {
        return "";
    }

    return extractBodyFromPart(message.getPayload());
}

private String extractBodyFromPart(MessagePart part) {
    // Check if this part has body data
    if (part.getBody() != null && part.getBody().getData() != null) {
        byte[] bodyBytes = Base64.getUrlDecoder().decode(part.getBody().getData());
        return new String(bodyBytes);
    }

    // If multipart, recursively check parts
    if (part.getParts() != null) {
        for (MessagePart subPart : part.getParts()) {
            String mimeType = subPart.getMimeType();

            // Prefer HTML over plain text
            if ("text/html".equals(mimeType)) {
                String htmlBody = extractBodyFromPart(subPart);
                if (!htmlBody.isEmpty()) {
                    return htmlBody;
                }
            }
        }

        // Fallback to plain text
        for (MessagePart subPart : part.getParts()) {
            if ("text/plain".equals(subPart.getMimeType())) {
                String plainBody = extractBodyFromPart(subPart);
                if (!plainBody.isEmpty()) {
                    return plainBody;
                }
            }
        }

        // Fallback to first part
        return extractBodyFromPart(part.getParts().get(0));
    }

    return "";
}
```

**Attachment Extraction:**

```java
private List<Attachment> extractAttachments(Message message) {
    List<Attachment> attachments = new ArrayList<>();

    if (message.getPayload() != null) {
        extractAttachmentsFromPart(message.getId(), message.getPayload(), attachments);
    }

    return attachments;
}

private void extractAttachmentsFromPart(
        String messageId, MessagePart part, List<Attachment> attachments) {

    // Check if this part is an attachment
    if (part.getFilename() != null && !part.getFilename().isEmpty() &&
        part.getBody() != null && part.getBody().getAttachmentId() != null) {

        Attachment attachment = Attachment.builder()
            .id(part.getBody().getAttachmentId())
            .messageId(messageId)
            .filename(part.getFilename())
            .mimeType(part.getMimeType())
            .size(part.getBody().getSize() != null ? part.getBody().getSize() : 0)
            .build();

        attachments.add(attachment);
    }

    // Recursively check sub-parts
    if (part.getParts() != null) {
        for (MessagePart subPart : part.getParts()) {
            extractAttachmentsFromPart(messageId, subPart, attachments);
        }
    }
}
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "id": "18d4c5f2a3b1c9e7",
    "from": "john@example.com",
    "fromName": "John Doe",
    "to": ["recipient@example.com"],
    "cc": [],
    "bcc": [],
    "subject": "Meeting Tomorrow",
    "body": "<html><body><p>Hi,</p><p>I wanted to confirm our meeting...</p></body></html>",
    "isRead": false,
    "isStarred": true,
    "isImportant": true,
    "attachments": [
      {
        "id": "ANGjdJ8wB3Vh0F...",
        "messageId": "18d4c5f2a3b1c9e7",
        "filename": "presentation.pdf",
        "mimeType": "application/pdf",
        "size": 245678
      }
    ],
    "receivedAt": "2026-01-14T10:00:00",
    "sentAt": "2026-01-14T10:00:00"
  }
}
```

### 4.2. Frontend: Email Detail View

```typescript
export const useEmailQuery = (
  emailId: string,
  options?: UseQueryOptions<IEmailDetail, AxiosError>
) => {
  return useQuery({
    queryKey: ['email', emailId],
    queryFn: async () => {
      const response = await getEmailById(emailId);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to fetch email');
    },
    enabled: !!emailId, // Only fetch if emailId is provided
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    ...options,
  });
};
```

**Usage trong EmailDetail Component:**

```typescript
const EmailDetail: React.FC<{ emailId: string }> = ({ emailId }) => {
  const { data: email, isLoading, error } = useEmailQuery(emailId);

  if (isLoading) return <EmailDetailSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!email) return null;

  return (
    <div className="email-detail">
      <EmailHeader
        from={email.from}
        fromName={email.fromName}
        to={email.to}
        subject={email.subject}
        receivedAt={email.receivedAt}
      />

      <EmailBody body={email.body} attachments={email.attachments} />

      <EmailActions
        emailId={email.id}
        isRead={email.isRead}
        isStarred={email.isStarred}
      />
    </div>
  );
};
```

---

## 5. CACHING STRATEGY

### 5.1. React Query Caching

Frontend sử dụng React Query để cache emails và giảm số lượng API calls.

**Cache Configuration:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // Data fresh trong 2 phút
      cacheTime: 10 * 60 * 1000, // Keep in cache 10 phút
      refetchOnWindowFocus: true, // Refetch khi user quay lại tab
      refetchOnReconnect: true, // Refetch khi mất mạng và reconnect
      retry: 1, // Retry 1 lần nếu failed
    },
  },
});
```

**Stale-While-Revalidate Pattern:**

```
User requests emails
  ↓
React Query checks cache
  ↓
Cache exists & fresh? → Return cached data immediately
  ↓
Cache exists but stale? → Return cached data + fetch new data in background
  ↓
No cache? → Show loading + fetch new data
```

### 5.2. Backend Caching (Optional)

Backend có thể implement Redis cache để giảm tải Gmail API:

```java
@Service
public class EmailService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_KEY_PREFIX = "emails:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    public PageResponse<EmailListResponse> getEmailsByMailbox(
            String userId, String mailboxId, int page, int size, String pageToken) {

        // Check cache
        String cacheKey = CACHE_KEY_PREFIX + userId + ":" + mailboxId + ":" + pageToken;
        PageResponse<EmailListResponse> cached =
            (PageResponse<EmailListResponse>) redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            log.debug("✅ Cache hit for key: {}", cacheKey);
            return cached;
        }

        // Fetch from Gmail API
        PageResponse<EmailListResponse> result =
            getEmailsFromGmail(userId, mailboxId, page, size, pageToken);

        // Store in cache
        redisTemplate.opsForValue().set(cacheKey, result, CACHE_TTL);

        return result;
    }
}
```

---

## 6. PERFORMANCE OPTIMIZATION

### 6.1. Virtualization For Large Lists

Frontend sử dụng **react-window** để render chỉ emails visible trong viewport:

```typescript
import { FixedSizeList as List } from "react-window";

const VirtualizedEmailList: React.FC<{ emails: IEmailListItem[] }> = ({
  emails,
}) => {
  const Row = ({ index, style }) => {
    const email = emails[index];
    return (
      <div style={style}>
        <EmailCard email={email} />
      </div>
    );
  };

  return (
    <List
      height={800} // Viewport height
      itemCount={emails.length}
      itemSize={80} // Height of each email card
      width="100%"
    >
      {Row}
    </List>
  );
};
```

**Benefits:**

- Chỉ render ~10-15 emails tại một thời điểm (thay vì 1000+)
- Scroll performance mượt mà
- Giảm memory usage

### 6.2. Rate Limiting & Error Handling

**Gmail API Quotas:**

- **250 quota units per user per second**
- `users.messages.list`: 5 units
- `users.messages.get`: 5 units
- `users.messages.modify`: 5 units

**Backend Rate Limiting:**

```java
@Service
public class GmailService {

    private final RateLimiter rateLimiter = RateLimiter.create(40.0);  // 40 requests/second

    public MessageListResult listMessages(...) {
        // Acquire rate limit permit
        rateLimiter.acquire();

        try {
            // Gmail API call
            return ...;
        } catch (GoogleJsonResponseException e) {
            if (e.getStatusCode() == 429) {  // Rate limit exceeded
                log.warn("Gmail API rate limit exceeded. Retrying after delay...");
                Thread.sleep(1000);
                return listMessages(...);  // Retry
            }
            throw e;
        }
    }
}
```

### 6.3. Prefetching Strategy

**Prefetch next page khi user scroll gần cuối:**

```typescript
const EmailList: React.FC<{ mailboxId: string }> = ({ mailboxId }) => {
  const { data, fetchNextPage, hasNextPage } =
    useEmailsInfiniteQuery(mailboxId);

  // Prefetch when user is 80% down the list
  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8 && hasNextPage) {
        fetchNextPage(); // Prefetch next page
      }
    },
    [fetchNextPage, hasNextPage]
  );

  return <div onScroll={handleScroll}>{/* Email list */}</div>;
};
```

---

## 7. KẾT LUẬN

Hệ thống đồng bộ email của dự án được thiết kế với các đặc điểm nổi bật:

✅ **Fetch On Demand**: Không lưu emails trong database, luôn lấy dữ liệu mới nhất từ Gmail

✅ **Cursor-Based Pagination**: Sử dụng Gmail's pageToken để pagination hiệu quả

✅ **Infinite Scroll**: Smooth user experience với React Query's useInfiniteQuery

✅ **Smart Caching**: Stale-while-revalidate pattern giảm API calls

✅ **Performance Optimized**: Virtualization, prefetching, rate limiting

✅ **Gmail API Integration**: Tận dụng đầy đủ Gmail API features

Hệ thống đảm bảo dữ liệu luôn đồng bộ với Gmail trong khi vẫn mang lại trải nghiệm người dùng mượt mà và nhanh chóng.
