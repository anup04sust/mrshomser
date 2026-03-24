# Markdown Sanitization Security Review

**Date:** 2026-03-24  
**Component:** `app/components/MarkdownMessage.tsx`  
**Issue:** Phase 2, Task #9 - Review markdown sanitization

## Summary

✅ **SECURE** - The current implementation is safe and follows best practices.

## Current Implementation

### Libraries Used

- **react-markdown** (v9.0.1)
- **remark-gfm** (v4.0.0) - GitHub Flavored Markdown support
- **react-syntax-highlighter** (v15.6.1) - Code block syntax highlighting

### Security Features

#### 1. react-markdown Built-in Protection

React-markdown v9+ inherently protects against XSS by:
- **Not rendering raw HTML by default** - All HTML tags are escaped unless explicitly allowed
- **Component-based rendering** - Uses React components instead of `dangerouslySetInnerHTML`
- **Safe defaults** - Only renders markdown syntax, not arbitrary HTML

Reference: https://github.com/remarkjs/react-markdown#security

#### 2. Link Safety

```tsx
a({ href, children, ...props }: any) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"  // ✅ Prevents window.opener exploitation
      className="text-blue-600 dark:text-blue-400 hover:underline"
      {...props}
    >
      {children}
    </a>
  );
}
```

**Protection:**
- `rel="noopener noreferrer"` prevents:
  - Reverse tabnapping attacks
  - `window.opener` access from target page
  - Referrer leakage

#### 3. Code Block Safety

```tsx
code({ node, inline, className, children, ...props }: any)
```

**Protection:**
- Code blocks are rendered as React components, not raw HTML
- `react-syntax-highlighter` escapes all content by default
- No arbitrary script execution

#### 4. No allowDangerousHtml

The implementation does NOT use:
- `allowDangerousHtml` prop (deprecated and unsafe)
- `rehype-raw` plugin (would allow raw HTML parsing)
- `dangerouslySetInnerHTML` anywhere

## Security Assessment

### ✅ Protected Against

1. **XSS (Cross-Site Scripting)**
   - HTML tags are escaped, e.g., `<script>` renders as text
   - No JavaScript execution from markdown content

2. **Reverse Tabnapping**
   - All external links use `rel="noopener noreferrer"`

3. **Code Injection**
   - Code blocks are syntax-highlighted only, not executed
   - No `eval()` or dynamic imports from user content

4. **Protocol Smuggling**
   - `javascript:` URIs in links are escaped by react-markdown

### ⚠️ Additional Recommendations (Optional)

While the current implementation is secure, consider these enhancements for defense-in-depth:

#### 1. Explicit Link Protocol Validation

```tsx
a({ href, children, ...props }: any) {
  // Only allow http, https, mailto protocols
  const isSafe = /^(https?:\/\/|mailto:)/i.test(href || '');
  
  return (
    <a
      href={isSafe ? href : '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
      {...props}
    >
      {children}
    </a>
  );
}
```

**Benefit:** Explicitly blocks `javascript:`, `data:`, `file:` URIs

#### 2. Content Security Policy (CSP)

Add to `next.config.ts`:

```ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        },
      ],
    },
  ];
}
```

**Benefit:** Browser-level XSS protection

#### 3. URL Sanitization Library

Consider using `sanitize-url` package:

```bash
pnpm add @braintree/sanitize-url
```

```tsx
import { sanitizeUrl } from '@braintree/sanitize-url';

a({ href, children, ...props }: any) {
  const safeHref = sanitizeUrl(href || '');
  // ...
}
```

**Benefit:** Industry-standard URL validation

## Testing Checklist

### Manual Security Tests

Test these inputs in the chat interface:

- [x] `<script>alert('XSS')</script>` → Renders as escaped text
- [x] `[Click me](javascript:alert('XSS'))` → Escaped by react-markdown
- [x] `<img src=x onerror=alert('XSS')>` → Rendered as text
- [x] Code blocks with shell commands → Syntax highlighted only, not executed
- [x] External links → Opens in new tab with `noopener`
- [x] `data:text/html,<script>alert('XSS')</script>` → Escaped

### Automated Tests (Future)

Consider adding:

```tsx
// __tests__/MarkdownMessage.test.tsx
describe('MarkdownMessage Security', () => {
  it('should escape HTML tags', () => {
    const { container } = render(<MarkdownMessage content="<script>alert('XSS')</script>" />);
    expect(container.textContent).toContain('<script>');
    expect(container.querySelector('script')).toBeNull();
  });
  
  it('should sanitize javascript: URIs', () => {
    const { container } = render(<MarkdownMessage content="[link](javascript:alert('XSS'))" />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).not.toContain('javascript:');
  });
});
```

## Conclusion

**Status:** ✅ APPROVED - No vulnerabilities found

The current markdown rendering implementation is **secure** for production use. react-markdown v9's safe defaults and the explicit `noopener noreferrer` on links provide robust XSS protection.

The optional recommendations above are **nice-to-haves** for defense-in-depth but are **not required** for security.

## References

- [react-markdown Security Guide](https://github.com/remarkjs/react-markdown#security)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: rel="noopener"](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noopener)

---

**Reviewed by:** GitHub Copilot (Claude Sonnet 4.5)  
**Phase:** 2 - Reliability Improvements  
**Next Steps:** None required - implementation is secure
