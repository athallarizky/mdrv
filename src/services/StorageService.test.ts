/**
 * Property-based tests for StorageService
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageService } from './StorageService';
import type { Comment } from '../types';

describe('StorageService', () => {
  // Clear storage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Basic functionality', () => {
    it('should detect storage availability', () => {
      expect(StorageService.isStorageAvailable()).toBe(true);
    });

    it('should return empty comment map for non-existent file', () => {
      const comments = StorageService.loadComments('non-existent-file');
      expect(comments.size).toBe(0);
    });
  });

  /**
   * Feature: md-review-app, Property 16: Storage round-trip consistency
   * Validates: Requirements 8.2
   * 
   * For any set of comments associated with a file, saving them to local storage
   * and then loading them back should result in an equivalent set of comments
   * with the same content, line numbers, and timestamps.
   */
  describe('Property 16: Storage round-trip consistency', () => {
    it('should preserve comments through save/load cycle', () => {
      fc.assert(
        fc.property(
          // Generate random file ID (avoid special property names)
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            s => !['__proto__', 'constructor', 'prototype'].includes(s)
          ),
          // Generate random comments
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              lineNumber: fc.integer({ min: 1, max: 10000 }),
              text: fc.string({ minLength: 1, maxLength: 500 }),
              createdAt: fc.date().filter(d => !isNaN(d.getTime())),
              updatedAt: fc.date().filter(d => !isNaN(d.getTime())),
            }),
            { minLength: 0, maxLength: 100 }
          ),
          (fileId, commentsArray) => {
            // Convert array to CommentMap
            const originalMap = new Map<number, Comment[]>();
            commentsArray.forEach((comment) => {
              const lineComments = originalMap.get(comment.lineNumber) || [];
              lineComments.push(comment);
              originalMap.set(comment.lineNumber, lineComments);
            });

            // Save comments
            StorageService.saveComments(fileId, originalMap);

            // Load comments back
            const loadedMap = StorageService.loadComments(fileId);

            // Verify same number of lines with comments
            expect(loadedMap.size).toBe(originalMap.size);

            // Verify each line's comments
            originalMap.forEach((originalComments, lineNumber) => {
              const loadedComments = loadedMap.get(lineNumber);
              expect(loadedComments).toBeDefined();
              expect(loadedComments?.length).toBe(originalComments.length);

              // Sort both arrays by ID for comparison
              const sortedOriginal = [...originalComments].sort((a, b) =>
                a.id.localeCompare(b.id)
              );
              const sortedLoaded = [...(loadedComments || [])].sort((a, b) =>
                a.id.localeCompare(b.id)
              );

              // Verify each comment
              sortedOriginal.forEach((original, index) => {
                const loaded = sortedLoaded[index];
                expect(loaded.id).toBe(original.id);
                expect(loaded.lineNumber).toBe(original.lineNumber);
                expect(loaded.text).toBe(original.text);
                // Compare timestamps (allowing for JSON serialization)
                expect(loaded.createdAt.getTime()).toBe(
                  original.createdAt.getTime()
                );
                expect(loaded.updatedAt.getTime()).toBe(
                  original.updatedAt.getTime()
                );
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: md-review-app, Property 17: Corrupted data handling
   * Validates: Requirements 8.3
   * 
   * For any corrupted or invalid JSON data in local storage, attempting to load it
   * should not crash the application and should display an error message to the user.
   */
  describe('Property 17: Corrupted data handling', () => {
    it('should handle corrupted storage data gracefully', () => {
      fc.assert(
        fc.property(
          // Generate random invalid JSON strings
          fc.oneof(
            fc.constant('not valid json'),
            fc.constant('{incomplete'),
            fc.constant('null'),
            fc.constant('undefined'),
            fc.constant(''),
            fc.constant('[1,2,3]'),
            fc.string().filter(s => {
              try {
                JSON.parse(s);
                return false;
              } catch {
                return true;
              }
            })
          ),
          fc.string({ minLength: 1, maxLength: 50 }),
          (corruptedData, fileId) => {
            // Set corrupted data in storage
            localStorage.setItem('md-review-app', corruptedData);

            // Should not throw when loading comments
            expect(() => {
              const comments = StorageService.loadComments(fileId);
              // Should return empty map for corrupted data
              expect(comments).toBeInstanceOf(Map);
            }).not.toThrow();

            // Should not throw when loading file data
            expect(() => {
              const fileData = StorageService.loadFileData(fileId);
              // Should return null for non-existent file in corrupted data
              expect(fileData).toBeNull();
            }).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return empty data structures when storage is corrupted', () => {
      // Set various types of corrupted data
      const corruptedValues = [
        'invalid json',
        '{broken',
        'null',
        '[]',
        '123',
        'true',
      ];

      corruptedValues.forEach((corrupted) => {
        localStorage.clear();
        localStorage.setItem('md-review-app', corrupted);

        const comments = StorageService.loadComments('test-file');
        expect(comments.size).toBe(0);

        const fileData = StorageService.loadFileData('test-file');
        expect(fileData).toBeNull();
      });
    });
  });

  /**
   * Feature: md-review-app, Property 18: File isolation
   * Validates: Requirements 8.5
   * 
   * For any two different files with comments, the comments for one file
   * should not appear when viewing the other file.
   */
  describe('Property 18: File isolation', () => {
    it('should isolate comments between different files', () => {
      fc.assert(
        fc.property(
          // Generate two different file IDs
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            s => !['__proto__', 'constructor', 'prototype'].includes(s)
          ),
          fc.string({ minLength: 1, maxLength: 50 }).filter(
            s => !['__proto__', 'constructor', 'prototype'].includes(s)
          ),
          // Generate comments for first file
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              lineNumber: fc.integer({ min: 1, max: 10000 }),
              text: fc.string({ minLength: 1, maxLength: 500 }),
              createdAt: fc.date(),
              updatedAt: fc.date(),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          // Generate comments for second file
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              lineNumber: fc.integer({ min: 1, max: 10000 }),
              text: fc.string({ minLength: 1, maxLength: 500 }),
              createdAt: fc.date(),
              updatedAt: fc.date(),
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (fileId1, fileId2, comments1Array, comments2Array) => {
            // Skip if file IDs are the same
            fc.pre(fileId1 !== fileId2);

            // Convert arrays to CommentMaps
            const commentsMap1 = new Map<number, Comment[]>();
            comments1Array.forEach((comment) => {
              const lineComments = commentsMap1.get(comment.lineNumber) || [];
              lineComments.push(comment);
              commentsMap1.set(comment.lineNumber, lineComments);
            });

            const commentsMap2 = new Map<number, Comment[]>();
            comments2Array.forEach((comment) => {
              const lineComments = commentsMap2.get(comment.lineNumber) || [];
              lineComments.push(comment);
              commentsMap2.set(comment.lineNumber, lineComments);
            });

            // Save comments for both files
            StorageService.saveComments(fileId1, commentsMap1);
            StorageService.saveComments(fileId2, commentsMap2);

            // Load comments for file 1
            const loadedComments1 = StorageService.loadComments(fileId1);

            // Load comments for file 2
            const loadedComments2 = StorageService.loadComments(fileId2);

            // Verify file 1 comments match original
            expect(loadedComments1.size).toBe(commentsMap1.size);

            // Verify file 2 comments match original
            expect(loadedComments2.size).toBe(commentsMap2.size);

            // Verify no comment IDs from file 1 appear in file 2
            const file1CommentIds = new Set<string>();
            commentsMap1.forEach((comments) => {
              comments.forEach((comment) => file1CommentIds.add(comment.id));
            });

            const file2CommentIds = new Set<string>();
            loadedComments2.forEach((comments) => {
              comments.forEach((comment) => {
                // This comment should not be from file 1
                expect(file1CommentIds.has(comment.id)).toBe(false);
                file2CommentIds.add(comment.id);
              });
            });

            // Verify no comment IDs from file 2 appear in file 1
            loadedComments1.forEach((comments) => {
              comments.forEach((comment) => {
                // This comment should not be from file 2
                expect(file2CommentIds.has(comment.id)).toBe(false);
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
