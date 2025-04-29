
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface BlogPreviewProps {
  content: string;
  metadata?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    tags?: string[];
    authors?: string[];
    publishDate?: string;
    featured?: boolean;
  };
}

const BlogPreview = ({ content, metadata }: BlogPreviewProps) => {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        {metadata && (
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Notion Metadata</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metadata.title && (
                  <TableRow>
                    <TableCell className="font-medium">Name (Title)</TableCell>
                    <TableCell>{metadata.title}</TableCell>
                  </TableRow>
                )}
                {metadata.slug && (
                  <TableRow>
                    <TableCell className="font-medium">Slug</TableCell>
                    <TableCell>{metadata.slug}</TableCell>
                  </TableRow>
                )}
                {metadata.excerpt && (
                  <TableRow>
                    <TableCell className="font-medium">Excerpt</TableCell>
                    <TableCell>{metadata.excerpt}</TableCell>
                  </TableRow>
                )}
                {metadata.publishDate && (
                  <TableRow>
                    <TableCell className="font-medium">Publish Date</TableCell>
                    <TableCell>{metadata.publishDate}</TableCell>
                  </TableRow>
                )}
                {metadata.featured !== undefined && (
                  <TableRow>
                    <TableCell className="font-medium">Featured</TableCell>
                    <TableCell>{metadata.featured ? "Yes" : "No"}</TableCell>
                  </TableRow>
                )}
                {metadata.tags && metadata.tags.length > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">Tags</TableCell>
                    <TableCell>{metadata.tags.join(", ")}</TableCell>
                  </TableRow>
                )}
                {metadata.authors && metadata.authors.length > 0 && (
                  <TableRow>
                    <TableCell className="font-medium">Authors</TableCell>
                    <TableCell>{metadata.authors.join(", ")}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-medium">Ready to Publish</TableCell>
                  <TableCell>Yes</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
        
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
