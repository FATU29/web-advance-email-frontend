# PHÂN TÍCH CHỨC NĂNG AI - TÍNH NĂNG TRÍ TUỆ NHÂN TẠO

## Đồ Án Cuối Kỳ - Ứng Dụng Email Client với Kanban Board

### Nhóm: 22120120 - 22120157 - 22120163

---

## MỤC LỤC

1. [Giới Thiệu Tính Năng AI](#1-giới-thiệu-tính-năng-ai)
2. [Kiến Trúc AI Service](#2-kiến-trúc-ai-service)
3. [Email Summarization - Tóm Tắt Email](#3-email-summarization---tóm-tắt-email)
4. [Text Embeddings - Vector Nhúng Văn Bản](#4-text-embeddings---vector-nhúng-văn-bản)
5. [Semantic Search - Tìm Kiếm Ngữ Nghĩa](#5-semantic-search---tìm-kiếm-ngữ-nghĩa)
6. [Tích Hợp với Hệ Thống](#6-tích-hợp-với-hệ-thống)

---

## 1. GIỚI THIỆU TÍNH NĂNG AI

### 1.1. Tổng Quan về AI trong Ứng Dụng

Ứng dụng Email Client tích hợp các tính năng AI tiên tiến để nâng cao trải nghiệm quản lý email của người dùng. Các tính năng AI được cung cấp bởi OpenAI API thông qua một AI Service riêng biệt, cho phép người dùng tận dụng sức mạnh của các mô hình ngôn ngữ lớn (Large Language Models) trong việc xử lý và tìm kiếm email.

**Các tính năng AI chính:**
Hệ thống cung cấp ba tính năng AI cốt lõi. Thứ nhất là Email Summarization cho phép tạo tóm tắt ngắn gọn cho email dài, giúp người dùng nhanh chóng nắm bắt nội dung chính mà không cần đọc toàn bộ email. Thứ hai là Text Embeddings cho phép chuyển đổi nội dung email thành vector số học để so sánh độ tương đồng về mặt ngữ nghĩa. Thứ ba là Semantic Search cho phép tìm kiếm email dựa trên ý nghĩa nội dung thay vì chỉ khớp từ khóa đơn thuần.

### 1.2. Tại Sao Cần Tính Năng AI?

Trong bối cảnh email ngày càng trở nên quan trọng trong công việc, người dùng gặp phải nhiều thách thức:

**Thách thức về khối lượng email:**
Người dùng nhận hàng chục đến hàng trăm email mỗi ngày. Việc đọc và hiểu tất cả email tốn rất nhiều thời gian. Cần có công cụ giúp nhanh chóng tổng hợp nội dung quan trọng.

**Thách thức về tìm kiếm:**
Tìm kiếm truyền thống dựa trên từ khóa không hiệu quả khi người dùng không nhớ chính xác từ đã dùng trong email. Người dùng có thể nhớ ý nghĩa hoặc context nhưng không nhớ từ cụ thể.

**Giải pháp AI mang lại:**
AI Summarization giúp tóm tắt email dài thành 2-3 câu dễ đọc trên Kanban card. Semantic Search hiểu được ý định tìm kiếm và tìm email liên quan về mặt ngữ nghĩa. Vector Embeddings cho phép so sánh độ tương đồng giữa các email một cách thông minh.

### 1.3. Công Nghệ Sử Dụng

**OpenAI API:**
Hệ thống sử dụng OpenAI API làm engine AI chính. Mô hình gpt-4o-mini được sử dụng cho việc tạo tóm tắt và phân tích ngữ nghĩa vì balance tốt giữa chất lượng và chi phí. Mô hình text-embedding-3-small được sử dụng cho việc tạo vector embeddings với 1536 dimensions.

**FastAPI AI Service:**
AI service được xây dựng bằng Python với FastAPI framework. Cung cấp RESTful API cho các tính năng AI. Tách biệt khỏi Java backend để dễ dàng scale và maintain.

**Vector Storage:**
Embeddings được lưu trữ trong MongoDB cùng với EmailKanbanStatus. Cho phép tìm kiếm nhanh mà không cần gọi AI API mỗi lần.

---

## 2. KIẾN TRÚC AI SERVICE

### 2.1. Tổng Quan Kiến Trúc

AI Service được thiết kế như một microservice độc lập, giao tiếp với Java Backend thông qua REST API:

**Thành phần Frontend:**
React frontend gọi API đến Java Backend. Không gọi trực tiếp AI Service để đảm bảo security. UI components như Generate Summary button trigger AI features.

**Thành phần Java Backend:**
Spring Boot backend đóng vai trò gateway. Nhận request từ frontend và forward đến AI Service. Xử lý authentication và authorization trước khi gọi AI. Lưu trữ kết quả AI (summaries, embeddings) vào database.

**Thành phần AI Service:**
FastAPI application chạy riêng biệt. Tích hợp trực tiếp với OpenAI API. Xử lý các tác vụ AI-intensive như summarization và embedding generation. Không có direct database access, chỉ xử lý và trả về kết quả.

### 2.2. Cấu Trúc AI Service

AI Service được tổ chức theo cấu trúc modular:

**Thư mục routers:**
Chứa các router định nghĩa API endpoints. File email.py định nghĩa các endpoint liên quan đến email AI features như summarize, embedding generation, và semantic search.

**Thư mục services:**
Chứa business logic cho các tính năng AI. openai_service.py wrap OpenAI SDK với error handling và logging. embedding_service.py chuyên xử lý vector embeddings. email_service.py kết hợp các service để thực hiện email-specific operations.

**Thư mục schemas:**
Định nghĩa request và response models sử dụng Pydantic. Đảm bảo type safety và validation cho API.

**Thư mục utils:**
Chứa các utility functions như prompt builders, email processing helpers, và exception handlers.

### 2.3. Configuration

AI Service sử dụng Pydantic Settings để quản lý configuration:

**OpenAI Configuration:**
openai_api_key lưu API key từ OpenAI, hỗ trợ cả biến môi trường OPENAI_API_KEY và OPEN_AI_KEY. openai_model mặc định là gpt-4o-mini, có thể thay đổi theo nhu cầu. openai_max_tokens giới hạn độ dài response, mặc định 1000 tokens. openai_temperature kiểm soát độ sáng tạo của model, mặc định 0.7.

**Server Configuration:**
host và port xác định địa chỉ listen của service. debug mode enable hot reload và verbose logging. Settings được load từ file .env.

### 2.4. API Endpoints

AI Service cung cấp các endpoints sau:

**POST /api/v1/email/summarize:**
Tạo tóm tắt cho một email. Request chứa subject, from_email, body. Response trả về summary text.

**POST /api/v1/email/summarize/batch:**
Tạo tóm tắt cho nhiều email cùng lúc. Xử lý concurrent để tối ưu performance.

**POST /api/v1/email/embedding/generate:**
Tạo vector embedding cho một email. Response trả về array of floats.

**POST /api/v1/email/embedding/generate/batch:**
Tạo embeddings cho nhiều email. Sử dụng OpenAI batch API để tối ưu.

**POST /api/v1/email/search/embedding:**
Thực hiện semantic search với embeddings. Nhận query và list emails, trả về ranked results.

**GET /api/v1/email/embedding/status:**
Kiểm tra embedding service có available không. Dùng để graceful degradation khi AI không available.

---

## 3. EMAIL SUMMARIZATION - TÓM TẮT EMAIL

### 3.1. Mục Đích và Use Cases

Email Summarization tạo tóm tắt ngắn gọn cho email để hiển thị trên Kanban cards:

**Mục đích chính:**
Giúp người dùng nhanh chóng understand nội dung email mà không cần mở và đọc toàn bộ. Đặc biệt hữu ích cho email dài hoặc thread phức tạp.

**Use cases:**
Khi browse Kanban board, user có thể đọc summary thay vì preview ngắn. Giúp prioritize emails nào cần xử lý trước. Provide context khi email đã lâu và user quên nội dung.

### 3.2. Quy Trình Tạo Summary

**Bước 1 - User trigger:**
User click Generate Summary từ menu của Kanban card. Frontend gọi mutation với emailId.

**Bước 2 - Backend xử lý:**
Java Backend nhận request và fetch email từ Gmail nếu chưa có. Gọi AISummarizationService.generateSummary() với subject, from, và body.

**Bước 3 - Gọi AI Service:**
Backend POST request đến AI Service endpoint /api/v1/email/summarize. Request chứa email content đã được clean và truncate.

**Bước 4 - AI processing:**
AI Service build prompt với email content. Gọi OpenAI chat completion API. Parse response và extract summary text.

**Bước 5 - Store và return:**
Backend lưu summary vào EmailKanbanStatus.summary và summaryGeneratedAt. Return response cho frontend. UI update để hiển thị summary.

### 3.3. Prompt Engineering

System prompt được thiết kế để tạo summary phù hợp cho Kanban:

**System prompt content:**
Prompt định nghĩa role là email assistant specialized in creating concise summaries for Kanban boards. Yêu cầu summary 2-3 sentences maximum, action-oriented highlighting what needs to be done, focus on main purpose and key information, professional and scannable, và suitable for display on Kanban cards.

**User prompt structure:**
Prompt bao gồm Email Subject, From address, và Email Content. Sau đó là instruction yêu cầu generate concise summary với focus on main action or purpose, key information needed for decision-making, và any deadlines or urgency indicators.

**Temperature setting:**
Temperature được set 0.3 (thấp hơn default) để đảm bảo output consistent và factual. Không cần creativity cao cho summarization task.

### 3.4. Email Body Processing

Trước khi gửi đến AI, email body được xử lý:

**Clean HTML:**
Remove HTML tags bằng regex. Convert HTML entities thành plain text. Normalize whitespace.

**Truncation:**
Body được giới hạn ở 10000 characters để tránh exceed token limits. Append "..." nếu bị truncate.

**Handle edge cases:**
Empty body được handle gracefully. Missing subject hoặc from được thay thế bằng placeholder.

### 3.5. Summary Display

Summary được hiển thị trên Kanban card:

**UI location:**
Summary hiển thị trong card content area, có thể thay thế hoặc bổ sung cho preview.

**Visual distinction:**
Summary có thể có styling khác như italic hoặc different color. Có thể có label "AI Summary" để distinguish từ original content.

**Generation state:**
Trong khi generating, button disabled và show loading. isGeneratingSummary prop track state per email.

---

## 4. TEXT EMBEDDINGS - VECTOR NHÚNG VĂN BẢN

### 4.1. Khái Niệm Embeddings

Text Embeddings là cách biểu diễn text dưới dạng vector số trong không gian nhiều chiều. Mỗi text được chuyển thành một array of floating point numbers, trong đó các text có ý nghĩa tương tự sẽ có vectors gần nhau trong không gian này.

**Tại sao cần embeddings:**
Máy tính không hiểu ngôn ngữ tự nhiên trực tiếp. Embeddings chuyển text thành dạng số mà máy tính có thể so sánh. Cho phép tìm kiếm semantic thay vì chỉ keyword matching.

**Ví dụ:**
"Meeting tomorrow at 3pm" và "Let's discuss tomorrow afternoon" có thể có embeddings gần nhau vì ý nghĩa tương tự. Dù không có từ chung, semantic similarity vẫn cao.

### 4.2. OpenAI Embedding Model

Hệ thống sử dụng text-embedding-3-small model:

**Model specifications:**
Model name là text-embedding-3-small. Dimensions là 1536 floating point numbers per embedding. Max input length là 8191 tokens.

**Tại sao chọn model này:**
Balance tốt giữa quality và cost. Dimensions đủ để capture semantic nuances. Performance tốt cho email-length texts.

### 4.3. Embedding Generation

**EmbeddingService trong AI Service:**
Service wrap OpenAI embeddings.create() API. Lazy initialize client để handle missing API key gracefully. Provide both single và batch generation methods.

**generate_embedding method:**
Nhận text string, clean và truncate nếu cần (max 8000 chars). Gọi OpenAI API với model và dimensions. Return list of floats.

**generate_embeddings_batch method:**
Nhận list of texts. Clean tất cả texts. Gọi OpenAI API một lần với batch input. Return list of embeddings in same order.

**build_email_text method:**
Combine subject và body thành single text cho embedding. Format: "Subject: {subject}\n\nContent: {cleaned_body}". Đảm bảo embedding capture cả subject và content.

### 4.4. Cosine Similarity

Để so sánh embeddings, sử dụng cosine similarity:

**Công thức:**
similarity = (A · B) / (||A|| × ||B||)

Trong đó A · B là dot product của hai vectors, ||A|| và ||B|| là norms (độ dài) của vectors.

**Implementation:**
Static method cosine_similarity trong EmbeddingService. Tính dot product bằng sum of element-wise products. Tính norms bằng square root of sum of squares. Return similarity score từ 0 đến 1.

**Interpretation:**
Score 1.0 nghĩa là identical. Score gần 1 nghĩa là very similar. Score gần 0 nghĩa là unrelated. Score < 0.3 thường filter out.

### 4.5. Embedding Storage

Embeddings được lưu trong MongoDB:

**Field trong EmailKanbanStatus:**
Trường embedding là List<Double> lưu vector. Trường embeddingGeneratedAt lưu timestamp.

**Storage considerations:**
Mỗi embedding chiếm khoảng 12KB (1536 doubles × 8 bytes). Cần index strategy phù hợp nếu có nhiều emails. Có thể consider specialized vector database cho scale lớn.

**Lazy generation:**
Embeddings không được generate upfront cho tất cả emails. Chỉ generate khi cần cho semantic search. Option generateMissingEmbeddings trong search request.

---

## 5. SEMANTIC SEARCH - TÌM KIẾM NGỮ NGHĨA

### 5.1. So Sánh với Keyword Search

**Keyword Search truyền thống:**
Tìm exact match hoặc partial match của từ khóa. "meeting tomorrow" chỉ tìm được emails chứa đúng các từ đó. Không hiểu synonyms hoặc related concepts.

**Semantic Search:**
Hiểu ý nghĩa của query. "meeting tomorrow" có thể match "discussion scheduled for the next day". Tìm được emails related về concept dù không có từ khóa chung.

### 5.2. Quy Trình Semantic Search

**Bước 1 - User nhập query:**
User nhập search query trong search bar. Query có thể là natural language như "emails about project deadline".

**Bước 2 - Frontend gửi request:**
Request được gửi đến backend với query string và options. Options có thể include limit, minScore, generateMissingEmbeddings.

**Bước 3 - Backend processing:**
SemanticSearchService nhận request. Fetch tất cả emails của user từ database. Separate emails có và không có embeddings.

**Bước 4 - Generate missing embeddings (optional):**
Nếu generateMissingEmbeddings = true, gọi AI Service để generate embeddings cho emails chưa có. Save embeddings vào database cho future use.

**Bước 5 - Gọi AI Service search:**
Build request với query và all emails (với embeddings nếu có). POST đến /api/v1/email/search/embedding endpoint.

**Bước 6 - AI search processing:**
AI Service generate embedding cho query. So sánh query embedding với tất cả email embeddings. Rank by cosine similarity. Return top results above minScore.

**Bước 7 - Return results:**
Backend nhận results và enrich với additional data. Return SemanticSearchResponse cho frontend.

### 5.3. AI Service Search Implementation

**EmbeddingSearchRequest:**
Request chứa query string, list of emails với optional pre-computed embeddings, top_k limit, và min_score threshold.

**Search logic:**
Generate query embedding. Nếu email có pre-computed embedding, sử dụng trực tiếp. Nếu không, generate embedding cho email content. Tính cosine similarity giữa query và mỗi email. Sort by similarity descending. Filter by minScore và limit by top_k.

**Response format:**
Return list of results với email_id, score (similarity), và matched_fields hoặc reason.

### 5.4. Hybrid Approach với LLM

Ngoài embedding-based search, hệ thống còn hỗ trợ LLM-based semantic search:

**SemanticSearchRequest (LLM-based):**
Gửi query và email contents đến LLM. LLM phân tích và trả về relevant emails với explanations.

**LLM prompt:**
System prompt define role as email search assistant. User prompt chứa query và all emails context. Request JSON response với email_id, relevance_score, và reason.

**Trade-offs:**
LLM-based chính xác hơn nhưng expensive và slow hơn. Embedding-based nhanh và cheap hơn. Có thể combine: embedding for quick filter, LLM for re-ranking top results.

### 5.5. Search Results Display

**Frontend rendering:**
Results hiển thị dưới dạng list với relevance score. Score có thể show as percentage hoặc visual indicator. Highlight matched fields hoặc show reason.

**Sorting:**
Default sort by relevance score descending. User có thể toggle sang date sort.

**Filter integration:**
Semantic search results có thể combine với regular filters. Ví dụ: semantic search "project deadline" + filter unread only.

---

## 6. TÍCH HỢP VỚI HỆ THỐNG

### 6.1. Java Backend Integration

**AISummarizationService:**
Java service wrap gọi đến AI Service. Sử dụng RestTemplate cho HTTP calls. Handle response parsing và error cases.

**SemanticSearchService:**
Orchestrate semantic search flow. Fetch emails từ database. Gọi AI Service và process results. Store generated embeddings.

**Configuration:**
app.ai-service.base-url config AI Service URL. app.ai-service.timeout-seconds config timeout. Load từ application.properties hoặc environment variables.

### 6.2. Frontend Integration

**Generate Summary button:**
Trong Kanban card menu. Trigger useGenerateSummaryMutation. Disable và show loading during generation.

**Search integration:**
Search bar với option cho semantic search. Toggle between keyword và semantic mode. Show relevance scores in results.

**Loading states:**
generatingSummaryIds track which emails are generating. Disable button và show spinner. Toast notification on success hoặc error.

### 6.3. Error Handling

**AI Service unavailable:**
Check availability trước khi gọi. Graceful degradation khi AI offline. Show user-friendly message.

**Rate limits:**
OpenAI có rate limits. Implement retry with exponential backoff. Queue requests nếu cần.

**Invalid responses:**
Parse errors handled gracefully. Fallback values nếu summary generation fails. Log errors cho debugging.

### 6.4. Performance Considerations

**Caching:**
Summaries stored permanently sau khi generate. Embeddings cached trong database. Không cần regenerate cho same email.

**Batch processing:**
Batch endpoints cho bulk operations. Concurrent processing với semaphore limiting. Reduce API calls và cost.

**Cost optimization:**
Use gpt-4o-mini thay vì gpt-4 cho summarization. Use text-embedding-3-small cho embeddings. Truncate long emails trước khi process.

### 6.5. Security

**API Key protection:**
OpenAI API key chỉ trong AI Service, không expose ra frontend. Environment variable loading. Không log API key.

**Input validation:**
Validate request parameters. Sanitize user input. Limit request size.

**Authentication:**
AI Service internal, không public exposed. Backend authenticate requests trước khi forward. Rate limiting per user.

---

## KẾT LUẬN

Tính năng AI trong ứng dụng Email Client mang lại giá trị đáng kể cho người dùng thông qua việc tự động tóm tắt email và tìm kiếm thông minh. Các điểm nổi bật bao gồm:

**Về mặt chức năng:**

- Email Summarization tạo tóm tắt 2-3 câu cho Kanban cards
- Text Embeddings cho phép so sánh semantic similarity
- Semantic Search tìm email theo ý nghĩa thay vì từ khóa

**Về mặt kỹ thuật:**

- Microservice architecture với AI Service riêng biệt
- OpenAI GPT-4o-mini và text-embedding-3-small integration
- Caching embeddings trong MongoDB để optimize performance

**Về mặt trải nghiệm:**

- One-click summary generation
- Natural language search queries
- Relevance scores cho search results

---

_Tài liệu này là một phần của bộ tài liệu phân tích chức năng đồ án cuối kỳ._
