/**
 * Tests for CommentThread component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentThread } from './CommentThread';
import type { Comment } from '../types';

describe('CommentThread', () => {
  const mockComments: Comment[] = [
    {
      id: '1',
      lineNumber: 5,
      text: 'First comment',
      createdAt: new Date('2024-01-01T10:00:00'),
      updatedAt: new Date('2024-01-01T10:00:00'),
    },
    {
      id: '2',
      lineNumber: 5,
      text: 'Second comment',
      createdAt: new Date('2024-01-01T11:00:00'),
      updatedAt: new Date('2024-01-01T11:00:00'),
    },
  ];

  it('displays all comments for a line', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentThread
        lineNumber={5}
        comments={mockComments}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Line 5 Comments')).toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
  });

  it('displays comment count badge', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentThread
        lineNumber={5}
        comments={mockComments}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('2 comments')).toBeInTheDocument();
  });

  it('displays singular "comment" for single comment', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentThread
        lineNumber={5}
        comments={[mockComments[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });

  it('displays comments in chronological order', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    // Pass comments in reverse order
    const reversedComments = [...mockComments].reverse();

    render(
      <CommentThread
        lineNumber={5}
        comments={reversedComments}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const comments = screen.getAllByText(/comment$/);
    expect(comments[0]).toHaveTextContent('First comment');
    expect(comments[1]).toHaveTextContent('Second comment');
  });

  it('shows edit and delete buttons for each comment', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentThread
        lineNumber={5}
        comments={mockComments}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const editButtons = screen.getAllByLabelText('Edit this comment');
    const deleteButtons = screen.getAllByLabelText('Delete this comment');

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('shows edit mode when edit button is clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentThread
        lineNumber={5}
        comments={[mockComments[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const editButton = screen.getByLabelText('Edit this comment');
    fireEvent.click(editButton);

    expect(screen.getByText('Edit Comment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('First comment')).toBeInTheDocument();
  });

  it('calls onEdit when edit is submitted', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentThread
        lineNumber={5}
        comments={[mockComments[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Click edit button
    const editButton = screen.getByLabelText('Edit this comment');
    fireEvent.click(editButton);

    // Modify text
    const textarea = screen.getByDisplayValue('First comment');
    fireEvent.change(textarea, { target: { value: 'Updated comment' } });

    // Submit
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(onEdit).toHaveBeenCalledWith('1', 'Updated comment');
  });

  it('cancels edit mode when cancel is clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentThread
        lineNumber={5}
        comments={[mockComments[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Click edit button
    const editButton = screen.getByLabelText('Edit this comment');
    fireEvent.click(editButton);

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Should return to normal view
    expect(screen.queryByText('Edit Comment')).not.toBeInTheDocument();
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('calls onDelete when delete is confirmed', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <CommentThread
        lineNumber={5}
        comments={[mockComments[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByLabelText('Delete this comment');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('does not call onDelete when delete is cancelled', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    // Mock window.confirm to return false
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <CommentThread
        lineNumber={5}
        comments={[mockComments[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByLabelText('Delete this comment');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('shows edited indicator when comment has been updated', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const editedComment: Comment = {
      id: '1',
      lineNumber: 5,
      text: 'Edited comment',
      createdAt: new Date('2024-01-01T10:00:00'),
      updatedAt: new Date('2024-01-01T12:00:00'), // Different from createdAt
    };

    render(
      <CommentThread
        lineNumber={5}
        comments={[editedComment]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });

  it('does not show edited indicator for unedited comments', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <CommentThread
        lineNumber={5}
        comments={[mockComments[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.queryByText('(edited)')).not.toBeInTheDocument();
  });
});
