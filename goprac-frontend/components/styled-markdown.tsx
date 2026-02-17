import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function StyledMarkdown({ children }: { children: string }) {
  return (
    <div className="prose max-w-none text-sm break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold mt-8 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-md font-bold mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-sm leading-relaxed mb-4" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="
          pl-6 
          list-disc
          space-y-1
        "
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-0" {...props} /> /* no extra left margin on li */
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
