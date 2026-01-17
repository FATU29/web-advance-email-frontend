# Accessibility Features Guide

## 🎯 Tổng Quan

Ứng dụng Email Client được xây dựng với đầy đủ tính năng hỗ trợ accessibility (a11y) để đảm bảo mọi người dùng đều có thể sử dụng hiệu quả, bao gồm người dùng chỉ sử dụng bàn phím, người dùng screen reader, và người dùng có nhu cầu đặc biệt.

## ⌨️ Keyboard Shortcuts (Phím tắt)

### Navigation (Di chuyển)

- `j` hoặc `↓` - Email tiếp theo
- `k` hoặc `↑` - Email trước đó
- `Enter` - Mở email đang chọn
- `Esc` - Đóng email detail

### Email Actions (Hành động)

- `r` - Reply (Trả lời)
- `Shift + r` - Reply all (Trả lời tất cả)
- `a` - Archive (Lưu trữ)
- `s` - Star/Unstar (Đánh dấu sao)
- `d` hoặc `#` - Delete (Xóa)
- `u` - Mark unread (Đánh dấu chưa đọc)
- `f` - Forward (Chuyển tiếp)

### Go to Folder (Chuyển thư mục)

- `g` + `i` - Go to Inbox
- `g` + `t` - Go to Sent
- `g` + `d` - Go to Drafts
- `Shift + i` - Quick jump to Inbox
- `Shift + t` - Quick jump to Sent
- `Shift + d` - Quick jump to Drafts

### Global Shortcuts (Phím tắt toàn cục)

- `Ctrl + K` (Mac: `Cmd + K`) - Mở tìm kiếm
- `Ctrl + N` (Mac: `Cmd + N`) - Soạn email mới
- `Ctrl + B` (Mac: `Cmd + B`) - Toggle sidebar
- `Ctrl + Enter` - Gửi email (trong compose dialog)
- `?` - Hiển thị danh sách phím tắt

### Search Suggestions (Gợi ý tìm kiếm)

- `↑` - Gợi ý trước
- `↓` - Gợi ý tiếp theo
- `Enter` - Chọn gợi ý
- `Esc` - Đóng dropdown

## 🎨 Components Accessibility

### 1. Keyboard Shortcuts Dialog

Component hiển thị tất cả phím tắt có sẵn:

```tsx
import { KeyboardShortcutsDialog } from '@/components/accessibility';

// Sử dụng với trigger button
<KeyboardShortcutsDialog />

// Hoặc với custom trigger
<KeyboardShortcutsDialog
  trigger={<Button>Show Shortcuts</Button>}
/>
```

**Features:**

- ✅ Tự động mở khi nhấn `?`
- ✅ Keyboard navigation hoàn chỉnh
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Scroll area cho nội dung dài

### 2. Skip Navigation

Cho phép keyboard users bỏ qua các phần không cần thiết và nhảy thẳng đến nội dung chính:

```tsx
import {
  SkipNavigation,
  MainContent,
  NavigationWrapper,
  EmailListWrapper,
} from '@/components/accessibility';

export default function Layout() {
  return (
    <>
      {/* Skip links - chỉ hiển thị khi focus */}
      <SkipNavigation />

      <div>
        {/* Sidebar Navigation */}
        <NavigationWrapper>
          <Sidebar />
        </NavigationWrapper>

        {/* Main Content */}
        <MainContent>
          {/* Email List */}
          <EmailListWrapper>
            <EmailList />
          </EmailListWrapper>
        </MainContent>
      </div>
    </>
  );
}
```

**Cách hoạt động:**

1. Nhấn `Tab` khi vào trang lần đầu
2. Thấy các skip links ở đầu trang
3. Nhấn `Enter` để nhảy đến section tương ứng

### 3. Focus Trap

Giữ focus trong modal/dialog để keyboard navigation dễ dàng hơn:

```tsx
import { FocusTrap } from '@/components/accessibility';

export function MyDialog({ onClose }) {
  return (
    <FocusTrap active={true} onEscape={onClose}>
      <div>
        <h2>Dialog Title</h2>
        <button>Button 1</button>
        <button>Button 2</button>
        <button onClick={onClose}>Close</button>
      </div>
    </FocusTrap>
  );
}
```

**Features:**

- ✅ Tab cycling (Tab đến cuối thì quay lại đầu)
- ✅ Shift+Tab backwards navigation
- ✅ Escape key support
- ✅ Auto-focus first element

### 4. Screen Reader Support

Components hỗ trợ screen reader users:

```tsx
import {
  ScreenReaderOnly,
  LiveRegion,
  useAnnounce
} from '@/components/accessibility';

// Screen Reader Only text
<button>
  <Icon />
  <ScreenReaderOnly>Send Email</ScreenReaderOnly>
</button>

// Live Region cho dynamic updates
<LiveRegion priority="polite">
  {loadingMessage}
</LiveRegion>

// Hook để announce changes
function MyComponent() {
  const { announce, AnnouncementRegion } = useAnnounce();

  const handleAction = () => {
    // Do something
    announce('Email sent successfully');
  };

  return (
    <>
      <button onClick={handleAction}>Send</button>
      {AnnouncementRegion}
    </>
  );
}
```

## 🔧 Implementation Examples

### Example 1: Add Keyboard Shortcuts to Page

```tsx
'use client';

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { KeyboardShortcutsDialog } from '@/components/accessibility';

export default function MailPage() {
  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onNextEmail: () => console.log('Next'),
    onPreviousEmail: () => console.log('Previous'),
    onOpenEmail: () => console.log('Open'),
    onCompose: () => console.log('Compose'),
    onSearch: () => console.log('Search'),
    // ... more handlers
  });

  return (
    <div>
      <header>
        <KeyboardShortcutsDialog />
      </header>
      {/* content */}
    </div>
  );
}
```

### Example 2: Accessible Email List

```tsx
import { EmailListWrapper } from '@/components/accessibility';

export function EmailList({ emails }) {
  return (
    <EmailListWrapper>
      <ul role="list" aria-label="Email list">
        {emails.map((email, index) => (
          <li
            key={email.id}
            role="listitem"
            aria-posinset={index + 1}
            aria-setsize={emails.length}
          >
            <EmailItem email={email} />
          </li>
        ))}
      </ul>
    </EmailListWrapper>
  );
}
```

### Example 3: Announce Loading States

```tsx
import { useAnnounce } from '@/components/accessibility';

export function EmailDetail() {
  const { announce, AnnouncementRegion } = useAnnounce();
  const [loading, setLoading] = useState(false);

  const loadEmail = async () => {
    setLoading(true);
    announce('Loading email...');

    try {
      await fetchEmail();
      announce('Email loaded successfully');
    } catch (error) {
      announce('Failed to load email', 'assertive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={loadEmail}>Load Email</button>
      {AnnouncementRegion}
    </>
  );
}
```

## 📋 ARIA Labels Checklist

Đảm bảo các elements quan trọng có ARIA labels:

### Buttons

```tsx
// Icon buttons cần label
<button aria-label="Delete email">
  <TrashIcon />
</button>

// Hoặc dùng ScreenReaderOnly
<button>
  <TrashIcon />
  <ScreenReaderOnly>Delete email</ScreenReaderOnly>
</button>
```

### Forms

```tsx
<input
  type="text"
  aria-label="Search emails"
  aria-describedby="search-hint"
/>
<span id="search-hint" className="sr-only">
  Type to search by subject, sender, or content
</span>
```

### Regions

```tsx
<nav aria-label="Main navigation">...</nav>
<main aria-label="Email content">...</main>
<aside aria-label="Email preview">...</aside>
```

## 🎯 Testing Accessibility

### 1. Keyboard-only Navigation

- Disconnect mouse
- Use only `Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow keys`
- Verify all functionality accessible

### 2. Screen Reader Testing

- **Windows**: NVDA (free)
- **Mac**: VoiceOver (built-in, `Cmd+F5`)
- **Linux**: Orca

### 3. Automated Testing

```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run in development
```

### 4. Browser DevTools

- Chrome: Lighthouse Accessibility audit
- Firefox: Accessibility Inspector
- Check for ARIA issues, color contrast, etc.

## 🌟 Best Practices

### 1. Focus Management

- Visible focus indicators (outline/ring)
- Logical tab order
- Return focus after actions

### 2. Color Contrast

- Text: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

### 3. Semantic HTML

```tsx
// ✅ Good
<button onClick={handleClick}>Submit</button>

// ❌ Bad
<div onClick={handleClick}>Submit</div>
```

### 4. Alternative Text

```tsx
// ✅ Images
<img src="..." alt="Email from John about meeting" />

// ✅ Icon buttons
<button aria-label="Star this email">
  <StarIcon aria-hidden="true" />
</button>
```

### 5. Error Messages

```tsx
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? 'error-msg' : undefined}
/>;
{
  hasError && (
    <span id="error-msg" role="alert">
      Invalid email address
    </span>
  );
}
```

## 📱 Mobile Accessibility

### Touch Targets

- Minimum 44x44px touch targets
- Adequate spacing between interactive elements

### Gestures

- Provide alternatives to gesture-only actions
- Support standard gestures (tap, swipe)

## 🔍 Resources

### Official Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Testing

- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Keyboard Accessibility](https://webaim.org/articles/keyboard/)

---

## 🎉 Summary

Accessibility features đã được tích hợp:

✅ **Keyboard Shortcuts** - Navigation & actions hoàn chỉnh  
✅ **Skip Navigation** - Jump to content nhanh chóng  
✅ **Focus Management** - Focus trap cho dialogs  
✅ **Screen Reader Support** - ARIA labels & live regions  
✅ **Semantic HTML** - Proper HTML5 elements  
✅ **Color Contrast** - WCAG AA compliant  
✅ **Help Dialog** - Hiển thị tất cả shortcuts

**Nhớ:** Accessibility không phải là tính năng phụ, mà là yêu cầu thiết yếu cho một ứng dụng chất lượng! 🌟
