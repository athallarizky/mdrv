/**
 * CommentSummary component for displaying all comments grouped by line
 * Shows line number, line content preview, and associated comments
 * Provides navigation to specific lines and export functionality
 */

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
import { Download, MessageSquare, FileText } from 'lucide-react';

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
 */
export function CommentSummary({
  isOpen,
  comments,
  fileData,
  onLineNavigate,
  onExport,
  onClose,
}: CommentSummaryProps) {
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
        </DialogHeader>
        
        <div className="flex-1 min-h-0 -mx-6">
          {totalComments === 0 ? (
            emptyStateContent
          ) : (
            <ScrollArea className="h-full px-6">
              <ul className="space-y-4 py-4" role="list" aria-label="Comments grouped by line">
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
                      className="border rounded-xl p-4 hover:bg-muted/50 transition-all duration-200"
                    >
                      {/* Line header with navigation */}
                      <button
                        onClick={() => handleLineClick(lineNumber)}
                        className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                        aria-label={`Navigate to line ${lineNumber} with ${lineComments.length} ${lineComments.length === 1 ? 'comment' : 'comments'}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Badge
                            variant="outline"
                            className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            aria-hidden="true"
                          >
                            Line {lineNumber}
                          </Badge>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <FileText className="h-3 w-3" aria-hidden="true" />
                              <span className="font-medium">Line content:</span>
                            </div>
                            <code className="text-sm font-mono block truncate group-hover:text-foreground transition-colors">
                              {linePreview}
                            </code>
                          </div>
                        </div>
                      </button>

                      {/* Comments for this line */}
                      <ul 
                        className="space-y-2 ml-2 pl-4 border-l-2 border-muted"
                        aria-label={`${lineComments.length} ${lineComments.length === 1 ? 'comment' : 'comments'} on line ${lineNumber}`}
                      >
                        {sortedComments.map((comment, index) => (
                          <li
                            key={`${lineNumber}-${comment.id}-${index}`}
                            className="text-sm bg-muted/30 rounded p-3"
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {comment.text}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              <time dateTime={comment.createdAt.toISOString()}>
                                {comment.createdAt.toLocaleString()}
                              </time>
                              {comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
                                <span className="italic ml-1" aria-label="edited">(edited)</span>
                              )}
                            </p>
                          </li>
                        ))}
                      </ul>
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
