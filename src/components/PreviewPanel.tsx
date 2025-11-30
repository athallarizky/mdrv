import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ScrollArea } from './ui/scroll-area';
import type { Components } from 'react-markdown';

interface PreviewPanelProps {
  content: string;
}

/**
 * PreviewPanel component displays rendered Markdown preview
 * Supports code blocks with syntax highlighting, tables, images, and links
 */
export function PreviewPanel({ content }: PreviewPanelProps) {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;
      
      return !isInline ? (
        <SyntaxHighlighter
          style={oneDark as Record<string, React.CSSProperties>}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="h-full border rounded-lg bg-card" role="region" aria-label="Markdown preview">
      <div className="border-b px-4 py-2 bg-muted/50">
        <h3 className="text-sm font-medium" id="preview-heading">Preview</h3>
      </div>
      <ScrollArea className="h-[calc(100%-3rem)] w-full">
        <article 
          className="prose prose-slate max-w-none p-6 dark:prose-invert"
          aria-labelledby="preview-heading"
        >
          <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </ScrollArea>
    </div>
  );
}
