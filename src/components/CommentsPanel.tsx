/**
 * CommentsPanel component for displaying comments aligned with line numbers
 * Shows all comments in a line-by-line layout matching the editor panel
 * Supports inline editing and deletion of comments
 */

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { FileData, CommentMap, Comment } from '../types';

/**
 * Props for CommentsPanel component
 */
export interface CommentsPanelProps {
  fileData: FileData;
  comments: CommentMap;
  onEditComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
  scrollLineNumber?: number; // For syncing scroll with editor
}

/**
 * CommentsPanel component
 * Displays comments aligned with their corresponding line numbers
 */
export function CommentsPanel({
  fileData,
  comments,
  onEditComment,
  onDeleteComment,
}: CommentsPanelProps) {
  // Track which comment is being edited
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editError, setEditError] = useState<string | null>(null);

  /**
   * Get comments for a specific line
   */
  const getCommentsForLine = (lineNumber: number): Comment[] => {
    return comments.get(lineNumber) || [];
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Start editing a comment
   */
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
    setEditError(null);
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditText('');
    setEditError(null);
  };

  /**
   * Save edited comment
   */
  const saveEdit = (commentId: string) => {
    // Validate text
    if (!editText.trim()) {
      setEditError('Comment cannot be empty');
      return;
    }

    // Call the update handler
    onEditComment(commentId, editText);
    
    // Reset edit state
    setEditingCommentId(null);
    setEditText('');
    setEditError(null);
  };

  /**
   * Handle keyboard shortcuts in edit mode
   */
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, commentId: string) => {
    // Save on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      saveEdit(commentId);
    }
    
    // Cancel on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="font-mono text-sm" role="list" aria-label="Comments aligned with line numbers">
        {fileData.lines.map((_, index) => {
          const lineNumber = index + 1;
          const lineComments = getCommentsForLine(lineNumber);
          const hasComments = lineComments.length > 0;

          return (
            <div
              key={lineNumber}
              className="flex border-b border-border/50 min-h-[2.5rem]"
              role="listitem"
              data-line-number={lineNumber}
            >
              {/* Line number indicator */}
              <div
                className={`
                  flex items-start justify-end px-3 py-2 min-w-[4rem] border-r
                  text-muted-foreground select-none
                  ${hasComments ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''}
                `}
                aria-label={`Line ${lineNumber}`}
              >
                <span>{lineNumber}</span>
              </div>

              {/* Comments or empty placeholder */}
              <div className="flex-1 px-4 py-2">
                {hasComments ? (
                  <div className="space-y-3">
                    {lineComments.map((comment) => {
                      const isEditing = editingCommentId === comment.id;

                      return (
                        <Card
                          key={comment.id}
                          className="p-3 bg-muted/30 border-border/50"
                        >
                          {isEditing ? (
                            // Edit mode: show textarea with save/cancel buttons
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {formatTimestamp(comment.createdAt)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">Editing...</span>
                              </div>
                              <Textarea
                                value={editText}
                                onChange={(e) => {
                                  setEditText(e.target.value);
                                  if (editError) setEditError(null);
                                }}
                                onKeyDown={(e) => handleEditKeyDown(e, comment.id)}
                                className="min-h-[80px] text-sm"
                                autoFocus
                                aria-label="Edit comment text"
                                aria-invalid={!!editError}
                              />
                              {editError && (
                                <p className="text-xs text-destructive" role="alert">
                                  {editError}
                                </p>
                              )}
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditing}
                                  aria-label="Cancel editing"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(comment.id)}
                                  aria-label="Save changes"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Tip: Ctrl+Enter to save, Escape to cancel
                              </p>
                            </div>
                          ) : (
                            // View mode: show comment with edit/delete buttons
                            <>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {formatTimestamp(comment.createdAt)}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => startEditing(comment)}
                                    aria-label="Edit comment"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      if (confirm('Delete this comment?')) {
                                        onDeleteComment(comment.id);
                                      }
                                    }}
                                    aria-label="Delete comment"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {comment.text}
                              </p>
                            </>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="text-muted-foreground/30 text-xs italic py-1"
                    aria-label="No comments for this line"
                  >
                    {/* Empty placeholder to maintain line height */}
                    &nbsp;
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
