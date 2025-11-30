# Browser Testing Guide for MD Review App

This document provides instructions for testing the MD Review App across different browsers.

## Browsers to Test

- ✅ Chrome (latest version)
- ✅ Firefox (latest version)
- ✅ Safari (latest version)
- ✅ Edge (latest version)

## Testing Checklist

### 1. Initial Load
- [ ] App loads without errors
- [ ] Header displays correctly with title "MD Review App"
- [ ] File upload area is visible and functional
- [ ] Custom favicon appears in browser tab
- [ ] Page title shows "MD Review App - Markdown Review Tool"

### 2. File Upload
- [ ] Drag and drop works
- [ ] Browse button opens file picker
- [ ] Only .md and .markdown files are accepted
- [ ] Error message shows for invalid file types
- [ ] Warning shows for files > 10MB
- [ ] File loads successfully

### 3. UI Features
- [ ] Tooltips appear on hover (Summary, Export, line numbers, buttons)
- [ ] Smooth transitions on button hover
- [ ] Responsive layout works on different screen sizes
- [ ] Mobile view toggle works (< 1024px width)
- [ ] Dark mode support (if system preference is dark)

### 4. Editor Panel
- [ ] Line numbers display correctly
- [ ] Click on line number shows comment input
- [ ] Lines with comments show orange indicator
- [ ] Tooltips show comment count on hover
- [ ] Active line highlights properly

### 5. Preview Panel
- [ ] Markdown renders correctly
- [ ] Code blocks have syntax highlighting
- [ ] Tables render properly
- [ ] Images display (if URLs are valid)
- [ ] Links are clickable

### 6. Comments
- [ ] Can add comments to any line
- [ ] Empty comments are rejected
- [ ] Comments persist in local storage
- [ ] Can edit existing comments
- [ ] Can delete comments
- [ ] Comment timestamps display correctly

### 7. Comment Summary
- [ ] Summary button opens dialog
- [ ] All comments are listed
- [ ] Clicking line number navigates to that line
- [ ] Export button works from summary

### 8. Export
- [ ] Export button opens dialog
- [ ] Preview shows formatted markdown
- [ ] Download button creates file
- [ ] File contains all comments
- [ ] Empty state handled correctly

### 9. Accessibility
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader announcements work
- [ ] ARIA labels are present
- [ ] Color contrast is sufficient

### 10. Performance
- [ ] App loads in < 2 seconds
- [ ] File loading is smooth
- [ ] No lag when adding comments
- [ ] Preview renders quickly
- [ ] Smooth animations

## How to Test

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in each browser:
   - Chrome: http://localhost:5173
   - Firefox: http://localhost:5173
   - Safari: http://localhost:5173
   - Edge: http://localhost:5173

3. Use the sample markdown file in the project root for testing

4. Test responsive design by resizing browser window

5. Test dark mode by changing system preferences

## Known Browser-Specific Issues

### Safari
- Local storage may be disabled in private browsing mode
- Some CSS animations may behave differently

### Firefox
- File drag-and-drop may have slight visual differences

### Edge
- Should work identically to Chrome (Chromium-based)

## Reporting Issues

If you find any browser-specific issues:
1. Note the browser name and version
2. Describe the issue
3. Include steps to reproduce
4. Take screenshots if applicable
