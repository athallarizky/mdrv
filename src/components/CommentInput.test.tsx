/**
 * Tests for CommentInput component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentInput } from './CommentInput';
import type { Comment } from '../types';

describe('CommentInput', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    lineNumber: 5,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render with correct title for create mode', () => {
      render(<CommentInput {...defaultProps} />);
      expect(screen.getByText('Add Comment to Line 5')).toBeInTheDocument();
    });

    it('should render textarea with placeholder', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');
      expect(textarea).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      render(<CommentInput {...defaultProps} />);
      expect(screen.getByRole('button', { name: /add comment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should call onSubmit with text when valid comment is submitted', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');
      const submitButton = screen.getByRole('button', { name: /add comment/i });

      fireEvent.change(textarea, { target: { value: 'This is a comment' } });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('This is a comment');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when comment is empty', () => {
      render(<CommentInput {...defaultProps} />);
      const submitButton = screen.getByRole('button', { name: /add comment/i });

      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Comment cannot be empty')).toBeInTheDocument();
    });

    it('should not call onSubmit when comment is only whitespace', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');
      const submitButton = screen.getByRole('button', { name: /add comment/i });

      fireEvent.change(textarea, { target: { value: '   \n\t  ' } });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Comment cannot be empty')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<CommentInput {...defaultProps} />);
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should clear error when user starts typing', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');
      const submitButton = screen.getByRole('button', { name: /add comment/i });

      // Trigger error
      fireEvent.click(submitButton);
      expect(screen.getByText('Comment cannot be empty')).toBeInTheDocument();

      // Start typing
      fireEvent.change(textarea, { target: { value: 'New text' } });
      expect(screen.queryByText('Comment cannot be empty')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    const existingComment: Comment = {
      id: 'comment-1',
      lineNumber: 5,
      text: 'Original comment text',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should render with correct title for edit mode', () => {
      render(<CommentInput {...defaultProps} existingComment={existingComment} />);
      expect(screen.getByText('Edit Comment')).toBeInTheDocument();
    });

    it('should initialize textarea with existing comment text', () => {
      render(<CommentInput {...defaultProps} existingComment={existingComment} />);
      const textarea = screen.getByDisplayValue('Original comment text');
      expect(textarea).toBeInTheDocument();
    });

    it('should show "Save" button in edit mode', () => {
      render(<CommentInput {...defaultProps} existingComment={existingComment} />);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should call onSubmit with updated text when saved', () => {
      render(<CommentInput {...defaultProps} existingComment={existingComment} />);
      const textarea = screen.getByDisplayValue('Original comment text');
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(textarea, { target: { value: 'Updated comment text' } });
      fireEvent.click(saveButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('Updated comment text');
    });

    it('should not allow saving empty comment in edit mode', () => {
      render(<CommentInput {...defaultProps} existingComment={existingComment} />);
      const textarea = screen.getByDisplayValue('Original comment text');
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.click(saveButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Comment cannot be empty')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should submit on Ctrl+Enter', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');

      fireEvent.change(textarea, { target: { value: 'Comment text' } });
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(mockOnSubmit).toHaveBeenCalledWith('Comment text');
    });

    it('should submit on Cmd+Enter (Mac)', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');

      fireEvent.change(textarea, { target: { value: 'Comment text' } });
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

      expect(mockOnSubmit).toHaveBeenCalledWith('Comment text');
    });

    it('should cancel on Escape', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');

      fireEvent.keyDown(textarea, { key: 'Escape' });

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByLabelText('Add comment');
      expect(textarea).toBeInTheDocument();
    });

    it('should set aria-invalid when there is an error', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');
      const submitButton = screen.getByRole('button', { name: /add comment/i });

      fireEvent.click(submitButton);

      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'comment-error');
    });

    it('should have autofocus on textarea', () => {
      render(<CommentInput {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('Enter your comment...');
      // In React, autoFocus is applied but doesn't show as an HTML attribute in tests
      // We can verify the element is focused instead
      expect(textarea).toHaveFocus();
    });
  });
});
