# 06. PHÂN TÍCH TÍNH NĂNG TÌM KIẾM (SEARCH FEATURES)

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

1. [Tổng Quan Hệ Thống Tìm Kiếm](#1-tổng-quan-hệ-thống-tìm-kiếm)
2. [Kiến Trúc Search System](#2-kiến-trúc-search-system)
3. [Fuzzy Search - Tìm Kiếm Mờ](#3-fuzzy-search---tìm-kiếm-mờ)
4. [Semantic Search - Tìm Kiếm Ngữ Nghĩa](#4-semantic-search---tìm-kiếm-ngữ-nghĩa)
5. [Auto-Suggestion System](#5-auto-suggestion-system)
6. [Search UI Components](#6-search-ui-components)
7. [Search Results View](#7-search-results-view)
8. [Luồng Xử Lý Tìm Kiếm](#8-luồng-xử-lý-tìm-kiếm)
9. [Tích Hợp Backend-Frontend](#9-tích-hợp-backend-frontend)
10. [Optimization và Performance](#10-optimization-và-performance)
11. [Edge Cases và Error Handling](#11-edge-cases-và-error-handling)
12. [So Sánh Fuzzy vs Semantic Search](#12-so-sánh-fuzzy-vs-semantic-search)

---

## 1. TỔNG QUAN HỆ THỐNG TÌM KIẾM

### 1.1 Giới Thiệu

Hệ thống tìm kiếm trong ứng dụng Email Client được thiết kế với hai chế độ tìm kiếm song song, mỗi chế độ phục vụ mục đích khác nhau và bổ trợ lẫn nhau để mang lại trải nghiệm tìm kiếm tối ưu cho người dùng.

Điểm đặc biệt của hệ thống là sự kết hợp giữa **Fuzzy Search** (tìm kiếm dựa trên văn bản với khả năng chịu lỗi chính tả) và **Semantic Search** (tìm kiếm dựa trên ngữ nghĩa sử dụng AI). Sự kết hợp này cho phép người dùng tìm kiếm email một cách linh hoạt, từ việc tìm chính xác theo từ khóa đến việc tìm các email có nội dung liên quan về mặt ý nghĩa.

### 1.2 Các Thành Phần Chính

Hệ thống tìm kiếm bao gồm các thành phần sau:

**Frontend Components:**

- **SearchBar**: Component thanh tìm kiếm với auto-complete
- **SearchResultsView**: Component hiển thị kết quả tìm kiếm
- **SearchResultCard**: Component thẻ hiển thị từng kết quả
- **Custom Hooks**: Các hook quản lý logic tìm kiếm

**Backend Services:**

- **FuzzySearchService**: Service xử lý tìm kiếm mờ
- **SemanticSearchService**: Service xử lý tìm kiếm ngữ nghĩa
- **SearchSuggestionService**: Service cung cấp gợi ý tìm kiếm
- **SearchController**: Controller điều phối các endpoint tìm kiếm

**AI Service:**

- **Embedding Search Endpoint**: API tạo và tìm kiếm embedding vectors
- **Cosine Similarity Calculator**: Tính toán độ tương đồng ngữ nghĩa

### 1.3 Mục Tiêu Thiết Kế

Hệ thống tìm kiếm được thiết kế với các mục tiêu sau:

**Độ Chính Xác Cao:**

- Fuzzy Search với ngưỡng điểm tối thiểu (MIN_SCORE_THRESHOLD = 0.5) để tránh kết quả sai
- Semantic Search với độ tương đồng tối thiểu (minScore = 0.2) để cân bằng giữa recall và precision

**Trải Nghiệm Người Dùng Tốt:**

- Auto-suggestion khi người dùng gõ (từ 2 ký tự)
- Debounce 300ms để tránh gọi API quá nhiều
- Keyboard navigation (Arrow Up/Down, Enter, Escape)
- Hiển thị trạng thái loading và error rõ ràng

**Hiệu Năng Cao:**

- Caching với React Query (staleTime 30s cho fuzzy, 5 phút cho semantic status)
- Giới hạn kết quả tối đa (MAX_LIMIT = 100)
- Pre-computed embeddings để tăng tốc semantic search

---

## 2. KIẾN TRÚC SEARCH SYSTEM

### 2.1 Kiến Trúc Tổng Thể

Hệ thống tìm kiếm được xây dựng theo kiến trúc multi-layer với sự phân tách rõ ràng giữa presentation layer, business logic layer và data access layer.

**Presentation Layer (Frontend):**
Tầng này chịu trách nhiệm hiển thị giao diện tìm kiếm và xử lý tương tác người dùng. Các component React được tổ chức theo nguyên tắc Single Responsibility, mỗi component chỉ đảm nhận một nhiệm vụ cụ thể.

**Business Logic Layer (Backend Services):**
Tầng này chứa toàn bộ logic nghiệp vụ của hệ thống tìm kiếm, bao gồm thuật toán scoring, filtering và ranking kết quả. Mỗi loại tìm kiếm được đóng gói trong một service riêng biệt.

**Data Access Layer (Repositories):**
Tầng này truy xuất dữ liệu từ MongoDB, cung cấp các phương thức tìm kiếm và truy vấn email.

**External Integration Layer (AI Service):**
Tầng này tích hợp với AI Service (FastAPI) để xử lý các tác vụ liên quan đến machine learning như tạo embedding và tính toán similarity.

### 2.2 Mô Hình Dữ Liệu

**SearchMode Enum:**
Hệ thống định nghĩa ba chế độ tìm kiếm:

- `fuzzy`: Chỉ sử dụng Fuzzy Search
- `semantic`: Chỉ sử dụng Semantic Search
- `both`: Kết hợp cả hai (chưa implement đầy đủ)

**FuzzySearchRequest:**
Đối tượng request cho Fuzzy Search bao gồm:

- `query`: Chuỗi tìm kiếm của người dùng
- `limit`: Số lượng kết quả tối đa (mặc định 20, tối đa 100)
- `includeBody`: Có tìm trong nội dung email hay không

**SemanticSearchRequest:**
Đối tượng request cho Semantic Search bao gồm:

- `query`: Chuỗi tìm kiếm
- `limit`: Số lượng kết quả tối đa
- `minScore`: Điểm similarity tối thiểu (mặc định 0.2)
- `generateMissingEmbeddings`: Có tự động tạo embedding cho email chưa có hay không

### 2.3 Luồng Dữ Liệu

Luồng dữ liệu trong hệ thống tìm kiếm diễn ra như sau:

**Bước 1 - User Input:**
Người dùng nhập từ khóa vào SearchBar. Input được debounce 300ms để tránh spam API.

**Bước 2 - Mode Selection:**
Hệ thống xác định chế độ tìm kiếm (fuzzy hoặc semantic) dựa trên lựa chọn của người dùng.

**Bước 3 - API Call:**
Frontend gọi API tương ứng thông qua các custom hooks (useKanbanSearchQuery hoặc useSemanticSearchMutation).

**Bước 4 - Backend Processing:**
Backend service nhận request, thực hiện logic tìm kiếm và trả về kết quả được sắp xếp theo điểm relevance.

**Bước 5 - Result Rendering:**
Frontend nhận kết quả và render thông qua SearchResultsView với các SearchResultCard.

---

## 3. FUZZY SEARCH - TÌM KIẾM MỜ

### 3.1 Nguyên Lý Hoạt Động

Fuzzy Search là phương pháp tìm kiếm cho phép tìm các chuỗi văn bản gần giống với từ khóa tìm kiếm, ngay cả khi có lỗi chính tả hoặc khác biệt nhỏ. Đây là tính năng quan trọng vì người dùng thường mắc lỗi gõ phím hoặc không nhớ chính xác từ khóa.

Hệ thống Fuzzy Search trong ứng dụng sử dụng kết hợp nhiều kỹ thuật để đạt được độ chính xác cao nhất có thể:

**Exact Match (Khớp Chính Xác):**
Khi văn bản chứa chính xác từ khóa tìm kiếm, điểm cao nhất được gán (1.0 cho khớp hoàn toàn, 0.9 cho contains).

**Prefix Match (Khớp Tiền Tố):**
Kiểm tra xem từ khóa có là tiền tố của các từ trong văn bản hay không. Yêu cầu tối thiểu 3 ký tự để tránh false positive.

**Levenshtein Distance (Khoảng Cách Levenshtein):**
Thuật toán đo lường số lượng thao tác chỉnh sửa (thêm, xóa, thay thế) cần thiết để biến đổi một chuỗi thành chuỗi khác. Điều này cho phép chịu lỗi chính tả.

**N-gram Similarity (Độ Tương Đồng N-gram):**
Chia văn bản thành các chuỗi con liên tiếp có độ dài n (sử dụng 3-gram) và so sánh độ trùng lặp giữa tập n-gram của query và văn bản.

### 3.2 Thuật Toán Scoring

Hệ thống scoring được thiết kế với các ngưỡng và trọng số cụ thể:

**Các Ngưỡng Quan Trọng:**

- MIN_SCORE_THRESHOLD = 0.5: Điểm tối thiểu để một kết quả được coi là khớp
- MIN_NGRAM_OVERLAP = 0.6: Độ trùng lặp n-gram tối thiểu
- MAX_LEVENSHTEIN_DISTANCE = 2: Số lỗi chính tả tối đa cho phép

**Trọng Số Theo Trường:**

- Subject (Tiêu đề): Hệ số 1.5 - ưu tiên cao nhất
- FromName (Tên người gửi): Hệ số 1.3
- FromEmail (Email người gửi): Hệ số 1.2
- Preview (Nội dung xem trước): Hệ số 0.8
- Summary (Tóm tắt AI): Hệ số 0.9

Việc thiết kế trọng số như vậy phản ánh tầm quan trọng của từng trường - tiêu đề email thường chứa thông tin quan trọng nhất và người dùng thường tìm kiếm theo tiêu đề hoặc người gửi.

### 3.3 Xử Lý Levenshtein Distance

Thuật toán Levenshtein được triển khai sử dụng dynamic programming với độ phức tạp O(m\*n) trong đó m và n là độ dài của hai chuỗi so sánh.

**Logic Cho Phép Lỗi Chính Tả:**

- Với từ khóa ngắn (≤5 ký tự): Cho phép tối đa 1 lỗi
- Với từ khóa dài (>5 ký tự): Cho phép tối đa 2 lỗi

Điều này có nghĩa là nếu người dùng tìm "email" nhưng gõ thành "emial", hệ thống vẫn tìm được kết quả vì khoảng cách Levenshtein chỉ là 1 (hoán đổi vị trí 'i' và 'a').

### 3.4 Xử Lý N-gram

N-gram là kỹ thuật chia văn bản thành các chuỗi con liên tiếp. Với 3-gram (trigram), chuỗi "hello" được chia thành: "hel", "ell", "llo".

**Tính Toán Similarity:**
Độ tương đồng được tính bằng công thức: |intersection| / |query_ngrams|

Trong đó intersection là tập các n-gram xuất hiện trong cả query và văn bản. Kết quả chỉ được chấp nhận nếu đạt ngưỡng MIN_NGRAM_OVERLAP (0.6), và điểm cuối cùng được nhân với 0.7 để giảm trọng số so với exact match.

### 3.5 Word-Level Matching

Đối với các truy vấn nhiều từ, hệ thống thực hiện matching ở cấp độ từ:

**Quy Trình:**

1. Tách query và văn bản thành các từ riêng biệt
2. Bỏ qua các từ quá ngắn (<3 ký tự)
3. Kiểm tra từng từ trong query có khớp với từ trong văn bản hay không
4. Chấp nhận khớp nếu: exact match, contains (với điều kiện), hoặc Levenshtein distance nhỏ

**Điểm Số:**
Điểm = (số từ khớp) / (tổng số từ trong query)

---

## 4. SEMANTIC SEARCH - TÌM KIẾM NGỮ NGHĨA

### 4.1 Nguyên Lý Hoạt Động

Semantic Search là phương pháp tìm kiếm dựa trên ý nghĩa của văn bản thay vì chỉ so khớp từ khóa. Điều này cho phép tìm các email có nội dung liên quan về mặt ngữ nghĩa, ngay cả khi không chứa từ khóa tìm kiếm.

Ví dụ, khi tìm kiếm "money", hệ thống có thể trả về các email về "invoice", "salary", "payment", "billing" vì các khái niệm này có liên quan về mặt ngữ nghĩa.

**Quy Trình Hoạt Động:**

1. Query của người dùng được chuyển đổi thành embedding vector
2. Các email đã có embedding vector được so sánh với query embedding
3. Độ tương đồng được tính bằng Cosine Similarity
4. Kết quả được sắp xếp theo điểm similarity giảm dần

### 4.2 Embedding Vectors

Embedding là biểu diễn số học của văn bản trong không gian vector nhiều chiều. Hệ thống sử dụng model text-embedding-3-small của OpenAI với 1536 dimensions.

**Cách Tạo Embedding:**
Mỗi email được kết hợp từ subject và body (hoặc preview) thành một chuỗi văn bản, sau đó gửi đến OpenAI API để nhận về một vector 1536 chiều.

**Lưu Trữ Embedding:**
Embedding vectors được lưu trữ trong MongoDB cùng với document EmailKanbanStatus để tránh phải tính toán lại mỗi lần tìm kiếm.

### 4.3 Tích Hợp AI Service

Semantic Search tích hợp với AI Service (FastAPI) thông qua REST API:

**Endpoints Sử Dụng:**

- `/api/v1/email/search/embedding`: Thực hiện tìm kiếm embedding
- `/api/v1/email/embedding/status`: Kiểm tra trạng thái AI service
- `/api/v1/email/embedding/generate/batch`: Tạo embedding hàng loạt

**Request Format:**
Backend gửi đến AI Service một request chứa:

- `query`: Chuỗi tìm kiếm
- `emails`: Danh sách email (bao gồm embedding nếu có)
- `top_k`: Số lượng kết quả mong muốn
- `min_score`: Điểm similarity tối thiểu

**Response Format:**
AI Service trả về danh sách các email match, mỗi email bao gồm:

- `email_id`: ID của email
- `similarity_score`: Điểm tương đồng (0.0 - 1.0)
- Các metadata khác của email

### 4.4 Generate Missing Embeddings

Một tính năng quan trọng là khả năng tự động tạo embedding cho các email chưa có trong quá trình tìm kiếm.

**Khi Được Kích Hoạt:**
Parameter `generateMissingEmbeddings` trong SemanticSearchRequest cho phép:

- Tự động phát hiện email chưa có embedding
- Gọi AI Service để tạo embedding
- Lưu embedding vào database
- Tiếp tục tìm kiếm với tập embedding đầy đủ

**Điều Này Quan Trọng Vì:**

- Email mới sync từ Gmail chưa có embedding
- Người dùng mới sử dụng semantic search lần đầu
- Đảm bảo coverage của tìm kiếm

Trong code frontend, `generateMissing` được set mặc định là `true` để đảm bảo trải nghiệm tìm kiếm tốt nhất.

### 4.5 Availability Check

Trước khi thực hiện Semantic Search, hệ thống luôn kiểm tra xem AI Service có khả dụng hay không.

**Quy Trình Kiểm Tra:**

1. Gọi endpoint `/api/v1/email/embedding/status`
2. Kiểm tra response có `available: true`
3. Nếu không khả dụng, fallback về Fuzzy Search hoặc hiển thị thông báo lỗi

**Cache Status:**
Trạng thái availability được cache 5 phút (staleTime) để giảm số lần gọi API kiểm tra.

---

## 5. AUTO-SUGGESTION SYSTEM

### 5.1 Tổng Quan

Auto-Suggestion (hay Autocomplete) là tính năng gợi ý khi người dùng đang gõ từ khóa tìm kiếm. Tính năng này giúp người dùng tìm kiếm nhanh hơn và chính xác hơn bằng cách đề xuất các từ khóa, liên hệ và tìm kiếm gần đây.

**Ba Loại Gợi Ý:**

1. **Contact Suggestions**: Gợi ý người gửi email dựa trên tên hoặc địa chỉ email
2. **Keyword Suggestions**: Gợi ý từ khóa dựa trên tiêu đề email
3. **Recent Searches**: Gợi ý từ các tìm kiếm gần đây của người dùng

### 5.2 Contact Suggestions

Hệ thống gợi ý liên hệ dựa trên lịch sử email của người dùng.

**Thuật Toán:**

1. Duyệt qua tất cả email của user
2. Nhóm theo địa chỉ email người gửi
3. Đếm số lượng email từ mỗi người gửi
4. Filter theo query (khớp email hoặc tên)
5. Sắp xếp theo số lượng email giảm dần
6. Trả về tối đa 5 gợi ý (MAX_CONTACT_SUGGESTIONS)

**Kết Quả Trả Về:**

- `email`: Địa chỉ email người gửi
- `name`: Tên người gửi (nếu có)
- `emailCount`: Số lượng email đã nhận từ người này

**Khi Người Dùng Chọn:**
Hệ thống sẽ điền `from:{email}` vào ô tìm kiếm, đây là cú pháp đặc biệt để tìm email theo người gửi.

### 5.3 Keyword Suggestions

Hệ thống gợi ý từ khóa dựa trên tiêu đề các email.

**Thuật Toán:**

1. Trích xuất tất cả từ từ tiêu đề email
2. Loại bỏ các từ quá ngắn (<3 ký tự)
3. Loại bỏ các từ phổ biến (stop words) như "the", "and", "for", v.v.
4. Đếm tần suất xuất hiện của mỗi từ
5. Filter theo query (startsWith hoặc contains)
6. Sắp xếp theo tần suất giảm dần
7. Trả về tối đa 5 gợi ý (MAX_KEYWORD_SUGGESTIONS)

**Stop Words List:**
Hệ thống có một danh sách các từ phổ biến cần loại bỏ, bao gồm:

- Từ ngắn phổ biến: "the", "and", "for", "are", "but"...
- Từ liên quan email: "fwd", "re", "fw"
- Đại từ: "you", "she", "her", "his"...

**Kết Quả Trả Về:**

- `keyword`: Từ khóa gợi ý
- `occurrences`: Số lần xuất hiện trong tiêu đề email
- `type`: Loại từ khóa ("subject")

### 5.4 Recent Searches

Tính năng lưu trữ và gợi ý các tìm kiếm gần đây của người dùng.

**Hiện Trạng:**
Trong implementation hiện tại, field `recentSearches` được trả về như một danh sách rỗng. Đây là tính năng có thể được mở rộng trong tương lai bằng cách:

- Lưu lịch sử tìm kiếm vào database hoặc local storage
- Sắp xếp theo thời gian gần nhất
- Giới hạn số lượng lưu trữ (ví dụ: 10 tìm kiếm gần nhất)

### 5.5 Debouncing và Caching

**Debouncing:**
Để tránh gọi API quá nhiều khi người dùng đang gõ, input được debounce 300ms. Điều này có nghĩa là API chỉ được gọi sau khi người dùng ngừng gõ 300ms.

**Điều Kiện Kích Hoạt:**

- Query phải có ít nhất 2 ký tự (MIN_QUERY_LENGTH trong frontend)
- showSuggestions phải được enable

**Caching:**
React Query tự động cache kết quả suggestions, giúp hiển thị ngay lập tức khi người dùng gõ lại cùng một query.

---

## 6. SEARCH UI COMPONENTS

### 6.1 SearchBar Component

SearchBar là component chính cho phép người dùng nhập từ khóa và xem gợi ý.

**Props Quan Trọng:**

- `value`: Giá trị hiện tại của ô input
- `onChange`: Callback khi giá trị thay đổi
- `onSearch`: Callback khi người dùng submit tìm kiếm
- `onClear`: Callback khi người dùng xóa ô tìm kiếm
- `searchMode`: Chế độ tìm kiếm ('fuzzy' | 'semantic' | 'both')
- `onSearchModeChange`: Callback khi chuyển chế độ tìm kiếm
- `showSuggestions`: Có hiển thị dropdown gợi ý hay không

**Các State Nội Bộ:**

- `isFocused`: Trạng thái focus của ô input
- `selectedIndex`: Index của gợi ý đang được chọn (keyboard navigation)

**Tích Hợp Custom Hooks:**

- `useDebounce`: Debounce query 300ms
- `useSearchSuggestionsQuery`: Fetch suggestions từ API
- `useIsMobile`: Detect thiết bị mobile để responsive

### 6.2 Keyboard Navigation

SearchBar hỗ trợ điều hướng bằng bàn phím để cải thiện accessibility:

**Các Phím Hỗ Trợ:**

- **Arrow Down**: Di chuyển xuống gợi ý tiếp theo
- **Arrow Up**: Di chuyển lên gợi ý trước đó
- **Enter**: Chọn gợi ý đang được highlight hoặc thực hiện tìm kiếm
- **Escape**: Đóng dropdown gợi ý

**Scroll Into View:**
Khi di chuyển bằng keyboard, gợi ý đang được chọn sẽ tự động scroll vào view với animation smooth.

### 6.3 Suggestions Dropdown

Dropdown gợi ý được chia thành các section rõ ràng:

**Layout Structure:**

1. **Contacts Section**: Hiển thị với icon User, header "Contacts"
2. **Keywords Section**: Hiển thị với icon Hash, header "Keywords"
3. **Recent Searches Section**: Hiển thị với icon Clock, header "Recent"

**Visual Design:**

- Mỗi section có header với background màu xám nhẹ
- Badge hiển thị số lượng gợi ý trong mỗi section
- Contact suggestions có avatar với chữ cái đầu tiên
- Separator giữa các sections
- Animation fade-in và slide-in khi mở

**Responsive Design:**

- Desktop: max-height 300px
- Mobile: max-height 400px để dễ chọn trên touchscreen

### 6.4 Search Mode Toggle

Người dùng có thể chuyển đổi giữa Fuzzy Search và Semantic Search:

**UI Implementation:**

- Toggle button với icon Sparkles cho Semantic mode
- Badge hiển thị chế độ hiện tại
- Tooltip giải thích chức năng

**Behavior Khi Chuyển Mode:**

- Nếu đang có query, tự động thực hiện lại tìm kiếm với mode mới
- Fallback về Fuzzy nếu Semantic không available

---

## 7. SEARCH RESULTS VIEW

### 7.1 Component Structure

SearchResultsView là component container hiển thị toàn bộ kết quả tìm kiếm.

**Props:**

- `onBack`: Callback khi người dùng nhấn nút quay lại
- `onViewEmail`: Callback khi chọn xem chi tiết email
- `onStar`: Callback khi toggle star email
- `className`: CSS class bổ sung

**Các State Nội Bộ:**

- `searchQuery`: Query đang được gõ
- `activeQuery`: Query đã được submit
- `includeBody`: Có tìm trong body email hay không
- `searchMode`: Chế độ tìm kiếm hiện tại

### 7.2 Data Flow

**Fuzzy Search Flow:**

1. User submit query
2. useKanbanSearchQuery được trigger với activeQuery
3. Hook gọi KanbanService.searchKanban()
4. Kết quả được cache và hiển thị

**Semantic Search Flow:**

1. User submit query
2. semanticSearchMutation.mutate() được gọi
3. Request được gửi đến backend
4. Backend gọi AI Service
5. Kết quả được normalize và hiển thị

### 7.3 Result Normalization

Vì Fuzzy Search và Semantic Search trả về format khác nhau, kết quả cần được normalize về cùng một format.

**Semantic to IKanbanEmail Mapping:**
Kết quả semantic search được chuyển đổi:

- `id`: Prefix "semantic\_" + emailId (để phân biệt)
- `emailId`: Giữ nguyên
- `score`: Từ similarityScore
- `matchedFields`: Set cố định là ['semantic']

### 7.4 Loading States

Component hiển thị các trạng thái loading khác nhau:

**Loading Indicator:**

- Spinner với text "Searching..."
- Disabled các interaction trong lúc loading

**Empty State:**
Khi không có kết quả:

- Icon SearchX
- Message "No results found"
- Gợi ý thử từ khóa khác

**Error State:**
Khi có lỗi xảy ra:

- Hiển thị error message
- Nút retry (nếu applicable)

### 7.5 Star Integration

Component tích hợp chức năng star email trực tiếp từ kết quả tìm kiếm:

**Implementation:**

- Sử dụng useToggleEmailStarMutation hook
- Optimistic update UI trước khi API hoàn thành
- Rollback nếu API fail

---

## 8. LUỒNG XỬ LÝ TÌM KIẾM

### 8.1 User Journey

**Bước 1 - Mở Search:**
Người dùng click vào icon search hoặc shortcut, SearchResultsView được hiển thị với SearchBar focused.

**Bước 2 - Gõ Query:**
Khi người dùng bắt đầu gõ:

- Input được debounce 300ms
- Sau 2 ký tự, auto-suggestions được fetch
- Dropdown gợi ý hiển thị

**Bước 3 - Chọn Gợi Ý hoặc Submit:**
Người dùng có thể:

- Click vào gợi ý để auto-fill
- Dùng Arrow keys để navigate và Enter để chọn
- Gõ xong và nhấn Enter để submit

**Bước 4 - Thực Hiện Tìm Kiếm:**
Tùy theo searchMode:

- Fuzzy: useKanbanSearchQuery hook được enable
- Semantic: semanticSearchMutation được trigger

**Bước 5 - Hiển Thị Kết Quả:**

- Loading state hiển thị
- Kết quả được render thành danh sách SearchResultCard
- Mỗi card hiển thị subject, sender, preview, similarity score (nếu semantic)

**Bước 6 - Tương Tác Với Kết Quả:**
Người dùng có thể:

- Click vào email để xem chi tiết
- Click star icon để toggle star
- Click back để quay lại Kanban board

### 8.2 Backend Processing Flow

**FuzzySearchService Flow:**

1. Validate và normalize query
2. Fetch tất cả email của user từ database
3. Với mỗi email, tính score dựa trên các trường (subject, sender, body)
4. Filter các email có score >= MIN_SCORE_THRESHOLD
5. Sort theo score giảm dần
6. Limit kết quả theo request
7. Map sang response format

**SemanticSearchService Flow:**

1. Validate query và parameters
2. Fetch tất cả email của user
3. Phân loại email có/không có embedding
4. Nếu generateMissingEmbeddings = true, gọi AI Service để tạo embedding
5. Gửi request đến AI Service với query và danh sách email
6. AI Service tính similarity và trả về top-k kết quả
7. Map sang response format với processing time

### 8.3 Error Handling Flow

**Semantic Search Not Available:**

1. Check status trả về not available
2. Hiển thị toast error
3. Tự động switch về Fuzzy mode
4. Re-trigger tìm kiếm với Fuzzy

**API Error:**

1. Catch exception từ API call
2. Log error
3. Hiển thị toast với error message
4. Return empty results hoặc cached results

**Gmail Not Connected:**

1. Detect từ error message
2. Hiển thị toast "Please connect your Gmail account first"
3. Có thể redirect đến settings

---

## 9. TÍCH HỢP BACKEND-FRONTEND

### 9.1 API Endpoints

**Fuzzy Search Endpoint:**

```
POST /api/kanban/search
```

Request body:

- query: string
- limit: number (optional, default 20)
- includeBody: boolean (optional, default false)

Response:

- query: string
- totalResults: number
- results: array of SearchResultItem

**Semantic Search Endpoint:**

```
POST /api/search/semantic
```

Request body:

- query: string (required)
- limit: number (optional, default 20)
- minScore: number (optional, default 0.2)
- generateMissingEmbeddings: boolean (optional)

Response:

- query: string
- totalResults: number
- results: array of SemanticSearchResultItem
- emailsWithEmbeddings: number
- emailsWithoutEmbeddings: number
- processingTimeMs: number

**Semantic Search Status:**

```
GET /api/search/semantic/status
```

Response:

- available: boolean
- message: string

**Suggestions Endpoint:**

```
GET /api/search/suggestions?query={query}
```

Response:

- query: string
- contacts: array of ContactSuggestion
- keywords: array of KeywordSuggestion
- recentSearches: array of string

**All Contacts Endpoint:**

```
GET /api/search/contacts
```

Response:

- array of ContactSuggestion

### 9.2 Service Layer Integration

**Frontend Services:**
SearchService class đóng gói tất cả API calls:

- `semanticSearch(request)`: POST /api/search/semantic
- `getSemanticSearchStatus()`: GET /api/search/semantic/status
- `generateEmbeddings()`: POST /api/search/semantic/generate-embeddings
- `generateSingleEmbedding(emailId)`: POST /api/search/semantic/generate-embedding/{emailId}
- `getSuggestions(query, limit)`: GET /api/search/suggestions
- `getAllContacts()`: GET /api/search/contacts

**Backend Services:**

- `FuzzySearchService.search()`: Xử lý fuzzy search logic
- `SemanticSearchService.search()`: Xử lý semantic search logic
- `SemanticSearchService.isAvailable()`: Kiểm tra AI service status
- `SearchSuggestionService.getSuggestions()`: Tạo suggestions
- `SearchSuggestionService.getAllContacts()`: Lấy tất cả contacts

### 9.3 React Query Integration

**Query Keys:**

```
semanticSearchQueryKeys:
  all: ['semantic-search']
  status: ['semantic-search', 'status']
  search: ['semantic-search', 'search', query, params]

kanbanSearchQueryKeys:
  search: ['kanban', 'search', query, limit, includeBody]
```

**Cache Configuration:**

- Semantic status: staleTime 5 phút
- Kanban search: staleTime 30 giây
- Suggestions: staleTime theo mặc định React Query

---

## 10. OPTIMIZATION VÀ PERFORMANCE

### 10.1 Frontend Optimizations

**Debouncing:**
Input được debounce 300ms để giảm số lần API call không cần thiết.

**Memoization:**

- `useMemo` cho flatSuggestions để tránh re-compute
- `useMemo` cho searchResults để normalize một lần

**Caching:**
React Query tự động cache responses:

- Kết quả tìm kiếm được cache
- Suggestions được cache
- Semantic status được cache 5 phút

**Lazy Loading:**

- Suggestions chỉ fetch khi query >= 2 ký tự
- Semantic search chỉ thực hiện khi user submit

### 10.2 Backend Optimizations

**In-Memory Processing:**
Fuzzy search được thực hiện in-memory sau khi load tất cả email một lần, thay vì query database nhiều lần.

**Pre-computed Embeddings:**
Embeddings được lưu trong database, không cần tính toán lại mỗi lần search.

**Limit và Threshold:**

- MAX_LIMIT = 100 để giới hạn kết quả
- MIN_SCORE_THRESHOLD để filter sớm các kết quả không liên quan

### 10.3 Database Considerations

**Indexing:**

- Index trên userId để query email nhanh
- Index trên các trường thường xuyên filter

**Embedding Storage:**

- Embedding vectors (1536 dimensions) được lưu trực tiếp trong EmailKanbanStatus document
- Có thể cân nhắc tách ra collection riêng nếu size quá lớn

### 10.4 AI Service Optimization

**Batch Embedding Generation:**
Thay vì gọi API cho từng email, hệ thống hỗ trợ batch generation để giảm số lượng API calls.

**Caching Embeddings:**
Embeddings được persist trong database, giảm đáng kể số lần gọi OpenAI API.

---

## 11. EDGE CASES VÀ ERROR HANDLING

### 11.1 Empty Query

**Frontend:**

- Không trigger tìm kiếm nếu query trống sau khi trim
- Hiển thị placeholder text hướng dẫn

**Backend:**

- Return empty results với totalResults = 0
- Không throw exception

### 11.2 Special Characters

**Query Sanitization:**

- Query được normalize (lowercase, trim)
- Ký tự đặc biệt được xử lý trong n-gram generation

**Operator Support:**

- `from:` prefix được nhận diện khi chọn contact suggestion
- Có thể mở rộng thêm operators trong tương lai

### 11.3 AI Service Unavailable

**Detection:**

- Check status trước khi search
- Catch exceptions từ RestTemplate

**Fallback:**

- Tự động switch về Fuzzy mode
- Hiển thị thông báo cho user
- Log warning để monitoring

### 11.4 Long Queries

**Handling:**

- Query quá dài có thể được truncate
- Limit không được vượt quá MAX_LIMIT

### 11.5 Network Errors

**Frontend:**

- React Query tự động retry (mặc định 3 lần)
- Hiển thị error state với option retry

**Backend:**

- Timeout configuration cho AI Service calls
- Log errors với đầy đủ context

### 11.6 Empty Results

**UX Considerations:**

- Hiển thị empty state rõ ràng
- Gợi ý thử từ khóa khác hoặc đổi search mode
- Không để user confused về việc không có kết quả

---

## 12. SO SÁNH FUZZY VS SEMANTIC SEARCH

### 12.1 Điểm Mạnh Fuzzy Search

**Ưu Điểm:**

- Nhanh: Không cần gọi external AI service
- Chính xác cho exact matches: Tìm chính xác từ khóa
- Typo tolerance: Chịu lỗi chính tả tốt
- Không phụ thuộc: Hoạt động độc lập, không cần OpenAI key
- Cost-effective: Không tốn chi phí API calls

**Use Cases Phù Hợp:**

- Tìm email từ người gửi cụ thể
- Tìm email với từ khóa chính xác trong tiêu đề
- Khi biết chính xác từ cần tìm (có thể gõ sai)

### 12.2 Điểm Mạnh Semantic Search

**Ưu Điểm:**

- Hiểu ngữ nghĩa: Tìm email liên quan về ý nghĩa
- Không cần từ khóa chính xác: "money" tìm được "invoice", "salary"
- Tìm kiếm tự nhiên hơn: Gần với cách người dùng nghĩ
- AI-powered: Tận dụng sức mạnh của language models

**Use Cases Phù Hợp:**

- Tìm email về một chủ đề (không nhớ từ khóa cụ thể)
- Tìm email liên quan đến khái niệm
- Research và discovery use cases

### 12.3 Trade-offs

| Tiêu chí             | Fuzzy Search | Semantic Search        |
| -------------------- | ------------ | ---------------------- |
| Tốc độ               | Nhanh        | Chậm hơn (AI API call) |
| Độ chính xác từ khóa | Cao          | Thấp hơn               |
| Hiểu ngữ nghĩa       | Không        | Có                     |
| Chi phí              | Miễn phí     | OpenAI API cost        |
| Dependencies         | Không        | AI Service + OpenAI    |
| Setup complexity     | Đơn giản     | Phức tạp hơn           |

### 12.4 Recommendations

**Mặc Định:**
Hệ thống mặc định sử dụng Semantic Search (searchMode = 'semantic') vì đây là tính năng nổi bật của ứng dụng và mang lại trải nghiệm tìm kiếm tốt hơn.

**Fallback:**
Khi AI Service không available, tự động fallback về Fuzzy Search để đảm bảo người dùng luôn có thể tìm kiếm.

**User Choice:**
Cho phép người dùng chuyển đổi giữa hai mode để phù hợp với nhu cầu cụ thể.

---

## 📊 TỔNG KẾT

### Thành Tựu

Hệ thống tìm kiếm trong ứng dụng Email Client đã đạt được các mục tiêu đề ra:

1. **Dual Search Modes**: Kết hợp Fuzzy Search và Semantic Search mang lại trải nghiệm tìm kiếm toàn diện

2. **Intelligent Suggestions**: Auto-suggestion system giúp người dùng tìm kiếm nhanh và chính xác hơn

3. **Robust Error Handling**: Xử lý tốt các edge cases và có fallback mechanism

4. **Performance Optimized**: Debouncing, caching, và pre-computed embeddings đảm bảo hiệu năng tốt

5. **User-Friendly UI**: Keyboard navigation, responsive design, clear feedback

### Điểm Có Thể Cải Thiện

1. **Combined Mode**: Triển khai đầy đủ chế độ 'both' kết hợp kết quả từ cả hai search types

2. **Recent Searches**: Implement lưu trữ và gợi ý lịch sử tìm kiếm

3. **Advanced Operators**: Hỗ trợ thêm các operators như `subject:`, `before:`, `after:`

4. **Relevance Tuning**: Fine-tune các threshold và weights dựa trên user feedback

5. **Analytics**: Tracking search patterns để cải thiện suggestions

---

**Tài liệu được tạo cho mục đích học thuật và phát triển dự án.**

_© 2025 - Nhóm 22120120 - 22120157 - 22120163_
