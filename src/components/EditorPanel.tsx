/**
 * EditorPanel component for displaying Markdown content with line numbers
 * Supports line selection, comment indicators, and active line highlighting
 */

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import type { FileData, CommentMap } from '../types';
import { MessageSquare } from 'lucide-react';

interface EditorPanelProps {
  fileData: FileData;
  comments: CommentMap;
  onLineClick: (lineNumber: number) => void;
  activeLineNumber: number | null;
}

export function EditorPanel({
  fileData,
  comments,
  onLineClick,
  activeLineNumber,
}: EditorPanelProps) {
  /**
   * Check if a line has comments
   */
  const hasComments = (lineNumber: number): boolean => {
    const lineComments = comments.get(lineNumber);
    return lineComments !== undefined && lineComments.length > 0;
  };

  /**
   * Get comment count for a line
   */
  const getCommentCount = (lineNumber: number): number => {
    const lineComments = comments.get(lineNumber);
    return lineComments?.length || 0;
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, lineNumber: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onLineClick(lineNumber);
    }
  };

  return (
    <TooltipProvider>
      <div className="h-full border rounded-lg bg-card" role="region" aria-label="Markdown editor">
        <div className="border-b px-4 py-2 bg-muted/50">
          <h3 className="text-sm font-medium" id="editor-heading">Editor</h3>
        </div>
        
        <ScrollArea className="h-[calc(100%-3rem)]">
          <div className="font-mono text-sm" role="list" aria-labelledby="editor-heading">
            {fileData.lines.map((line, index) => {
              const lineNumber = index + 1;
              const isActive = lineNumber === activeLineNumber;
              const hasComment = hasComments(lineNumber);
              const commentCount = getCommentCount(lineNumber);

              return (
                <div
                  key={lineNumber}
                  className={`
                    flex border-b border-border/50 hover:bg-muted/50 transition-colors
                    ${isActive ? 'bg-primary/10 border-primary/50' : ''}
                  `}
                  role="listitem"
                >
                  {/* Line number with comment indicator */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onLineClick(lineNumber)}
                        onKeyDown={(e) => handleKeyDown(e, lineNumber)}
                        className={`
                          flex items-center justify-end gap-2 px-3 py-2 min-w-[4rem] border-r
                          text-muted-foreground hover:text-foreground hover:bg-muted
                          transition-colors cursor-pointer select-none
                          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                          ${isActive ? 'bg-primary/20 text-primary font-semibold border-primary/50' : ''}
                          ${hasComment ? 'text-orange-600 dark:text-orange-400' : ''}
                        `}
                        aria-label={`Line ${lineNumber}${hasComment ? `, ${commentCount} comment${commentCount > 1 ? 's' : ''}` : ', click to add comment'}`}
                        aria-pressed={isActive}
                      >
                        {hasComment && (
                          <MessageSquare className="h-3 w-3" aria-hidden="true" />
                        )}
                        <span>{lineNumber}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{hasComment ? `${commentCount} comment${commentCount > 1 ? 's' : ''} - Click to view/add` : 'Click to add comment'}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Line content */}
                  <div 
                    className="flex-1 px-4 py-2 whitespace-pre-wrap break-all"
                    aria-label={`Line ${lineNumber} content`}
                  >
                    {line || '\u00A0'}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
