
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Download, Loader2 } from "lucide-react";
import BlogPreview from "./BlogPreview";
import { detectStructure, convertToNotionFormat } from "@/lib/blogParser";

const BlogConverter = () => {
  const [blogUrl, setBlogUrl] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [convertedContent, setConvertedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("url");

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would fetch the content from the URL
      // Here we're simulating that with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This is a simulated blog fetch - in real implementation, you'd fetch the content
      const sampleBlogContent = `# How to Use Feather with Notion\n\nFeather.so is a powerful tool that integrates with Notion. Here's how to use it effectively.\n\n## Getting Started\n\nFirst, you'll need to set up your Notion account and connect it to Feather.\n\n### Prerequisites\n* A Notion account\n* A Feather.so subscription\n\n## Key Features\n\n1. Simple integration\n2. Powerful formatting\n3. Export options`;
      
      const structure = detectStructure(sampleBlogContent);
      const formatted = convertToNotionFormat(structure);
      
      setConvertedContent(formatted);
      toast.success("Blog successfully converted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to convert blog. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogContent) {
      toast.error("Please paste some blog content");
      return;
    }

    setIsLoading(true);
    try {
      // Process the directly pasted content
      const structure = detectStructure(blogContent);
      const formatted = convertToNotionFormat(structure);
      
      setConvertedContent(formatted);
      toast.success("Blog successfully converted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to convert blog. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(convertedContent);
    toast.success("Copied to clipboard!");
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([convertedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notion-blog.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded as Markdown!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="url">Import from URL</TabsTrigger>
          <TabsTrigger value="paste">Paste Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter blog URL"
                    value={blogUrl}
                    onChange={(e) => setBlogUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Convert to Notion Format"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paste">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleContentSubmit} className="space-y-4">
                <Textarea
                  placeholder="Paste blog content here..."
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Convert to Notion Format"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {convertedContent && (
        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Preview</h2>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                className="flex items-center"
              >
                <Copy className="mr-1 h-4 w-4" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadAsMarkdown}
                className="flex items-center"
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          <BlogPreview content={convertedContent} />
        </div>
      )}
    </div>
  );
};

export default BlogConverter;
