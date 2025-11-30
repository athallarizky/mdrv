import { useState } from 'react';
import { useAppState } from './store';
import { 
  FileUploader, 
  EditorPanel, 
  PreviewPanel,
  CommentsPanel,
  CommentInput,
  CommentThread,
  CommentSummary,
  ExportDialog,
  ModeToggle,
  ViewToggle
} from './components';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import {
  TooltipProvider,
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
    rightPanelMode,
    setRightPanelMode,
    clearAllData
  } = useAppState();

  // Mobile view toggle state
  const [mobileView, setMobileView] = useState<MobileView>('editor');

  // Calculate stats
  const commentCount = Array.from(comments.values()).reduce((acc, curr) => acc + curr.length, 0);

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
                <ViewToggle
                  currentMode={rightPanelMode}
                  onModeChange={setRightPanelMode}
                />
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
              className="top-20 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl shadow-sm ring-1 ring-border/50"
              role="region"
              aria-label="File information"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight truncate">{currentFile.name}</h2>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pl-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                    {currentFile.lines.length} lines
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${comments.size > 0 ? 'bg-primary' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                    {Array.from(comments.values()).reduce((sum, c) => sum + c.length, 0)} comments
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllData} 
                    className="h-8 text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                 >
                    Change File
                 </Button>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div 
              className="lg:hidden flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/50"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-18rem)] min-h-[600px]">
              {/* Editor Panel */}
              <div 
                className={`${mobileView === 'editor' ? 'block' : 'hidden'} lg:block h-full flex flex-col group`}
                id="editor-panel"
                role="tabpanel"
                aria-label="Editor view"
              >
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden h-full flex flex-col ring-1 ring-border/50 transition-all duration-200 group-hover:shadow-md group-hover:ring-border">
                  <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500/50" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden relative bg-background">
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
                className={`${mobileView === 'preview' ? 'block' : 'hidden'} lg:block h-full flex flex-col group`}
                id="preview-panel"
                role="tabpanel"
                aria-label="Preview view"
              >
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden h-full flex flex-col ring-1 ring-border/50 transition-all duration-200 group-hover:shadow-md group-hover:ring-border">
                  <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${rightPanelMode === 'preview' ? 'bg-blue-500/50' : 'bg-orange-500/50'}`} />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {rightPanelMode === 'preview' ? 'Preview' : 'Comments'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden relative bg-background">
                    {rightPanelMode === 'preview' ? (
                      <PreviewPanel content={currentFile.content} />
                    ) : (
                      <CommentsPanel
                        fileData={currentFile}
                        comments={comments}
                        onEditComment={handleCommentEdit}
                        onDeleteComment={deleteComment}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Input - Shows when a line is selected */}
            {activeLineNumber !== null && (
              <div 
                className="fixed bottom-8 right-8 z-40 w-full max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300"
                role="region"
                aria-label={`Comments for line ${activeLineNumber}`}
              >
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border rounded-2xl shadow-2xl p-1 ring-1 ring-border/50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {activeLineNumber}
                          </span>
                          <span className="font-semibold text-sm">Line Comments</span>
                       </div>
                       <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted" onClick={() => setActiveLineNumber(null)}>
                          <X className="h-3.5 w-3.5" />
                       </Button>
                    </div>
                    
                    {activeLineComments.length > 0 ? (
                      <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-4 pr-1 scrollbar-thin">
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
