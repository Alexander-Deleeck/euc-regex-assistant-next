// components/MarkdownRenderer.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown (tables, strikethrough, etc.)
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// Ensure you have a theme. `oneDark` is a good default.
// Adjust import path if your setup differs.
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string; // Optional className for the root div
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => (
  <div className={className}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Code blocks and inline code
        code: ({ node, className: codeClassName, children, ...props }) => {
          const match = /language-(\w+)/.exec(codeClassName || "");
          if ((props as any).inline) {
            // Render inline code (e.g., `variableName`)
            return (
              <code
                className={`bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-sm ${codeClassName || ""}`}
                {...props}
              >
                {children}
              </code>
            );
          }
          // Render code blocks (e.g., ```javascript ... ```)
          return (
            <SyntaxHighlighter
              style={oneDark} // Apply your chosen Prism theme
              language={match ? match[1] : undefined}
              PreTag="div" // Use div for the outer element of the highlighter
              // showLineNumbers // Optional: adds line numbers
              customStyle={{
                borderRadius: "0.375rem", // Equivalent to rounded-md
                fontSize: "0.875em",   // Equivalent to text-sm
                margin: "0.5em 0",     // my-2: Some vertical spacing for blocks
                padding: "0.75em",     // p-3: Padding inside the code block
              }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        },

        // Paragraphs
        p: ({ children, ...props }) => {
          // If a paragraph seems to be just a description following a list item's primary content
          // (often starting with ": "), try to keep it more inline.
          // This is a heuristic and might need adjustment based on AI's output.
          if (typeof children === 'string' && children.trim().startsWith(':')) {
            return <span className="ml-1 text-sm" {...props}>{children}</span>;
          }
          return <p className="my-1.5 text-sm leading-relaxed" {...props}>{children}</p>; // Slightly more space than my-1 for readability
        },

        // Unordered Lists
        ul: ({ children, ...props }) => {
          return <ul className="list-disc space-y-1 pl-5 my-2 text-sm" {...props}>{children}</ul>;
        },

        // Ordered Lists
        ol: ({ children, ...props }) => {
          return <ol className="list-decimal space-y-1 pl-5 my-2 text-sm" {...props}>{children}</ol>;
        },

        // List Items
        li: ({ children, ...props }) => {
          // Using flex to try and keep inline code and subsequent text on the same line.
          // The children might already be wrapped in <p> by ReactMarkdown.
          // The custom 'p' renderer above will try to handle simple descriptions.
          return (
            <li className="mb-0.5 flex items-start text-sm leading-relaxed" {...props}>
              {/*
                The bullet/number is created by `list-disc/decimal pl-5` on ul/ol.
                This div helps group the content of the list item for flex layout.
              */}
              <div className="flex-grow">
                {children}
              </div>
            </li>
          );
        },

        // Blockquotes
        blockquote: ({ children, ...props }) => {
          return (
            <blockquote
              className="border-l-4 border-muted-foreground bg-muted/50 pl-4 pr-2 py-2 my-2 italic text-sm rounded"
              {...props}
            >
              {children}
            </blockquote>
          );
        },

        // Tables
        table: ({ children, ...props }) => {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-border text-sm" {...props}>
                {children}
              </table>
            </div>
          );
        },
        th: ({ children, ...props }) => {
          return (
            <th className="bg-muted font-semibold px-3 py-2 border border-border text-left" {...props}>
              {children}
            </th>
          );
        },
        td: ({ children, ...props }) => {
          return (
            <td className="px-3 py-2 border border-border" {...props}>
              {children}
            </td>
          );
        },

        // Headings (adjust margins and sizes as needed)
        h1: ({ children, ...props }) => {
          return <h1 className="text-xl font-bold mt-4 mb-1.5 text-foreground" {...props}>{children}</h1>;
        },
        h2: ({ children, ...props }) => {
          return <h2 className="text-lg font-semibold mt-3 mb-1 text-foreground" {...props}>{children}</h2>;
        },
        h3: ({ children, ...props }) => {
          return <h3 className="text-base font-semibold mt-2 mb-0.5 text-foreground" {...props}>{children}</h3>;
        },
        // Add h4, h5, h6 if your AI uses them and you want specific styling

        // Horizontal Rule
        hr: ({ ...props }) => {
          return <hr className="my-3 border-border" {...props} />;
        },

        // Links
        a: ({ children, href, ...props }) => {
          return (
            <a
              href={href}
              className="text-primary hover:underline"
              target="_blank" // Open external links in new tab
              rel="noopener noreferrer" // Security for external links
              {...props}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default MarkdownRenderer;