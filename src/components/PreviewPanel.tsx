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
      <ScrollArea className="h-full w-full">
        <article 
          className="prose prose-slate dark:prose-invert max-w-none p-8 prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-p:leading-7 prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50"
          aria-label="Markdown preview content"
        >
          <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </ScrollArea>
  );
}
