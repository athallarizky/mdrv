/**
 * Type definitions for application state
 */

import type { FileData, CommentMap } from '../types';

/**
 * View mode for the right panel
 */
export type ViewMode = 'preview' | 'comments';

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
  rightPanelMode: ViewMode;
  
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
  setRightPanelMode: (mode: ViewMode) => void;
  clearError: () => void;
  clearAllData: () => void;
}
