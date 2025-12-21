/**
 * Property-based tests for EditorPanel component
 * Using fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { EditorPanel } from '../EditorPanel';
import type { FileData, CommentMap, Comment } from '../types';

describe('EditorPanel - Property-Based Tests', () => {
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

  /**
   * Feature: md-review-app, Property 7: Visual indicator consistency
   * Validates: Requirements 3.3, 5.5
   * 
   * For any line number, if and only if that line has at least one comment, 
   * then a visual indicator should be displayed on that line.
   */
  it('Property 7: Visual indicator consistency - indicators shown iff line has comments', () => {
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
            <EditorPanel
              fileData={fileData}
              comments={commentMap}
              onLineClick={() => {}}
              activeLineNumber={null}
            />
          );

          // Check each line for visual indicator consistency
          for (let i = 0; i < fileData.lines.length; i++) {
            const lineNumber = i + 1;
            const hasComments = commentMap.has(lineNumber) && commentMap.get(lineNumber)!.length > 0;

            // Find all buttons and filter by exact line number match
            // Use a more precise selector to avoid matching line numbers that are substrings
            const allButtons = container.querySelectorAll('button');
            const lineButtons = Array.from(allButtons).filter(button => {
              const ariaLabel = button.getAttribute('aria-label');
              // Match "Line X" or "Line X, N comment(s)" but not "Line 10" when looking for "Line 1"
              const pattern = new RegExp(`^Line ${lineNumber}(?:,|$)`);
              return ariaLabel && pattern.test(ariaLabel);
            });

            // Should have exactly one button for this line
            expect(lineButtons.length).toBe(1);
            const lineButton = lineButtons[0];

            // Check for visual indicator (MessageSquare icon)
            // The icon is rendered as an svg element within the button
            const icon = lineButton.querySelector('svg');

            if (hasComments) {
              // If line has comments, icon should be present
              expect(icon).not.toBeNull();
              // Button should have comment count in aria-label
              const ariaLabel = lineButton.getAttribute('aria-label');
              expect(ariaLabel).toMatch(/\d+ comment/i); // Should have count like "1 comment" or "2 comments"
            } else {
              // If line has no comments, icon should not be present
              expect(icon).toBeNull();
              // The aria-label should mention adding a comment (for accessibility)
              const ariaLabel = lineButton.getAttribute('aria-label');
              expect(ariaLabel).toMatch(/click to add comment/i);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
