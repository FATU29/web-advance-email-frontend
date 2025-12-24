# Search API - Quick Reference Card

## 🔍 Search Modes

| Mode         | Speed              | Best For          | Example                          |
| ------------ | ------------------ | ----------------- | -------------------------------- |
| **Fuzzy**    | ⚡ Fast (50-200ms) | Exact text, typos | "markting" → finds "marketing"   |
| **Semantic** | 🐢 Slow (1-5s)     | Concepts, meaning | "money" → finds invoices, salary |
| **Both**     | Medium             | Best results      | Combined fuzzy + semantic        |

## 📡 API Endpoints

### Fuzzy Search

```typescript
GET /api/kanban/search?query=marketing&limit=20&includeBody=true
```

### Semantic Search

```typescript
// Check availability
GET /api/search/semantic/status

// Generate embeddings (run once)
POST /api/search/semantic/generate-embeddings

// Search
POST /api/search/semantic
Body: { query: "marketing", limit: 20, minScore: 0.2 }
```

### Suggestions

```typescript
GET /api/search/suggestions?query=john&limit=5
GET /api/search/contacts
```

## 🎣 React Hooks

### Fuzzy Search

```typescript
import { useKanbanSearchQuery } from '@/hooks/use-kanban-search';

const { data, isLoading } = useKanbanSearchQuery(
  query, // search query
  20, // limit
  true, // includeBody
  enabled // enabled flag
);
```

### Semantic Search

```typescript
import {
  useSemanticSearchStatusQuery,
  useSemanticSearchMutation,
  useGenerateEmbeddingsMutation,
} from '@/hooks/use-semantic-search';

// Check status
const { data: status } = useSemanticSearchStatusQuery();

// Generate embeddings
const generate = useGenerateEmbeddingsMutation();
generate.mutate(); // Call once

// Search
const search = useSemanticSearchMutation();
search.mutate({
  query: 'marketing',
  limit: 20,
  minScore: 0.2, // ⭐ Recommended: 0.2
  generateMissingEmbeddings: true,
});
```

### Suggestions

```typescript
import { useSearchSuggestionsQuery } from '@/hooks/use-search-suggestions';

const { data } = useSearchSuggestionsQuery(query, 5, true);
// data.contacts, data.keywords, data.recentSearches
```

## 🧩 Components

### Search Bar

```tsx
import { SearchBar } from '@/components/email/search-bar';

<SearchBar
  value={query}
  onChange={setQuery}
  onSearch={(q) => handleSearch(q)}
  onClear={() => setQuery('')}
  searchMode="both"
  onSearchModeChange={setMode}
  showSuggestions={true}
/>;
```

### Search Results View

```tsx
import { SearchResultsView } from '@/components/email/search-results-view';

<SearchResultsView
  onBack={() => setShowSearch(false)}
  onViewEmail={(id) => router.push(`/mail/${id}`)}
  onStar={(id, starred) => console.log('Star:', id, starred)}
/>;
```

### Semantic Search Initializer

```tsx
import { SemanticSearchInitializer } from '@/components/email/semantic-search-initializer';

<SemanticSearchInitializer
  show={true}
  autoInitialize={false}
  onComplete={() => toast.success('Ready!')}
/>;
```

## ⚙️ Configuration

### minScore Values (Semantic Search)

| Value   | Results       | Use Case           |
| ------- | ------------- | ------------------ |
| 0.15    | More results  | Broad search       |
| **0.2** | **Balanced**  | **⭐ Recommended** |
| 0.25    | Fewer results | Strict matching    |
| 0.3+    | Very few      | Very strict        |

### Why 0.2?

OpenAI embeddings typically score 0.15-0.40 for related content. Using 0.2 provides good balance.

## 🔄 Initialization Flow

```typescript
// 1. Check if available
const { data: status } = useSemanticSearchStatusQuery();

// 2. Generate embeddings (once on startup)
useEffect(() => {
  if (status?.available) {
    generateMutation.mutate();
  }
}, [status?.available]);

// 3. Search
searchMutation.mutate({
  query: 'marketing',
  minScore: 0.2,
  generateMissingEmbeddings: true, // Auto-generate if missing
});
```

## 🎯 Search Examples

### Fuzzy Search Examples

- ❌ "markting" → ✅ finds "marketing" (typo)
- ❌ "proj" → ✅ finds "project" (partial)
- ❌ "jon" → ✅ finds "John" (typo)

### Semantic Search Examples

- 🔍 "money" → 💰 invoice, payment, salary, price, budget
- 🔍 "meeting" → 📅 appointment, schedule, calendar, call
- 🔍 "urgent" → ⚡ deadline, ASAP, important, priority
- 🔍 "work" → 💼 project, task, assignment, job

## 🐛 Error Handling

```typescript
searchMutation.mutate(request, {
  onError: (error) => {
    if (error.message?.includes('not available')) {
      toast.error('AI search unavailable. Using text search.');
      setMode('fuzzy'); // Fallback
    }
  },
});
```

## 📊 Response Types

### Fuzzy Search Result

```typescript
{
  id: string;
  emailId: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  preview: string;
  score: number;          // 0.0 - 1.0
  matchedFields: string[]; // ["subject", "fromName"]
  // ... more fields
}
```

### Semantic Search Result

```typescript
{
  emailId: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  preview: string;
  similarityScore: number; // 0.15 - 0.40 typical
  columnId: string;
  columnName: string;
  // ... more fields
}
```

### Suggestion Response

```typescript
{
  contacts: [{
    email: string;
    name: string;
    emailCount: number;
  }];
  keywords: [{
    keyword: string;
    frequency: number;
  }];
  recentSearches: string[];
}
```

## 🚀 Performance Tips

1. **Fuzzy Search**: Use `includeBody: false` for faster results
2. **Semantic Search**: Generate embeddings once at startup
3. **Suggestions**: Auto-debounced at 300ms
4. **Caching**: Results cached for 30 seconds (React Query)
5. **Limits**: Use reasonable limits (20-50) for better performance

## 📚 Documentation

- Full Guide: `frontend/SEARCH_INTEGRATION_GUIDE.md`
- Summary: `frontend/SEARCH_INTEGRATION_SUMMARY.md`
- Backend API: `backend/SEARCH_FRONTEND_INTEGRATION.md`

---

**Quick Start**: Copy-paste examples above and adjust as needed!
