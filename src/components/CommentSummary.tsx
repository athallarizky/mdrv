/**
 * CommentSummary component for displaying all comments grouped by line
 * Shows line number, line content preview, and associated comments
 * Provides navigation to specific lines and export functionality
 * Supports both card view and JSON view modes
 */

import { useState } from 'react';
import type { FileData, CommentMap } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, MessageSquare, FileText, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Props for CommentSummary component
 */
export interface CommentSummaryProps {
  isOpen: boolean;
  comments: CommentMap;
  fileData: FileData;
  onLineNavigate: (lineNumber: number) => void;
  onExport: () => void;
  onClose: () => void;
}

/**
 * CommentSummary component
 * Displays all comments grouped by line number
 * Allows navigation to specific lines and exporting comments
 * Supports both card view and JSON view modes
 */
export function CommentSummary({
  isOpen,
  comments,
  fileData,
  onLineNavigate,
  onExport,
  onClose,
}: CommentSummaryProps) {
  // View mode state: 'card' or 'json'
  const [viewMode, setViewMode] = useState<'card' | 'json'>('card');
  const [copied, setCopied] = useState(false);

  // Get all line numbers that have comments, sorted
  const lineNumbersWithComments = Array.from(comments.keys()).sort((a, b) => a - b);
  
  // Calculate total comment count
  const totalComments = Array.from(comments.values()).reduce(
    (sum, commentList) => sum + commentList.length,
    0
  );

  /**
   * Get a preview of the line content (truncated if too long)
   */
  const getLinePreview = (lineNumber: number): string => {
    const line = fileData.lines[lineNumber - 1] || '';
    const maxLength = 80;
    
    if (line.length <= maxLength) {
      return line || '(empty line)';
    }
    
    return line.substring(0, maxLength) + '...';
  };

  /**
   * Handle line navigation
   */
  const handleLineClick = (lineNumber: number) => {
    onLineNavigate(lineNumber);
  };

  /**
   * Generate JSON representation of comments
   */
  const generateJSON = (): string => {
    const jsonData = lineNumbersWithComments.map((lineNumber) => {
      const lineComments = comments.get(lineNumber) || [];
      const lineContent = fileData.lines[lineNumber - 1] || '';
      
      return {
        line: lineNumber,
        line_content: lineContent,
        comments: lineComments.map(c => c.text),
      };
    });

    return JSON.stringify(jsonData, null, 2);
  };

  /**
   * Copy JSON to clipboard
   */
  const handleCopyJSON = async () => {
    try {
      const jsonText = generateJSON();
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      toast.success('JSON copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy JSON:', error);
      toast.error('Failed to copy JSON to clipboard');
    }
  };

  // Empty state content
  const emptyStateContent = (
    <div 
      className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
      role="status"
    >
      <MessageSquare className="h-16 w-16 mb-4 opacity-50" aria-hidden="true" />
      <p className="text-base font-medium">No comments yet</p>
      <p className="text-sm mt-2">Click on line numbers to add comments</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[85vh] flex flex-col"
        aria-describedby="comment-summary-description"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Comment Summary</DialogTitle>
              <DialogDescription id="comment-summary-description">
                {totalComments === 0 
                  ? 'No comments in this file yet'
                  : `${totalComments} ${totalComments === 1 ? 'comment' : 'comments'} in ${fileData.name}`
                }
              </DialogDescription>
            </div>
            {totalComments > 0 && (
              <div className="flex items-center gap-2" role="group" aria-label="Summary actions">
                <Badge variant="secondary" className="text-sm" aria-label={`${totalComments} total comments`}>
                  {totalComments}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="gap-2"
                  aria-label="Export all comments"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            )}
          </div>
          
          {/* View mode toggle */}
          {totalComments > 0 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="flex flex-col gap-2">
                <div className="flex p-1 bg-muted/50 rounded-xl gap-2 border border-border/50">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${viewMode === 'card' ? 'shadow-sm' : 'hover:bg-background/50'}`}
                    aria-label="Card view"
                    aria-pressed={viewMode === 'card'}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'json' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('json')}
                    className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${viewMode === 'json' ? 'shadow-sm' : 'hover:bg-background/50'}`}
                    aria-label="JSON view"
                    aria-pressed={viewMode === 'json'}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    JSON
                  </Button>
                </div>
              </div>
              
              {/* Copy JSON button (only visible in JSON mode) */}
              {viewMode === 'json' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJSON}
                  className="h-8 gap-2 rounded-lg border-border/50 shadow-sm"
                  aria-label="Copy JSON to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="text-xs">Copy JSON</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 min-h-0 -mx-6 bg-muted/5">
          {totalComments === 0 ? (
            emptyStateContent
          ) : viewMode === 'json' ? (
            // JSON View
            <ScrollArea className="h-full px-6">
              <div className="py-6">
                <div className="relative rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-9 bg-muted/30 border-b flex items-center px-4">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
                    </div>
                    <span className="ml-3 text-[10px] font-mono text-muted-foreground">comments.json</span>
                  </div>
                  <pre className="p-4 pt-12 text-xs font-mono overflow-x-auto leading-relaxed text-foreground/80">
                    <code>{generateJSON()}</code>
                  </pre>
                </div>
              </div>
            </ScrollArea>
          ) : (
            // Card View
            <ScrollArea className="h-full px-6">
              <ul className="space-y-6 py-6" role="list" aria-label="Comments grouped by line">
                {lineNumbersWithComments.map((lineNumber) => {
                  const lineComments = comments.get(lineNumber) || [];
                  const linePreview = getLinePreview(lineNumber);
                  
                  // Sort comments chronologically
                  const sortedComments = [...lineComments].sort(
                    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
                  );

                  return (
                    <li
                      key={lineNumber}
                      className="group relative bg-card border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Line header with navigation */}
                      <button
                        onClick={() => handleLineClick(lineNumber)}
                        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                        aria-label={`Navigate to line ${lineNumber}`}
                      >
                        <div className="px-4 py-3 border-b bg-muted/20 flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="bg-background shadow-sm border-border/50 group-hover:border-primary/50 transition-colors"
                          >
                            Line {lineNumber}
                          </Badge>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <code className="text-xs font-mono text-muted-foreground truncate flex-1">
                              {linePreview}
                            </code>
                          </div>
                          <div className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-background border">
                            {lineComments.length}
                          </div>
                        </div>
                      </button>

                      {/* Comments for this line */}
                      <div className="p-4 space-y-3 bg-gradient-to-b from-transparent to-muted/5">
                        {sortedComments.map((comment, index) => (
                          <div
                            key={`${lineNumber}-${comment.id}-${index}`}
                            className="relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20 before:rounded-full"
                          >
                            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                              {comment.text}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                                {comment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
                                <span className="text-[10px] text-muted-foreground italic">(edited)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
