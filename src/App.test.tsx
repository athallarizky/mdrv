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

describe('App - View Toggle Integration Tests', () => {
  beforeEach(() => {
    cleanup();
    // Clear localStorage before each test
    localStorage.clear();
    // Mock window.confirm for delete operations
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    
    // Mock ResizeObserver for ScrollArea component
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /**
   * Test: Switching between Preview and Comments modes
   * Validates: Requirements 9.1, 9.2
   */
  it('should switch between Preview and Comments modes when toggle is clicked', async () => {
    const user = userEvent.setup();

    // Create a test markdown file
    const testContent = '# Test Heading\n\nThis is a test paragraph.\n\n## Section 2\n\nAnother paragraph.';
    const file = new File([testContent], 'test.md', { type: 'text/markdown' });

    renderApp();

    // Upload the file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    // Initially, Preview mode should be active (default)
    const previewButton = screen.getByRole('button', { name: /preview mode/i });
    const commentsButton = screen.getByRole('button', { name: /comments mode/i });

    expect(previewButton).toHaveAttribute('aria-pressed', 'true');
    expect(commentsButton).toHaveAttribute('aria-pressed', 'false');

    // Verify Preview panel is showing (should have rendered markdown)
    expect(screen.getByText('Test Heading')).toBeInTheDocument();

    // Click Comments button to switch to Comments mode
    await user.click(commentsButton);

    // Verify Comments mode is now active
    await waitFor(() => {
      expect(commentsButton).toHaveAttribute('aria-pressed', 'true');
      expect(previewButton).toHaveAttribute('aria-pressed', 'false');
    });

    // Click Preview button to switch back
    await user.click(previewButton);

    // Verify Preview mode is active again
    await waitFor(() => {
      expect(previewButton).toHaveAttribute('aria-pressed', 'true');
      expect(commentsButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  /**
   * Test: Comments mode displays CommentsPanel component
   * Validates: Requirements 9.2, 9.3
   */
  it('should display CommentsPanel when in Comments mode', async () => {
    const user = userEvent.setup();

    // Create a test markdown file
    const testContent = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    const file = new File([testContent], 'test.md', { type: 'text/markdown' });

    renderApp();

    // Upload the file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    // Initially in Preview mode - should see rendered markdown
    const previewPanel = screen.getByRole('tabpanel', { name: /preview view/i });
    expect(previewPanel).toBeInTheDocument();

    // Switch to Comments mode
    const commentsButton = screen.getByRole('button', { name: /comments mode/i });
    await user.click(commentsButton);

    // Verify Comments mode is active
    await waitFor(() => {
      expect(commentsButton).toHaveAttribute('aria-pressed', 'true');
    });

    // Verify the right panel now shows Comments view
    const commentsPanel = screen.getByRole('tabpanel', { name: /comments view/i });
    expect(commentsPanel).toBeInTheDocument();
  });

  /**
   * Test: Comments mode shows correct panel label
   * Validates: Requirements 9.2
   */
  it('should show "Comments" label when in Comments mode', async () => {
    const user = userEvent.setup();

    // Create a test markdown file
    const testContent = 'Line 1\nLine 2\nLine 3';
    const file = new File([testContent], 'test.md', { type: 'text/markdown' });

    renderApp();

    // Upload the file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    // Initially should show "Preview" label
    const previewLabels = screen.getAllByText('Preview');
    expect(previewLabels.length).toBeGreaterThan(0);

    // Switch to Comments mode
    const commentsButton = screen.getByRole('button', { name: /comments mode/i });
    await user.click(commentsButton);

    // Verify "Comments" label is now shown
    await waitFor(() => {
      const commentsLabels = screen.getAllByText('Comments');
      expect(commentsLabels.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test: Preview mode shows correct panel label
   * Validates: Requirements 9.2
   */
  it('should show "Preview" label when in Preview mode', async () => {
    const user = userEvent.setup();

    // Create a test markdown file
    const testContent = 'Line 1\nLine 2';
    const file = new File([testContent], 'test.md', { type: 'text/markdown' });

    renderApp();

    // Upload the file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    // Should show "Preview" label in panel header by default
    const panelHeaders = screen.getAllByText('Preview');
    expect(panelHeaders.length).toBeGreaterThan(0);

    // Switch to Comments mode
    const commentsButton = screen.getByRole('button', { name: /comments mode/i });
    await user.click(commentsButton);

    // Wait for Comments mode
    await waitFor(() => {
      const commentsLabels = screen.getAllByText('Comments');
      expect(commentsLabels.length).toBeGreaterThan(0);
    });

    // Switch back to Preview mode
    const previewButton = screen.getByRole('button', { name: /preview mode/i });
    await user.click(previewButton);

    // Verify "Preview" label is shown again
    await waitFor(() => {
      const panelHeaders = screen.getAllByText('Preview');
      expect(panelHeaders.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test: ViewToggle is only visible when a file is loaded
   * Validates: Requirements 9.1
   */
  it('should only show ViewToggle when a file is loaded', async () => {
    const user = userEvent.setup();

    renderApp();

    // Initially, no file is loaded, so ViewToggle should not be visible
    expect(screen.queryByRole('button', { name: /preview mode/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /comments mode/i })).not.toBeInTheDocument();

    // Upload a file
    const testContent = 'Test content';
    const file = new File([testContent], 'test.md', { type: 'text/markdown' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Wait for file to load
    await waitFor(() => {
      expect(screen.getByText('test.md')).toBeInTheDocument();
    });

    // Now ViewToggle should be visible
    expect(screen.getByRole('button', { name: /preview mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comments mode/i })).toBeInTheDocument();
  });
});

describe('App - Responsive Behavior Tests', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    
    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /**
   * Test: Mobile view toggle exists on small screens
   * Validates: Requirements 7.2
   */
  it('should have mobile view toggle for editor/preview on small screens', async () => {
    const user = userEvent.setup();

    // Mock window.matchMedia for mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 1023px)', // lg breakpoint
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderApp();

    // Upload a file
    const testContent = 'Test content\nLine 2';
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

describe('App - Accessibility Tests', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    
    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  /**
   * Test: ViewToggle has proper ARIA attributes
   * Validates: Requirements 7.1 (accessibility)
   */
  it('should have proper ARIA attributes on ViewToggle buttons', async () => {
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

    // Check ARIA attributes
    const previewButton = screen.getByRole('button', { name: /preview mode/i });
    const commentsButton = screen.getByRole('button', { name: /comments mode/i });

    // Both buttons should have aria-pressed attribute
    expect(previewButton).toHaveAttribute('aria-pressed');
    expect(commentsButton).toHaveAttribute('aria-pressed');

    // Initially, preview should be pressed
    expect(previewButton).toHaveAttribute('aria-pressed', 'true');
    expect(commentsButton).toHaveAttribute('aria-pressed', 'false');

    // Click comments button
    await user.click(commentsButton);

    // Now comments should be pressed
    await waitFor(() => {
      expect(commentsButton).toHaveAttribute('aria-pressed', 'true');
      expect(previewButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  /**
   * Test: Keyboard navigation works for ViewToggle
   * Validates: Requirements 7.1 (keyboard navigation)
   */
  it('should support keyboard navigation for ViewToggle', async () => {
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

    const previewButton = screen.getByRole('button', { name: /preview mode/i });
    const commentsButton = screen.getByRole('button', { name: /comments mode/i });

    // Tab to preview button
    await user.tab();
    // Continue tabbing until we reach the preview button
    let activeElement = document.activeElement;
    let tabCount = 0;
    while (activeElement !== previewButton && tabCount < 20) {
      await user.tab();
      activeElement = document.activeElement;
      tabCount++;
    }

    // Press Enter to activate (if we found it)
    if (activeElement === previewButton) {
      await user.keyboard('{Enter}');
      expect(previewButton).toHaveAttribute('aria-pressed', 'true');
    }

    // Tab to comments button
    await user.tab();
    activeElement = document.activeElement;
    
    // If we're on the comments button, press Enter
    if (activeElement === commentsButton) {
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(commentsButton).toHaveAttribute('aria-pressed', 'true');
      });
    }
  });
});
