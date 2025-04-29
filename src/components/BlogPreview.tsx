
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
        <div className="prose prose-blue max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPreview;
