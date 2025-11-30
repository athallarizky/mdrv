/**
 * ExportService handles export operations for comments
 * Provides methods for generating Markdown exports and downloading files
 */

import type { FileData, CommentMap } from '../types';

export class ExportService {
  /**
   * Generate a Markdown export containing all comments with line numbers and content
   * @param fileData - The file data containing lines
   * @param comments - The comment map to export
   * @returns Formatted Markdown string
   */
  static generateMarkdownExport(fileData: FileData, comments: CommentMap): string {
    const lines: string[] = [];
    
    // Add header
    lines.push(`# Review Comments for ${fileData.name}`);
    lines.push('');
    lines.push(`Generated on: ${new Date().toLocaleString()}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Get all line numbers that have comments, sorted
    const lineNumbers = Array.from(comments.keys()).sort((a, b) => a - b);

    if (lineNumbers.length === 0) {
      lines.push('No comments found.');
      return lines.join('\n');
    }

    // For each line with comments
    lineNumbers.forEach((lineNumber) => {
      const lineComments = comments.get(lineNumber) || [];
      
      // Add line number and content
      lines.push(`## Line ${lineNumber}`);
      lines.push('');
      
      // Add the actual line content from the file
      const lineContent = fileData.lines[lineNumber - 1] || ''; // Convert to 0-indexed
      lines.push('```');
      lines.push(lineContent);
      lines.push('```');
      lines.push('');
      
      // Add all comments for this line
      lines.push('**Comments:**');
      lines.push('');
      
      lineComments.forEach((comment, index) => {
        lines.push(`${index + 1}. ${comment.text}`);
        lines.push(`   - *Created: ${comment.createdAt.toLocaleString()}*`);
        if (comment.updatedAt.getTime() !== comment.createdAt.getTime()) {
          lines.push(`   - *Updated: ${comment.updatedAt.toLocaleString()}*`);
        }
        lines.push('');
      });
      
      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Download content as a file using browser download API
   * @param content - The content to download
   * @param filename - The name for the downloaded file
   */
  static downloadAsFile(content: string, filename: string): void {
    // Create a Blob from the content
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
  }

  /**
   * Generate a filename for the export based on the original file name
   * @param originalFileName - The original file name
   * @returns A filename for the export
   */
  static generateExportFilename(originalFileName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const baseName = originalFileName.replace(/\.(md|markdown)$/i, '');
    return `${baseName}-review-${timestamp}.md`;
  }
}
