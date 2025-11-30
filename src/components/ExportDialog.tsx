/**
 * ExportDialog component for exporting comments
 * Displays export preview and provides download functionality
 * Handles empty comments case and shows success/error messages
 */

import { useState } from 'react';
import type { FileData, CommentMap } from '../types';
import { ExportService } from '../services/ExportService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription } from './ui/alert';
import { Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Props for ExportDialog component
 */
export interface ExportDialogProps {
  isOpen: boolean;
  comments: CommentMap;
  fileData: FileData;
  onClose: () => void;
}

/**
 * ExportDialog component
 * Provides export preview and download functionality for comments
 */
export function ExportDialog({
  isOpen,
  comments,
  fileData,
  onClose,
}: ExportDialogProps) {
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Calculate total comment count
  const totalComments = Array.from(comments.values()).reduce(
    (sum, commentList) => sum + commentList.length,
    0
  );

  // Check if there are no comments
  const hasNoComments = totalComments === 0;

  /**
   * Generate export preview
   */
  const generatePreview = (): string => {
    if (hasNoComments) {
      return 'No comments to export.';
    }

    try {
      return ExportService.generateMarkdownExport(fileData, comments);
    } catch {
      return 'Error generating preview.';
    }
  };

  /**
   * Handle download action
   */
  const handleDownload = async () => {
    // Prevent download if no comments
    if (hasNoComments) {
      setExportStatus('error');
      setErrorMessage('Cannot export: No comments available.');
      toast.error('Cannot export', {
        description: 'No comments available to export.',
      });
      return;
    }

    try {
      setExportStatus('loading');
      
      // Simulate async operation for better UX (allows UI to update)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate export content
      const exportContent = ExportService.generateMarkdownExport(fileData, comments);
      
      // Generate filename
      const filename = ExportService.generateExportFilename(fileData.name);
      
      // Download the file
      ExportService.downloadAsFile(exportContent, filename);
      
      // Show success message
      setExportStatus('success');
      toast.success('Export successful', {
        description: `Downloaded ${filename}`,
      });
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setExportStatus('idle');
        onClose();
      }, 2000);
    } catch (error) {
      // Show error message
      const errorMsg = error instanceof Error ? error.message : 'Failed to export comments.';
      setExportStatus('error');
      setErrorMessage(errorMsg);
      toast.error('Export failed', {
        description: errorMsg,
      });
    }
  };

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    setExportStatus('idle');
    setErrorMessage('');
    onClose();
  };

  /**
   * Reset status when dialog opens/closes
   */
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Reset status when dialog opens
      setExportStatus('idle');
      setErrorMessage('');
    } else {
      handleClose();
    }
  };

  const exportPreview = generatePreview();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[80vh] flex flex-col"
        aria-describedby="export-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" aria-hidden="true" />
            Export Comments
          </DialogTitle>
          <DialogDescription id="export-dialog-description">
            {hasNoComments
              ? 'There are no comments to export.'
              : `Export ${totalComments} ${totalComments === 1 ? 'comment' : 'comments'} from ${fileData.name}`}
          </DialogDescription>
        </DialogHeader>

        {/* Export Preview */}
        <div className="flex-1 min-h-0" role="region" aria-label="Export preview">
          <div className="mb-2">
            <h3 className="text-sm font-medium" id="export-preview-heading">Preview:</h3>
          </div>
          <ScrollArea className="h-[400px] w-full rounded-md border bg-muted/30">
            <pre 
              className="p-4 text-xs font-mono whitespace-pre-wrap break-words"
              aria-labelledby="export-preview-heading"
              role="document"
            >
              {exportPreview}
            </pre>
          </ScrollArea>
        </div>

        {/* Status Messages */}
        {exportStatus === 'success' && (
          <Alert 
            className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Comments exported successfully! Download started.
            </AlertDescription>
          </Alert>
        )}

        {exportStatus === 'error' && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Footer with Actions */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={exportStatus === 'success' || exportStatus === 'loading'}
            aria-label="Cancel export"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={hasNoComments || exportStatus === 'success' || exportStatus === 'loading'}
            className="gap-2"
            aria-label={exportStatus === 'loading' ? 'Exporting comments' : 'Download exported comments'}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {exportStatus === 'loading' ? 'Exporting...' : 'Download'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
