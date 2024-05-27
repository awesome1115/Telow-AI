import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { anOldHope } from 'react-syntax-highlighter/dist/esm/styles/hljs';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'github-markdown-css';
import './Markdown.scss';

interface CodeBlockProps {
  node: unknown;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const components: any = {
  code({ node, inline, className, children, ...props }: CodeBlockProps) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={anOldHope}
        language={match[1]}
        PreTag="div"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

interface MarkdownRendererProps {
  markdownText: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdownText,
}) => {
  return (
    <div
      className="markdown-body"
      style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}
    >
      <ReactMarkdown components={components}>{markdownText}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
