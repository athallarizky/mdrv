/**
 * CommentService handles all comment-related operations
 * Provides methods for creating, updating, deleting, and retrieving comments
 */

import type { Comment, CommentMap } from '../types';
import { StorageService } from './StorageService';

export class CommentService {
  /**
   * Generate a unique ID for a comment
   */
  private static generateId(): string {
    return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate comment text (reject empty or whitespace-only)
   */
  private static validateCommentText(text: string): boolean {
    return text.trim().length > 0;
  }

  /**
   * Create a new comment
   * @throws Error if comment text is empty or whitespace-only
   * @throws Error if line number is invalid
   */
  static createComment(lineNumber: number, text: string): Comment {
    if (!this.validateCommentText(text)) {
      throw new Error('Comment text cannot be empty or whitespace-only');
    }

    if (lineNumber < 1) {
      throw new Error('Line number must be greater than 0');
    }

    const now = new Date();
    return {
      id: this.generateId(),
      lineNumber,
      text: text.trim(),
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update an existing comment with new text
   * @throws Error if comment text is empty or whitespace-only
   */
  static updateComment(comment: Comment, text: string): Comment {
    if (!this.validateCommentText(text)) {
      throw new Error('Comment text cannot be empty or whitespace-only');
    }

    return {
      ...comment,
      text: text.trim(),
      updatedAt: new Date(),
    };
  }

  /**
   * Delete a comment from the comment map
   * Returns a new CommentMap with the comment removed
   */
  static deleteComment(comments: CommentMap, commentId: string): CommentMap {
    const newComments = new Map<number, Comment[]>();

    comments.forEach((commentList, lineNumber) => {
      const filteredComments = commentList.filter(c => c.id !== commentId);
      if (filteredComments.length > 0) {
        newComments.set(lineNumber, filteredComments);
      }
    });

    return newComments;
  }

  /**
   * Get all comments for a specific line, sorted chronologically
   */
  static getCommentsForLine(comments: CommentMap, lineNumber: number): Comment[] {
    const lineComments = comments.get(lineNumber) || [];
    // Sort by creation timestamp (oldest first)
    return [...lineComments].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get all comments from the comment map, sorted chronologically
   */
  static getAllComments(comments: CommentMap): Comment[] {
    const allComments: Comment[] = [];
    
    comments.forEach((commentList) => {
      allComments.push(...commentList);
    });

    // Sort by creation timestamp (oldest first)
    return allComments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Add a comment to the comment map
   * Returns a new CommentMap with the comment added
   */
  static addCommentToMap(comments: CommentMap, comment: Comment): CommentMap {
    const newComments = new Map(comments);
    const lineComments = newComments.get(comment.lineNumber) || [];
    newComments.set(comment.lineNumber, [...lineComments, comment]);
    return newComments;
  }

  /**
   * Update a comment in the comment map
   * Returns a new CommentMap with the comment updated
   */
  static updateCommentInMap(comments: CommentMap, updatedComment: Comment): CommentMap {
    const newComments = new Map<number, Comment[]>();

    comments.forEach((commentList, lineNumber) => {
      const updatedList = commentList.map(c => 
        c.id === updatedComment.id ? updatedComment : c
      );
      newComments.set(lineNumber, updatedList);
    });

    return newComments;
  }

  /**
   * Save comments to storage for a specific file
   */
  static saveToStorage(fileId: string, comments: CommentMap): void {
    StorageService.saveComments(fileId, comments);
  }

  /**
   * Load comments from storage for a specific file
   */
  static loadFromStorage(fileId: string): CommentMap {
    return StorageService.loadComments(fileId);
  }
}
