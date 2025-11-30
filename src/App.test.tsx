/**
 * Integration tests for App component
 * Tests the view toggle feature and overall app behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AppProvider } from './store/AppContext';

// Helper to render App with AppProvider
const renderApp = () => {
  return render(
    <AppProvider>
      <App />
    </AppProvider>
  );
};

describe('App - Integration Tests', () => {
  beforeEach(() => {
    cleanup();
    // Clear localStorage before each test
    localStorage.clear();
    // Mock window.confirm for delete operations
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    
    // Mock ResizeObserver for ScrollArea component
    (globalThis as unknown).ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /**
   * Test: File upload and initial layout
   */
  it('should display Editor and Preview panels after file upload', async () => {
    const user = userEvent.setup();

    // Create a test markdown file
    const testContent = '# Test Heading\n\nThis is a test paragraph.';
    const file = new File([testContent], 'test.md', { type: 'text/markdown' });

    renderApp();

    // Upload the file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    // Verify Editor and Preview panels are present
    const editorPanel = screen.getByRole('tabpanel', { name: /editor view/i });
    const previewPanel = screen.getByRole('tabpanel', { name: /preview view/i });

    expect(editorPanel).toBeInTheDocument();
    expect(previewPanel).toBeInTheDocument();

    // Verify content is rendered
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  /**
   * Test: Mobile view toggle exists
   */
  it('should have mobile view toggle for editor/preview', async () => {
    const user = userEvent.setup();

    renderApp();

    // Upload a file
    const testContent = 'Test content';
    const file = new File([testContent], 'test.md', { type: 'text/markdown' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    // Check for mobile view toggle buttons (Editor/Preview)
    // These should be in a tablist with role="tablist"
    const tablist = screen.getByRole('tablist', { name: /view selection/i });
    expect(tablist).toBeInTheDocument();

    // Check for Editor and Preview tabs
    const editorTab = screen.getByRole('tab', { name: /editor/i });
    const previewTab = screen.getByRole('tab', { name: /preview/i });
    
    expect(editorTab).toBeInTheDocument();
    expect(previewTab).toBeInTheDocument();
  });
});

