/**
 * StorageService handles all local storage operations for the MD Review App
 * Provides methods for saving/loading comments and file data with error handling
 */

import type { FileData, Comment, CommentMap, StorageData } from '../types';
import { toast } from 'sonner';

const STORAGE_KEY = 'md-review-app';
const STORAGE_VERSION = '1.0.0';

export class StorageService {
  /**
   * Check if local storage is available in the browser
   */
  static isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Show toast notification (only in non-test environment)
   */
  private static showToast(type: 'error', title: string, description: string): void {
    // Skip toast in test environment
    if (import.meta.env?.MODE === 'test') {
      return;
    }
    toast[type](title, { description });
  }

  /**
   * Get the current storage data or initialize empty structure
   */
  private static getStorageData(): StorageData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return this.createEmptyStorageData();
      }

      const parsed = JSON.parse(data);
      
      // Validate basic structure
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.error('Failed to load storage data: Invalid storage data structure');
        this.showToast('error', 'Storage data corrupted', 'Starting with fresh storage. Previous data may be lost.');
        return this.createEmptyStorageData();
      }

      // Validate required fields exist and are correct types
      if (!parsed.version || typeof parsed.version !== 'string') {
        console.error('Failed to load storage data: Missing or invalid version');
        this.showToast('error', 'Storage data corrupted', 'Starting with fresh storage. Previous data may be lost.');
        return this.createEmptyStorageData();
      }

      if (!parsed.files || typeof parsed.files !== 'object' || Array.isArray(parsed.files)) {
        console.error('Failed to load storage data: Missing or invalid files');
        this.showToast('error', 'Storage data corrupted', 'Starting with fresh storage. Previous data may be lost.');
        return this.createEmptyStorageData();
      }

      if (!parsed.comments || typeof parsed.comments !== 'object' || Array.isArray(parsed.comments)) {
        console.error('Failed to load storage data: Missing or invalid comments');
        this.showToast('error', 'Storage data corrupted', 'Starting with fresh storage. Previous data may be lost.');
        return this.createEmptyStorageData();
      }

      return parsed as StorageData;
    } catch (e) {
      // Return empty data if corrupted
      console.error('Failed to load storage data:', e);
      this.showToast('error', 'Storage data corrupted', 'Starting with fresh storage. Previous data may be lost.');
      return this.createEmptyStorageData();
    }
  }

  /**
   * Create empty storage data structure
   */
  private static createEmptyStorageData(): StorageData {
    return {
      version: STORAGE_VERSION,
      files: {},
      comments: {},
      currentFileId: null,
    };
  }

  /**
   * Save storage data to local storage
   */
  private static setStorageData(data: StorageData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // Check if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear old data.');
      }
      throw new Error('Failed to save to storage');
    }
  }

  /**
   * Save comments for a specific file
   * @throws Error if storage is unavailable or quota exceeded
   */
  static saveComments(fileId: string, comments: CommentMap): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Local storage is not available');
    }

    const data = this.getStorageData();
    
    // Convert Map to array for storage
    const commentsArray: Comment[] = [];
    comments.forEach((commentList) => {
      commentsArray.push(...commentList);
    });

    data.comments[fileId] = commentsArray;
    this.setStorageData(data);
  }

  /**
   * Load comments for a specific file
   */
  static loadComments(fileId: string): CommentMap {
    const data = this.getStorageData();
    
    // Convert array back to Map grouped by line number
    const commentMap = new Map<number, Comment[]>();
    
    // Use hasOwnProperty to avoid prototype pollution
    if (!Object.prototype.hasOwnProperty.call(data.comments, fileId)) {
      return commentMap;
    }
    
    const commentsArray = data.comments[fileId];
    
    // Validate commentsArray is actually an array
    if (!Array.isArray(commentsArray)) {
      return commentMap;
    }
    
    commentsArray.forEach((comment) => {
      // Restore Date objects from JSON strings
      const restoredComment: Comment = {
        ...comment,
        createdAt: new Date(comment.createdAt),
        updatedAt: new Date(comment.updatedAt),
      };
      
      const lineComments = commentMap.get(restoredComment.lineNumber) || [];
      lineComments.push(restoredComment);
      commentMap.set(restoredComment.lineNumber, lineComments);
    });

    return commentMap;
  }

  /**
   * Save file data
   * @throws Error if storage is unavailable or quota exceeded
   */
  static saveFileData(fileData: FileData): void {
    if (!this.isStorageAvailable()) {
      throw new Error('Local storage is not available');
    }

    const data = this.getStorageData();
    data.files[fileData.id] = fileData;
    data.currentFileId = fileData.id;
    this.setStorageData(data);
  }

  /**
   * Load file data by ID
   */
  static loadFileData(fileId: string): FileData | null {
    const data = this.getStorageData();
    
    // Use hasOwnProperty to avoid prototype pollution
    if (!Object.prototype.hasOwnProperty.call(data.files, fileId)) {
      return null;
    }
    
    const fileData = data.files[fileId];
    
    if (!fileData) {
      return null;
    }

    // Restore Date object from JSON string
    return {
      ...fileData,
      uploadedAt: new Date(fileData.uploadedAt),
    };
  }

  /**
   * Clear all storage data
   */
  static clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get current file ID
   */
  static getCurrentFileId(): string | null {
    const data = this.getStorageData();
    return data.currentFileId;
  }

  /**
   * Get all file IDs
   */
  static getAllFileIds(): string[] {
    const data = this.getStorageData();
    return Object.keys(data.files);
  }
}
