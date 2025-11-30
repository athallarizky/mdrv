/**
 * CommentInput component for adding or editing comments on specific lines
 * Handles both create and edit modes with validation
 */

import { useState } from 'react';
import type { Comment } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

/**
 * Props for CommentInput component
 */
export interface CommentInputProps {
  lineNumber: number;
  existingComment?: Comment;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

/**
 * CommentInput component
 * Provides textarea for comment input with submit and cancel buttons
 * Validates empty/whitespace-only comments
 * Supports both create and edit modes
 */
export function CommentInput({
  lineNumber,
  existingComment,
  onSubmit,
  onCancel,
}: CommentInputProps) {
  // Initialize text from existing comment, will reset when component remounts with new key
  const [text, setText] = useState(existingComment?.text || '');
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate comment text
   * Returns true if valid, false if invalid
   */
  const validateText = (value: string): boolean => {
    // Check if text is empty or only whitespace
    if (!value.trim()) {
      setError('Comment cannot be empty');
      return false;
    }
    
    setError(null);
    return true;
  };

  /**
   * Handle submit button click
   */
  const handleSubmit = () => {
    if (validateText(text)) {
      onSubmit(text);
      setText('');
      setError(null);
    }
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    setText('');
    setError(null);
    onCancel();
  };

  /**
   * Handle textarea change
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    
    // Cancel on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const isEditMode = !!existingComment;

  return (
    <TooltipProvider>
      <div 
        className="space-y-3 p-4 border rounded-md bg-background"
        role="form"
        aria-label={isEditMode ? 'Edit comment form' : 'Add comment form'}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" id={`comment-form-heading-${lineNumber}`}>
            {isEditMode ? 'Edit Comment' : `Add Comment to Line ${lineNumber}`}
          </h3>
        </div>
        
        <Textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter your comment..."
          className="min-h-[100px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
          autoFocus
          aria-label={isEditMode ? 'Edit comment text' : 'Comment text'}
          aria-invalid={!!error}
          aria-describedby={error ? 'comment-error' : 'comment-hint'}
          aria-labelledby={`comment-form-heading-${lineNumber}`}
        />
        
        {error && (
          <p id="comment-error" className="text-sm text-destructive" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        
        <div className="flex gap-2 justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={handleCancel}
                type="button"
                aria-label="Cancel comment"
              >
                Cancel
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Discard changes (Esc)</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSubmit}
                type="button"
                aria-label={isEditMode ? 'Save comment changes' : 'Add comment'}
              >
                {isEditMode ? 'Save' : 'Add Comment'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isEditMode ? 'Save changes' : 'Add comment'} (Ctrl+Enter)</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <p id="comment-hint" className="text-xs text-muted-foreground" role="note">
          Tip: Press Ctrl+Enter to submit, Escape to cancel
        </p>
      </div>
    </TooltipProvider>
  );
}
