# Hướng Dẫn Test Semantic Search (Không Generate Embeddings)

**Mục đích**: Test semantic search với emails đã có embeddings sẵn, không tự động generate embeddings mới.

---

## ✅ Kiểm Tra Frontend vs Backend

### 1. API Endpoints - ✅ ĐỦ

| Backend Endpoint                  | Frontend Implementation                   | Status |
| --------------------------------- | ----------------------------------------- | ------ |
| `GET /api/search/semantic/status` | `SearchService.getSemanticSearchStatus()` | ✅     |
| `POST /api/search/semantic`       | `SearchService.semanticSearch()`          | ✅     |
| `GET /api/search/suggestions`     | `SearchService.getSuggestions()`          | ✅     |
| `GET /api/search/contacts`        | `SearchService.getAllContacts()`          | ✅     |
| `GET /api/kanban/search`          | `KanbanService.search()`                  | ✅     |

### 2. Request/Response Types - ✅ ĐỦ

**Semantic Search Request:**

```typescript
// Backend (SEARCH_FRONTEND_INTEGRATION.md)
{
  "query": "money issues",
  "limit": 20,
  "minScore": 0.7,
  "generateMissingEmbeddings": false
}

// Frontend (search.service.ts)
export interface ISemanticSearchRequest {
  query: string;
  limit?: number;
  minScore?: number;
  generateMissingEmbeddings?: boolean; // ✅ Có
}
```

**Semantic Search Response:**

```typescript
// Backend
{
  "query": "money issues",
  "totalResults": 3,
  "results": [...],
  "emailsWithEmbeddings": 150,
  "emailsWithoutEmbeddings": 10,
  "processingTimeMs": 245
}

// Frontend (search.service.ts)
export interface ISemanticSearchResponse {
  query: string;
  totalResults: number;
  results: ISemanticSearchResult[];
  emailsWithEmbeddings: number; // ✅ Có
  emailsWithoutEmbeddings: number; // ✅ Có
  processingTimeMs: number; // ✅ Có
}
```

### 3. Hooks & Components - ✅ ĐỦ

| Feature                  | Hook/Component                   | Status |
| ------------------------ | -------------------------------- | ------ |
| Semantic Search Status   | `useSemanticSearchStatusQuery()` | ✅     |
| Semantic Search Mutation | `useSemanticSearchMutation()`    | ✅     |
| Search Suggestions       | `useSearchSuggestionsQuery()`    | ✅     |
| Search Results View      | `SearchResultsView`              | ✅     |
| Search Bar               | `SearchBar`                      | ✅     |

---

## 🧪 Hướng Dẫn Test Semantic Search (Không Generate Embeddings)

### Bước 1: Chuẩn Bị

1. **Kiểm tra OpenAI API Key đã được cấu hình:**

   ```bash
   # Backend: Kiểm tra environment variable
   echo $OPENAI_API_KEY
   ```

2. **Đảm bảo có emails đã có embeddings:**
   - Emails cần có `embedding` field trong database
   - Nếu chưa có, cần generate embeddings trước (dùng endpoint riêng)

3. **Kiểm tra Semantic Search Status:**
   - Mở DevTools → Network tab
   - Vào trang Search
   - Kiểm tra request: `GET /api/search/semantic/status`
   - Response phải có: `"available": true`

### Bước 2: Test Semantic Search (Không Generate Embeddings)

#### Option 1: Test Qua UI (Hiện tại đang tự động generate)

**Vấn đề**: Hiện tại `search-results-view.tsx` hardcode `generateMissingEmbeddings: true`

**Giải pháp tạm thời**: Sửa code để test không generate:

```typescript
// frontend/components/email/search-results-view.tsx
// Dòng 115 - Sửa từ:
generateMissingEmbeddings: true,

// Thành:
generateMissingEmbeddings: false, // Test không generate embeddings
```

#### Option 2: Test Qua API Directly (Khuyến nghị)

**Sử dụng Postman/curl/Thunder Client:**

```bash
# 1. Test Semantic Search Status
curl -X GET "http://localhost:8080/api/search/semantic/status" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Response mong đợi:
# {
#   "success": true,
#   "data": {
#     "available": true,
#     "message": "Semantic search is available"
#   }
# }
```

```bash
# 2. Test Semantic Search (KHÔNG generate embeddings)
curl -X POST "http://localhost:8080/api/search/semantic" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "money",
    "limit": 20,
    "minScore": 0.7,
    "generateMissingEmbeddings": false
  }'

# Response mong đợi:
# {
#   "success": true,
#   "data": {
#     "query": "money",
#     "totalResults": 5,
#     "results": [
#       {
#         "id": "...",
#         "emailId": "...",
#         "subject": "Invoice #1234 - Payment Due",
#         "similarityScore": 0.89,
#         ...
#       }
#     ],
#     "emailsWithEmbeddings": 150,
#     "emailsWithoutEmbeddings": 10,
#     "processingTimeMs": 245
#   }
# }
```

#### Option 3: Test Qua Browser DevTools

1. **Mở trang Search trong browser**
2. **Mở DevTools (F12) → Network tab**
3. **Chuyển sang Semantic Search mode (click nút "AI")**
4. **Nhập query: "money"**
5. **Click Search**
6. **Kiểm tra request trong Network tab:**

```
Request URL: POST /api/search/semantic
Request Payload:
{
  "query": "money",
  "limit": 50,
  "minScore": 0.7,
  "generateMissingEmbeddings": true  // ⚠️ Hiện tại đang là true
}
```

7. **Sửa request payload (nếu cần):**
   - Right-click request → Edit and Resend
   - Đổi `generateMissingEmbeddings: false`
   - Resend

### Bước 3: Kiểm Tra Kết Quả

#### ✅ Kết Quả Mong Đợi (Không Generate Embeddings):

1. **Response có `emailsWithoutEmbeddings > 0`:**

   ```json
   {
     "emailsWithEmbeddings": 150,
     "emailsWithoutEmbeddings": 10 // ✅ Có emails chưa có embeddings
   }
   ```

2. **Chỉ tìm trong emails đã có embeddings:**
   - Kết quả chỉ từ emails có `embedding` field
   - Emails không có embeddings sẽ không xuất hiện trong kết quả

3. **Conceptual Relevance hoạt động:**
   - Query: "money" → Tìm thấy emails về "invoice", "price", "salary"
   - Không cần từ "money" xuất hiện trong email

4. **Similarity Score hiển thị:**
   - Mỗi result có `similarityScore` (0.0 - 1.0)
   - Results được sort theo score giảm dần

### Bước 4: Test Cases

#### Test Case 1: Conceptual Search - "money"

**Query**: `"money"`

**Expected Results**:

- ✅ Emails về "invoice", "payment", "salary", "price"
- ✅ Không cần từ "money" xuất hiện trong email
- ✅ Similarity score > 0.7 (minScore)

**Kiểm tra:**

```bash
curl -X POST "http://localhost:8080/api/search/semantic" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "money",
    "limit": 10,
    "minScore": 0.7,
    "generateMissingEmbeddings": false
  }'
```

#### Test Case 2: Conceptual Search - "deadline"

**Query**: `"deadline"`

**Expected Results**:

- ✅ Emails về "due date", "urgent", "ASAP", "time-sensitive"
- ✅ Conceptual matching hoạt động

#### Test Case 3: Conceptual Search - "team meeting"

**Query**: `"team meeting"`

**Expected Results**:

- ✅ Emails về "standup", "sync", "discussion", "collaboration"
- ✅ Không chỉ exact match "team meeting"

#### Test Case 4: Kiểm Tra Không Generate Embeddings

**Setup**: Có 10 emails chưa có embeddings

**Query**: `"test"` với `generateMissingEmbeddings: false`

**Expected Behavior**:

- ✅ Chỉ search trong emails đã có embeddings
- ✅ `emailsWithoutEmbeddings: 10` trong response
- ✅ Không có toast notification về "Generated embeddings"
- ✅ Không có emails mới được generate embeddings

### Bước 5: So Sánh Với Generate Embeddings

#### Test 1: Không Generate (generateMissingEmbeddings: false)

```json
{
  "query": "money",
  "generateMissingEmbeddings": false
}
```

**Kết quả:**

- Chỉ search trong emails đã có embeddings
- Nhanh hơn (không phải generate)
- `emailsWithoutEmbeddings` > 0 nếu có emails chưa có embeddings

#### Test 2: Có Generate (generateMissingEmbeddings: true)

```json
{
  "query": "money",
  "generateMissingEmbeddings": true
}
```

**Kết quả:**

- Generate embeddings cho emails chưa có
- Chậm hơn (phải gọi OpenAI API)
- `emailsWithoutEmbeddings` sẽ giảm sau khi generate
- Có toast notification: "✨ Generated embeddings for X emails"

---

## 🔧 Sửa Code Để Test Không Generate Embeddings

### Option 1: Sửa Tạm Thời (Để Test)

**File**: `frontend/components/email/search-results-view.tsx`

```typescript
// Dòng 110-116
semanticSearchMutation.mutate(
  {
    query: trimmedQuery,
    limit: 50,
    minScore: 0.7,
    generateMissingEmbeddings: false, // ✅ Đổi thành false để test
  }
  // ...
);
```

### Option 2: Thêm Toggle (Khuyến nghị cho Production)

**Thêm state để toggle:**

```typescript
// Trong SearchResultsView component
const [autoGenerateEmbeddings, setAutoGenerateEmbeddings] = React.useState(false);

// Trong handleSearch
semanticSearchMutation.mutate(
  {
    query: trimmedQuery,
    limit: 50,
    minScore: 0.7,
    generateMissingEmbeddings: autoGenerateEmbeddings, // ✅ Dùng state
  },
  // ...
);

// Thêm UI toggle
<label>
  <input
    type="checkbox"
    checked={autoGenerateEmbeddings}
    onChange={(e) => setAutoGenerateEmbeddings(e.target.checked)}
  />
  Auto-generate embeddings for emails without them
</label>
```

---

## 📊 Checklist Test Semantic Search

- [ ] **API Status Check**
  - [ ] `GET /api/search/semantic/status` returns `available: true`
  - [ ] OpenAI API key được cấu hình

- [ ] **Semantic Search Request**
  - [ ] `POST /api/search/semantic` với `generateMissingEmbeddings: false`
  - [ ] Request body đúng format
  - [ ] Authorization header có token

- [ ] **Response Validation**
  - [ ] Response có `totalResults`
  - [ ] Response có `results[]` với `similarityScore`
  - [ ] Response có `emailsWithEmbeddings` và `emailsWithoutEmbeddings`
  - [ ] Response có `processingTimeMs`

- [ ] **Conceptual Relevance**
  - [ ] Query "money" tìm thấy "invoice", "price", "salary"
  - [ ] Query "deadline" tìm thấy "urgent", "due date"
  - [ ] Results không cần exact keyword match

- [ ] **No Embedding Generation**
  - [ ] `emailsWithoutEmbeddings` > 0 (nếu có emails chưa có embeddings)
  - [ ] Không có toast notification về "Generated embeddings"
  - [ ] Database không có embeddings mới được tạo

- [ ] **UI Display**
  - [ ] Results hiển thị "🧠 Conceptual Match: X%" badge
  - [ ] Similarity score hiển thị đúng
  - [ ] Results được sort theo score giảm dần

---

## 🐛 Troubleshooting

### Issue 1: "Semantic search is not available"

**Nguyên nhân**: OpenAI API key chưa được cấu hình

**Giải pháp**:

```bash
# Backend: Thêm vào application.yml hoặc environment variables
app:
  openai:
    api-key: sk-...
```

### Issue 2: Không có kết quả

**Nguyên nhân**:

- Emails chưa có embeddings
- `minScore` quá cao

**Giải pháp**:

- Giảm `minScore` xuống 0.3-0.5
- Hoặc generate embeddings trước (dùng endpoint riêng)

### Issue 3: Vẫn tự động generate embeddings

**Nguyên nhân**: Frontend hardcode `generateMissingEmbeddings: true`

**Giải pháp**: Sửa code như hướng dẫn ở trên

---

## 📝 Notes

- **Test không generate embeddings** giúp test nhanh hơn và không tốn OpenAI API credits
- **Production** nên có option để user chọn có muốn auto-generate hay không
- **Conceptual relevance** chỉ hoạt động với emails đã có embeddings

---

## ✅ Kết Luận

Frontend implementation **ĐỦ** so với backend documentation. Chỉ cần sửa `generateMissingEmbeddings: false` để test semantic search không tự động generate embeddings.
