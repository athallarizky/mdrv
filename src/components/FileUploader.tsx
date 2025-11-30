/**
 * FileUploader component for loading Markdown files
 * Supports drag-and-drop and file selection with validation
 */

import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Upload, FileText, AlertCircle, AlertTriangle } from 'lucide-react';

interface FileUploaderProps {
  onFileLoad: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function FileUploader({ onFileLoad, disabled = false }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_EXTENSIONS = ['.md', '.markdown'];

  /**
   * Validate file type
   */
  const validateFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return VALID_EXTENSIONS.some(ext => fileName.endsWith(ext));
  };

  /**
   * Check if file is too large
   */
  const isFileTooLarge = (file: File): boolean => {
    return file.size > MAX_FILE_SIZE;
  };

  /**
   * Handle file selection
   */
  const handleFile = async (file: File) => {
    setError(null);
    setWarning(null);

    // Validate file type
    if (!validateFileType(file)) {
      setError('Invalid file type. Only .md and .markdown files are supported.');
      return;
    }

    // Check file size and show warning
    if (isFileTooLarge(file)) {
      setWarning(`File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Large files may affect performance.`);
    }

    // Load the file
    try {
      setIsLoading(true);
      await onFileLoad(file);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle drag over event
   */
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragging(true);
    }
  };

  /**
   * Handle drag leave event
   */
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handle drop event
   */
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (disabled || isLoading) {
      return;
    }

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  /**
   * Handle button click to open file dialog
   */
  const handleButtonClick = () => {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        {/* Drag and drop area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
          `}
          onClick={handleButtonClick}
          role="button"
          tabIndex={disabled || isLoading ? -1 : 0}
          aria-label="Upload Markdown file by clicking or dragging and dropping"
          aria-disabled={disabled || isLoading}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading) {
              e.preventDefault();
              handleButtonClick();
            }
          }}
        >
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown"
          onChange={handleFileInputChange}
          disabled={disabled || isLoading}
          className="hidden"
          aria-label="Upload Markdown file"
          id="file-upload-input"
        />

        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <>
              <FileText className="h-12 w-12 text-muted-foreground animate-pulse" aria-hidden="true" />
              <div className="space-y-2" role="status" aria-live="polite">
                <p className="text-sm font-medium">Loading file...</p>
                <p className="text-xs text-muted-foreground">Please wait</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <div className="space-y-2">
                <p className="text-sm font-medium" aria-live="polite">
                  {isDragging ? 'Drop your file here' : 'Drag and drop your Markdown file here'}
                </p>
                <p className="text-xs text-muted-foreground">or</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled || isLoading}
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleButtonClick();
                      }}
                      aria-label="Browse files to upload"
                    >
                      Browse Files
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select a .md or .markdown file from your computer</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground" role="note">
                Supported formats: .md, .markdown (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Warning message */}
      {warning && (
        <Alert role="alert" aria-live="polite">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
      </div>
    </TooltipProvider>
  );
}
