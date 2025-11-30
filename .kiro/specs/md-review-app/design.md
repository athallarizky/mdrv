# Design Document - MD Review App

## Overview

MD Review adalah aplikasi web single-page yang dibangun menggunakan React, Vite, Tailwind CSS, dan shadcn/ui. Aplikasi ini memungkinkan pengguna untuk melakukan review terhadap file Markdown dengan memberikan komentar pada setiap baris, mirip dengan fitur code review di IDE modern seperti GitHub atau GitLab.

Aplikasi ini berjalan sepenuhnya di client-side (browser) tanpa memerlukan backend server, dengan semua data disimpan di browser local storage. Arsitektur ini memastikan privasi pengguna dan kemudahan deployment.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MD Review App (SPA)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │ State Layer  │  │ Storage Layer│      │
│  │   (React +   │◄─┤   (Zustand/  │◄─┤  (Local      │      │
│  │   shadcn/ui) │  │   Context)   │  │   Storage)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                                 │
│         ▼                  ▼                                 │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Markdown   │  │   Comment    │                        │
│  │   Parser     │  │   Manager    │                        │
│  │  (react-     │  │              │                        │
│  │   markdown)  │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **React 18+**: UI framework dengan hooks untuk state management
- **Vite**: Build tool dan dev server untuk fast development
- **Tailwind CSS**: Utility-first CSS framework untuk styling
- **shadcn/ui**: Component library berbasis Radix UI dan Tailwind
- **react-markdown**: Library untuk parsing dan rendering Markdown
- **react-syntax-highlighter**: Syntax highlighting untuk code blocks
- **zustand** atau **React Context**: State management untuk aplikasi
- **Local Storage API**: Persistent storage untuk comments dan file data

## Components and Interfaces

### Core Components

#### 1. App Component
Root component yang mengatur layout dan routing (jika diperlukan).

```typescript
interface AppProps {}

function App(): JSX.Element
```

#### 2. FileUploader Component
Component untuk upload dan load Markdown files.

```typescript
interface FileUploaderProps {
  onFileLoad: (file: FileData) => void;
  onError: (error: string) => void;
}

interface FileData {
  id: string;
  name: string;
  content: string;
  lines: string[];
  uploadedAt: Date;
}

function FileUploader(props: FileUploaderProps): JSX.Element
```

#### 3. EditorPanel Component
Panel yang menampilkan Markdown content dengan line numbers dan comment indicators.

```typescript
interface EditorPanelProps {
  fileData: FileData;
  comments: CommentMap;
  onLineClick: (lineNumber: number) => void;
  activeLineNumber: number | null;
}

function EditorPanel(props: EditorPanelProps): JSX.Element
```

#### 4. PreviewPanel Component
Panel yang menampilkan rendered Markdown preview.

```typescript
interface PreviewPanelProps {
  content: string;
}

function PreviewPanel(props: PreviewPanelProps): JSX.Element
```

#### 5. CommentInput Component
Component untuk menambahkan atau mengedit comment pada line tertentu.

```typescript
interface CommentInputProps {
  lineNumber: number;
  existingComment?: Comment;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

function CommentInput(props: CommentInputProps): JSX.Element
```

#### 6. CommentThread Component
Component yang menampilkan semua comments untuk satu line.

```typescript
interface CommentThreadProps {
  lineNumber: number;
  comments: Comment[];
  onEdit: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

function CommentThread(props: CommentThreadProps): JSX.Element
```

#### 7. CommentSummary Component
Component yang menampilkan rangkuman semua comments.

```typescript
interface CommentSummaryProps {
  comments: CommentMap;
  fileData: FileData;
  onLineNavigate: (lineNumber: number) => void;
  onExport: () => void;
}

function CommentSummary(props: CommentSummaryProps): JSX.Element
```

#### 8. ExportDialog Component
Dialog untuk export comments dalam format Markdown.

```typescript
interface ExportDialogProps {
  isOpen: boolean;
  comments: CommentMap;
  fileData: FileData;
  onClose: () => void;
}

function ExportDialog(props: ExportDialogProps): JSX.Element
```

## Data Models

### FileData Model

```typescript
interface FileData {
  id: string;              // Unique identifier (hash dari nama + timestamp)
  name: string;            // Nama file
  content: string;         // Raw Markdown content
  lines: string[];         // Array of lines untuk line-by-line processing
  uploadedAt: Date;        // Timestamp upload
}
```

### Comment Model

```typescript
interface Comment {
  id: string;              // Unique identifier
  lineNumber: number;      // Line number (1-indexed)
  text: string;            // Comment content
  createdAt: Date;         // Timestamp creation
  updatedAt: Date;         // Timestamp last update
}
```

### CommentMap Type

```typescript
type CommentMap = Map<number, Comment[]>;  // Map dari line number ke array of comments
```

### Storage Schema

Data yang disimpan di Local Storage:

```typescript
interface StorageData {
  version: string;                    // Schema version untuk migration
  files: Record<string, FileData>;    // Map dari file ID ke FileData
  comments: Record<string, Comment[]>; // Map dari file ID ke array of comments
  currentFileId: string | null;       // Currently active file
}
```

## State Management

### Global State Structure

```typescript
interface AppState {
  // File state
  currentFile: FileData | null;
  
  // Comment state
  comments: CommentMap;
  activeLineNumber: number | null;
  
  // UI state
  isCommentSummaryOpen: boolean;
  isExportDialogOpen: boolean;
  
  // Actions
  loadFile: (file: File) => Promise<void>;
  addComment: (lineNumber: number, text: string) => void;
  updateComment: (commentId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
  setActiveLineNumber: (lineNumber: number | null) => void;
  exportComments: () => string;
  clearAllData: () => void;
}
```

## Service Layer

### FileService

Handles file operations:

```typescript
class FileService {
  static async loadFile(file: File): Promise<FileData>;
  static validateFile(file: File): boolean;
  static generateFileId(name: string): string;
  static parseLines(content: string): string[];
}
```

### CommentService

Handles comment operations:

```typescript
class CommentService {
  static createComment(lineNumber: number, text: string): Comment;
  static updateComment(comment: Comment, text: string): Comment;
  static deleteComment(comments: CommentMap, commentId: string): CommentMap;
  static getCommentsForLine(comments: CommentMap, lineNumber: number): Comment[];
  static getAllComments(comments: CommentMap): Comment[];
}
```

### StorageService

Handles local storage operations:

```typescript
class StorageService {
  static saveComments(fileId: string, comments: CommentMap): void;
  static loadComments(fileId: string): CommentMap;
  static saveFileData(fileData: FileData): void;
  static loadFileData(fileId: string): FileData | null;
  static clearStorage(): void;
  static isStorageAvailable(): boolean;
}
```

### ExportService

Handles export operations:

```typescript
class ExportService {
  static generateMarkdownExport(
    fileData: FileData,
    comments: CommentMap
  ): string;
  
  static downloadAsFile(content: string, filename: string): void;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties about Markdown rendering (2.1-2.5) can be combined into comprehensive rendering tests
- Properties about comment persistence (3.5, 8.1) are redundant - one comprehensive persistence property is sufficient
- Properties about visual indicators (3.3, 5.5) can be combined into one property about UI state consistency

### Core Properties

**Property 1: File loading preserves content**
*For any* valid Markdown file, loading the file should result in the editor panel containing the exact same content as the original file.
**Validates: Requirements 1.1**

**Property 2: Line numbering completeness**
*For any* loaded file content, the number of assigned line numbers should equal the number of lines in the content.
**Validates: Requirements 1.3**

**Property 3: Invalid file rejection**
*For any* file with a non-Markdown extension (not .md or .markdown), attempting to load it should result in an error message and no content being loaded.
**Validates: Requirements 1.4**

**Property 4: Markdown rendering completeness**
*For any* valid Markdown content containing code blocks, tables, images, or links, the rendered preview should contain corresponding HTML elements (pre/code tags, table tags, img tags, anchor tags).
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

**Property 5: Comment persistence**
*For any* comment added to any line number, the comment should immediately exist in local storage with the correct line number association.
**Validates: Requirements 3.2, 3.5, 8.1**

**Property 6: Empty comment rejection**
*For any* string composed entirely of whitespace characters, attempting to submit it as a comment should be rejected and the comment list should remain unchanged.
**Validates: Requirements 3.4**

**Property 7: Visual indicator consistency**
*For any* line number, if and only if that line has at least one comment, then a visual indicator should be displayed on that line.
**Validates: Requirements 3.3, 5.5**

**Property 8: Comment chronological ordering**
*For any* line with multiple comments, when displayed, the comments should be ordered by their creation timestamp in ascending order (oldest first).
**Validates: Requirements 4.1**

**Property 9: Comment summary completeness**
*For any* set of comments across multiple lines, the comment summary should include all comments grouped by their line numbers with no comments missing or duplicated.
**Validates: Requirements 4.2**

**Property 10: Summary rendering completeness**
*For any* comment in the summary view, the rendered entry should contain the line number, a preview of the line content, and the comment text.
**Validates: Requirements 4.3**

**Property 11: Comment edit persistence**
*For any* existing comment, editing it with new text and saving should result in the comment having the new text in both memory and local storage, while preserving the original creation timestamp.
**Validates: Requirements 5.2**

**Property 12: Comment deletion completeness**
*For any* existing comment, deleting it should result in the comment being removed from both the in-memory comment map and local storage.
**Validates: Requirements 5.3**

**Property 13: Edit cancellation preservation**
*For any* comment being edited, canceling the edit operation should result in the comment retaining its original text unchanged.
**Validates: Requirements 5.4**

**Property 14: Export completeness**
*For any* set of comments, the exported Markdown document should include all comments with their associated line numbers and line content.
**Validates: Requirements 6.1, 6.2**

**Property 15: Export format validity**
*For any* generated export, the output should be valid Markdown that can be parsed without errors.
**Validates: Requirements 6.3**

**Property 16: Storage round-trip consistency**
*For any* set of comments associated with a file, saving them to local storage and then loading them back should result in an equivalent set of comments with the same content, line numbers, and timestamps.
**Validates: Requirements 8.2**

**Property 17: Corrupted data handling**
*For any* corrupted or invalid JSON data in local storage, attempting to load it should not crash the application and should display an error message to the user.
**Validates: Requirements 8.3**

**Property 18: File isolation**
*For any* two different files with comments, the comments for one file should not appear when viewing the other file.
**Validates: Requirements 8.5**

## Error Handling

### File Loading Errors

1. **Invalid File Type**: Display user-friendly error message when non-Markdown files are selected
2. **File Too Large**: Show warning dialog for files exceeding 10MB, allow user to proceed or cancel
3. **File Read Error**: Handle browser file API errors gracefully with appropriate error messages
4. **Empty File**: Allow loading but show informational message

### Storage Errors

1. **Storage Quota Exceeded**: Detect when local storage is full and notify user to clear old data
2. **Storage Unavailable**: Check if local storage is available (private browsing mode) and show warning
3. **Corrupted Data**: Catch JSON parse errors and offer to reset storage
4. **Storage Access Denied**: Handle permission errors gracefully

### Comment Operation Errors

1. **Invalid Line Number**: Validate line numbers are within file bounds
2. **Comment Not Found**: Handle cases where comment ID doesn't exist
3. **Concurrent Modifications**: Use optimistic updates with error recovery

### Export Errors

1. **No Comments**: Prevent export when no comments exist, show informational message
2. **Export Generation Failed**: Handle errors in Markdown generation
3. **Download Failed**: Handle browser download API errors

## Testing Strategy

### Unit Testing

We will use **Vitest** as the testing framework, which integrates seamlessly with Vite and provides a Jest-compatible API.

**Unit Test Coverage:**

- **Component Tests**: Test individual React components in isolation using React Testing Library
  - FileUploader: file selection, validation, error states
  - CommentInput: input handling, submission, cancellation
  - CommentThread: display, edit/delete actions
  - CommentSummary: rendering, navigation, export trigger
  
- **Service Tests**: Test business logic in service classes
  - FileService: file parsing, validation, ID generation
  - CommentService: CRUD operations, sorting, filtering
  - StorageService: save/load operations, error handling
  - ExportService: Markdown generation, download functionality

- **Integration Tests**: Test component interactions
  - Adding a comment and verifying it appears in the summary
  - Editing a comment and verifying persistence
  - Loading a file and verifying preview renders correctly

### Property-Based Testing

We will use **fast-check** as the property-based testing library for JavaScript/TypeScript.

**Configuration:**
- Each property-based test MUST run a minimum of 100 iterations
- Each property-based test MUST be tagged with a comment referencing the correctness property from this design document
- Tag format: `// Feature: md-review-app, Property {number}: {property_text}`

**Property Test Coverage:**

Each correctness property listed above will be implemented as a property-based test:

- **Property 1-3**: File loading and validation properties
- **Property 4**: Markdown rendering with various content types
- **Property 5-7**: Comment creation and persistence properties
- **Property 8-10**: Comment display and summary properties
- **Property 11-13**: Comment editing and deletion properties
- **Property 14-15**: Export generation properties
- **Property 16-18**: Storage and data isolation properties

**Test Data Generators:**

We will create custom generators for:
- Random Markdown content with various elements (headings, lists, code blocks, tables, images, links)
- Random comment text (including edge cases like very long text, special characters, emojis)
- Random line numbers within valid ranges
- Random file names and IDs
- Random timestamps for testing chronological ordering

### End-to-End Testing

While not part of the core implementation, we recommend using **Playwright** or **Cypress** for E2E testing to validate complete user workflows:

- Upload file → Add comments → View summary → Export
- Add comment → Edit → Delete → Verify persistence
- Load file → Close browser → Reopen → Verify comments restored

## UI/UX Design

### Layout Structure

**Desktop Layout (≥1024px):**
```
┌─────────────────────────────────────────────────────────┐
│                     Header / Toolbar                     │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│     Editor Panel         │      Preview Panel           │
│   (Line numbers +        │   (Rendered Markdown)        │
│    Raw Markdown)         │                              │
│                          │                              │
│                          │                              │
└──────────────────────────┴──────────────────────────────┘
```

**Tablet/Mobile Layout (<1024px):**
```
┌─────────────────────────────────────────────────────────┐
│              Header / Toolbar + View Toggle             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              Active Panel (Editor OR Preview)            │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Component Styling with shadcn/ui

We will use the following shadcn/ui components:

- **Button**: For actions (upload, export, add comment, etc.)
- **Dialog**: For export dialog and confirmation modals
- **Textarea**: For comment input
- **Card**: For comment display and summary items
- **Badge**: For comment count indicators
- **Separator**: For visual separation between sections
- **ScrollArea**: For scrollable panels
- **Tooltip**: For helpful hints on icons and actions
- **Alert**: For error messages and warnings

### Color Scheme

Using Tailwind's default palette with customization:

- **Primary**: Blue (for actions and links)
- **Secondary**: Gray (for text and borders)
- **Success**: Green (for successful operations)
- **Warning**: Yellow (for warnings like large files)
- **Error**: Red (for errors)
- **Comment Indicator**: Orange/Amber (for lines with comments)

### Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Focus indicators
- Sufficient color contrast (WCAG AA compliance)
- Screen reader friendly

## Performance Considerations

### Optimization Strategies

1. **Virtual Scrolling**: For large files (>1000 lines), implement virtual scrolling to render only visible lines
2. **Debounced Search**: If search functionality is added, debounce input
3. **Memoization**: Use React.memo and useMemo for expensive computations
4. **Lazy Loading**: Code-split components that aren't immediately needed
5. **Local Storage Batching**: Batch multiple storage operations when possible

### Performance Targets

- Initial load: <2 seconds
- File load: <500ms for files up to 1MB
- Comment add/edit: <100ms perceived response time
- Preview render: <300ms for typical Markdown files
- Export generation: <1 second for up to 1000 comments

## Security Considerations

Since this is a client-side only application:

1. **No Server Communication**: All data stays in the browser
2. **XSS Prevention**: Sanitize Markdown rendering to prevent XSS attacks (react-markdown handles this)
3. **Local Storage Limits**: Respect browser storage quotas
4. **No Sensitive Data**: Warn users not to store sensitive information in comments
5. **File Validation**: Validate file types and sizes before processing

## Future Enhancements

Potential features for future versions:

1. **Collaboration**: Real-time collaboration using WebRTC or WebSocket
2. **Cloud Sync**: Optional cloud storage integration
3. **Themes**: Dark mode and custom themes
4. **Keyboard Shortcuts**: Power user shortcuts for common actions
5. **Comment Threads**: Reply to comments for discussions
6. **Markdown Editor**: Rich text editor for Markdown
7. **Version History**: Track changes to comments over time
8. **Export Formats**: Support PDF, HTML, or JSON export
9. **Import Comments**: Import comments from external sources
10. **Search**: Search within comments and file content
