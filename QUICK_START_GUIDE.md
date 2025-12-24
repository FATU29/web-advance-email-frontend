# Quick Start Guide - Search & Gmail Label Features

## 🚀 Getting Started

### Prerequisites

- Backend running on `http://localhost:8080` (or configured API URL)
- Frontend running on `http://localhost:3000`
- Gmail account connected (for label mapping)
- OpenAI API key configured (optional, for semantic search)

---

## 📖 User Guide

### 1. Using Search Features

#### Text Search (Fuzzy)

1. Click on the **Search** icon or press `Ctrl+K` (if hotkey enabled)
2. Type your search query (e.g., "project update")
3. See real-time suggestions appear:
   - 👤 **Contacts**: Click to search emails from that person
   - #️⃣ **Keywords**: Popular subjects from your emails
   - 🕐 **Recent**: Your previous searches
4. Press **Enter** or click **Search** button
5. View results with matched fields highlighted
6. Click any result to view the full email

**Tips**:

- ✅ Typos are okay: "markting" will find "marketing"
- ✅ Partial words work: "proj" will find "project"
- ✅ Searches: subject, sender name, sender email, preview

#### AI Search (Semantic)

1. Click the **AI** toggle button (⚡ icon)
2. Type conceptual queries (e.g., "money problems", "urgent tasks")
3. AI will find related emails even without exact matches
4. See processing time and similarity scores
5. Results ranked by relevance

**When to use**:

- 🎯 Finding emails by topic/concept
- 🔍 When you don't remember exact keywords
- 💡 Discovering related correspondence

#### Keyboard Shortcuts

- `↑` / `↓` - Navigate suggestions
- `Enter` - Select suggestion or search
- `Esc` - Close suggestions

---

### 2. Gmail Label Mapping

#### Setup Column Label Mapping

1. Open **Kanban Board**
2. Click **Settings** icon (⚙️)
3. Find the column you want to configure
4. Click **Add Mapping** or **Edit Mapping**
5. Configure:
   - **Primary Label**: Main label to add (e.g., "To Do")
   - **Additional Labels**: Extra labels to add (e.g., "STARRED")
   - **Labels to Remove**: Labels to remove (e.g., "INBOX", "UNREAD")
6. Click **Save Mapping**

#### Common Configurations

**"Done" Column** - Archive completed emails

```
Primary Label: [Your "Done" label]
Remove Labels: INBOX, UNREAD
```

_Effect_: Email archived and marked as read

**"Important" Column** - Star important emails

```
Primary Label: Important
Add Labels: STARRED
```

_Effect_: Email starred and labeled as important

**"To Do" Column** - Keep in inbox with label

```
Primary Label: To Do
Remove Labels: (none)
```

_Effect_: Email stays in inbox but gets "To Do" label

**"Trash" Column** - Move to trash

```
Primary Label: (none)
Add Labels: TRASH
Remove Labels: INBOX
```

_Effect_: Email moved to Gmail trash

#### How It Works

- 🔄 When you drag an email to a column
- 🏷️ Configured labels are automatically applied in Gmail
- ⚡ Changes sync in background (non-blocking)
- ❌ Sync failures don't block the move operation

---

## 🎨 UI Features

### Search Bar

- **Toggle Buttons**: Switch between Text and AI search
- **Suggestion Dropdown**: Auto-appears when typing (2+ chars)
- **Clear Button**: Quick reset (appears when text entered)
- **Loading Spinner**: Shows during search
- **Search Button**: Trigger search manually

### Search Results

- **Result Cards**: Click to view full email
- **Star Icon**: Toggle starred status
- **Preview**: First 200 characters of email
- **Metadata**: Sender, date, attachments indicator
- **Score**: Relevance score (fuzzy) or similarity (semantic)
- **Matched Fields**: Which fields matched your query

### Label Mapping UI

- **Column List**: All your Kanban columns
- **Label Badges**: Click to select/deselect
- **Grouped Labels**: System labels vs Your labels
- **Status Indicator**: Shows if Gmail connected
- **Inline Editing**: Edit column names directly

---

## 🔧 Troubleshooting

### Search Issues

**Suggestions Not Appearing**

- ✅ Ensure query is 2+ characters
- ✅ Check internet connection
- ✅ Verify backend is running

**Semantic Search Unavailable**

- ✅ Check if OpenAI API key is configured in backend
- ✅ Fallback to Text search works automatically
- ✅ Status shown in UI: "AI search not available"

**No Results Found**

- ✅ Try different keywords
- ✅ Check spelling (though fuzzy search handles typos)
- ✅ Try semantic search for concept-based queries

### Label Mapping Issues

**"Gmail Not Connected" Message**

- ✅ Go to Settings → Connect Gmail
- ✅ Complete OAuth flow
- ✅ Refresh the page

**Labels Not Syncing**

- ✅ Check Gmail connection status
- ✅ Verify you have permission to modify labels
- ✅ Check backend logs for sync errors
- ✅ Try re-saving the column mapping

**Missing Gmail Labels**

- ✅ Labels are fetched when settings dialog opens
- ✅ Create labels in Gmail first, then refresh
- ✅ System labels always available (INBOX, STARRED, etc.)

---

## 💡 Pro Tips

### Search Power Tips

1. **Combine keywords**: "john invoice" finds emails from John about invoices
2. **Use suggestions**: Click suggested contacts for instant filtering
3. **Switch modes**: Start with fuzzy, use semantic if no results
4. **Keyboard navigation**: Much faster than clicking

### Label Mapping Power Tips

1. **Archive pattern**: Remove "INBOX" and "UNREAD" labels
2. **Star important**: Add "STARRED" to your Important column
3. **Multi-step workflow**: Create columns for each step with unique labels
4. **Cleanup**: Use "Trash" column with "TRASH" label to delete
5. **Keep organized**: Map each column to a unique label for easy Gmail filtering

---

## 📊 Performance Notes

### Search Performance

- **Fuzzy search**: ~100-500ms (instant)
- **Semantic search**: ~200-1000ms (depends on email count)
- **Suggestions**: ~50-200ms (debounced)

### Optimization

- Results cached for 30 seconds
- Suggestions cached for 30 seconds
- Gmail labels cached for 5 minutes
- Automatic retry on transient failures

---

## 🎯 Best Practices

### Search

1. ✅ Start with fuzzy search (faster, most cases)
2. ✅ Use semantic for discovery and topic-based searches
3. ✅ Leverage suggestions for quick filtering
4. ✅ Keep queries concise (2-5 words optimal)

### Label Mapping

1. ✅ Map each column to a unique Gmail label
2. ✅ Use system labels (STARRED, TRASH) strategically
3. ✅ Remove INBOX to "archive" emails
4. ✅ Remove UNREAD to mark as read
5. ✅ Test mapping with a single email first
6. ✅ Don't map too many labels at once (keep it simple)

---

## 🔐 Privacy & Security

### Search

- All search happens server-side
- No search data stored permanently
- Semantic embeddings stored in database (can be deleted)

### Gmail Labels

- Label sync uses Gmail API with OAuth 2.0
- No passwords stored, only refresh tokens
- Tokens encrypted at rest
- You can revoke access anytime in Google Account settings

---

## 📞 Need Help?

### Common Questions

**Q: Can I search archived emails?**  
A: Yes, search works across all emails in your Kanban board.

**Q: Does semantic search work offline?**  
A: No, it requires OpenAI API (backend feature).

**Q: Can I undo a label mapping?**  
A: Yes, click "Clear Mapping" or re-configure the column.

**Q: Are label changes reversible?**  
A: Yes, you can manually change labels in Gmail or move email to different column.

**Q: How many suggestions can I see?**  
A: Up to 5 per category (contacts, keywords, recent searches).

**Q: Can I disable semantic search?**  
A: It's automatically disabled if OpenAI is not configured. You can always use fuzzy search.

---

## 🎉 Enjoy Your Enhanced Email Experience!

Both features are designed to make your email management faster, smarter, and more organized. Experiment with different search modes and label mappings to find what works best for your workflow!

**Happy searching! 🔍✨**
