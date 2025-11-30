# Implementation Plan - MD Review App

- [x] 1. Initialize project and setup development environment
  - Create new Vite + React + TypeScript project
  - Install and configure Tailwind CSS
  - Install and configure shadcn/ui components
  - Install dependencies: react-markdown, react-syntax-highlighter, fast-check, vitest
  - Setup project structure with folders: components, services, hooks, types, utils
  - Configure Vitest for testing
  - _Requirements: All_

- [x] 2. Implement core data models and types
  - Create TypeScript interfaces for FileData, Comment, CommentMap, StorageData
  - Create type definitions file (types/index.ts)
  - _Requirements: 1.1, 3.2, 8.5_

- [x] 3. Implement StorageService for local storage operations
  - Create StorageService class with save/load methods
  - Implement storage availability check
  - Implement error handling for corrupted data
  - Add storage quota detection
  - _Requirements: 3.5, 8.1, 8.2, 8.3, 8.5_

- [x] 3.1 Write property test for storage round-trip
  - **Property 16: Storage round-trip consistency**
  - **Validates: Requirements 8.2**

- [x] 3.2 Write property test for corrupted data handling
  - **Property 17: Corrupted data handling**
  - **Validates: Requirements 8.3**

- [x] 3.3 Write property test for file isolation
  - **Property 18: File isolation**
  - **Validates: Requirements 8.5**

- [x] 4. Implement FileService for file operations
  - Create FileService class with loadFile, validateFile, generateFileId methods
  - Implement file type validation (check .md or .markdown extension)
  - Implement file size validation (10MB limit)
  - Implement line parsing logic
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 4.1 Write property test for file loading
  - **Property 1: File loading preserves content**
  - **Validates: Requirements 1.1**

- [x] 4.2 Write property test for line numbering
  - **Property 2: Line numbering completeness**
  - **Validates: Requirements 1.3**

- [x] 4.3 Write property test for invalid file rejection
  - **Property 3: Invalid file rejection**
  - **Validates: Requirements 1.4**

- [x] 5. Implement CommentService for comment operations
  - Create CommentService class with createComment, updateComment, deleteComment methods
  - Implement getCommentsForLine and getAllComments methods
  - Implement chronological sorting logic
  - Add comment validation (reject empty/whitespace-only comments)
  - _Requirements: 3.2, 3.4, 4.1, 5.2, 5.3_

- [x] 5.1 Write property test for comment persistence
  - **Property 5: Comment persistence**
  - **Validates: Requirements 3.2, 3.5, 8.1**

- [x] 5.2 Write property test for empty comment rejection
  - **Property 6: Empty comment rejection**
  - **Validates: Requirements 3.4**

- [x] 5.3 Write property test for chronological ordering
  - **Property 8: Comment chronological ordering**
  - **Validates: Requirements 4.1**

- [x] 5.4 Write property test for comment edit persistence
  - **Property 11: Comment edit persistence**
  - **Validates: Requirements 5.2**

- [x] 5.5 Write property test for comment deletion
  - **Property 12: Comment deletion completeness**
  - **Validates: Requirements 5.3**

- [x] 5.6 Write property test for edit cancellation
  - **Property 13: Edit cancellation preservation**
  - **Validates: Requirements 5.4**

- [x] 6. Implement ExportService for export operations
  - Create ExportService class with generateMarkdownExport method
  - Implement downloadAsFile method using browser download API
  - Format export with line numbers, line content, and comments
  - Validate export contains all comments
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6.1 Write property test for export completeness
  - **Property 14: Export completeness**
  - **Validates: Requirements 6.1, 6.2**

- [x] 6.2 Write property test for export format validity
  - **Property 15: Export format validity**
  - **Validates: Requirements 6.3**

- [x] 7. Setup global state management
  - Create AppState interface and context/store
  - Implement state actions: loadFile, addComment, updateComment, deleteComment
  - Implement UI state management: activeLineNumber, dialog states
  - Connect state to StorageService for persistence
  - _Requirements: All_

- [x] 8. Implement FileUploader component
  - Create file input with drag-and-drop support
  - Add file validation and error display
  - Show file size warning for large files
  - Trigger file loading on selection
  - Style with shadcn/ui Button and Alert components
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 9. Implement PreviewPanel component
  - Create panel with react-markdown for rendering
  - Configure react-syntax-highlighter for code blocks
  - Add support for tables, images, and links
  - Style with Tailwind CSS and shadcn/ui ScrollArea
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 9.1 Write property test for Markdown rendering
  - **Property 4: Markdown rendering completeness**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [x] 10. Implement EditorPanel component
  - Create line-numbered text display
  - Add click handlers for line numbers
  - Display comment indicators on lines with comments
  - Implement active line highlighting
  - Style with Tailwind CSS
  - _Requirements: 1.1, 1.3, 3.1, 3.3_

- [x] 10.1 Write property test for visual indicator consistency
  - **Property 7: Visual indicator consistency**
  - **Validates: Requirements 3.3, 5.5**

- [x] 11. Implement CommentInput component
  - Create textarea for comment input
  - Add submit and cancel buttons
  - Implement validation for empty comments
  - Handle edit mode vs create mode
  - Style with shadcn/ui Textarea and Button
  - _Requirements: 3.1, 3.2, 3.4, 5.2, 5.4_

- [x] 12. Implement CommentThread component
  - Display list of comments for a line
  - Add edit and delete buttons for each comment
  - Show timestamps and comment text
  - Handle edit mode toggle
  - Style with shadcn/ui Card and Badge
  - _Requirements: 4.1, 5.1, 5.2, 5.3_

- [x] 13. Implement CommentSummary component
  - Create summary view with all comments grouped by line
  - Display line number, line content preview, and comments
  - Add navigation to line on click
  - Add export button
  - Handle empty state
  - Style with shadcn/ui Card and ScrollArea
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 6.1_

- [x] 13.1 Write property test for comment summary completeness
  - **Property 9: Comment summary completeness**
  - **Validates: Requirements 4.2**

- [x] 13.2 Write property test for summary rendering
  - **Property 10: Summary rendering completeness**
  - **Validates: Requirements 4.3**

- [x] 14. Implement ExportDialog component
  - Create dialog with export preview
  - Add download button
  - Handle empty comments case
  - Show success/error messages
  - Style with shadcn/ui Dialog and Button
  - _Requirements: 6.1, 6.4, 6.5_

- [x] 15. Implement responsive layout
  - Create main App component with layout structure
  - Implement side-by-side layout for desktop
  - Implement stacked/toggle layout for mobile/tablet
  - Add responsive breakpoints with Tailwind
  - _Requirements: 7.1, 7.2_

- [x] 16. Integrate all components in App
  - Wire up FileUploader to load files
  - Connect EditorPanel and PreviewPanel to file state
  - Connect CommentInput to comment actions
  - Connect CommentThread to display and manage comments
  - Connect CommentSummary to show all comments
  - Connect ExportDialog to export functionality
  - _Requirements: All_

- [x] 17. Add error handling and user feedback
  - Implement error boundaries for React components
  - Add toast notifications for actions (using shadcn/ui)
  - Handle all error cases from services
  - Add loading states for async operations
  - _Requirements: 1.4, 1.5, 6.5, 8.3_

- [x] 18. Implement accessibility features
  - Add ARIA labels to interactive elements
  - Ensure keyboard navigation works (Tab, Enter, Escape)
  - Add focus indicators
  - Test with screen reader
  - Verify color contrast meets WCAG AA
  - _Requirements: 7.1, 7.2_

- [x] 19. Add polish and final touches
  - Add app header with title and actions
  - Add helpful tooltips using shadcn/ui Tooltip
  - Implement smooth transitions and animations
  - Add app icon and favicon
  - Test on different browsers (Chrome, Firefox, Safari)
  - _Requirements: 7.5_

- [x] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Implement ViewToggle component for switching between Preview and Comments modes
  - Create toggle button component with two states: 'preview' and 'comments'
  - Add visual indicators for active mode
  - Connect to global state for mode switching
  - Style with shadcn/ui Button or custom toggle component
  - _Requirements: 9.1_

- [x] 21.1 Write property test for view mode toggle
  - **Property 19: View mode toggle**
  - **Validates: Requirements 9.1**

- [x] 22. Implement CommentsPanel component for inline comment display
  - Create panel that displays comments aligned with line numbers
  - Implement line-by-line layout matching editor panel height
  - Show empty placeholders for lines without comments
  - Add scroll synchronization with editor panel
  - Style with Tailwind CSS and shadcn/ui components
  - _Requirements: 9.3, 9.7_

- [x] 22.1 Write property test for comments panel completeness
  - **Property 20: Comments panel completeness**
  - **Validates: Requirements 9.3**

- [x] 22.2 Write property test for line alignment
  - **Property 22: Comments panel line alignment**
  - **Validates: Requirements 9.7**

- [x] 23. Add inline editing capabilities to CommentsPanel
  - Add edit button for each comment in the comments panel
  - Implement inline textarea for editing
  - Add save and cancel buttons for edit mode
  - Connect to updateComment action in global state
  - Ensure changes persist to local storage immediately
  - _Requirements: 9.4, 9.8_

- [x] 23.1 Write property test for inline comment edit persistence
  - **Property 21: Inline comment edit persistence**
  - **Validates: Requirements 9.8**

- [x] 24. Add delete functionality to CommentsPanel
  - Add delete button for each comment
  - Implement confirmation dialog for delete action
  - Connect to deleteComment action in global state
  - Update UI immediately after deletion
  - _Requirements: 9.5_

- [x] 25. Integrate ViewToggle and CommentsPanel into App layout
  - Add ViewToggle to header/toolbar area
  - Update right panel to conditionally render PreviewPanel or CommentsPanel based on mode
  - Ensure smooth transitions between modes
  - Preserve scroll position when switching modes
  - Update global state to include rightPanelMode
  - _Requirements: 9.1, 9.2, 9.6_

- [x] 26. Test and polish the new view toggle feature
  - Test switching between Preview and Comments modes
  - Verify scroll position preservation
  - Test inline editing and deletion in Comments mode
  - Ensure responsive behavior on different screen sizes
  - Add keyboard shortcuts for mode switching (optional)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 27. Final checkpoint for new feature - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
