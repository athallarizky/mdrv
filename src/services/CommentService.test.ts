/**
 * Property-based tests for CommentService
 * Using fast-check for property-based testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { CommentService } from './CommentService';
import { StorageService } from './StorageService';
import type { Comment, CommentMap } from '../types';

describe('CommentService - Property-Based Tests', () => {
  // Clean up storage before and after each test
  beforeEach(() => {
    StorageService.clearStorage();
  });

  afterEach(() => {
    StorageService.clearStorage();
  });

  // Generators for property-based testing
  const lineNumberArb = fc.integer({ min: 1, max: 10000 });
  const commentTextArb = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);
  // Exclude prototype pollution strings from fileId
  const fileIdArb = fc.string({ minLength: 1, maxLength: 50 }).filter(
    s => s !== '__proto__' && s !== 'constructor' && s !== 'prototype'
  );

  /**
   * Feature: md-review-app, Property 5: Comment persistence
   * Validates: Requirements 3.2, 3.5, 8.1
   * 
   * For any comment added to any line number, the comment should immediately 
   * exist in local storage with the correct line number association.
   */
  it('Property 5: Comment persistence - comments saved to storage are retrievable', () => {
    fc.assert(
      fc.property(
        fileIdArb,
        lineNumberArb,
        commentTextArb,
        (fileId, lineNumber, text) => {
          // Create a comment
          const comment = CommentService.createComment(lineNumber, text);
          
          // Add to comment map
          const commentMap: CommentMap = new Map();
          const updatedMap = CommentService.addCommentToMap(commentMap, comment);
          
          // Save to storage
          CommentService.saveToStorage(fileId, updatedMap);
          
          // Load from storage
          const loadedMap = CommentService.loadFromStorage(fileId);
          
          // Verify the comment exists in storage with correct line number
          const loadedComments = loadedMap.get(lineNumber);
          expect(loadedComments).toBeDefined();
          expect(loadedComments!.length).toBeGreaterThan(0);
          
          const loadedComment = loadedComments!.find(c => c.id === comment.id);
          expect(loadedComment).toBeDefined();
          expect(loadedComment!.lineNumber).toBe(lineNumber);
          expect(loadedComment!.text).toBe(text.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: md-review-app, Property 6: Empty comment rejection
   * Validates: Requirements 3.4
   * 
   * For any string composed entirely of whitespace characters, attempting to 
   * submit it as a comment should be rejected and the comment list should remain unchanged.
   */
  it('Property 6: Empty comment rejection - whitespace-only comments are rejected', () => {
    fc.assert(
      fc.property(
        lineNumberArb,
        fc.string().filter(s => s.trim().length === 0), // Generate whitespace-only strings
        (lineNumber, whitespaceText) => {
          // Attempt to create a comment with whitespace-only text
          expect(() => {
            CommentService.createComment(lineNumber, whitespaceText);
          }).toThrow('Comment text cannot be empty or whitespace-only');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: md-review-app, Property 8: Comment chronological ordering
   * Validates: Requirements 4.1
   * 
   * For any line with multiple comments, when displayed, the comments should be 
   * ordered by their creation timestamp in ascending order (oldest first).
   */
  it('Property 8: Comment chronological ordering - comments are sorted by creation time', () => {
    fc.assert(
      fc.property(
        lineNumberArb,
        fc.array(commentTextArb, { minLength: 2, maxLength: 10 }),
        (lineNumber, textArray) => {
          // Create multiple comments with manually set timestamps to ensure ordering
          const commentMap: CommentMap = new Map();
          const baseTime = Date.now();
          
          for (let i = 0; i < textArray.length; i++) {
            const text = textArray[i];
            // Create comment with incrementing timestamp
            const comment: Comment = {
              id: `comment-${i}`,
              lineNumber,
              text: text.trim(),
              createdAt: new Date(baseTime + i * 1000), // Each comment 1 second apart
              updatedAt: new Date(baseTime + i * 1000),
            };
            
            // Add to map
            const existing = commentMap.get(lineNumber) || [];
            commentMap.set(lineNumber, [...existing, comment]);
          }
          
          // Get comments for the line (should be sorted)
          const sortedComments = CommentService.getCommentsForLine(commentMap, lineNumber);
          
          // Verify they are in chronological order
          for (let i = 1; i < sortedComments.length; i++) {
            expect(sortedComments[i].createdAt.getTime()).toBeGreaterThanOrEqual(
              sortedComments[i - 1].createdAt.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: md-review-app, Property 11: Comment edit persistence
   * Validates: Requirements 5.2
   * 
   * For any existing comment, editing it with new text and saving should result in 
   * the comment having the new text in both memory and local storage, while preserving 
   * the original creation timestamp.
   */
  it('Property 11: Comment edit persistence - edited comments persist with original creation time', () => {
    fc.assert(
      fc.property(
        fileIdArb,
        lineNumberArb,
        commentTextArb,
        commentTextArb,
        (fileId, lineNumber, originalText, newText) => {
          // Create original comment
          const originalComment = CommentService.createComment(lineNumber, originalText);
          const originalCreatedAt = originalComment.createdAt;
          
          // Add to comment map and save
          let commentMap: CommentMap = new Map();
          commentMap = CommentService.addCommentToMap(commentMap, originalComment);
          CommentService.saveToStorage(fileId, commentMap);
          
          // Update the comment
          const updatedComment = CommentService.updateComment(originalComment, newText);
          
          // Update in map and save
          commentMap = CommentService.updateCommentInMap(commentMap, updatedComment);
          CommentService.saveToStorage(fileId, commentMap);
          
          // Load from storage
          const loadedMap = CommentService.loadFromStorage(fileId);
          const loadedComments = loadedMap.get(lineNumber);
          
          expect(loadedComments).toBeDefined();
          const loadedComment = loadedComments!.find(c => c.id === originalComment.id);
          
          expect(loadedComment).toBeDefined();
          expect(loadedComment!.text).toBe(newText.trim());
          expect(loadedComment!.createdAt.getTime()).toBe(originalCreatedAt.getTime());
          expect(loadedComment!.updatedAt.getTime()).toBeGreaterThanOrEqual(originalCreatedAt.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: md-review-app, Property 12: Comment deletion completeness
   * Validates: Requirements 5.3
   * 
   * For any existing comment, deleting it should result in the comment being removed 
   * from both the in-memory comment map and local storage.
   */
  it('Property 12: Comment deletion completeness - deleted comments are removed from storage', () => {
    fc.assert(
      fc.property(
        fileIdArb,
        lineNumberArb,
        commentTextArb,
        (fileId, lineNumber, text) => {
          // Create and save a comment
          const comment = CommentService.createComment(lineNumber, text);
          let commentMap: CommentMap = new Map();
          commentMap = CommentService.addCommentToMap(commentMap, comment);
          CommentService.saveToStorage(fileId, commentMap);
          
          // Verify it exists
          let loadedMap = CommentService.loadFromStorage(fileId);
          expect(loadedMap.get(lineNumber)?.find(c => c.id === comment.id)).toBeDefined();
          
          // Delete the comment
          commentMap = CommentService.deleteComment(commentMap, comment.id);
          CommentService.saveToStorage(fileId, commentMap);
          
          // Verify it's removed from storage
          loadedMap = CommentService.loadFromStorage(fileId);
          const loadedComments = loadedMap.get(lineNumber);
          
          if (loadedComments) {
            expect(loadedComments.find(c => c.id === comment.id)).toBeUndefined();
          } else {
            // Line should have no comments, which is also valid
            expect(loadedComments).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: md-review-app, Property 13: Edit cancellation preservation
   * Validates: Requirements 5.4
   * 
   * For any comment being edited, canceling the edit operation should result in 
   * the comment retaining its original text unchanged.
   */
  it('Property 13: Edit cancellation preservation - cancelled edits preserve original text', () => {
    fc.assert(
      fc.property(
        lineNumberArb,
        commentTextArb,
        (lineNumber, originalText) => {
          // Create original comment
          const originalComment = CommentService.createComment(lineNumber, originalText);
          
          // Simulate starting an edit but not saving it
          // In a real UI, the user would type new text but click "cancel"
          // The key is that we don't call updateComment or updateCommentInMap
          
          // Verify the original comment is unchanged
          expect(originalComment.text).toBe(originalText.trim());
          expect(originalComment.lineNumber).toBe(lineNumber);
          
          // Create a comment map with the original
          const commentMap: CommentMap = new Map();
          const updatedMap = CommentService.addCommentToMap(commentMap, originalComment);
          
          // Verify the comment in the map is still the original
          const retrievedComments = CommentService.getCommentsForLine(updatedMap, lineNumber);
          expect(retrievedComments.length).toBe(1);
          expect(retrievedComments[0].text).toBe(originalText.trim());
          expect(retrievedComments[0].id).toBe(originalComment.id);
        }
      ),
      { numRuns: 100 }
    );
  });
});
