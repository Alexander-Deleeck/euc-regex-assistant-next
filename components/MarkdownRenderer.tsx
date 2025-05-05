import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * MarkdownRenderer
 * ----------------
 * Renders markdown content as React elements, supporting GitHub-flavored markdown.
 * - Code blocks and inline code are styled for readability.
 * - Safe for user-generated content (no raw HTML rendering by default).
 *
 * @param content   The markdown string to render.
 * @param className Optional additional class names for the root element.
 */
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code(props) {
        const { inline, className, children, ...rest } = props as any;
        if (inline) {
          return (
            <code
              className={`bg-gray-100 rounded px-1 py-0.5 font-mono text-xs ${className || ""}`}
              {...rest}
            >
              {children}
            </code>
          );
        }
        return (
          <pre
            className={`bg-gray-100 rounded p-2 font-mono  text-xs overflow-x-auto ${className || ""}`}
            {...rest}
          >
            <code>{children}</code>
          </pre>
        );
      },
      // You can add more custom renderers here if needed (e.g., for tables, blockquotes, etc.)
    }}
  >
    {content}
  </ReactMarkdown>
);

export default MarkdownRenderer;
