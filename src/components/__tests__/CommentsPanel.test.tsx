/**
 * Property-based tests for CommentsPanel component
 * Using fast-check for property-based testing
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { CommentsPanel } from '../CommentsPanel';
import type { FileData, CommentMap, Comment } from '../types';

describe('CommentsPanel - Property-Based Tests', () => {
  // Generators for property-based testing
  const lineContentArb = fc.string({ maxLength: 100 });
  const fileDataArb = fc.array(lineContentArb, { minLength: 1, maxLength: 50 }).map(
    (lines): FileData => ({
      id: 'test-file-id',
      name: 'test.md',
      content: lines.join('\n'),
      lines,
      uploadedAt: new Date(),
    })
  );

  const commentTextArb = fc.string({ minLength: 1, maxLength: 200 });

  /**
   * Feature: md-review-app, Property 20: Comments panel completeness
   * Validates: Requirements 9.3
   * 
   * For any file with comments, when in Comments mode, all comments should be 
   * displayed aligned with their corresponding line numbers.
   */
  it('Property 20: Comments panel completeness - all comments displayed with line numbers', () => {
    fc.assert(
      fc.property(
        fileDataArb,
        fc.array(
          fc.record({
            lineIndex: fc.integer({ min: 0, max: 49 }),
            commentText: commentTextArb,
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (fileData, commentSpecs) => {
          // Create comment map with comments on specified lines
          const commentMap: CommentMap = new Map();
          const allComments: Comment[] = [];

          for (const spec of commentSpecs) {
            if (spec.lineIndex < fileData.lines.length) {
              const lineNumber = spec.lineIndex + 1; // 1-indexed
              const comment: Comment = {
                id: `comment-${lineNumber}-${Math.random()}`,
                lineNumber,
                text: spec.commentText,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              // Add to map
              const existing = commentMap.get(lineNumber) || [];
              commentMap.set(lineNumber, [...existing, comment]);
              allComments.push(comment);
            }
          }

          // Render the component
          const { container } = render(
            <CommentsPanel
              fileData={fileData}
              comments={commentMap}
              onEditComment={() => {}}
              onDeleteComment={() => {}}
            />
          );

          // Verify all comments are displayed
          for (const comment of allComments) {
            // Check that the comment text appears in the rendered output
            const commentElements = container.querySelectorAll('p');
            const found = Array.from(commentElements).some(
              (el) => el.textContent === comment.text
            );
            expect(found).toBe(true);

            // Check that the line number is displayed for this comment
            const lineNumberElements = container.querySelectorAll('[data-line-number]');
            const lineNumberFound = Array.from(lineNumberElements).some(
              (el) => el.getAttribute('data-line-number') === String(comment.lineNumber)
            );
            expect(lineNumberFound).toBe(true);
          }

          // Verify that each line in the file has a corresponding row in the panel
          const lineNumberElements = container.querySelectorAll('[data-line-number]');
          expect(lineNumberElements.length).toBe(fileData.lines.length);

          // Verify line numbers are sequential and complete
          for (let i = 0; i < fileData.lines.length; i++) {
            const expectedLineNumber = i + 1;
            const lineElement = Array.from(lineNumberElements).find(
              (el) => el.getAttribute('data-line-number') === String(expectedLineNumber)
            );
            expect(lineElement).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: md-review-app, Property 22: Comments panel line alignment
   * Validates: Requirements 9.7
   * 
   * For any line number in the editor, the corresponding position in the Comments 
   * panel should align with the same line number, whether or not a comment exists 
   * for that line.
   */
  it('Property 22: Comments panel line alignment - all lines present in order', () => {
    fc.assert(
      fc.property(
        fileDataArb,
        fc.array(fc.integer({ min: 0, max: 49 }), { maxLength: 10 }), // Line indices with comments
        (fileData, commentLineIndices) => {
          // Create comment map with comments on specified lines
          const commentMap: CommentMap = new Map();
          const uniqueLineIndices = [...new Set(commentLineIndices)];

          for (const lineIndex of uniqueLineIndices) {
            if (lineIndex < fileData.lines.length) {
              const lineNumber = lineIndex + 1; // 1-indexed
              const comment: Comment = {
                id: `comment-${lineNumber}`,
                lineNumber,
                text: `Comment on line ${lineNumber}`,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              commentMap.set(lineNumber, [comment]);
            }
          }

          // Render the component
          const { container } = render(
            <CommentsPanel
              fileData={fileData}
              comments={commentMap}
              onEditComment={() => {}}
              onDeleteComment={() => {}}
            />
          );

          // Get all line elements in order
          const lineElements = container.querySelectorAll('[data-line-number]');

          // Verify we have exactly one element per line
          expect(lineElements.length).toBe(fileData.lines.length);

          // Verify line numbers are in sequential order (1, 2, 3, ...)
          for (let i = 0; i < lineElements.length; i++) {
            const expectedLineNumber = i + 1;
            const actualLineNumber = lineElements[i].getAttribute('data-line-number');
            expect(actualLineNumber).toBe(String(expectedLineNumber));
          }

          // Verify that lines without comments still have a placeholder
          for (let i = 0; i < fileData.lines.length; i++) {
            const lineNumber = i + 1;
            const hasComments = commentMap.has(lineNumber);

            // Find the line element
            const lineElement = Array.from(lineElements).find(
              (el) => el.getAttribute('data-line-number') === String(lineNumber)
            );

            expect(lineElement).toBeDefined();

            if (!hasComments) {
              // Lines without comments should have a placeholder (empty space)
              // The placeholder is rendered as a div with specific aria-label
              const placeholder = lineElement!.querySelector('[aria-label="No comments for this line"]');
              expect(placeholder).not.toBeNull();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: md-review-app, Property 21: Inline comment edit persistence
   * Validates: Requirements 9.8
   * 
   * For any comment edited in Comments mode, the updated text should be immediately 
   * persisted to local storage and reflected in all views.
   */
  it('Property 21: Inline comment edit persistence - edits trigger persistence callback', () => {
    fc.assert(
      fc.property(
        fileDataArb,
        fc.integer({ min: 0, max: 49 }), // Line index for comment
        commentTextArb, // Original comment text
        commentTextArb, // New comment text
        (fileData, lineIndex, originalText, newText) => {
          // Skip if line index is out of bounds or texts are the same or empty
          if (lineIndex >= fileData.lines.length || originalText === newText || !originalText.trim() || !newText.trim()) {
            return true;
          }

          const lineNumber = lineIndex + 1;
          
          // Create a single comment (to avoid multiple edit textareas)
          const comment: Comment = {
            id: `comment-${lineNumber}-${Math.random()}`,
            lineNumber,
            text: originalText,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Create comment map with only one comment
          const commentMap: CommentMap = new Map();
          commentMap.set(lineNumber, [comment]);

          // Track if onEditComment was called
          let editCallbackCalled = false;
          let capturedCommentId = '';
          let capturedNewText = '';

          const handleEditComment = (commentId: string, text: string) => {
            editCallbackCalled = true;
            capturedCommentId = commentId;
            capturedNewText = text;
          };

          // Render the component
          const { container, getAllByLabelText, getAllByText } = render(
            <CommentsPanel
              fileData={fileData}
              comments={commentMap}
              onEditComment={handleEditComment}
              onDeleteComment={() => {}}
            />
          );

          // Find the edit button for the comment
          const editButtons = container.querySelectorAll('[aria-label="Edit comment"]');
          
          // Should have exactly one edit button (since we only have one comment)
          expect(editButtons.length).toBe(1);

          // Click the edit button to enter edit mode
          const editButton = editButtons[0] as HTMLButtonElement;
          fireEvent.click(editButton);

          // Find the textarea that should now be visible
          const textareas = getAllByLabelText('Edit comment text') as HTMLTextAreaElement[];
          expect(textareas.length).toBeGreaterThan(0);
          const textarea = textareas[0];
          
          // Verify initial value
          expect(textarea.value).toBe(originalText);

          // Change the text - clear first, then set new value
          fireEvent.change(textarea, { target: { value: newText } });
          
          // Verify the textarea value was updated
          expect(textarea.value).toBe(newText);

          // Find and click the save button
          const saveButtons = getAllByText('Save') as HTMLButtonElement[];
          expect(saveButtons.length).toBeGreaterThan(0);
          fireEvent.click(saveButtons[0]);

          // Verify the callback was called with correct parameters
          expect(editCallbackCalled).toBe(true);
          expect(capturedCommentId).toBe(comment.id);
          expect(capturedNewText).toBe(newText);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('CommentsPanel - Unit Tests', () => {
  /**
   * Unit test for delete functionality
   * Validates: Requirements 9.5
   * 
   * Tests that the delete button triggers confirmation and calls onDeleteComment
   */
  it('should show delete button and call onDeleteComment when confirmed', () => {
    // Create test data
    const fileData: FileData = {
      id: 'test-file',
      name: 'test.md',
      content: 'Line 1\nLine 2\nLine 3',
      lines: ['Line 1', 'Line 2', 'Line 3'],
      uploadedAt: new Date(),
    };

    const comment: Comment = {
      id: 'comment-1',
      lineNumber: 2,
      text: 'Test comment',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const commentMap: CommentMap = new Map();
    commentMap.set(2, [comment]);

    // Mock the delete callback
    const handleDeleteComment = vi.fn();

    // Render the component
    const { container, getByRole, getByText } = render(
      <CommentsPanel
        fileData={fileData}
        comments={commentMap}
        onEditComment={() => {}}
        onDeleteComment={handleDeleteComment}
      />
    );

    // Find the delete button
    const deleteButton = container.querySelector('[aria-label="Delete comment"]') as HTMLButtonElement;
    expect(deleteButton).not.toBeNull();

    // Click the delete button to open dialog
    fireEvent.click(deleteButton);

    // Verify dialog is shown
    expect(getByText('Delete Comment')).toBeInTheDocument();

    // Click confirm button in dialog (find by text)
    const confirmButton = getByText('Delete');
    fireEvent.click(confirmButton);

    // Verify onDeleteComment was called with correct comment ID
    expect(handleDeleteComment).toHaveBeenCalledWith('comment-1');
    expect(handleDeleteComment).toHaveBeenCalledTimes(1);
  });

  it('should not call onDeleteComment when user cancels confirmation', () => {
    // Create test data
    const fileData: FileData = {
      id: 'test-file',
      name: 'test.md',
      content: 'Line 1\nLine 2',
      lines: ['Line 1', 'Line 2'],
      uploadedAt: new Date(),
    };

    const comment: Comment = {
      id: 'comment-1',
      lineNumber: 1,
      text: 'Test comment',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const commentMap: CommentMap = new Map();
    commentMap.set(1, [comment]);

    // Mock the delete callback
    const handleDeleteComment = vi.fn();

    // Render the component
    const { container, getByRole, getByText } = render(
      <CommentsPanel
        fileData={fileData}
        comments={commentMap}
        onEditComment={() => {}}
        onDeleteComment={handleDeleteComment}
      />
    );

    // Find the delete button
    const deleteButton = container.querySelector('[aria-label="Delete comment"]') as HTMLButtonElement;
    expect(deleteButton).not.toBeNull();

    // Click the delete button to open dialog
    fireEvent.click(deleteButton);

    // Verify dialog is shown
    expect(getByText('Delete Comment')).toBeInTheDocument();

    // Click cancel button in dialog (find by text)
    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    // Verify onDeleteComment was NOT called
    expect(handleDeleteComment).not.toHaveBeenCalled();
  });

  it('should have delete button for each comment', () => {
    // Create test data with multiple comments on same line
    const fileData: FileData = {
      id: 'test-file',
      name: 'test.md',
      content: 'Line 1\nLine 2',
      lines: ['Line 1', 'Line 2'],
      uploadedAt: new Date(),
    };

    const comments: Comment[] = [
      {
        id: 'comment-1',
        lineNumber: 1,
        text: 'First comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'comment-2',
        lineNumber: 1,
        text: 'Second comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const commentMap: CommentMap = new Map();
    commentMap.set(1, comments);

    // Render the component
    const { container } = render(
      <CommentsPanel
        fileData={fileData}
        comments={commentMap}
        onEditComment={() => {}}
        onDeleteComment={() => {}}
      />
    );

    // Find all delete buttons
    const deleteButtons = container.querySelectorAll('[aria-label="Delete comment"]');
    
    // Should have one delete button per comment
    expect(deleteButtons.length).toBe(2);
  });
});
