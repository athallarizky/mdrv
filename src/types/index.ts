/**
 * Core data models and types for MD Review App
 */

/**
 * Represents a loaded Markdown file with parsed content
 */
export interface FileData {
  id: string;              // Unique identifier (hash of name + timestamp)
  name: string;            // File name
  content: string;         // Raw Markdown content
  lines: string[];         // Array of lines for line-by-line processing
  uploadedAt: Date;        // Timestamp of upload
}

/**
 * Represents a comment on a specific line
 */
export interface Comment {
  id: string;              // Unique identifier
  lineNumber: number;      // Line number (1-indexed)
  text: string;            // Comment content
  createdAt: Date;         // Timestamp of creation
  updatedAt: Date;         // Timestamp of last update
}

/**
 * Map from line number to array of comments for that line
 */
export type CommentMap = Map<number, Comment[]>;

/**
 * Storage schema for persisting data in local storage
 */
export interface StorageData {
  version: string;                    // Schema version for migration
  files: Record<string, FileData>;    // Map from file ID to FileData
  comments: Record<string, Comment[]>; // Map from file ID to array of comments
  currentFileId: string | null;       // Currently active file ID
}
