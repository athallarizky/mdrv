import { useState } from 'react';
import { useAppState } from './store';
import { 
  FileUploader, 
  EditorPanel, 
  PreviewPanel,
  CommentInput,
  CommentThread,
  CommentSummary,
  ExportDialog
} from './components';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  FileText, 
  Eye, 
  MessageSquare, 
  Upload,
  AlertCircle,
  X
} from 'lucide-react';
import './App.css';

type MobileView = 'editor' | 'preview';

function App() {
  const { 
    currentFile, 
    loadFile, 
    error,
    clearError,
    comments, 
    activeLineNumber, 
    setActiveLineNumber,
    addComment,
    updateComment,
    deleteComment,
    isCommentSummaryOpen,
    setCommentSummaryOpen,
    isExportDialogOpen,
    setExportDialogOpen
  } = useAppState();

  // Mobile view toggle state
  const [mobileView, setMobileView] = useState<MobileView>('editor');

  /**
   * Handle comment submission
   */
  const handleCommentSubmit = (text: string) => {
    if (activeLineNumber !== null) {
      try {
        addComment(activeLineNumber, text);
        setActiveLineNumber(null);
      } catch (err) {
        // Error is already handled in addComment, just log for debugging
        console.error('Failed to add comment:', err);
      }
    }
  };

  /**
   * Handle comment edit
   */
  const handleCommentEdit = (commentId: string, text: string) => {
    try {
      updateComment(commentId, text);
    } catch (err) {
      // Error is already handled in updateComment, just log for debugging
      console.error('Failed to update comment:', err);
    }
  };

  /**
   * Handle line navigation from summary
   */
  const handleLineNavigate = (lineNumber: number) => {
    try {
      if (currentFile && lineNumber > 0 && lineNumber <= currentFile.lines.length) {
        setActiveLineNumber(lineNumber);
        setCommentSummaryOpen(false);
        // Scroll to line if needed (handled by EditorPanel)
      } else {
        console.error('Invalid line number:', lineNumber);
      }
    } catch (err) {
      console.error('Failed to navigate to line:', err);
    }
  };

  /**
   * Get comments for active line
   */
  const activeLineComments = activeLineNumber !== null 
    ? comments.get(activeLineNumber) || []
    : [];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Skip to main content link for keyboard navigation */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
      
      {/* Header */}
      <header 
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
        role="banner"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">MD Review App</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Review Markdown files with inline comments
              </p>
            </div>
            
            {currentFile && (
              <nav aria-label="Main actions">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCommentSummaryOpen(true)}
                        className="gap-2"
                        aria-label="Open comment summary"
                      >
                        <MessageSquare className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Summary</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View all comments grouped by line</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExportDialogOpen(true)}
                        className="gap-2"
                        aria-label="Export comments"
                      >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export comments as Markdown file</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-6" role="main">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4" role="alert" aria-live="assertive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload State */}
        {!currentFile ? (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="text-center mb-8">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
              <p className="text-muted-foreground">
                Upload a Markdown file to begin reviewing
              </p>
            </div>
            <FileUploader onFileLoad={loadFile} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info Bar */}
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/30"
              role="region"
              aria-label="File information"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold truncate">{currentFile.name}</h2>
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {currentFile.lines.length} lines • {
                    Array.from(comments.values()).reduce((sum, c) => sum + c.length, 0)
                  } comments
                </p>
              </div>
              <FileUploader onFileLoad={loadFile} />
            </div>

            {/* Mobile View Toggle */}
            <div 
              className="lg:hidden flex gap-2 p-1 bg-muted rounded-lg"
              role="tablist"
              aria-label="View selection"
            >
              <Button
                variant={mobileView === 'editor' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMobileView('editor')}
                className="flex-1 gap-2"
                role="tab"
                aria-selected={mobileView === 'editor'}
                aria-controls="editor-panel"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Editor
              </Button>
              <Button
                variant={mobileView === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMobileView('preview')}
                className="flex-1 gap-2"
                role="tab"
                aria-selected={mobileView === 'preview'}
                aria-controls="preview-panel"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Preview
              </Button>
            </div>

            {/* Desktop: Side-by-Side Layout | Mobile: Stacked/Toggle Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Editor Panel - Always visible on desktop, toggle on mobile */}
              <div 
                className={`${mobileView === 'editor' ? 'block' : 'hidden'} lg:block`}
                id="editor-panel"
                role="tabpanel"
                aria-label="Editor view"
                aria-hidden={mobileView !== 'editor' && window.innerWidth < 1024}
              >
                <EditorPanel
                  fileData={currentFile}
                  comments={comments}
                  onLineClick={setActiveLineNumber}
                  activeLineNumber={activeLineNumber}
                />
              </div>

              {/* Preview Panel - Always visible on desktop, toggle on mobile */}
              <div 
                className={`${mobileView === 'preview' ? 'block' : 'hidden'} lg:block`}
                id="preview-panel"
                role="tabpanel"
                aria-label="Preview view"
                aria-hidden={mobileView !== 'preview' && window.innerWidth < 1024}
              >
                <PreviewPanel content={currentFile.content} />
              </div>
            </div>

            {/* Comment Input - Shows when a line is selected */}
            {activeLineNumber !== null && (
              <div 
                className="mt-4"
                role="region"
                aria-label={`Comments for line ${activeLineNumber}`}
                aria-live="polite"
              >
                {activeLineComments.length > 0 ? (
                  <div className="space-y-4">
                    <CommentThread
                      lineNumber={activeLineNumber}
                      comments={activeLineComments}
                      onEdit={handleCommentEdit}
                      onDelete={deleteComment}
                    />
                    <CommentInput
                      lineNumber={activeLineNumber}
                      onSubmit={handleCommentSubmit}
                      onCancel={() => setActiveLineNumber(null)}
                    />
                  </div>
                ) : (
                  <CommentInput
                    lineNumber={activeLineNumber}
                    onSubmit={handleCommentSubmit}
                    onCancel={() => setActiveLineNumber(null)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Comment Summary Dialog */}
      {currentFile && (
        <>
          <CommentSummary
            isOpen={isCommentSummaryOpen}
            comments={comments}
            fileData={currentFile}
            onLineNavigate={handleLineNavigate}
            onExport={() => {
              setCommentSummaryOpen(false);
              setExportDialogOpen(true);
            }}
            onClose={() => setCommentSummaryOpen(false)}
          />
          
          <ExportDialog
            isOpen={isExportDialogOpen}
            comments={comments}
            fileData={currentFile}
            onClose={() => setExportDialogOpen(false)}
          />
        </>
      )}
      </div>
    </TooltipProvider>
  );
}

export default App;
