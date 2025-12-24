# Quick Test Script - Week 4 Features

**⏱️ 15 phút test nhanh tất cả tính năng**

---

## 🚀 QUICK START

### 1️⃣ Khởi động hệ thống (2 phút)

```bash
# Terminal 1 - Backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Check status
curl http://localhost:8080/api/health
curl http://localhost:3000
```

### 2️⃣ Login (30 giây)

- Mở `http://localhost:3000`
- Login với Google
- Verify "✓ Gmail Connected"

---

## ⚡ QUICK TESTS (12 phút)

### A. SEMANTIC SEARCH - 4 phút

#### ✅ Test 1: Generate Embeddings (1 phút)

```javascript
// Browser Console:
fetch('/api/search/semantic/generate-embeddings', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
  },
})
  .then((r) => r.json())
  .then((d) => console.log('Generated:', d.data.generated));
```

**Expected:** `Generated: X` (X > 0)

#### ✅ Test 2: Conceptual Search (2 phút)

1. Click "Search" button
2. Click "AI" toggle
3. Type "money" → Enter
4. **Expected:** See emails about "invoice", "payment", "salary"
5. Check purple gradient: "AI-Powered Semantic Search" ✓

#### ✅ Test 3: Compare Modes (1 phút)

1. Search "money" in Text mode → exact matches only
2. Search "money" in AI mode → conceptual matches
3. **Expected:** AI mode returns MORE relevant emails

---

### B. AUTO-SUGGESTION - 4 phút

#### ✅ Test 4: Contacts (1 phút)

1. Type "jo" in search
2. **Expected:** Dropdown shows contacts với avatars
3. Click a contact → Search triggered ✓

#### ✅ Test 5: Keywords (1 phút)

1. Type "proj"
2. **Expected:** Keywords hiện với frequency badges
3. Click "project" → Search triggered ✓

#### ✅ Test 6: Keyboard Nav (1 phút)

1. Type "jo"
2. Press ↓ → Highlight moves
3. Press Enter → Search triggered ✓

#### ✅ Test 7: Visual Check (1 phút)

- [ ] Avatar bubbles có gradient
- [ ] Section headers có count badges
- [ ] Keyboard hints visible at bottom
- [ ] Loading skeleton works

---

### C. KANBAN CONFIG - 4 phút

#### ✅ Test 8: Create Column (1 phút)

1. Click "Settings"
2. Type "Test Column" → Click Create
3. **Expected:** Column added, toast success ✓

#### ✅ Test 9: Rename Column (30 giây)

1. Click Edit (pencil icon)
2. Change name → Save
3. **Expected:** Name updated ✓

#### ✅ Test 10: Label Mapping (1.5 phút)

1. Click "Add Mapping" on "Test Column"
2. Select "STARRED" as primary label
3. Click Save
4. **Expected:** Badge "🔵 Synced" appears ✓

#### ✅ Test 11: Gmail Sync (1 phút)

1. Drag an email to "Test Column"
2. Open Gmail
3. **Expected:** Email has STARRED label ✓

---

## 📊 QUICK CHECKLIST

### Semantic Search

- [ ] ✅ Generate embeddings works
- [ ] ✅ AI search finds conceptual matches
- [ ] ✅ Processing time displayed
- [ ] ✅ Purple gradient indicator visible

### Auto-Suggestion

- [ ] ✅ Contacts show with avatars
- [ ] ✅ Keywords show with frequencies
- [ ] ✅ Keyboard navigation works
- [ ] ✅ Visual enhancements present

### Kanban Config

- [ ] ✅ Create column works
- [ ] ✅ Rename column works
- [ ] ✅ Label mapping saves
- [ ] ✅ Gmail sync works

---

## 🎯 ONE-LINER TESTS

**Semantic Search:**

```bash
curl -X POST http://localhost:8080/api/search/semantic \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"money","limit":10,"minScore":0.7}'
```

**Generate Embeddings:**

```bash
curl -X POST http://localhost:8080/api/search/semantic/generate-embeddings \
  -H "Authorization: Bearer $TOKEN"
```

**Get Suggestions:**

```bash
curl "http://localhost:8080/api/search/suggestions?query=jo&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

**Get Columns:**

```bash
curl http://localhost:8080/api/kanban/columns \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 QUICK DEBUG

### Problem: No results in semantic search

```bash
# Check embeddings exist
curl http://localhost:8080/api/kanban/board \
  -H "Authorization: Bearer $TOKEN" | grep embedding
```

### Problem: Suggestions not showing

```bash
# Check data exists
curl "http://localhost:8080/api/search/suggestions?query=a&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

### Problem: Gmail not syncing

```bash
# Check Gmail status
curl http://localhost:8080/api/gmail/status \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📸 QUICK SCREENSHOTS

1. AI search results → `screenshot_1_ai_search.png`
2. Suggestions dropdown → `screenshot_2_suggestions.png`
3. Settings dialog → `screenshot_3_settings.png`
4. Label mapping → `screenshot_4_mapping.png`
5. Gmail synced → `screenshot_5_gmail.png`

---

## ✅ PASS CRITERIA

**PASS nếu:**

- ✅ All 11 tests pass
- ✅ No console errors
- ✅ UI looks professional
- ✅ Gmail sync works

**FAIL nếu:**

- ❌ Semantic search không tìm conceptual matches
- ❌ Suggestions không hiện
- ❌ Gmail sync không work
- ❌ Nhiều console errors

---

## 🎥 2-MINUTE VIDEO SCRIPT

**0:00-0:30** - Semantic Search

- Generate embeddings
- Search "money"
- Show "invoice", "salary" results

**0:30-1:00** - Auto-Suggestions

- Type "jo" → contacts
- Type "proj" → keywords
- Keyboard navigation

**1:00-2:00** - Kanban Config

- Create column
- Add label mapping
- Move email → Gmail syncs

---

## 💪 STRESS TEST (Optional)

1. **Load Test:**
   - Generate 100+ embeddings
   - Search with 10 different queries
   - Check performance < 500ms

2. **UI Test:**
   - Open/close settings 10x
   - Rapid typing in search
   - Multiple column operations

3. **Sync Test:**
   - Move 5 emails quickly
   - Check all Gmail labels updated

---

**Time Total: ~15 minutes** ⏱️

Nếu tất cả pass → **READY FOR DEMO! 🎉**
