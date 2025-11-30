/**
 * Type definitions for application state
 */

import type { FileData, CommentMap } from '../types';

/**
 * Application state interface
 */
export interface AppState {
  // File state
  currentFile: FileData | null;
  
  // Comment state
  comments: CommentMap;
  activeLineNumber: number | null;
  
  // UI state
  isCommentSummaryOpen: boolean;
  isExportDialogOpen: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  loadFile: (file: File) => Promise<void>;
  addComment: (lineNumber: number, text: string) => void;
  updateComment: (commentId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
  setActiveLineNumber: (lineNumber: number | null) => void;
  setCommentSummaryOpen: (isOpen: boolean) => void;
  setExportDialogOpen: (isOpen: boolean) => void;
  clearError: () => void;
  clearAllData: () => void;
}
