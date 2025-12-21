/**
 * Tests for ExportDialog component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportDialog } from '../ExportDialog';
import type { FileData, CommentMap } from '../types';
import { ExportService } from '../services/export';

describe('ExportDialog', () => {
  const mockFileData: FileData = {
    id: 'test-file-1',
    name: 'test.md',
    content: 'Line 1\nLine 2\nLine 3',
    lines: ['Line 1', 'Line 2', 'Line 3'],
    uploadedAt: new Date('2024-01-01'),
  };

  const mockComments: CommentMap = new Map([
    [
      1,
      [
        {
          id: 'comment-1',
          lineNumber: 1,
          text: 'First comment',
          createdAt: new Date('2024-01-01T10:00:00'),
          updatedAt: new Date('2024-01-01T10:00:00'),
        },
      ],
    ],
    [
      2,
      [
        {
          id: 'comment-2',
          lineNumber: 2,
          text: 'Second comment',
          createdAt: new Date('2024-01-01T11:00:00'),
          updatedAt: new Date('2024-01-01T11:00:00'),
        },
      ],
    ],
  ]);

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(
      <ExportDialog
        isOpen={true}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Export Comments')).toBeInTheDocument();
    expect(screen.getByText(/Export 2 comments from test.md/)).toBeInTheDocument();
  });

  it('does not render dialog when closed', () => {
    render(
      <ExportDialog
        isOpen={false}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Export Comments')).not.toBeInTheDocument();
  });

  it('displays export preview', () => {
    render(
      <ExportDialog
        isOpen={true}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Preview:')).toBeInTheDocument();
    expect(screen.getByText(/Review Comments for test.md/)).toBeInTheDocument();
  });

  it('handles empty comments case', () => {
    const emptyComments: CommentMap = new Map();

    render(
      <ExportDialog
        isOpen={true}
        comments={emptyComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('There are no comments to export.')).toBeInTheDocument();
    expect(screen.getByText('No comments to export.')).toBeInTheDocument();

    const downloadButton = screen.getByRole('button', { name: /download/i });
    expect(downloadButton).toBeDisabled();
  });

  it('prevents download when no comments exist', () => {
    const emptyComments: CommentMap = new Map();
    const downloadSpy = vi.spyOn(ExportService, 'downloadAsFile');

    render(
      <ExportDialog
        isOpen={true}
        comments={emptyComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /download/i });
    
    // Button should be disabled when no comments
    expect(downloadButton).toBeDisabled();
    
    // Download should not be called since button is disabled
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('downloads file when download button is clicked', async () => {
    const downloadSpy = vi.spyOn(ExportService, 'downloadAsFile').mockImplementation(() => {});
    const generateFilenameSpy = vi
      .spyOn(ExportService, 'generateExportFilename')
      .mockReturnValue('test-review-2024-01-01.md');

    render(
      <ExportDialog
        isOpen={true}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalled();
      expect(generateFilenameSpy).toHaveBeenCalledWith('test.md');
    });

    expect(screen.getByText(/Comments exported successfully/)).toBeInTheDocument();
  });

  it('shows error message when export fails', async () => {
    vi.spyOn(ExportService, 'downloadAsFile').mockImplementation(() => {
      throw new Error('Export failed');
    });

    render(
      <ExportDialog
        isOpen={true}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText('Export failed')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ExportDialog
        isOpen={true}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('auto-closes after successful export', async () => {
    vi.spyOn(ExportService, 'downloadAsFile').mockImplementation(() => {});

    render(
      <ExportDialog
        isOpen={true}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Comments exported successfully/)).toBeInTheDocument();
    });

    // Wait for auto-close (2 seconds)
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays correct comment count in description', () => {
    const singleComment: CommentMap = new Map([
      [
        1,
        [
          {
            id: 'comment-1',
            lineNumber: 1,
            text: 'Single comment',
            createdAt: new Date('2024-01-01T10:00:00'),
            updatedAt: new Date('2024-01-01T10:00:00'),
          },
        ],
      ],
    ]);

    render(
      <ExportDialog
        isOpen={true}
        comments={singleComment}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Export 1 comment from test.md/)).toBeInTheDocument();
  });

  it('resets status when dialog is closed and reopened', async () => {
    vi.spyOn(ExportService, 'downloadAsFile').mockImplementation(() => {
      throw new Error('Test error');
    });

    const { unmount } = render(
      <ExportDialog
        isOpen={true}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    // Trigger an error by clicking download
    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Test error/)).toBeInTheDocument();
    });

    // Unmount the component (simulating closing)
    unmount();

    // Render a new instance (simulating reopening)
    render(
      <ExportDialog
        isOpen={true}
        comments={mockComments}
        fileData={mockFileData}
        onClose={mockOnClose}
      />
    );

    // Error message should not be present in the new instance
    expect(screen.queryByText(/Test error/)).not.toBeInTheDocument();
  });
});
