# Accessibility Guidelines

## Overview
This document outlines accessibility standards for the Vend-IT Admin Dashboard.

## Standards Compliance
- WCAG 2.1 Level AA
- Keyboard navigation support
- Screen reader compatibility
- Focus management

---

## Keyboard Navigation

### Global Shortcuts
- `Tab` / `Shift+Tab` - Navigate between interactive elements
- `Enter` / `Space` - Activate buttons and links
- `Esc` - Close modals and dialogs
- `/` - Focus search input

### Navigation
- All interactive elements are keyboard accessible
- Logical tab order throughout the application
- Focus indicators visible on all interactive elements

---

## ARIA Implementation

### Labels
- All form inputs have associated labels
- Interactive elements have descriptive aria-labels
- Buttons clearly describe their action

### Landmarks
```html
<nav aria-label="Main navigation">
<main aria-label="Main content">
<aside aria-label="Sidebar">
```

### Live Regions
- Toast notifications use `role="status"`
- Error messages use `role="alert"`
- Loading states use `aria-busy="true"`

---

## Color & Contrast

### Minimum Contrast Ratios
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

### Color Independence
- Information not conveyed by color alone
- Status indicators use icons + text
- Form validation shows icon + message

---

## Focus Management

### Focus Indicators
- Visible focus ring on all interactive elements
- 2px solid outline for keyboard focus
- Focus trapped in modal dialogs

### Skip Links
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

---

## Screen Reader Support

### Semantic HTML
- Proper heading hierarchy (h1 → h6)
- Semantic landmarks (nav, main, aside)
- Lists for grouped content

### ARIA Attributes
- `aria-label` for icon-only buttons
- `aria-describedby` for additional context
- `aria-live` for dynamic content
- `aria-expanded` for collapsible sections

---

## Forms

### Labels
- All inputs have visible labels
- Required fields marked with `aria-required="true"`
- Error messages linked with `aria-describedby`

### Validation
- Inline validation with clear error messages
- Error summary at top of form
- Focus moved to first error on submit

---

## Testing Checklist

### Automated Testing
- [ ] Run axe-core tests
- [ ] Check Lighthouse accessibility score (90+)
- [ ] Validate HTML semantics

### Manual Testing
- [ ] Navigate entire app with keyboard only
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify focus indicators visible
- [ ] Check color contrast
- [ ] Test with 200% zoom

### Browser Testing
- [ ] Chrome + NVDA
- [ ] Firefox + JAWS
- [ ] Safari + VoiceOver

---

## Common Patterns

### Modal Dialog
```tsx
<Dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Delete User?</h2>
  <!-- Focus trapped inside -->
</Dialog>
```

### Button with Icon
```tsx
<button aria-label="Delete user">
  <TrashIcon aria-hidden="true" />
</button>
```

### Status Badge
```tsx
<Badge>
  <CheckIcon aria-hidden="true" />
  <span>Active</span>
</Badge>
```

---

## Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Maintenance
- Run accessibility audit quarterly
- Update this document as patterns evolve
- Train team on accessibility best practices
