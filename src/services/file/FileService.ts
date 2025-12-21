import type { FileData } from '../../types';

/**
 * Service for handling file operations including loading, validation, and parsing
 */
export class FileService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  private static readonly VALID_EXTENSIONS = ['.md', '.markdown'];

  /**
   * Load a file and parse it into FileData
   * @param file - The File object to load
   * @returns Promise resolving to FileData
   * @throws Error if file is invalid or cannot be read
   */
  static async loadFile(file: File): Promise<FileData> {
    // Validate file before loading
    if (!this.validateFile(file)) {
      throw new Error('Invalid file type. Only .md and .markdown files are supported.');
    }

    // Read file content
    const content = await this.readFileContent(file);
    
    // Parse lines
    const lines = this.parseLines(content);
    
    // Generate unique ID
    const id = this.generateFileId(file.name);
    
    return {
      id,
      name: file.name,
      content,
      lines,
      uploadedAt: new Date(),
    };
  }

  /**
   * Validate if a file is a valid Markdown file
   * @param file - The File object to validate
   * @returns true if file is valid, false otherwise
   */
  static validateFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    return this.VALID_EXTENSIONS.some(ext => fileName.endsWith(ext));
  }

  /**
   * Check if file size exceeds the maximum allowed size
   * @param file - The File object to check
   * @returns true if file exceeds max size, false otherwise
   */
  static isFileTooLarge(file: File): boolean {
    return file.size > this.MAX_FILE_SIZE;
  }

  /**
   * Generate a unique file ID based on name and timestamp
   * @param name - The file name
   * @returns A unique identifier string
   */
  static generateFileId(name: string): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 9);
    return `${name}-${timestamp}-${randomPart}`;
  }

  /**
   * Parse file content into an array of lines
   * @param content - The raw file content
   * @returns Array of lines
   */
  static parseLines(content: string): string[] {
    // Split by newlines, preserving empty lines
    return content.split(/\r?\n/);
  }

  /**
   * Read file content as text
   * @param file - The File object to read
   * @returns Promise resolving to file content as string
   */
  private static readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
}
