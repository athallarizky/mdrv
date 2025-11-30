import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { FileService } from './FileService';

describe('FileService', () => {
  describe('Property-Based Tests', () => {
    /**
     * Feature: md-review-app, Property 1: File loading preserves content
     * Validates: Requirements 1.1
     * 
     * For any valid Markdown file, loading the file should result in the 
     * editor panel containing the exact same content as the original file.
     */
    it('Property 1: File loading preserves content', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(), // arbitrary file content
          fc.constantFrom('test.md', 'document.markdown', 'README.md', 'notes.markdown'),
          async (content, fileName) => {
            // Create a mock File object
            const file = new File([content], fileName, { type: 'text/markdown' });
            
            // Load the file
            const fileData = await FileService.loadFile(file);
            
            // The loaded content should exactly match the original
            expect(fileData.content).toBe(content);
            expect(fileData.name).toBe(fileName);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: md-review-app, Property 2: Line numbering completeness
     * Validates: Requirements 1.3
     * 
     * For any loaded file content, the number of assigned line numbers 
     * should equal the number of lines in the content.
     */
    it('Property 2: Line numbering completeness', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          fc.constantFrom('test.md', 'document.markdown'),
          async (content, fileName) => {
            const file = new File([content], fileName, { type: 'text/markdown' });
            const fileData = await FileService.loadFile(file);
            
            // Count expected lines (split by newlines)
            const expectedLineCount = content.split(/\r?\n/).length;
            
            // The number of parsed lines should match
            expect(fileData.lines.length).toBe(expectedLineCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: md-review-app, Property 3: Invalid file rejection
     * Validates: Requirements 1.4
     * 
     * For any file with a non-Markdown extension (not .md or .markdown), 
     * attempting to load it should result in an error message and no content being loaded.
     */
    it('Property 3: Invalid file rejection', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          fc.constantFrom('.txt', '.pdf', '.doc', '.html', '.js', '.json', '.xml', '.csv', ''),
          async (content, extension) => {
            const fileName = `test${extension}`;
            const file = new File([content], fileName, { type: 'text/plain' });
            
            // Attempting to load should throw an error
            await expect(FileService.loadFile(file)).rejects.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should validate .md files as valid', () => {
      const file = new File(['content'], 'test.md', { type: 'text/markdown' });
      expect(FileService.validateFile(file)).toBe(true);
    });

    it('should validate .markdown files as valid', () => {
      const file = new File(['content'], 'test.markdown', { type: 'text/markdown' });
      expect(FileService.validateFile(file)).toBe(true);
    });

    it('should reject non-markdown files', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(FileService.validateFile(file)).toBe(false);
    });

    it('should detect files exceeding 10MB', () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'large.md', { type: 'text/markdown' });
      expect(FileService.isFileTooLarge(file)).toBe(true);
    });

    it('should accept files under 10MB', () => {
      const smallContent = 'x'.repeat(5 * 1024 * 1024); // 5MB
      const file = new File([smallContent], 'small.md', { type: 'text/markdown' });
      expect(FileService.isFileTooLarge(file)).toBe(false);
    });

    it('should parse lines correctly', () => {
      const content = 'line1\nline2\nline3';
      const lines = FileService.parseLines(content);
      expect(lines).toEqual(['line1', 'line2', 'line3']);
    });

    it('should handle empty content', () => {
      const content = '';
      const lines = FileService.parseLines(content);
      expect(lines).toEqual(['']);
    });

    it('should preserve empty lines', () => {
      const content = 'line1\n\nline3';
      const lines = FileService.parseLines(content);
      expect(lines).toEqual(['line1', '', 'line3']);
    });

    it('should generate unique file IDs', () => {
      const id1 = FileService.generateFileId('test.md');
      const id2 = FileService.generateFileId('test.md');
      expect(id1).not.toBe(id2);
    });
  });
});
