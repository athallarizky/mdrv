/**
 * CommentThread component for displaying and managing comments on a specific line
 * Shows list of comments with edit and delete functionality
 */

import { useState } from 'react';
import type { Comment } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CommentInput } from './CommentInput';
import { Pencil, Trash2, Clock } from 'lucide-react';

/**
 * Props for CommentThread component
 */
export interface CommentThreadProps {
  lineNumber: number;
  comments: Comment[];
  onEdit: (commentId: string, text: string) => void;
  onDelete: (commentId: string) => void;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  return date.toLocaleDateString();
}

/**
 * CommentThread component
 * Displays all comments for a line in chronological order
 * Provides edit and delete actions for each comment
 */
export function CommentThread({
  lineNumber,
  comments,
  onEdit,
  onDelete,
}: CommentThreadProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  /**
   * Handle edit button click
   */
  const handleEditClick = (commentId: string) => {
    setEditingCommentId(commentId);
  };

  /**
   * Handle edit submit
   */
  const handleEditSubmit = (commentId: string, text: string) => {
    onEdit(commentId, text);
    setEditingCommentId(null);
  };

  /**
   * Handle edit cancel
   */
  const handleEditCancel = () => {
    setEditingCommentId(null);
  };

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (commentId: string) => {
    // Simple confirmation
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(commentId);
    }
  };

  // Sort comments chronologically (oldest first)
  const sortedComments = [...comments].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <Card className="w-full" role="region" aria-label={`Comments for line ${lineNumber}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base" id={`comment-thread-${lineNumber}`}>
            Line {lineNumber} Comments
          </CardTitle>
          <Badge variant="secondary" aria-label={`${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}>
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <ul className="space-y-3" aria-labelledby={`comment-thread-${lineNumber}`}>
          {sortedComments.map((comment) => (
            <li key={comment.id}>
              {editingCommentId === comment.id ? (
                <CommentInput
                  key={comment.id}
                  lineNumber={lineNumber}
                  existingComment={comment}
                  onSubmit={(text) => handleEditSubmit(comment.id, text)}
                  onCancel={handleEditCancel}
                />
              ) : (
                <article 
                  className="border rounded-xl p-3 space-y-2 bg-muted/30 transition-all hover:bg-muted/50"
                  aria-label="Comment"
                >
                  {/* Comment text */}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>
                  
                  {/* Timestamp and actions */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <time dateTime={comment.createdAt.toISOString()}>
                        {formatTimestamp(comment.createdAt)}
                      </time>
                      {comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
                        <span className="italic" aria-label="edited">(edited)</span>
                      )}
                    </div>
                    
                    <div className="flex gap-1" role="group" aria-label="Comment actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(comment.id)}
                        className="h-7 px-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Edit this comment"
                      >
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(comment.id)}
                        className="h-7 px-2 text-destructive hover:text-destructive focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                        aria-label="Delete this comment"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </article>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
