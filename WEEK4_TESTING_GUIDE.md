# Week 4 Features - Complete Testing Guide

**Ngày**: December 24, 2025  
**Mục đích**: Hướng dẫn test tất cả tính năng Week 4 trên UI

---

## 📋 Chuẩn bị trước khi test

### 1. Kiểm tra Environment Setup

**Backend (Java):**

```bash
cd backend
# Kiểm tra file .env có OpenAI API Key
cat .env | grep OPENAI_API_KEY

# Expected output:
# OPENAI_API_KEY=sk-...
```

**Frontend:**

```bash
cd frontend
# Check if running
# Expected: http://localhost:3000
```

**Database:**

- MongoDB phải running
- User đã có emails trong hệ thống

### 2. Login vào hệ thống

1. Mở browser: `http://localhost:3000`
2. Login với Google Account
3. Đảm bảo Gmail đã kết nối (xem badge "✓ Gmail Connected")

---

## 🧪 I. TEST SEMANTIC SEARCH (25 điểm)

### Test 1: Kiểm tra Semantic Search có hoạt động không

**Bước thực hiện:**

1. **Mở Search Interface**

   ```
   Kanban Page → Click nút "Search" (góc trên bên phải)
   ```

   ✅ **Expected**: Search modal/view mở ra

2. **Kiểm tra AI Search Mode có sẵn không**

   ```
   Nhìn vào thanh search bar → Xem toggle buttons "Text" và "AI"
   ```

   ✅ **Expected**:
   - Thấy 2 nút: "Text" và "AI"
   - Nút "AI" có icon Sparkles (✨)
   - Nếu API key configured, nút "AI" có thể click

3. **Check Semantic Search Status**
   ```
   Browser DevTools → Network Tab
   Request: GET /api/search/semantic/status
   ```
   ✅ **Expected Response**:
   ```json
   {
     "success": true,
     "data": {
       "available": true,
       "message": "Semantic search is available"
     }
   }
   ```

### Test 2: Generate Embeddings cho Emails

**Mục đích**: Tạo vector embeddings cho tất cả emails

**Bước thực hiện:**

1. **Call Generate Embeddings API**

   ```
   Method 1: Via Postman/curl
   POST http://localhost:8080/api/search/semantic/generate-embeddings
   Headers: {
     "Authorization": "Bearer YOUR_TOKEN"
   }
   ```

   ```
   Method 2: Via Browser Console
   // Mở DevTools Console và chạy:
   fetch('/api/search/semantic/generate-embeddings', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
       'Content-Type': 'application/json'
     }
   }).then(r => r.json()).then(console.log)
   ```

2. **Xem kết quả**
   ✅ **Expected Response**:

   ```json
   {
     "success": true,
     "data": {
       "generated": 15,
       "message": "Generated embeddings for 15 emails"
     }
   }
   ```

3. **Check Database**
   ```
   MongoDB → email_kanban_status collection
   Kiểm tra field "embedding" có giá trị (array of 1536 numbers)
   ```

### Test 3: Test Conceptual Relevance (QUAN TRỌNG!)

**Scenario**: Tìm emails về "money" mà không có từ "money"

**Test Case 1: Search "money"**

1. **Input:**

   ```
   - Click nút "AI" để bật semantic search
   - Type "money" vào search bar
   - Press Enter hoặc click Search
   ```

2. **Expected Results:**
   ✅ Thấy emails có từ khóa liên quan:
   - "invoice" (hóa đơn)
   - "payment" (thanh toán)
   - "salary" (lương)
   - "price" (giá)
   - "cost" (chi phí)
   - "budget" (ngân sách)

   ⚠️ **KHÔNG** cần có từ "money" trong email

3. **Check UI Indicators:**
   ✅ Thấy:
   - Purple-blue gradient banner: "AI-Powered Semantic Search"
   - Badge "Conceptual Match"
   - Processing time (e.g., "245ms")
   - Indexed count (e.g., "150 indexed")

4. **Check Similarity Scores:**
   ```
   Mỗi result phải có score từ 0.7 - 1.0
   Sorted từ cao xuống thấp
   ```

**Test Case 2: Search "urgent"**

1. **Input:** "urgent"
2. **Expected:** Tìm emails về:
   - "ASAP"
   - "important"
   - "critical"
   - "priority"
   - "deadline"

**Test Case 3: Search "meeting"**

1. **Input:** "meeting"
2. **Expected:** Tìm emails về:
   - "conference"
   - "call"
   - "appointment"
   - "schedule"
   - "zoom"

**Test Case 4: So sánh Text vs AI Search**

1. **Text Search:**

   ```
   - Click nút "Text"
   - Search "money"
   → Chỉ tìm emails CÓ từ "money"
   ```

2. **AI Search:**

   ```
   - Click nút "AI"
   - Search "money"
   → Tìm emails về CONCEPT "money" (invoice, payment, salary...)
   ```

3. **Screenshot:**
   ```
   Chụp 2 screenshots để so sánh kết quả
   ```

### Test 4: Kiểm tra Empty States

**Test 4.1: No Results**

```
Input: "asdfghjkl" (gibberish)
Expected:
- Hiện "No Results Found"
- Suggestion: "Try Text Search" hoặc "Try AI Search"
- Button để switch mode
```

**Test 4.2: Unindexed Emails Warning**

```
Nếu có emails chưa có embeddings:
- Thấy badge: "⚠️ X not indexed"
- Có thể click để generate embeddings
```

### Test 5: Performance Check

1. **Measure Response Time:**

   ```
   Network Tab → Semantic Search Request
   Check processing time
   ```

   ✅ **Expected**: < 500ms cho ~100 emails

2. **Check Processing Stats:**
   ```
   Response có field:
   - processingTimeMs: < 500
   - emailsWithEmbeddings: X
   - emailsWithoutEmbeddings: Y
   ```

---

## 🔍 II. TEST AUTO-SUGGESTION (20 điểm)

### Test 6: Kiểm tra Dropdown hiện ra

**Bước thực hiện:**

1. **Type vào Search Bar**

   ```
   - Focus vào search input
   - Type ít nhất 2 ký tự (e.g., "jo")
   - Wait 300ms (debounce)
   ```

2. **Expected:**
   ✅ Dropdown hiện ra bên dưới input
   ✅ Loading skeleton hiện trong lúc fetch data
   ✅ Sau đó hiện suggestions

### Test 7: Kiểm tra Contacts Suggestions

**Scenario**: Tìm sender "John"

1. **Input:**

   ```
   Type "jo" vào search bar
   ```

2. **Expected Results:**
   ✅ **Contacts Section** hiển thị:

   ```
   👤 Contacts (3)
   ┌─────────────────────────────────────┐
   │ [J] John Doe                        │
   │     john.doe@example.com            │
   │                            15 emails │
   └─────────────────────────────────────┘
   ```

3. **Check Visual:**
   - Avatar bubble màu blue-purple gradient
   - Chữ cái đầu trong circle (J)
   - Tên đầy đủ (John Doe)
   - Email address
   - Badge hiện số emails

4. **Click vào Contact:**
   ```
   Click vào "John Doe"
   → Search bar auto-fill: "from:john.doe@example.com"
   → Trigger search
   → Hiện emails từ John Doe
   ```

### Test 8: Kiểm tra Keywords Suggestions

1. **Input:**

   ```
   Type "proj" vào search bar
   ```

2. **Expected Results:**
   ✅ **Keywords Section** hiển thị:

   ```
   #️⃣ Keywords (2)
   ┌─────────────────────────────────────┐
   │ [#] project                         │
   │     Found in subject or content     │
   │                                 42x │
   └─────────────────────────────────────┘
   │ [#] progress                        │
   │     Found in subject or content     │
   │                                 28x │
   └─────────────────────────────────────┘
   ```

3. **Check Visual:**
   - Green gradient icon background
   - Keyword text
   - Subtitle "Found in subject or content"
   - Frequency badge (42x)

4. **Click vào Keyword:**
   ```
   Click vào "project"
   → Search bar auto-fill: "project"
   → Trigger search
   → Hiện emails có "project"
   ```

### Test 9: Kiểm tra Recent Searches

1. **Perform some searches trước:**

   ```
   Search 1: "invoice"
   Search 2: "meeting"
   Search 3: "urgent"
   ```

2. **Clear search và type lại:**

   ```
   Type "in" vào search bar
   ```

3. **Expected Results:**
   ✅ **Recent Searches Section** hiển thị:

   ```
   🕒 Recent Searches (1)
   ┌─────────────────────────────────────┐
   │ [🕒] invoice                         │
   │      Previous search                │
   └─────────────────────────────────────┘
   ```

4. **Click vào Recent Search:**
   ```
   Click vào "invoice"
   → Re-run previous search
   → Hiện kết quả cũ
   ```

### Test 10: Keyboard Navigation

**Test 10.1: Arrow Keys**

1. **Setup:**

   ```
   Type "jo" → Dropdown hiện với 5 suggestions
   ```

2. **Test Navigation:**

   ```
   Press ↓ (Down Arrow)
   → Highlight suggestion #1

   Press ↓ again
   → Highlight suggestion #2

   Press ↑ (Up Arrow)
   → Highlight suggestion #1
   ```

3. **Check Visual:**
   ✅ Selected item có background color thay đổi
   ✅ Scale animation (scale-[1.02])

**Test 10.2: Enter Key**

```
Navigate to suggestion #2
Press Enter
→ Search bar fill với value của suggestion #2
→ Trigger search
→ Dropdown close
```

**Test 10.3: Escape Key**

```
Open dropdown
Press Esc
→ Dropdown close
→ Input focus mất
```

### Test 11: Loading States

1. **Slow Connection Test:**

   ```
   DevTools → Network Tab → Throttle to "Slow 3G"
   Type "jo"
   ```

2. **Expected:**
   ✅ Skeleton loading hiện:
   ```
   [●●●●●] Loading placeholder 1
   [●●●●●] Loading placeholder 2
   [●●●●●] Loading placeholder 3
   ```
   (Pulsing animation)

### Test 12: Empty State

1. **Input:**

   ```
   Type "zzzzz" (không match gì)
   ```

2. **Expected:**
   ```
   ┌─────────────────────────────────────┐
   │         No suggestions found        │
   │      Try a different search term    │
   └─────────────────────────────────────┘
   ```

### Test 13: Keyboard Shortcuts Hint

1. **Open suggestions dropdown**

2. **Check bottom của dropdown:**
   ✅ Thấy keyboard hints:
   ```
   [↑][↓] Navigate    [⏎] Select    [Esc] Close
   ```

---

## ⚙️ III. TEST KANBAN CONFIGURATION (25 điểm)

### Test 14: Mở Settings Dialog

**Bước thực hiện:**

1. **Click Settings Button**

   ```
   Kanban Page → Click nút "Settings" (góc trên bên phải)
   ```

2. **Expected:**
   ✅ Dialog mở ra với title "Kanban Board Settings"
   ✅ Dialog size: Large (max-w-5xl)
   ✅ Height: 95vh

### Test 15: Create New Column

**Test 15.1: Successful Creation**

1. **Input:**

   ```
   Section "Create New Column"
   Type "Urgent" vào input
   Click "Create" button
   ```

2. **Expected:**
   ✅ Loading spinner hiện
   ✅ Toast success: "Column created successfully"
   ✅ Column mới hiện trong list
   ✅ Input field cleared

3. **Check Column Card:**
   ```
   ┌─────────────────────────────────────┐
   │ [🔵] Urgent              ✨ Custom  │
   │                                      │
   │ 📧 No Gmail label mapping            │
   │     Configure label sync for...      │
   │                      [+ Add Mapping] │
   └─────────────────────────────────────┘
   ```

**Test 15.2: Validation**

1. **Test Empty Name:**

   ```
   Input: "" (empty)
   Click "Create"
   → Toast error: "Column name is required"
   ```

2. **Test Keyboard:**
   ```
   Type "Follow Up"
   Press Enter
   → Create column (không cần click button)
   ```

### Test 16: Rename Column

1. **Click Edit Button:**

   ```
   Hover vào column "Urgent"
   Click pencil icon (Edit)
   ```

2. **Expected:**
   ✅ Input field hiện
   ✅ Current name pre-filled
   ✅ Auto-focus vào input
   ✅ Save (✓) và Cancel (✗) buttons hiện

3. **Rename:**

   ```
   Change "Urgent" → "High Priority"
   Click Save hoặc press Enter
   ```

4. **Expected:**
   ✅ Loading state
   ✅ Toast success: "Column updated successfully"
   ✅ Name changed in UI

5. **Cancel Test:**
   ```
   Click Edit
   Change name
   Click Cancel hoặc press Esc
   → Name không thay đổi
   ```

### Test 17: Delete Column

**Test 17.1: Delete Custom Column**

1. **Click Delete Button:**

   ```
   Hover vào custom column
   Click trash icon (Delete)
   ```

2. **Expected:**
   ✅ Confirmation dialog: "Are you sure you want to delete..."
   ✅ Warning: "All emails will be moved to Backlog"

3. **Confirm Delete:**

   ```
   Click OK
   ```

4. **Expected:**
   ✅ Loading state
   ✅ Toast success: "Column deleted successfully"
   ✅ Column removed from list
   ✅ Emails moved to Backlog

**Test 17.2: Cannot Delete Default Column**

1. **Try to delete "INBOX":**

   ```
   Hover vào INBOX column
   → Delete button KHÔNG hiện (hoặc disabled)

   Nếu somehow click được:
   → Toast error: "Cannot delete default columns"
   ```

### Test 18: Persistence Test

1. **Create/Rename columns:**

   ```
   Create "Test Column 1"
   Rename "Test Column 1" → "Test Column 2"
   ```

2. **Refresh Page:**

   ```
   Press F5 hoặc Ctrl+R
   ```

3. **Expected:**
   ✅ All changes persist
   ✅ "Test Column 2" vẫn còn
   ✅ Renamed columns giữ nguyên tên mới

### Test 19: Gmail Label Mapping (QUAN TRỌNG!)

**Setup: Đảm bảo Gmail đã connected**

**Test 19.1: Check Gmail Connection**

1. **Look for badge:**

   ```
   Main page → Check badge
   ✅ "✓ Gmail Connected" (green)
   hoặc
   ⚠️ "Gmail not connected" (orange)
   ```

2. **If not connected:**
   ```
   Need to reconnect Gmail OAuth
   ```

**Test 19.2: Add Label Mapping**

1. **Click "Add Mapping":**

   ```
   Column card → Click button "+ Add Mapping"
   ```

2. **Expected:**
   ✅ Form hiện ra:

   ```
   Primary Gmail Label:
   [Dropdown: Select Gmail label...]

   Additional Labels to Add:
   [Badges của available labels]

   Labels to Remove:
   [Badges của available labels]

   [Save] [Clear] [Cancel]
   ```

3. **Select Primary Label:**

   ```
   Click dropdown
   → Thấy 2 sections:
     - System Labels (INBOX, STARRED, IMPORTANT...)
     - User Labels (custom labels)

   Select "STARRED"
   ```

4. **Add Additional Labels:**

   ```
   Click badge "IMPORTANT"
   → Badge highlight (selected)
   → This label sẽ được add khi move email vào column
   ```

5. **Remove Labels:**

   ```
   Click badge "INBOX" trong section "Labels to Remove"
   → Badge highlight
   → INBOX sẽ bị remove khi move email vào column
   ```

6. **Save:**

   ```
   Click "Save" button
   ```

7. **Expected:**
   ✅ Loading state
   ✅ Toast success: "Label mapping saved successfully"
   ✅ Form close
   ✅ Column card hiện status:
   ```
   ┌─────────────────────────────────────┐
   │ 📧 Gmail Label: STARRED         🔵 Synced │
   │     Automatically syncs with Gmail      │
   │                        [✏️ Edit]         │
   └─────────────────────────────────────┘
   ```

**Test 19.3: Edit Existing Mapping**

1. **Click "Edit" button**
2. **Change mapping:**
   ```
   Change primary label: STARRED → IMPORTANT
   ```
3. **Save**
4. **Expected:**
   ✅ Mapping updated

**Test 19.4: Clear Mapping**

1. **Open edit form**
2. **Click "Clear" button**
3. **Confirmation:**
   ```
   → Confirm clear
   ```
4. **Expected:**
   ✅ Mapping cleared
   ✅ Status change: "No Gmail label mapping"

### Test 20: Test Label Sync When Moving Emails

**Setup:**

```
Column "Done" → Map to "CATEGORY_PERSONAL"
              → Add label: "IMPORTANT"
              → Remove label: "INBOX"
```

**Test:**

1. **Move email từ "To Do" → "Done":**

   ```
   Drag email card
   Drop vào "Done" column
   ```

2. **Expected:**
   ✅ Email moved in UI
   ✅ Toast success: "Email moved successfully"

3. **Check Gmail:**

   ```
   Mở Gmail web hoặc app
   Tìm email vừa move

   Expected labels:
   ✅ CATEGORY_PERSONAL (added)
   ✅ IMPORTANT (added)
   ❌ INBOX (removed)
   ```

4. **Check Network Request:**

   ```
   DevTools → Network Tab
   POST /api/kanban/move

   Response should show label sync happened
   ```

### Test 21: Empty State

1. **Delete all custom columns**
2. **Expected:**
   ```
   ┌─────────────────────────────────────┐
   │            📧                        │
   │        No columns yet                │
   │  Create your first column above      │
   │         to get started               │
   └─────────────────────────────────────┘
   ```

---

## 🎨 IV. TEST UI/UX ENHANCEMENTS

### Test 22: Visual Indicators

**Test 22.1: AI Search Indicator**

```
Enable AI mode
Expected:
- Purple-blue gradient background
- Animated Sparkles icon (pulsing)
- Text: "AI-Powered Semantic Search"
- Badge: "Conceptual Match"
```

**Test 22.2: Suggestion Avatars**

```
Open contacts suggestions
Expected:
- Circular avatar with gradient
- First letter of name
- Hover effect (scale up)
```

**Test 22.3: Column Color Indicators**

```
Column cards have:
- 4x4 colored circle
- Shadow effect
- Tooltip with color hex
```

### Test 23: Animations

**Test 23.1: Search Results Animation**

```
Perform search
Expected:
- Results fade in (fade-in)
- Staggered animation (delay per item)
- Smooth transition
```

**Test 23.2: Suggestion Hover**

```
Hover over suggestion
Expected:
- Scale up (scale-[1.02])
- Shadow appear
- Smooth transition
```

**Test 23.3: Column Hover**

```
Hover over column card
Expected:
- Border color change (primary/50)
- Shadow increase
- Smooth transition
```

### Test 24: Loading States

1. **Search Loading:**

   ```
   Spinning loader
   Text: "Searching emails..."
   Query shown
   ```

2. **Suggestions Loading:**

   ```
   Skeleton placeholders (3 items)
   Pulsing animation
   ```

3. **Column Actions Loading:**
   ```
   Button disabled
   Spinner on button
   ```

### Test 25: Empty States

1. **No Search Results:**

   ```
   - Icon (SearchX)
   - Message
   - Suggestion to try other mode
   - Clear button
   ```

2. **No Suggestions:**

   ```
   - Message: "No suggestions found"
   - Tip: "Try a different search term"
   ```

3. **No Columns:**
   ```
   - Large mail icon
   - Message
   - Call to action
   ```

---

## 📊 V. CHECKLIST TẤT CẢ TÍNH NĂNG

### ✅ Semantic Search Checklist

- [ ] OpenAI API key configured
- [ ] Status endpoint returns available=true
- [ ] Can generate embeddings
- [ ] Search "money" finds "invoice", "price", "salary"
- [ ] Results sorted by similarity score
- [ ] Processing time displayed
- [ ] Indexed count shown
- [ ] Warning for unindexed emails
- [ ] Can switch between Text and AI mode
- [ ] Empty state works
- [ ] Loading state works

### ✅ Auto-Suggestion Checklist

- [ ] Dropdown appears when typing >= 2 chars
- [ ] Contacts section shows with avatars
- [ ] Keywords section shows with frequencies
- [ ] Recent searches section shows
- [ ] Click suggestion triggers search
- [ ] Arrow keys navigate suggestions
- [ ] Enter key selects suggestion
- [ ] Esc key closes dropdown
- [ ] Loading skeleton displays
- [ ] Empty state displays
- [ ] Keyboard shortcuts hint visible

### ✅ Kanban Configuration Checklist

- [ ] Settings dialog opens
- [ ] Can create new column
- [ ] Can rename column
- [ ] Can delete custom column
- [ ] Cannot delete default column
- [ ] Changes persist after refresh
- [ ] Gmail connection status shown
- [ ] Can add label mapping
- [ ] Can select primary label
- [ ] Can add additional labels
- [ ] Can remove labels
- [ ] Can edit mapping
- [ ] Can clear mapping
- [ ] Moving email syncs labels in Gmail
- [ ] Empty state shows when no columns
- [ ] Color indicators visible
- [ ] Status badges show (Default, Custom, Synced)

---

## 🐛 Common Issues & Solutions

### Issue 1: Semantic Search Not Available

```
Problem: Status returns available=false
Solution:
1. Check backend .env file
2. Verify OPENAI_API_KEY is set
3. Restart backend
4. Check OpenAI account has credits
```

### Issue 2: No Suggestions Appearing

```
Problem: Dropdown doesn't show
Solution:
1. Type at least 2 characters
2. Wait 300ms (debounce)
3. Check Network tab for errors
4. Verify backend is running
5. Check if you have emails in database
```

### Issue 3: Gmail Labels Not Syncing

```
Problem: Moving email doesn't update Gmail
Solution:
1. Check Gmail connection status
2. Re-authenticate OAuth if needed
3. Verify column has label mapping configured
4. Check Network tab for API errors
5. Check email permissions
```

### Issue 4: Columns Not Persisting

```
Problem: Changes lost after refresh
Solution:
1. Check MongoDB connection
2. Verify user is logged in
3. Check browser console for errors
4. Clear cache and retry
```

---

## 📸 Screenshot Checklist

Chụp screenshots cho report/demo:

1. ✅ Semantic search results showing conceptual matches
2. ✅ AI mode indicator with gradient
3. ✅ Auto-suggestions dropdown (all 3 types)
4. ✅ Keyboard navigation hints
5. ✅ Settings dialog overview
6. ✅ Create column form
7. ✅ Gmail label mapping form
8. ✅ Column with "Synced" badge
9. ✅ Empty states (search, suggestions, columns)
10. ✅ Loading states

---

## 🎥 Video Demo Script

**Duration: 5 minutes**

### Part 1: Semantic Search (1.5 min)

1. Show status endpoint
2. Generate embeddings
3. Search "money" in AI mode
4. Show results with "invoice", "salary"
5. Compare with Text search
6. Show processing stats

### Part 2: Auto-Suggestion (1.5 min)

1. Type "jo" → show contacts
2. Type "pro" → show keywords
3. Show recent searches
4. Demo keyboard navigation
5. Show loading skeleton

### Part 3: Kanban Configuration (2 min)

1. Open settings
2. Create new column
3. Rename column
4. Configure Gmail label mapping
5. Move email and show Gmail sync
6. Show persistence (refresh page)

---

## ✅ Final Verification

Trước khi submit, verify:

1. [ ] All 3 features work end-to-end
2. [ ] No console errors
3. [ ] No network errors
4. [ ] All UI indicators show correctly
5. [ ] All animations smooth
6. [ ] Gmail sync works
7. [ ] Data persists after refresh
8. [ ] Mobile responsive (bonus)
9. [ ] Screenshots captured
10. [ ] Video recorded

---

## 📝 Notes

- Test trên Chrome/Firefox/Safari
- Test với nhiều types of queries
- Test với emails có/không có attachments
- Test với emails từ different senders
- Document any bugs found

**Good luck testing! 🚀**
