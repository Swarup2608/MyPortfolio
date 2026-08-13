import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Content is authored by the single trusted admin account, but we still
// sanitize on render as defense in depth against stored XSS.
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight prose-a:text-accent prose-strong:text-foreground prose-blockquote:border-accent">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
