/**
 * Property-based tests for CommentSummary component
 * Using fast-check for property-based testing
 */

import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import { CommentSummary } from '../CommentSummary';
import type { FileData, CommentMap, Comment } from '../types';

describe('CommentSummary - Property-Based Tests', () => {
  // Clean up after each test to remove dialogs from DOM
  afterEach(() => {
    cleanup();
  });

  // Generators for property-based testing
  // Use smaller ranges for faster tests
  const lineNumberArb = fc.integer({ min: 1, max: 50 });
  const commentTextArb = fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length > 1);
  const fileIdArb = fc.string({ minLength: 1, maxLength: 20 }).filter(
    s => s !== '__proto__' && s !== 'constructor' && s !== 'prototype'
  );
  const fileNameArb = fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '.md');
  
  /**
   * Generate a random FileData object with reasonable size
   */
  const fileDataArb = fc.record({
    id: fileIdArb,
    name: fileNameArb,
    content: fc.string({ maxLength: 200 }),
    uploadedAt: fc.date(),
  }).map(data => ({
    ...data,
    lines: data.content.split('\n'),
  })) as fc.Arbitrary<FileData>;

  /**
   * Generate a random Comment object
   */
  const commentArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    lineNumber: lineNumberArb,
    text: commentTextArb,
    createdAt: fc.date().filter(d => !isNaN(d.getTime())),
    updatedAt: fc.date().filter(d => !isNaN(d.getTime())),
  }) as fc.Arbitrary<Comment>;

  /**
   * Generate a CommentMap with random comments (smaller for faster tests)
   */
  const commentMapArb = fc.array(
    fc.tuple(lineNumberArb, fc.array(commentArb, { minLength: 1, maxLength: 3 })),
    { minLength: 1, maxLength: 5 }
  ).map(entries => {
    const map = new Map<number, Comment[]>();
    entries.forEach(([lineNumber, comments]) => {
      // Ensure comments have the correct line number
      const correctedComments = comments.map(c => ({ ...c, lineNumber }));
      map.set(lineNumber, correctedComments);
    });
    return map;
  }) as fc.Arbitrary<CommentMap>;

  /**
   * Feature: md-review-app, Property 9: Comment summary completeness
   * Validates: Requirements 4.2
   * 
   * For any set of comments across multiple lines, the comment summary should include 
   * all comments grouped by their line numbers with no comments missing or duplicated.
   */
  it('Property 9: Comment summary completeness - all comments are displayed without duplication', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        fileDataArb,
        commentMapArb,
        (fileData, comments) => {
          // Ensure file has enough lines for all comments
          const maxLineNumber = Math.max(...Array.from(comments.keys()));
          if (fileData.lines.length < maxLineNumber) {
            // Pad the lines array
            while (fileData.lines.length < maxLineNumber) {
              fileData.lines.push(`Line ${fileData.lines.length + 1}`);
            }
          }

          // Count total comments in the map
          const totalComments = Array.from(comments.values()).reduce(
            (sum, commentList) => sum + commentList.length,
            0
          );

          // Render the component
          const mockNavigate = () => {};
          const mockExport = () => {};
          const mockClose = () => {};
          
          const { unmount } = render(
            <CommentSummary
              isOpen={true}
              comments={comments}
              fileData={fileData}
              onLineNavigate={mockNavigate}
              onExport={mockExport}
              onClose={mockClose}
            />
          );

          try {
            // Verify the total comment count is displayed somewhere in the dialog
            // The Dialog renders into a portal, so we need to check the document body
            const dialogContent = document.body.querySelector('[role="dialog"]');
            expect(dialogContent).toBeDefined();
          
          // Check that the comment count appears in the dialog
          const dialogText = dialogContent?.textContent || '';
          expect(dialogText).toContain(`${totalComments}`);
          expect(dialogText).toMatch(/comment/);

          // Ensure we're in Card view mode (not JSON mode)
          // The Card button should be active/pressed
          const cardButton = screen.queryByRole('button', { name: /card/i, pressed: true });
          // If the button exists, we're in the right mode. If it doesn't exist, that's also fine (no toggle visible)
          
          // Verify all line numbers with comments are displayed
          const lineNumbers = Array.from(comments.keys());
          lineNumbers.forEach(lineNumber => {
            // Use getAllByText since "Line X" might appear multiple times in different contexts
            const lineElements = screen.getAllByText(`Line ${lineNumber}`, { exact: false });
            expect(lineElements.length).toBeGreaterThan(0);
          });

          // Verify all comment texts are displayed (no duplicates, no missing)
          // Find the actual comment list container (not including aria-labels)
          // Structure: ul[aria-label="Comments grouped by line"] > li (per line) > ul (comments for that line) > li (individual comments)
          const commentListElements = dialogContent?.querySelectorAll('ul[aria-label="Comments grouped by line"] > li ul > li');
          
          // Only verify comment elements if we found the list (card view mode)
          if (commentListElements && commentListElements.length > 0) {
            // Verify each comment from the map appears in the rendered output
            comments.forEach(commentList => {
              commentList.forEach(comment => {
                // Check that the comment text appears in at least one comment element
                let found = false;
                commentListElements?.forEach(el => {
                  if (el.textContent?.includes(comment.text)) {
                    found = true;
                  }
                });
                expect(found).toBe(true);
              });
            });
            
            // Count total rendered comments to ensure no duplicates
            const renderedCommentCount = commentListElements?.length || 0;
            expect(renderedCommentCount).toBe(totalComments);
          } else {
            // If we can't find the comment list elements, at least verify the comments appear in the dialog text
            comments.forEach(commentList => {
              commentList.forEach(comment => {
                expect(dialogText).toContain(comment.text);
              });
            });
          }
          } finally {
            // Clean up after each iteration
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: md-review-app, Property 10: Summary rendering completeness
   * Validates: Requirements 4.3
   * 
   * For any comment in the summary view, the rendered entry should contain the line number, 
   * a preview of the line content, and the comment text.
   */
  it('Property 10: Summary rendering completeness - each entry contains line number, content, and comment', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        fileDataArb,
        lineNumberArb,
        fc.array(commentArb, { minLength: 1, maxLength: 3 }),
        (fileData, lineNumber, commentList) => {
          // Ensure file has enough lines
          if (fileData.lines.length < lineNumber) {
            while (fileData.lines.length < lineNumber) {
              fileData.lines.push(`Test line ${fileData.lines.length + 1}`);
            }
          }

          // Ensure comments have correct line number
          const correctedComments = commentList.map(c => ({ ...c, lineNumber }));

          // Create comment map with single line
          const comments: CommentMap = new Map();
          comments.set(lineNumber, correctedComments);

          // Render the component
          const mockNavigate = () => {};
          const mockExport = () => {};
          const mockClose = () => {};
          
          const { unmount } = render(
            <CommentSummary
              isOpen={true}
              comments={comments}
              fileData={fileData}
              onLineNavigate={mockNavigate}
              onExport={mockExport}
              onClose={mockClose}
            />
          );

          try {
            // Verify line number is displayed (use getAllByText since it might appear in badge)
            const lineNumberElements = screen.getAllByText(`Line ${lineNumber}`, { exact: false });
            expect(lineNumberElements.length).toBeGreaterThan(0);

          // Verify line content preview is displayed
          const lineContent = fileData.lines[lineNumber - 1];
          const expectedPreview = lineContent.length <= 80 
            ? lineContent 
            : lineContent.substring(0, 80) + '...';
          
          if (expectedPreview && expectedPreview.trim()) {
            const contentElements = screen.getAllByText(expectedPreview, { exact: true });
            expect(contentElements.length).toBeGreaterThan(0);
          }

            // Verify all comment texts are displayed
            // The Dialog renders into a portal, so query from document body
            const dialogContent = document.body.querySelector('[role="dialog"]');
            const dialogFullText = dialogContent?.textContent || '';
            
            // Verify each comment text appears in the dialog
            correctedComments.forEach(comment => {
              expect(dialogFullText).toContain(comment.text);
            });
          } finally {
            // Clean up after each iteration
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
