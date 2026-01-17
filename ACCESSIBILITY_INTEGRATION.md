# Accessibility Integration Example

## Quick Integration Guide

### Step 1: Add Skip Navigation to Root Layout

```tsx
// app/layout.tsx
import { SkipNavigation } from '@/components/accessibility';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SkipNavigation />
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Add Keyboard Shortcuts Dialog to Header

```tsx
// components/email/header.tsx
import { KeyboardShortcutsDialog } from '@/components/accessibility';
import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmailHeader() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Email Client</h1>

      <div className="flex items-center gap-2">
        {/* Other buttons */}

        <KeyboardShortcutsDialog
          trigger={
            <Button variant="ghost" size="sm">
              <Keyboard className="size-4 mr-2" />
              Shortcuts (?)
            </Button>
          }
        />
      </div>
    </header>
  );
}
```

### Step 3: Wrap Main Sections with Accessibility Components

```tsx
// app/(routes)/mail/[folder]/page.tsx
import {
  MainContent,
  NavigationWrapper,
  EmailListWrapper,
} from '@/components/accessibility';

export default function MailFolderPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar with Skip target */}
      <NavigationWrapper className="w-64 border-r">
        <Sidebar />
      </NavigationWrapper>

      {/* Main content area */}
      <MainContent className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <SearchBar />
        </div>

        {/* Email list with Skip target */}
        <EmailListWrapper className="flex-1 overflow-auto">
          <EmailList emails={emails} />
        </EmailListWrapper>
      </MainContent>
    </div>
  );
}
```

### Step 4: Add Screen Reader Announcements

```tsx
// components/email/email-list.tsx
import { useAnnounce } from '@/components/accessibility';

export function EmailList() {
  const { announce, AnnouncementRegion } = useAnnounce();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEmails = async () => {
    setLoading(true);
    announce('Loading emails...');

    try {
      const data = await fetchEmails();
      setEmails(data);
      announce(`${data.length} emails loaded`);
    } catch (error) {
      announce('Failed to load emails', 'assertive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {emails.map((email) => (
        <EmailItem key={email.id} email={email} />
      ))}
      {AnnouncementRegion}
    </div>
  );
}
```

### Step 5: Add Focus Trap to Dialogs

```tsx
// components/email/compose-email-dialog.tsx
import { FocusTrap } from '@/components/accessibility';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function ComposeEmailDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <FocusTrap active={open} onEscape={() => onOpenChange(false)}>
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="To" />
            <input type="text" placeholder="Subject" />
            <textarea placeholder="Message" />
            <button type="submit">Send</button>
          </form>
        </FocusTrap>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 6: Improve Button Accessibility

```tsx
// Before
<button onClick={handleStar}>
  <Star />
</button>;

// After
import { ScreenReaderOnly } from '@/components/accessibility';

<button
  onClick={handleStar}
  aria-label={isStarred ? 'Remove star' : 'Add star'}
  aria-pressed={isStarred}
>
  <Star aria-hidden="true" />
  <ScreenReaderOnly>
    {isStarred ? 'Remove star from email' : 'Star this email'}
  </ScreenReaderOnly>
</button>;
```

### Step 7: Add Loading States

```tsx
import { LiveRegion } from '@/components/accessibility';

export function EmailDetail() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {loading && (
        <LiveRegion priority="polite">Loading email content...</LiveRegion>
      )}

      <div aria-busy={loading}>{/* Email content */}</div>
    </div>
  );
}
```

## Complete Example: Accessible Email Item

```tsx
import { ScreenReaderOnly } from '@/components/accessibility';
import { formatDate } from '@/lib/utils';

export function EmailItem({ email, isSelected, onSelect }) {
  return (
    <article
      role="article"
      aria-label={`Email from ${email.sender}`}
      className={cn(
        'p-4 border-b cursor-pointer',
        'hover:bg-muted/50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary',
        isSelected && 'bg-primary/10'
      )}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      aria-selected={isSelected}
    >
      {/* Unread indicator */}
      {!email.isRead && (
        <>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full"
            aria-hidden="true"
          />
          <ScreenReaderOnly>Unread</ScreenReaderOnly>
        </>
      )}

      {/* Sender */}
      <div className="font-semibold">
        {email.sender}
        <ScreenReaderOnly>, sender</ScreenReaderOnly>
      </div>

      {/* Subject */}
      <div className="text-sm">
        {email.subject}
        <ScreenReaderOnly>, subject</ScreenReaderOnly>
      </div>

      {/* Date */}
      <time dateTime={email.date} className="text-xs text-muted-foreground">
        {formatDate(email.date)}
        <ScreenReaderOnly>, received</ScreenReaderOnly>
      </time>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar(email.id);
          }}
          aria-label={email.isStarred ? 'Remove star' : 'Add star'}
          aria-pressed={email.isStarred}
        >
          <Star className={email.isStarred ? 'fill-yellow-500' : ''} />
          <ScreenReaderOnly>
            {email.isStarred ? 'Remove star' : 'Star email'}
          </ScreenReaderOnly>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(email.id);
          }}
          aria-label="Delete email"
        >
          <Trash />
          <ScreenReaderOnly>Delete email</ScreenReaderOnly>
        </button>
      </div>
    </article>
  );
}
```

## Testing Checklist

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Shift+Tab goes backwards
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate lists
- [ ] Escape closes dialogs
- [ ] All shortcuts work (?, j, k, etc.)

### Screen Reader

- [ ] All images have alt text
- [ ] Icon buttons have labels
- [ ] Loading states announced
- [ ] Error messages announced
- [ ] Focus changes announced
- [ ] Lists have proper roles

### Visual

- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Text resizable to 200%
- [ ] No content lost when zoomed
- [ ] Works without color

### Forms

- [ ] Labels associated with inputs
- [ ] Error messages clear
- [ ] Required fields marked
- [ ] Success messages shown

## Common Patterns

### Pattern 1: Accessible Icon Button

```tsx
<button aria-label="Send email">
  <Send className="size-4" aria-hidden="true" />
</button>
```

### Pattern 2: Status Message

```tsx
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

### Pattern 3: Error Alert

```tsx
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### Pattern 4: Loading State

```tsx
<div aria-busy={loading} aria-label="Loading emails">
  {loading ? <Spinner /> : <EmailList />}
</div>
```

### Pattern 5: Expandable Section

```tsx
<button
  aria-expanded={isExpanded}
  aria-controls="details-section"
  onClick={toggle}
>
  Show details
</button>
<div id="details-section" hidden={!isExpanded}>
  {/* Details content */}
</div>
```

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Keyboard Accessibility](https://webaim.org/articles/keyboard/)
- [React Accessibility Guide](https://react.dev/learn/accessibility)

---

**Remember:** Accessibility is not optional - it's essential! 🌟
