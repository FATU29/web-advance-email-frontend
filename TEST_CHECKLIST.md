# Week 4 Features - Test Checklist

**Tester:** **\*\*\*\***\_**\*\*\*\***  
**Date:** **\*\*\*\***\_**\*\*\*\***  
**Environment:** □ Local □ Staging □ Production

---

## 📋 I. SEMANTIC SEARCH (25 points)

| #    | Test Case                    | Steps                                           | Expected Result                           | Status        | Notes |
| ---- | ---------------------------- | ----------------------------------------------- | ----------------------------------------- | ------------- | ----- |
| 1.1  | Check API Status             | `GET /api/search/semantic/status`               | `available: true`                         | ☐ Pass ☐ Fail |       |
| 1.2  | Generate Embeddings          | `POST /api/search/semantic/generate-embeddings` | `generated: X emails`                     | ☐ Pass ☐ Fail |       |
| 1.3  | Conceptual Search: "money"   | Search "money" in AI mode                       | Finds "invoice", "payment", "salary"      | ☐ Pass ☐ Fail |       |
| 1.4  | Conceptual Search: "urgent"  | Search "urgent" in AI mode                      | Finds "ASAP", "important", "critical"     | ☐ Pass ☐ Fail |       |
| 1.5  | Conceptual Search: "meeting" | Search "meeting" in AI mode                     | Finds "call", "conference", "appointment" | ☐ Pass ☐ Fail |       |
| 1.6  | Vector Comparison            | Check similarity scores                         | All scores between 0.7-1.0                | ☐ Pass ☐ Fail |       |
| 1.7  | Results Ranking              | Check result order                              | Sorted by score descending                | ☐ Pass ☐ Fail |       |
| 1.8  | UI Indicator                 | Visual check                                    | Purple gradient, "AI-Powered" label       | ☐ Pass ☐ Fail |       |
| 1.9  | Processing Stats             | Check response                                  | Processing time, indexed count shown      | ☐ Pass ☐ Fail |       |
| 1.10 | Text vs AI Comparison        | Compare both modes                              | AI returns more relevant results          | ☐ Pass ☐ Fail |       |
| 1.11 | Empty State                  | Search gibberish                                | "No Results Found" with suggestions       | ☐ Pass ☐ Fail |       |
| 1.12 | Unindexed Warning            | Check badge                                     | Shows "X not indexed" if applicable       | ☐ Pass ☐ Fail |       |

**Semantic Search Score:** \_\_\_\_/12 ✓

---

## 🔍 II. AUTO-SUGGESTION (20 points)

| #    | Test Case        | Steps                      | Expected Result                         | Status        | Notes |
| ---- | ---------------- | -------------------------- | --------------------------------------- | ------------- | ----- |
| 2.1  | Dropdown Trigger | Type >= 2 characters       | Dropdown appears                        | ☐ Pass ☐ Fail |       |
| 2.2  | Debounce         | Type quickly               | Waits 300ms before fetch                | ☐ Pass ☐ Fail |       |
| 2.3  | Contacts Section | Type "jo"                  | Shows contacts with avatars             | ☐ Pass ☐ Fail |       |
| 2.4  | Contact Avatar   | Visual check               | Circle with gradient, first letter      | ☐ Pass ☐ Fail |       |
| 2.5  | Contact Data     | Check display              | Name, email, count shown                | ☐ Pass ☐ Fail |       |
| 2.6  | Keywords Section | Type "proj"                | Shows keywords with frequencies         | ☐ Pass ☐ Fail |       |
| 2.7  | Keyword Visual   | Visual check               | Green icon, frequency badge             | ☐ Pass ☐ Fail |       |
| 2.8  | Recent Searches  | After searching            | Shows previous searches                 | ☐ Pass ☐ Fail |       |
| 2.9  | Recent Visual    | Visual check               | Orange icon, "Previous search" subtitle | ☐ Pass ☐ Fail |       |
| 2.10 | Click Contact    | Click suggestion           | Fills search, triggers search           | ☐ Pass ☐ Fail |       |
| 2.11 | Click Keyword    | Click keyword              | Fills search, triggers search           | ☐ Pass ☐ Fail |       |
| 2.12 | Arrow Navigation | Press ↓↑ keys              | Highlights move correctly               | ☐ Pass ☐ Fail |       |
| 2.13 | Enter Key        | Press Enter on highlighted | Selects and searches                    | ☐ Pass ☐ Fail |       |
| 2.14 | Escape Key       | Press Esc                  | Closes dropdown                         | ☐ Pass ☐ Fail |       |
| 2.15 | Loading Skeleton | Slow connection            | Shows pulsing placeholders              | ☐ Pass ☐ Fail |       |
| 2.16 | Empty State      | Type "zzzzz"               | "No suggestions found" message          | ☐ Pass ☐ Fail |       |
| 2.17 | Keyboard Hints   | Open dropdown              | Shows ↑↓, Enter, Esc hints              | ☐ Pass ☐ Fail |       |
| 2.18 | Section Headers  | Visual check               | Has count badges                        | ☐ Pass ☐ Fail |       |
| 2.19 | Hover Effect     | Hover suggestion           | Scale animation, shadow                 | ☐ Pass ☐ Fail |       |
| 2.20 | Scroll           | Many suggestions           | ScrollArea works                        | ☐ Pass ☐ Fail |       |

**Auto-Suggestion Score:** \_\_\_\_/20 ✓

---

## ⚙️ III. KANBAN CONFIGURATION (25 points)

### A. Column Management

| #    | Test Case         | Steps                         | Expected Result                        | Status        | Notes |
| ---- | ----------------- | ----------------------------- | -------------------------------------- | ------------- | ----- |
| 3.1  | Open Settings     | Click Settings button         | Dialog opens (max-w-5xl)               | ☐ Pass ☐ Fail |       |
| 3.2  | Create Column     | Type name, click Create       | Column created, toast success          | ☐ Pass ☐ Fail |       |
| 3.3  | Create Validation | Empty name, click Create      | Error toast "Name is required"         | ☐ Pass ☐ Fail |       |
| 3.4  | Create Keyboard   | Type name, press Enter        | Column created                         | ☐ Pass ☐ Fail |       |
| 3.5  | Column Display    | Visual check                  | Color indicator, name, badges          | ☐ Pass ☐ Fail |       |
| 3.6  | Rename Column     | Click Edit, change name, Save | Name updated, toast success            | ☐ Pass ☐ Fail |       |
| 3.7  | Rename Cancel     | Click Edit, change, Cancel    | Name unchanged                         | ☐ Pass ☐ Fail |       |
| 3.8  | Rename Keyboard   | Edit, press Esc               | Cancels edit                           | ☐ Pass ☐ Fail |       |
| 3.9  | Delete Custom     | Click Delete, confirm         | Column deleted, toast success          | ☐ Pass ☐ Fail |       |
| 3.10 | Delete Default    | Try delete INBOX              | Cannot delete (button hidden/disabled) | ☐ Pass ☐ Fail |       |
| 3.11 | Persistence       | Create/rename, refresh page   | Changes persist                        | ☐ Pass ☐ Fail |       |
| 3.12 | Empty State       | Delete all custom columns     | "No columns yet" message               | ☐ Pass ☐ Fail |       |

### B. Gmail Label Mapping

| #    | Test Case                | Steps                       | Expected Result                   | Status        | Notes |
| ---- | ------------------------ | --------------------------- | --------------------------------- | ------------- | ----- |
| 3.13 | Gmail Status             | Check badge                 | "✓ Gmail Connected" or warning    | ☐ Pass ☐ Fail |       |
| 3.14 | Open Mapping Form        | Click "Add Mapping"         | Form opens with dropdowns         | ☐ Pass ☐ Fail |       |
| 3.15 | Label Dropdown           | Click dropdown              | System + User labels shown        | ☐ Pass ☐ Fail |       |
| 3.16 | Select Primary Label     | Select "STARRED"            | Label selected                    | ☐ Pass ☐ Fail |       |
| 3.17 | Add Additional Labels    | Click label badges          | Badges highlight                  | ☐ Pass ☐ Fail |       |
| 3.18 | Remove Labels            | Click in "Remove" section   | Badges highlight                  | ☐ Pass ☐ Fail |       |
| 3.19 | Save Mapping             | Click Save                  | Saved, toast success, form closes | ☐ Pass ☐ Fail |       |
| 3.20 | Synced Badge             | Visual check                | "🔵 Synced" badge appears         | ☐ Pass ☐ Fail |       |
| 3.21 | Mapping Display          | Visual check                | "Gmail Label: STARRED" shown      | ☐ Pass ☐ Fail |       |
| 3.22 | Edit Mapping             | Click Edit                  | Form reopens with saved values    | ☐ Pass ☐ Fail |       |
| 3.23 | Clear Mapping            | Click Clear, confirm        | Mapping removed                   | ☐ Pass ☐ Fail |       |
| 3.24 | Label Sync - Move Email  | Drag email to mapped column | Email moved in UI                 | ☐ Pass ☐ Fail |       |
| 3.25 | Label Sync - Check Gmail | Open Gmail, check email     | Labels updated in Gmail           | ☐ Pass ☐ Fail |       |

**Kanban Config Score:** \_\_\_\_/25 ✓

---

## 🎨 IV. UI/UX ENHANCEMENTS (20 points)

| #    | Test Case           | Expected Result                         | Status        | Notes |
| ---- | ------------------- | --------------------------------------- | ------------- | ----- |
| 4.1  | AI Search Indicator | Purple-blue gradient, animated Sparkles | ☐ Pass ☐ Fail |       |
| 4.2  | Processing Stats    | Time, indexed count, badges visible     | ☐ Pass ☐ Fail |       |
| 4.3  | Contact Avatars     | Gradient circles with initials          | ☐ Pass ☐ Fail |       |
| 4.4  | Keyword Icons       | Green gradient backgrounds              | ☐ Pass ☐ Fail |       |
| 4.5  | Recent Icons        | Orange gradient backgrounds             | ☐ Pass ☐ Fail |       |
| 4.6  | Section Headers     | Bold text, count badges                 | ☐ Pass ☐ Fail |       |
| 4.7  | Column Color        | 4x4 circle with shadow                  | ☐ Pass ☐ Fail |       |
| 4.8  | Status Badges       | 🔒 Default, ✨ Custom, 🔵 Synced        | ☐ Pass ☐ Fail |       |
| 4.9  | Search Animation    | Results fade in with stagger            | ☐ Pass ☐ Fail |       |
| 4.10 | Suggestion Hover    | Scale up, shadow appear                 | ☐ Pass ☐ Fail |       |
| 4.11 | Column Hover        | Border change, shadow increase          | ☐ Pass ☐ Fail |       |
| 4.12 | Loading States      | Spinners, skeletons work                | ☐ Pass ☐ Fail |       |
| 4.13 | Empty States        | All empty states styled                 | ☐ Pass ☐ Fail |       |
| 4.14 | Tooltips            | Helpful tooltips present                | ☐ Pass ☐ Fail |       |
| 4.15 | Spacing             | Consistent gaps and padding             | ☐ Pass ☐ Fail |       |
| 4.16 | Typography          | Hierarchical text styles                | ☐ Pass ☐ Fail |       |
| 4.17 | Colors              | Semantic colors used correctly          | ☐ Pass ☐ Fail |       |
| 4.18 | Responsive          | Works on tablet/desktop                 | ☐ Pass ☐ Fail |       |
| 4.19 | Dark Mode           | Supports dark theme                     | ☐ Pass ☐ Fail |       |
| 4.20 | Accessibility       | Keyboard nav, focus states              | ☐ Pass ☐ Fail |       |

**UI/UX Score:** \_\_\_\_/20 ✓

---

## 💻 V. CODE QUALITY (10 points)

| #    | Criteria              | Check                        | Status        | Notes |
| ---- | --------------------- | ---------------------------- | ------------- | ----- |
| 5.1  | Component Structure   | Clean, well-organized        | ☐ Pass ☐ Fail |       |
| 5.2  | Error Handling        | Try-catch, proper messages   | ☐ Pass ☐ Fail |       |
| 5.3  | TypeScript Types      | Proper type definitions      | ☐ Pass ☐ Fail |       |
| 5.4  | Environment Variables | No hardcoded secrets         | ☐ Pass ☐ Fail |       |
| 5.5  | API Calls             | Proper async/await usage     | ☐ Pass ☐ Fail |       |
| 5.6  | State Management      | React Query, proper hooks    | ☐ Pass ☐ Fail |       |
| 5.7  | Code Comments         | Well-documented              | ☐ Pass ☐ Fail |       |
| 5.8  | Naming Conventions    | Clear, consistent names      | ☐ Pass ☐ Fail |       |
| 5.9  | No Console Errors     | Clean browser console        | ☐ Pass ☐ Fail |       |
| 5.10 | Performance           | Fast load, smooth animations | ☐ Pass ☐ Fail |       |

**Code Quality Score:** \_\_\_\_/10 ✓

---

## 📊 FINAL SCORING

| Category             | Score           | Max     | Percentage    |
| -------------------- | --------------- | ------- | ------------- |
| Semantic Search      | \_\_\_\_/12     | 25      | \_\_\_\_%     |
| Auto-Suggestion      | \_\_\_\_/20     | 20      | \_\_\_\_%     |
| Kanban Configuration | \_\_\_\_/25     | 25      | \_\_\_\_%     |
| UI/UX Enhancements   | \_\_\_\_/20     | 20      | \_\_\_\_%     |
| Code Quality         | \_\_\_\_/10     | 10      | \_\_\_\_%     |
| **TOTAL**            | **\_\_\_\_/87** | **100** | **\_\_\_\_%** |

---

## ✅ PASS/FAIL CRITERIA

- **PASS**: >= 80/87 tests pass (92%)
- **ACCEPTABLE**: >= 70/87 tests pass (80%)
- **NEEDS WORK**: < 70/87 tests pass

---

## 🐛 BUGS FOUND

| Bug # | Feature | Description | Severity                   | Status         |
| ----- | ------- | ----------- | -------------------------- | -------------- |
| 1     |         |             | ☐ Critical ☐ Major ☐ Minor | ☐ Fixed ☐ Open |
| 2     |         |             | ☐ Critical ☐ Major ☐ Minor | ☐ Fixed ☐ Open |
| 3     |         |             | ☐ Critical ☐ Major ☐ Minor | ☐ Fixed ☐ Open |

---

## 📝 ADDITIONAL NOTES

**What worked well:**

```
[Space for notes]
```

**What needs improvement:**

```
[Space for notes]
```

**Recommendations:**

```
[Space for notes]
```

---

## 📸 SCREENSHOTS TAKEN

- [ ] Screenshot 1: AI search results
- [ ] Screenshot 2: Suggestions dropdown
- [ ] Screenshot 3: Settings dialog
- [ ] Screenshot 4: Label mapping form
- [ ] Screenshot 5: Gmail synced labels
- [ ] Screenshot 6: Empty states
- [ ] Screenshot 7: Loading states
- [ ] Screenshot 8: All features together

---

## 🎥 VIDEO DEMO

- [ ] Video recorded (< 5 minutes)
- [ ] Shows all 3 main features
- [ ] Clear audio narration
- [ ] High quality (720p+)
- [ ] Shows Gmail sync working

---

**Test Completed:** ☐ Yes ☐ No  
**Ready for Demo:** ☐ Yes ☐ No  
**Ready for Submission:** ☐ Yes ☐ No

**Tester Signature:** **\*\*\*\***\_**\*\*\*\***  
**Date:** **\*\*\*\***\_**\*\*\*\***
