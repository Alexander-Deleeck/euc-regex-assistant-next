import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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

const renderCode = ({ node, inline, className, children, ...props }: {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}) => {
  const match = /language-(\w+)/.exec(className || "");
  if (inline) {
    return (
      <div
        className={`bg-gray-100 rounded px-1 py-0.5 font-mono text-xs ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }
  return (
    <SyntaxHighlighter
      style={oneDark}
      language={match ? match[1] : undefined}
      PreTag="div"
      showLineNumbers
      customStyle={{
        borderRadius: "0.5rem",
        fontSize: "0.9em",
        margin: "0.5em 0",
      }}
      {...props}
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => (
  <div className={className}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: renderCode,
        blockquote({ children, ...props }) {
          return (
            <blockquote
              className="border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/30 pl-4 pr-2 py-2 my-2 italic text-blue-900 dark:text-blue-100 rounded"
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm" {...props}>
                {children}
              </table>
            </div>
          );
        },
        th({ children, ...props }) {
          return (
            <th className="bg-gray-100 dark:bg-gray-800 font-semibold px-3 py-2 border border-gray-300 dark:border-gray-700" {...props}>
              {children}
            </th>
          );
        },
        td({ children, ...props }) {
          return (
            <td className="px-3 py-2 border border-gray-300 dark:border-gray-700" {...props}>
              {children}
            </td>
          );
        },
        ul({ children, ...props }) {
          return (
            <ul className="list-disc list-inside ml-4 my-2" {...props}>
              {children}
            </ul>
          );
        },
        ol({ children, ...props }) {
          return (
            <ol className="list-decimal list-inside ml-4 my-2" {...props}>
              {children}
            </ol>
          );
        },
        li({ children, ...props }) {
          return (
            <li className="mb-1" {...props}>
              {children}
            </li>
          );
        },
        h1({ children, ...props }) {
          return (
            <h1 className="text-3xl font-bold mt-6 mb-2" {...props}>
              {children}
            </h1>
          );
        },
        h2({ children, ...props }) {
          return (
            <h2 className="text-2xl font-bold mt-5 mb-2" {...props}>
              {children}
            </h2>
          );
        },
        h3({ children, ...props }) {
          return (
            <h3 className="text-xl font-semibold mt-4 mb-2" {...props}>
              {children}
            </h3>
          );
        },
        // Add more heading levels if desired
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

// Add a module declaration for 'react-syntax-highlighter' if needed
// declare module 'react-syntax-highlighter';

export default MarkdownRenderer;
