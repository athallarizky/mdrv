/**
 * AppContext provides global state management for the MD Review App
 * Manages file data, comments, UI state, and persistence
 */

import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FileData, Comment, CommentMap } from '../types';
import { FileService, CommentService, StorageService } from '../services';
import type { AppState, ViewMode } from './types';
import { AppContext } from './context';
import { toast } from 'sonner';

/**
 * Props for AppProvider component
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component that wraps the application and provides state
 */
export function AppProvider({ children }: AppProviderProps) {
  // File state
  const [currentFile, setCurrentFile] = useState<FileData | null>(null);
  
  // Comment state
  const [comments, setComments] = useState<CommentMap>(new Map());
  const [activeLineNumber, setActiveLineNumber] = useState<number | null>(null);
  
  // UI state
  const [isCommentSummaryOpen, setCommentSummaryOpen] = useState(false);
  const [isExportDialogOpen, setExportDialogOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<ViewMode>('preview');
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Check storage availability on mount
  useEffect(() => {
    if (!StorageService.isStorageAvailable()) {
      toast.warning('Storage unavailable', {
        description: 'Local storage is not available. Comments will not be saved.',
        duration: 5000,
      });
    }
  }, []);

  /**
   * Load a file and restore its comments from storage
   */
  const loadFile = useCallback(async (file: File) => {
    const loadingToast = toast.loading('Loading file...');
    
    try {
      setError(null);
      
      // Check if file is too large (warning, not error)
      if (FileService.isFileTooLarge(file)) {
        toast.warning('Large file detected', {
          description: 'File is larger than 10MB. Performance may be affected.',
        });
      }
      
      // Load and parse the file
      const fileData = await FileService.loadFile(file);
      
      // Save file data to storage (with error handling)
      try {
        StorageService.saveFileData(fileData);
      } catch (storageError) {
        // Log storage error but don't fail the file load
        console.error('Failed to save file to storage:', storageError);
        toast.warning('Storage warning', {
          description: 'File loaded but could not be saved to storage. Comments may not persist.',
        });
      }
      
      // Load comments for this file from storage
      const loadedComments = CommentService.loadFromStorage(fileData.id);
      
      // Update state
      setCurrentFile(fileData);
      setComments(loadedComments);
      setActiveLineNumber(null);
      
      toast.success('File loaded successfully', {
        description: `${fileData.name} (${fileData.lines.length} lines)`,
        id: loadingToast,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
      setError(errorMessage);
      toast.error('Failed to load file', {
        description: errorMessage,
        id: loadingToast,
      });
      throw err;
    }
  }, []);

  /**
   * Add a new comment to a line
   */
  const addComment = useCallback((lineNumber: number, text: string) => {
    try {
      setError(null);
      
      if (!currentFile) {
        throw new Error('No file loaded');
      }
      
      // Create the comment
      const comment = CommentService.createComment(lineNumber, text);
      
      // Add to comment map
      const newComments = CommentService.addCommentToMap(comments, comment);
      
      // Save to storage (with error handling)
      try {
        CommentService.saveToStorage(currentFile.id, newComments);
      } catch (storageError) {
        console.error('Failed to save comment to storage:', storageError);
        toast.warning('Storage warning', {
          description: 'Comment added but could not be saved to storage.',
        });
      }
      
      // Update state
      setComments(newComments);
      setActiveLineNumber(null);
      
      toast.success('Comment added', {
        description: `Added to line ${lineNumber}`,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      toast.error('Failed to add comment', {
        description: errorMessage,
      });
      throw err;
    }
  }, [currentFile, comments]);

  /**
   * Update an existing comment
   */
  const updateComment = useCallback((commentId: string, text: string) => {
    try {
      setError(null);
      
      if (!currentFile) {
        throw new Error('No file loaded');
      }
      
      // Find the comment to update
      let commentToUpdate: Comment | null = null;
      
      comments.forEach((commentList) => {
        const found = commentList.find(c => c.id === commentId);
        if (found) {
          commentToUpdate = found;
        }
      });
      
      if (!commentToUpdate) {
        throw new Error('Comment not found');
      }
      
      // Update the comment
      const updatedComment = CommentService.updateComment(commentToUpdate, text);
      
      // Update in comment map
      const newComments = CommentService.updateCommentInMap(comments, updatedComment);
      
      // Save to storage (with error handling)
      try {
        CommentService.saveToStorage(currentFile.id, newComments);
      } catch (storageError) {
        console.error('Failed to save updated comment to storage:', storageError);
        toast.warning('Storage warning', {
          description: 'Comment updated but could not be saved to storage.',
        });
      }
      
      // Update state
      setComments(newComments);
      
      toast.success('Comment updated', {
        description: 'Your changes have been saved',
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update comment';
      setError(errorMessage);
      toast.error('Failed to update comment', {
        description: errorMessage,
      });
      throw err;
    }
  }, [currentFile, comments]);

  /**
   * Delete a comment
   */
  const deleteComment = useCallback((commentId: string) => {
    try {
      setError(null);
      
      if (!currentFile) {
        throw new Error('No file loaded');
      }
      
      // Delete from comment map
      const newComments = CommentService.deleteComment(comments, commentId);
      
      // Save to storage (with error handling)
      try {
        CommentService.saveToStorage(currentFile.id, newComments);
      } catch (storageError) {
        console.error('Failed to save after deleting comment:', storageError);
        toast.warning('Storage warning', {
          description: 'Comment deleted but could not be saved to storage.',
        });
      }
      
      // Update state
      setComments(newComments);
      
      toast.success('Comment deleted', {
        description: 'The comment has been removed',
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      toast.error('Failed to delete comment', {
        description: errorMessage,
      });
      throw err;
    }
  }, [currentFile, comments]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear all data (file and comments)
   */
  const clearAllData = useCallback(() => {
    StorageService.clearStorage();
    setCurrentFile(null);
    setComments(new Map());
    setActiveLineNumber(null);
    setCommentSummaryOpen(false);
    setExportDialogOpen(false);
    setError(null);
  }, []);

  const value: AppState = {
    // State
    currentFile,
    comments,
    activeLineNumber,
    isCommentSummaryOpen,
    isExportDialogOpen,
    rightPanelMode,
    error,
    
    // Actions
    loadFile,
    addComment,
    updateComment,
    deleteComment,
    setActiveLineNumber,
    setCommentSummaryOpen,
    setExportDialogOpen,
    setRightPanelMode,
    clearError,
    clearAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
