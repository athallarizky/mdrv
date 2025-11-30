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
import { FileText, AlertCircle, AlertTriangle, CloudUpload } from 'lucide-react';

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
      <div className="w-full space-y-4 animate-fade-in">
        {/* Drag and drop area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative group border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ease-in-out
            ${isDragging 
              ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg' 
              : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30'}
            ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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

        <div className="flex flex-col items-center gap-4 transition-transform duration-300 group-hover:-translate-y-1">
          {isLoading ? (
            <>
              <div className="relative">
                <FileText className="h-16 w-16 text-muted-foreground/50" aria-hidden="true" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              <div className="space-y-1" role="status" aria-live="polite">
                <p className="text-lg font-medium">Loading file...</p>
                <p className="text-sm text-muted-foreground">Please wait while we process your content</p>
              </div>
            </>
          ) : (
            <>
              <div className={`
                p-4 rounded-full bg-secondary transition-colors duration-300
                ${isDragging ? 'bg-primary/10 text-primary' : 'text-muted-foreground group-hover:text-primary group-hover:bg-primary/5'}
              `}>
                <CloudUpload className="h-10 w-10" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold tracking-tight" aria-live="polite">
                  {isDragging ? 'Drop your file here' : 'Upload Markdown File'}
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Drag and drop your file here, or click to browse from your computer
                </p>
              </div>
              <div className="pt-2">
                <Button
                  type="button"
                  variant={isDragging ? "default" : "outline"}
                  disabled={disabled || isLoading}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleButtonClick();
                  }}
                  className="min-w-[140px]"
                >
                  Browse Files
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/70 pt-2" role="note">
                Supported formats: .md, .markdown (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Warning message */}
      {warning && (
        <Alert role="alert" aria-live="polite" className="animate-fade-in">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
      </div>
    </TooltipProvider>
  );
}
