/**
 * ViewToggle component for switching between Preview and Comments modes
 * Allows users to toggle the right panel between rendered Markdown preview
 * and inline comments view
 */

import { Eye, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { ViewMode } from '../store/types';

/**
 * Props for ViewToggle component
 */
export interface ViewToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

/**
 * ViewToggle component
 * Displays a toggle button to switch between Preview and Comments modes
 */
export function ViewToggle({ currentMode, onModeChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('preview')}
              className="gap-2"
              aria-label="Preview mode"
              aria-pressed={currentMode === 'preview'}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show rendered Markdown preview</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentMode === 'comments' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('comments')}
              className="gap-2"
              aria-label="Comments mode"
              aria-pressed={currentMode === 'comments'}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show inline comments view</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
