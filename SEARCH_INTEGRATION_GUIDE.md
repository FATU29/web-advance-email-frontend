# Search Integration - Implementation Guide

This document explains the complete search integration in the frontend, including Fuzzy Search, Semantic Search (AI-powered), and Auto-Suggestions.

## 📁 File Structure

```
frontend/
├── services/
│   └── search.service.ts          # Search API service
├── hooks/
│   ├── use-semantic-search.ts     # Semantic search hooks
│   ├── use-search-suggestions.ts  # Suggestions hooks
│   └── use-kanban-search.ts       # Fuzzy search hooks
├── components/email/
│   ├── search-bar.tsx             # Search input with suggestions
│   ├── search-results-view.tsx    # Search results display
│   ├── search-result-card.tsx     # Individual result card
│   └── semantic-search-initializer.tsx  # Semantic search setup component
└── utils/constants/
    └── api.ts                      # API endpoint constants
```

## 🔌 API Endpoints

All endpoints are defined in `utils/constants/api.ts`:

### Fuzzy Search

- **GET** `/api/kanban/search?query={query}&limit={limit}&includeBody={boolean}`
- Fast text-based search with typo tolerance

### Semantic Search

- **GET** `/api/search/semantic/status` - Check availability
- **POST** `/api/search/semantic` - Perform AI search
- **POST** `/api/search/semantic/generate-embeddings` - Generate all embeddings
- **POST** `/api/search/semantic/generate-embedding/{emailId}` - Generate single embedding

### Suggestions

- **GET** `/api/search/suggestions?query={query}&limit={limit}` - Get suggestions
- **GET** `/api/search/contacts` - Get all contacts

## 🎯 Key Features

### 1. Fuzzy Search

- **Speed**: ~50-200ms
- **Typo tolerance**: Finds "marketing" when you type "markting"
- **Partial matching**: Finds "project" when you type "proj"
- **Fields searched**: Subject, sender name, email address, preview/body (optional)

### 2. Semantic Search

- **Speed**: ~1-5 seconds
- **AI-powered**: Uses OpenAI embeddings (1536 dimensions)
- **Conceptual matching**: Search "money" finds "invoice", "payment", "salary"
- **Score range**: 0.15-0.40 (typical), recommended minScore: **0.2**

### 3. Auto-Suggestions

- **Contacts**: Recent senders with email count
- **Keywords**: Common subjects/phrases
- **Recent searches**: Previous search queries
- **Debounced**: 300ms delay for performance

## 🚀 Usage Examples

### Basic Fuzzy Search

```tsx
import { useKanbanSearchQuery } from '@/hooks/use-kanban-search';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useKanbanSearchQuery(query, 20, true);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {isLoading && <p>Searching...</p>}
      {data?.results.map((result) => (
        <div key={result.emailId}>{result.subject}</div>
      ))}
    </div>
  );
}
```

### Semantic Search with Initialization

```tsx
import {
  useSemanticSearchStatusQuery,
  useSemanticSearchMutation,
  useGenerateEmbeddingsMutation,
} from '@/hooks/use-semantic-search';

function SemanticSearchComponent() {
  // 1. Check if semantic search is available
  const { data: status } = useSemanticSearchStatusQuery();

  // 2. Generate embeddings (call once on app startup)
  const generateMutation = useGenerateEmbeddingsMutation();

  // 3. Perform semantic search
  const searchMutation = useSemanticSearchMutation();

  useEffect(() => {
    if (status?.available) {
      // Generate embeddings for all emails
      generateMutation.mutate();
    }
  }, [status?.available]);

  const handleSearch = (query: string) => {
    searchMutation.mutate({
      query,
      limit: 20,
      minScore: 0.2, // Recommended: balanced results
      generateMissingEmbeddings: true, // Auto-generate if missing
    });
  };

  return (
    <div>
      <button onClick={() => handleSearch('marketing')}>
        Search for marketing emails
      </button>
      {searchMutation.data?.results.map((result) => (
        <div key={result.emailId}>
          {result.subject} - Score: {result.similarityScore.toFixed(3)}
        </div>
      ))}
    </div>
  );
}
```

### Auto-Suggestions

```tsx
import { useSearchSuggestionsQuery } from '@/hooks/use-search-suggestions';
import { useDebounce } from '@/hooks/useDebounce';

function SearchWithSuggestions() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions } = useSearchSuggestionsQuery(
    debouncedQuery,
    5,
    true // enabled
  );

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />

      {suggestions?.contacts.map((contact) => (
        <div
          key={contact.email}
          onClick={() => setQuery(`from:${contact.email}`)}
        >
          {contact.name} - {contact.emailCount} emails
        </div>
      ))}

      {suggestions?.keywords.map((kw) => (
        <div key={kw.keyword} onClick={() => setQuery(kw.keyword)}>
          {kw.keyword} ({kw.frequency})
        </div>
      ))}
    </div>
  );
}
```

### Combined Search (Both Fuzzy + Semantic)

See `components/email/search-results-view.tsx` for the complete implementation.

```tsx
function CombinedSearch() {
  const [mode, setMode] = useState<'fuzzy' | 'semantic' | 'both'>('both');

  // Fuzzy search
  const fuzzyQuery = useKanbanSearchQuery(
    query,
    50,
    true,
    mode === 'fuzzy' || mode === 'both'
  );

  // Semantic search
  const semanticMutation = useSemanticSearchMutation();

  useEffect(() => {
    if (mode === 'semantic' || mode === 'both') {
      semanticMutation.mutate({
        query,
        limit: 50,
        minScore: 0.2,
      });
    }
  }, [query, mode]);

  // Combine results by emailId
  const results = useMemo(() => {
    if (mode === 'both') {
      const map = new Map();
      fuzzyQuery.data?.results.forEach((r) => map.set(r.emailId, r));
      semanticMutation.data?.results.forEach((r) => map.set(r.emailId, r));
      return Array.from(map.values());
    }
    // ... handle other modes
  }, [mode, fuzzyQuery.data, semanticMutation.data]);
}
```

## 🎨 Components

### SemanticSearchInitializer

Use this component to set up semantic search on app startup or user login:

```tsx
import { SemanticSearchInitializer } from '@/components/email/semantic-search-initializer';

function AppLayout() {
  const [showInit, setShowInit] = useState(true);

  return (
    <div>
      <SemanticSearchInitializer
        show={showInit}
        onComplete={() => setShowInit(false)}
        autoInitialize={false} // Set true to auto-generate embeddings
      />
      {/* Rest of your app */}
    </div>
  );
}
```

### SearchBar

Full-featured search input with suggestions:

```tsx
import { SearchBar } from '@/components/email/search-bar';

function MyComponent() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'fuzzy' | 'semantic' | 'both'>('both');

  return (
    <SearchBar
      value={query}
      onChange={setQuery}
      onSearch={(q) => console.log('Search:', q)}
      onClear={() => setQuery('')}
      searchMode={mode}
      onSearchModeChange={setMode}
      showSuggestions={true}
      placeholder="Search emails..."
    />
  );
}
```

### SearchResultsView

Complete search interface with results:

```tsx
import { SearchResultsView } from '@/components/email/search-results-view';

function MailPage() {
  const [showSearch, setShowSearch] = useState(false);

  return showSearch ? (
    <SearchResultsView
      onBack={() => setShowSearch(false)}
      onViewEmail={(emailId) => console.log('View:', emailId)}
      onStar={(emailId, starred) => console.log('Star:', emailId, starred)}
    />
  ) : (
    <div>Normal email view</div>
  );
}
```

## ⚙️ Configuration

### minScore Values for Semantic Search

| minScore | Use Case        | Description                     |
| -------- | --------------- | ------------------------------- |
| 0.15     | Broad           | Include loosely related results |
| **0.2**  | **Recommended** | Good balance of relevance       |
| 0.25     | Strict          | Only highly relevant results    |
| 0.3+     | Very Strict     | May return few/no results       |

**Why 0.2?** OpenAI embeddings typically produce similarity scores in the 0.15-0.40 range for related content. A minScore of 0.2 provides a good balance.

### Debounce Timing

- **Suggestions**: 300ms (set in `search-bar.tsx`)
- **Search**: Immediate (on Enter key or button click)

## 🔄 Data Flow

### Fuzzy Search Flow

1. User types query
2. Debounced query triggers `useKanbanSearchQuery`
3. React Query fetches from `/api/kanban/search`
4. Results cached for 30 seconds
5. Display results

### Semantic Search Flow

1. Check availability: `useSemanticSearchStatusQuery()`
2. Generate embeddings: `useGenerateEmbeddingsMutation()`
3. User performs search: `useSemanticSearchMutation()`
4. Backend calculates cosine similarity
5. Results filtered by minScore
6. Display with similarity scores

### Suggestions Flow

1. User types (minimum 2 characters)
2. Debounce 300ms
3. `useSearchSuggestionsQuery` fetches suggestions
4. Display categorized: Contacts, Keywords, Recent
5. Click suggestion → trigger search

## 🐛 Error Handling

### Semantic Search Not Available

```tsx
const handleSearch = () => {
  semanticMutation.mutate(request, {
    onError: (error) => {
      if (error.message?.includes('not available')) {
        toast.error('AI search is not available. Using text search.');
        setMode('fuzzy'); // Fallback to fuzzy
      }
    },
  });
};
```

### Missing Embeddings

```tsx
// Option 1: Auto-generate on search
searchMutation.mutate({
  query,
  generateMissingEmbeddings: true, // Automatically generate if missing
});

// Option 2: Show warning and manual trigger
if (response.emailsWithoutEmbeddings > 0) {
  toast.info(
    `${response.emailsWithoutEmbeddings} emails need indexing. ` +
      `Click "Generate Embeddings" to enable full search.`
  );
}
```

## 📊 Performance Tips

### Fuzzy Search

- Set appropriate `limit` (default: 20, max: 100)
- Use `includeBody: false` for faster searches
- Results are cached for 30 seconds

### Semantic Search

- Generate embeddings once at startup
- Use `generateMissingEmbeddings: true` for new emails
- Set reasonable `minScore` (0.2 recommended)
- Results take 1-5 seconds (AI processing)

### Suggestions

- Debounce at 300ms
- Limit to 5 per category
- Cache for 30 seconds
- Only fetch for queries ≥ 2 characters

## 🔐 Authentication

All endpoints require authentication via Bearer token:

```tsx
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

The `axiosBI` instance (used by all services) automatically adds this header from the auth context.

## 🎯 Best Practices

1. **Initialize semantic search early**: Call on app startup or login
2. **Use "both" mode as default**: Provides best user experience
3. **Show similarity scores**: Help users understand relevance
4. **Provide mode toggle**: Let users switch between fuzzy/semantic
5. **Handle availability gracefully**: Fall back to fuzzy if semantic unavailable
6. **Cache results**: React Query handles this automatically
7. **Debounce suggestions**: Prevent excessive API calls

## 🧪 Testing

### Test Fuzzy Search

```bash
# Search with typo
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/kanban/search?query=markting&limit=10"
```

### Test Semantic Search

```bash
# Check status
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/search/semantic/status"

# Generate embeddings
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/search/semantic/generate-embeddings"

# Search
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"money","limit":20,"minScore":0.2}' \
  "http://localhost:3000/api/search/semantic"
```

### Test Suggestions

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/search/suggestions?query=john&limit=5"
```

## 📚 Additional Resources

- Backend API Documentation: `backend/SEARCH_FRONTEND_INTEGRATION.md`
- Semantic Search Testing: `frontend/SEMANTIC_SEARCH_TESTING_GUIDE.md`
- Kanban Integration: `frontend/KANBAN_INTEGRATION_GUIDE.md`

## 🆘 Troubleshooting

### Semantic search returns no results

- Check minScore (try 0.15 instead of 0.2)
- Verify embeddings are generated
- Check AI service is running
- Look at similarity scores in response

### Suggestions not appearing

- Ensure query is ≥ 2 characters
- Check network tab for API errors
- Verify debounce is working (300ms)
- Check suggestions data in React Query DevTools

### Fuzzy search too slow

- Reduce limit parameter
- Set includeBody: false
- Check backend logs for performance issues

---

**Last Updated**: December 24, 2025
**API Version**: v1
**Frontend Version**: Next.js 14
