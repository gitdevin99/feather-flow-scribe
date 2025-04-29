
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface BlogPreviewProps {
  content: string;
}

const BlogPreview = ({ content }: BlogPreviewProps) => {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="prose prose-blue max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-6 mb-3" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-5 mb-2" {...props} />,
              p: ({ node, ...props }) => <p className="my-4 leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc ml-6 my-4" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal ml-6 my-4" {...props} />,
              li: ({ node, ...props }) => <li className="my-1" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-blue-400 pl-4 italic my-4" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPreview;
