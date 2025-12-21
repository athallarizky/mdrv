/**
 * Property-based tests for ViewToggle component
 * Tests the view mode toggle functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { ViewToggle } from '../ViewToggle';
import type { ViewMode } from '../store/types';

describe('ViewToggle', () => {
  /**
   * Feature: md-review-app, Property 19: View mode toggle
   * For any view mode (preview or comments), clicking the toggle button should switch to the opposite mode.
   * Validates: Requirements 9.1
   */
  it('should toggle between preview and comments modes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<ViewMode>('preview', 'comments'),
        async (initialMode) => {
          // Clean up before each property test iteration
          cleanup();
          
          const user = userEvent.setup();
          const onModeChange = vi.fn();

          render(
            <ViewToggle currentMode={initialMode} onModeChange={onModeChange} />
          );

          // Determine the opposite mode
          const oppositeMode: ViewMode = initialMode === 'preview' ? 'comments' : 'preview';

          // Find all buttons and get the one for the opposite mode
          const allButtons = screen.getAllByRole('button');
          const oppositeButton = allButtons.find(btn => 
            btn.getAttribute('aria-label') === `${oppositeMode.charAt(0).toUpperCase() + oppositeMode.slice(1)} mode`
          );

          expect(oppositeButton).toBeDefined();

          // Click the opposite mode button
          await user.click(oppositeButton!);

          // Verify onModeChange was called with the opposite mode
          expect(onModeChange).toHaveBeenCalledWith(oppositeMode);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Verify both buttons are always present
   */
  it('should always display both preview and comments buttons', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ViewMode>('preview', 'comments'),
        (mode) => {
          cleanup();
          
          const onModeChange = vi.fn();

          render(<ViewToggle currentMode={mode} onModeChange={onModeChange} />);

          // Get all buttons
          const allButtons = screen.getAllByRole('button');
          
          // Find preview and comments buttons by aria-label
          const previewButton = allButtons.find(btn => btn.getAttribute('aria-label') === 'Preview mode');
          const commentsButton = allButtons.find(btn => btn.getAttribute('aria-label') === 'Comments mode');

          expect(previewButton).toBeDefined();
          expect(commentsButton).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Verify exactly one button is active at a time
   */
  it('should have exactly one active button at any time', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ViewMode>('preview', 'comments'),
        (mode) => {
          cleanup();
          
          const onModeChange = vi.fn();

          render(<ViewToggle currentMode={mode} onModeChange={onModeChange} />);

          // Get all buttons
          const allButtons = screen.getAllByRole('button');
          
          // Find preview and comments buttons by aria-label
          const previewButton = allButtons.find(btn => btn.getAttribute('aria-label') === 'Preview mode');
          const commentsButton = allButtons.find(btn => btn.getAttribute('aria-label') === 'Comments mode');

          expect(previewButton).toBeDefined();
          expect(commentsButton).toBeDefined();

          // Check which button should be active
          const previewPressed = previewButton!.getAttribute('aria-pressed') === 'true';
          const commentsPressed = commentsButton!.getAttribute('aria-pressed') === 'true';

          // Exactly one should be pressed
          expect(previewPressed !== commentsPressed).toBe(true);

          // The correct button should be pressed
          if (mode === 'preview') {
            expect(previewPressed).toBe(true);
            expect(commentsPressed).toBe(false);
          } else {
            expect(previewPressed).toBe(false);
            expect(commentsPressed).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
