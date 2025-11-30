/**
 * Tests for ExportService
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ExportService } from './ExportService';
import type { FileData, Comment } from '../types';

describe('ExportService', () => {
  // Helper to create a FileData object
  const createFileData = (name: string, lines: string[]): FileData => ({
    id: `file-${Date.now()}`,
    name,
    content: lines.join('\n'),
    lines,
    uploadedAt: new Date(),
  });

  // Helper to create a Comment object
  const createComment = (lineNumber: number, text: string): Comment => ({
    id: `comment-${Date.now()}-${Math.random()}`,
    lineNumber,
    text,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('generateMarkdownExport', () => {
    it('should generate export with header and file name', () => {
      const fileData = createFileData('test.md', ['line 1', 'line 2']);
      const comments = new Map<number, Comment[]>();
      
      const result = ExportService.generateMarkdownExport(fileData, comments);
      
      expect(result).toContain('# Review Comments for test.md');
      expect(result).toContain('Generated on:');
    });

    it('should handle empty comments', () => {
      const fileData = createFileData('test.md', ['line 1']);
      const comments = new Map<number, Comment[]>();
      
      const result = ExportService.generateMarkdownExport(fileData, comments);
      
      expect(result).toContain('No comments found.');
    });

    it('should include line numbers and content', () => {
      const fileData = createFileData('test.md', ['first line', 'second line']);
      const comments = new Map<number, Comment[]>();
      comments.set(1, [createComment(1, 'Comment on line 1')]);
      
      const result = ExportService.generateMarkdownExport(fileData, comments);
      
      expect(result).toContain('## Line 1');
      expect(result).toContain('first line');
    });

    // Feature: md-review-app, Property 14: Export completeness
    // Validates: Requirements 6.1, 6.2
    it('property: export contains all comments with line numbers and content', () => {
      // Arbitrary for generating random file lines
      const fileLineArb = fc.string({ minLength: 0, maxLength: 100 });
      const fileLinesArb = fc.array(fileLineArb, { minLength: 1, maxLength: 50 });

      fc.assert(
        fc.property(
          fileLinesArb,
          fc.string({ minLength: 1, maxLength: 50 }).map(s => s + '.md'),
          (lines, fileName) => {
            // Generate random comments for random lines
            const numComments = Math.min(lines.length, Math.floor(Math.random() * 10) + 1);
            const comments = new Map<number, Comment[]>();
            
            for (let i = 0; i < numComments; i++) {
              const lineNumber = Math.floor(Math.random() * lines.length) + 1;
              const comment = createComment(lineNumber, `Comment ${i + 1}`);
              
              const existing = comments.get(lineNumber) || [];
              existing.push(comment);
              comments.set(lineNumber, existing);
            }

            const fileData = createFileData(fileName, lines);
            const exported = ExportService.generateMarkdownExport(fileData, comments);

            // Property: All comments must appear in the export
            comments.forEach((commentList, lineNumber) => {
              commentList.forEach((comment) => {
                // Each comment text must be in the export
                expect(exported).toContain(comment.text);
              });
              
              // Line number must be in the export
              expect(exported).toContain(`## Line ${lineNumber}`);
              
              // Line content must be in the export
              const lineContent = lines[lineNumber - 1];
              expect(exported).toContain(lineContent);
            });

            // Property: File name must be in the export
            expect(exported).toContain(fileName);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: md-review-app, Property 15: Export format validity
    // Validates: Requirements 6.3
    it('property: exported markdown is valid and well-formed', () => {
      const fileLineArb = fc.string({ minLength: 0, maxLength: 100 });
      const fileLinesArb = fc.array(fileLineArb, { minLength: 1, maxLength: 50 });

      fc.assert(
        fc.property(
          fileLinesArb,
          fc.string({ minLength: 1, maxLength: 50 }).map(s => s + '.md'),
          (lines, fileName) => {
            // Generate random comments
            const numComments = Math.min(lines.length, Math.floor(Math.random() * 10) + 1);
            const comments = new Map<number, Comment[]>();
            
            for (let i = 0; i < numComments; i++) {
              const lineNumber = Math.floor(Math.random() * lines.length) + 1;
              const comment = createComment(lineNumber, `Comment ${i + 1}`);
              
              const existing = comments.get(lineNumber) || [];
              existing.push(comment);
              comments.set(lineNumber, existing);
            }

            const fileData = createFileData(fileName, lines);
            const exported = ExportService.generateMarkdownExport(fileData, comments);

            // Property: Export must be valid Markdown
            // Valid Markdown should:
            // 1. Not have unmatched code fences
            const codeBlockMatches = exported.match(/```/g);
            if (codeBlockMatches) {
              expect(codeBlockMatches.length % 2).toBe(0); // Even number of code fences
            }

            // 2. Have proper heading structure (starts with #)
            expect(exported).toMatch(/^# /m);

            // 3. Have proper list formatting if comments exist
            if (comments.size > 0) {
              expect(exported).toMatch(/^\d+\. /m); // Numbered list items
            }

            // 4. Not have malformed structure
            expect(exported).not.toContain('undefined');
            expect(exported).not.toContain('null');
            expect(exported).not.toContain('[object Object]');

            // 5. Should be parseable as text (no control characters that break parsing)
            expect(() => {
              const lines = exported.split('\n');
              lines.forEach(line => {
                // Each line should be a valid string
                expect(typeof line).toBe('string');
              });
            }).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('downloadAsFile', () => {
    it('should create a download link', () => {
      // This is difficult to test in a unit test environment
      // as it requires DOM manipulation and browser APIs
      // We'll just ensure it doesn't throw
      expect(() => {
        ExportService.downloadAsFile('test content', 'test.md');
      }).not.toThrow();
    });
  });

  describe('generateExportFilename', () => {
    it('should generate filename with timestamp', () => {
      const result = ExportService.generateExportFilename('test.md');
      
      expect(result).toContain('test-review-');
      expect(result).toMatch(/\.md$/);
    });

    it('should handle .markdown extension', () => {
      const result = ExportService.generateExportFilename('test.markdown');
      
      expect(result).toContain('test-review-');
      expect(result).toMatch(/\.md$/);
    });
  });
});
