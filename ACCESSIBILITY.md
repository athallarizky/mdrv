# Accessibility Features - MD Review App

This document outlines the accessibility features implemented in the MD Review App to ensure WCAG 2.1 AA compliance.

## Overview

The MD Review App has been designed with accessibility as a core principle, ensuring that all users, including those using assistive technologies, can effectively review Markdown files and add comments.

## Implemented Features

### 1. Semantic HTML

- **Proper heading hierarchy**: H1 for app title, H2 for section headings, H3 for subsections
- **Landmark regions**: `<header>`, `<main>`, `<nav>`, `<article>` elements used appropriately
- **Lists**: Proper `<ul>` and `<li>` elements for comment threads and summaries
- **Forms**: Proper form structure with labels and fieldsets

### 2. ARIA Labels and Attributes

#### Interactive Elements
- All buttons have descriptive `aria-label` attributes
- Icon-only buttons include text alternatives
- Decorative icons marked with `aria-hidden="true"`

#### Dynamic Content
- `aria-live="polite"` for non-critical updates (file info, loading states)
- `aria-live="assertive"` for critical alerts and errors
- `role="alert"` for error messages
- `role="status"` for loading and success states

#### Form Controls
- `aria-invalid` for form validation errors
- `aria-describedby` linking inputs to error messages and hints
- `aria-labelledby` for complex form relationships

#### Navigation
- `role="tablist"` and `role="tab"` for mobile view toggle
- `aria-selected` for active tab state
- `aria-controls` linking tabs to their panels
- `aria-hidden` for hidden panels on mobile

#### State Management
- `aria-pressed` for toggle buttons (active line selection)
- `aria-expanded` for expandable sections (handled by Dialog component)

### 3. Keyboard Navigation

#### Global Shortcuts
- **Tab**: Navigate through interactive elements
- **Shift + Tab**: Navigate backwards
- **Enter/Space**: Activate buttons and links
- **Escape**: Close dialogs and cancel operations

#### Comment Input
- **Ctrl/Cmd + Enter**: Submit comment
- **Escape**: Cancel comment input

#### Line Selection
- **Enter/Space**: Select line for commenting when focused on line number

#### Focus Management
- Focus automatically moves to comment input when line is selected
- Focus returns to trigger element when dialogs close
- Skip-to-main-content link for keyboard users

### 4. Focus Indicators

#### Visual Focus States
- 2px solid outline with offset for all focusable elements
- Enhanced focus ring using `focus-visible` pseudo-class
- Consistent focus styling across all components
- High contrast mode support with 3px outlines

#### Focus Styles
```css
*:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

### 5. Color Contrast (WCAG AA)

#### Text Contrast Ratios
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

#### Color Scheme
- Light mode: Dark text (#09090b) on light background (#ffffff)
- Dark mode: Light text (#f8fafc) on dark background (#09090b)
- Muted text: Sufficient contrast maintained (#64748b on light, #94a3b8 on dark)
- Primary actions: Blue (#3b82f6 light, #60a5fa dark) with white text
- Destructive actions: Red (#ef4444) with white text
- Comment indicators: Orange (#ea580c) with sufficient contrast

#### Non-Color Indicators
- Comment presence indicated by both color AND icon (MessageSquare)
- Active line indicated by both color AND bold text
- Form errors indicated by both color AND text message

### 6. Screen Reader Support

#### Descriptive Labels
- All form inputs have associated labels
- All buttons have descriptive text or aria-labels
- All images and icons have appropriate alt text or aria-hidden

#### Content Structure
- Proper heading hierarchy for navigation
- Lists used for related items (comments, lines)
- Regions labeled with aria-label or aria-labelledby

#### Dynamic Updates
- Live regions announce changes (comment count, file loading)
- Status messages announced appropriately
- Error messages announced immediately

### 7. Responsive Design

#### Mobile Accessibility
- Touch targets minimum 44x44px
- Tab-based navigation for mobile views
- Proper focus management on view switching
- Swipe gestures not required (button alternatives provided)

#### Viewport Scaling
- No maximum-scale restrictions
- Text can be zoomed to 200% without loss of functionality
- Responsive breakpoints maintain usability

### 8. Motion and Animation

#### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Respects user's motion preferences
- Animations disabled for users who prefer reduced motion
- Transitions still provide visual feedback but without motion

### 9. Error Handling

#### Form Validation
- Inline error messages with aria-live
- Error messages associated with inputs via aria-describedby
- Clear, descriptive error text
- Errors announced to screen readers

#### Error Recovery
- Clear instructions for fixing errors
- Ability to dismiss error messages
- No automatic timeouts on error messages

### 10. Additional Features

#### Skip Links
- "Skip to main content" link for keyboard users
- Visible on focus
- Positioned at top of page

#### Language
- HTML lang attribute set (inherited from framework)
- Clear, simple language used throughout

#### Help Text
- Keyboard shortcuts documented in UI
- Tooltips provide additional context
- Placeholder text provides examples

## Testing Recommendations

### Manual Testing
1. **Keyboard Navigation**: Navigate entire app using only keyboard
2. **Screen Reader**: Test with NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
3. **Zoom**: Test at 200% zoom level
4. **Color Blindness**: Use color blindness simulators
5. **High Contrast**: Test in high contrast mode

### Automated Testing
1. **axe DevTools**: Browser extension for accessibility testing
2. **Lighthouse**: Chrome DevTools accessibility audit
3. **WAVE**: Web accessibility evaluation tool
4. **Pa11y**: Command-line accessibility testing

### Browser Testing
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Known Limitations

1. **Markdown Preview**: Complex Markdown rendering may have accessibility issues depending on content
2. **File Size**: Very large files (>1000 lines) may impact screen reader performance
3. **Drag and Drop**: While keyboard alternative provided, drag-and-drop itself not fully accessible

## Future Improvements

1. Add keyboard shortcuts documentation page
2. Implement custom focus trap for dialogs
3. Add high contrast theme option
4. Improve virtual scrolling for large files
5. Add more granular ARIA live region updates
6. Implement undo/redo functionality with keyboard shortcuts

## Compliance

This application aims to meet **WCAG 2.1 Level AA** standards. Key compliance areas:

- ✅ Perceivable: Text alternatives, adaptable content, distinguishable
- ✅ Operable: Keyboard accessible, enough time, navigable, input modalities
- ✅ Understandable: Readable, predictable, input assistance
- ✅ Robust: Compatible with assistive technologies

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Contact

For accessibility issues or suggestions, please open an issue in the project repository.
