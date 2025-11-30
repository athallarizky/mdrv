import { useState } from 'react';
import { useAppState } from './store';
import { 
  FileUploader, 
  EditorPanel, 
  PreviewPanel,
  CommentInput,
  CommentThread,
  CommentSummary,
  ExportDialog,
  ModeToggle
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
  X,
  Sparkles
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
    setExportDialogOpen,
    clearAllData
  } = useAppState();

  // Mobile view toggle state
  const [mobileView, setMobileView] = useState<MobileView>('editor');

  // Calculate stats
  const commentCount = Array.from(comments.values()).reduce((acc, curr) => acc + curr.length, 0);
  const lineCount = currentFile?.lines.length || 0;

  /**
   * Handle comment submission
   */
  const handleCommentSubmit = (text: string) => {
    if (activeLineNumber !== null) {
      try {
        addComment(activeLineNumber, text);
        setActiveLineNumber(null);
      } catch (err) {
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
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-300">
        {/* Skip to main content link for keyboard navigation */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              MD Review
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {currentFile && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommentSummaryOpen(true)}
                  className="hidden sm:flex gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Summary
                  <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {commentCount}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExportDialogOpen(true)}
                  className="hidden sm:flex gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Export
                </Button>
              </>
            )}
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 pt-24 pb-12" role="main">
        {/* Error Alert */}
        {error && (
          <div className="animate-fade-in mb-6">
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-6 w-6 p-0 hover:bg-destructive/20"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* File Upload State */}
        {!currentFile ? (
          <div className="max-w-2xl mx-auto mt-20 animate-fade-in">
            <div className="text-center mb-10">
              <div className="bg-secondary/50 p-4 rounded-2xl inline-block mb-6 ring-1 ring-border">
                <FileText className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">Review Markdown Files</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Upload a document to start adding inline comments and feedback.
              </p>
            </div>
            <FileUploader onFileLoad={loadFile} />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* File Info Bar */}
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-1"
              role="region"
              aria-label="File information"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold tracking-tight truncate mb-1">{currentFile.name}</h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {currentFile.lines.length} lines
                  </span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {Array.from(comments.values()).reduce((sum, c) => sum + c.length, 0)} comments
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="ghost" size="sm" onClick={clearAllData} className="text-muted-foreground">
                    Change File
                 </Button>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div 
              className="lg:hidden flex gap-1 p-1 bg-secondary/50 rounded-xl border border-border/50"
              role="tablist"
              aria-label="View selection"
            >
              <Button
                variant={mobileView === 'editor' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMobileView('editor')}
                className="flex-1 gap-2 rounded-lg shadow-none"
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
                className="flex-1 gap-2 rounded-lg shadow-none"
                role="tab"
                aria-selected={mobileView === 'preview'}
                aria-controls="preview-panel"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Preview
              </Button>
            </div>

            {/* Desktop: Side-by-Side Layout | Mobile: Stacked/Toggle Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
              {/* Editor Panel */}
              <div 
                className={`${mobileView === 'editor' ? 'block' : 'hidden'} lg:block h-full flex flex-col`}
                id="editor-panel"
                role="tabpanel"
                aria-label="Editor view"
              >
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden h-full flex flex-col ring-1 ring-border/50">
                  <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">Source</span>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <EditorPanel
                      fileData={currentFile}
                      comments={comments}
                      onLineClick={setActiveLineNumber}
                      activeLineNumber={activeLineNumber}
                    />
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div 
                className={`${mobileView === 'preview' ? 'block' : 'hidden'} lg:block h-full flex flex-col`}
                id="preview-panel"
                role="tabpanel"
                aria-label="Preview view"
              >
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden h-full flex flex-col ring-1 ring-border/50">
                  <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">Preview</span>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <PreviewPanel content={currentFile.content} />
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Input - Shows when a line is selected */}
            {activeLineNumber !== null && (
              <div 
                className="fixed bottom-6 right-6 z-40 w-full max-w-md animate-fade-in"
                role="region"
                aria-label={`Comments for line ${activeLineNumber}`}
              >
                <div className="bg-card border rounded-xl shadow-xl p-4 ring-1 ring-border">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                     <span className="font-medium text-sm">Line {activeLineNumber}</span>
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveLineNumber(null)}>
                        <X className="h-3 w-3" />
                     </Button>
                  </div>
                  
                  {activeLineComments.length > 0 ? (
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-4 pr-1">
                      <CommentThread
                        lineNumber={activeLineNumber}
                        comments={activeLineComments}
                        onEdit={handleCommentEdit}
                        onDelete={deleteComment}
                      />
                    </div>
                  ) : null}
                  
                  <CommentInput
                    lineNumber={activeLineNumber}
                    onSubmit={handleCommentSubmit}
                    onCancel={() => setActiveLineNumber(null)}
                  />
                </div>
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
