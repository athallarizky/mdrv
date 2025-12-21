/**
 * Tests for AppContext state management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AppProvider } from '../AppContext';
import { useAppState } from '../useAppState';

// Mock file for testing
const createMockFile = (name: string, content: string): File => {
  return new File([content], name, { type: 'text/markdown' });
};

describe('AppContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  describe('Initial state', () => {
    it('should have null currentFile initially', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      expect(result.current.currentFile).toBeNull();
    });

    it('should have empty comments map initially', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      expect(result.current.comments.size).toBe(0);
    });

    it('should have null activeLineNumber initially', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      expect(result.current.activeLineNumber).toBeNull();
    });

    it('should have closed dialogs initially', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      expect(result.current.isCommentSummaryOpen).toBe(false);
      expect(result.current.isExportDialogOpen).toBe(false);
    });

    it('should have no error initially', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('File loading', () => {
    it('should load a valid markdown file', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      const file = createMockFile('test.md', '# Hello\nWorld');
      
      await act(async () => {
        await result.current.loadFile(file);
      });
      
      expect(result.current.currentFile).not.toBeNull();
      expect(result.current.currentFile?.name).toBe('test.md');
      expect(result.current.currentFile?.content).toBe('# Hello\nWorld');
      expect(result.current.currentFile?.lines).toEqual(['# Hello', 'World']);
    });

    it('should reject invalid file types', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      const file = createMockFile('test.txt', 'Hello World');
      
      await expect(
        act(async () => {
          await result.current.loadFile(file);
        })
      ).rejects.toThrow();
      
      expect(result.current.currentFile).toBeNull();
    });

    it('should persist file data to storage', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      const file = createMockFile('test.md', '# Test');
      
      await act(async () => {
        await result.current.loadFile(file);
      });
      
      // Check that data was saved to localStorage
      const storageData = localStorage.getItem('md-review-app');
      expect(storageData).not.toBeNull();
      
      const parsed = JSON.parse(storageData!);
      expect(parsed.files).toBeDefined();
      expect(Object.keys(parsed.files).length).toBeGreaterThan(0);
    });
  });

  describe('Comment operations', () => {
    it('should add a comment to a line', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      // Load a file first
      const file = createMockFile('test.md', '# Hello\nWorld');
      await act(async () => {
        await result.current.loadFile(file);
      });
      
      // Add a comment
      act(() => {
        result.current.addComment(1, 'This is a comment');
      });
      
      expect(result.current.comments.size).toBe(1);
      expect(result.current.comments.get(1)).toBeDefined();
      expect(result.current.comments.get(1)?.[0].text).toBe('This is a comment');
    });

    it('should reject empty comments', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      const file = createMockFile('test.md', '# Hello');
      await act(async () => {
        await result.current.loadFile(file);
      });
      
      expect(() => {
        act(() => {
          result.current.addComment(1, '   ');
        });
      }).toThrow();
    });

    it('should update an existing comment', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      const file = createMockFile('test.md', '# Hello');
      await act(async () => {
        await result.current.loadFile(file);
      });
      
      // Add a comment
      act(() => {
        result.current.addComment(1, 'Original comment');
      });
      
      const commentId = result.current.comments.get(1)?.[0].id;
      expect(commentId).toBeDefined();
      
      // Update the comment
      act(() => {
        result.current.updateComment(commentId!, 'Updated comment');
      });
      
      expect(result.current.comments.get(1)?.[0].text).toBe('Updated comment');
    });

    it('should delete a comment', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      const file = createMockFile('test.md', '# Hello');
      await act(async () => {
        await result.current.loadFile(file);
      });
      
      // Add a comment
      act(() => {
        result.current.addComment(1, 'Comment to delete');
      });
      
      const commentId = result.current.comments.get(1)?.[0].id;
      expect(result.current.comments.size).toBe(1);
      
      // Delete the comment
      act(() => {
        result.current.deleteComment(commentId!);
      });
      
      expect(result.current.comments.size).toBe(0);
    });

    it('should persist comments to storage', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      const file = createMockFile('test.md', '# Hello');
      await act(async () => {
        await result.current.loadFile(file);
      });
      
      act(() => {
        result.current.addComment(1, 'Test comment');
      });
      
      // Check storage
      const storageData = localStorage.getItem('md-review-app');
      expect(storageData).not.toBeNull();
      
      const parsed = JSON.parse(storageData!);
      expect(parsed.comments).toBeDefined();
      
      const fileId = result.current.currentFile?.id;
      expect(parsed.comments[fileId!]).toBeDefined();
      expect(parsed.comments[fileId!].length).toBe(1);
    });
  });

  describe('UI state management', () => {
    it('should set active line number', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      act(() => {
        result.current.setActiveLineNumber(5);
      });
      
      expect(result.current.activeLineNumber).toBe(5);
    });

    it('should toggle comment summary dialog', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      act(() => {
        result.current.setCommentSummaryOpen(true);
      });
      
      expect(result.current.isCommentSummaryOpen).toBe(true);
      
      act(() => {
        result.current.setCommentSummaryOpen(false);
      });
      
      expect(result.current.isCommentSummaryOpen).toBe(false);
    });

    it('should toggle export dialog', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      act(() => {
        result.current.setExportDialogOpen(true);
      });
      
      expect(result.current.isExportDialogOpen).toBe(true);
      
      act(() => {
        result.current.setExportDialogOpen(false);
      });
      
      expect(result.current.isExportDialogOpen).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should throw error when loading invalid file', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      const invalidFile = createMockFile('test.txt', 'content');
      
      await expect(
        act(async () => {
          await result.current.loadFile(invalidFile);
        })
      ).rejects.toThrow('Invalid file type');
    });

    it('should clear error state', () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      // Manually set an error state by trying to add comment without file
      try {
        act(() => {
          result.current.addComment(1, 'test');
        });
      } catch (error) {
        // Expected error
      }
      
      // Clear should work
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('Clear all data', () => {
    it('should clear all state and storage', async () => {
      const { result } = renderHook(() => useAppState(), { wrapper });
      
      // Load file and add comment
      const file = createMockFile('test.md', '# Hello');
      await act(async () => {
        await result.current.loadFile(file);
      });
      
      act(() => {
        result.current.addComment(1, 'Test comment');
        result.current.setActiveLineNumber(1);
        result.current.setCommentSummaryOpen(true);
      });
      
      // Clear all data
      act(() => {
        result.current.clearAllData();
      });
      
      expect(result.current.currentFile).toBeNull();
      expect(result.current.comments.size).toBe(0);
      expect(result.current.activeLineNumber).toBeNull();
      expect(result.current.isCommentSummaryOpen).toBe(false);
      expect(result.current.isExportDialogOpen).toBe(false);
      
      // Check storage is cleared
      const storageData = localStorage.getItem('md-review-app');
      expect(storageData).toBeNull();
    });
  });

  describe('Hook usage', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useAppState());
      }).toThrow('useAppState must be used within an AppProvider');
    });
  });
});
