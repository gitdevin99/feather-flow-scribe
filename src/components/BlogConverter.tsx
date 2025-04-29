import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Download, Loader2, Send } from "lucide-react";
import BlogPreview from "./BlogPreview";
import NotionPublishDialog from "./NotionPublishDialog";
import { detectStructure, convertToNotionFormat, generateFeatherNotionJSON } from "@/lib/blogParser";
import { FirecrawlService, BlogMetadata } from "@/lib/FirecrawlService";

const BlogConverter = () => {
  const [blogUrl, setBlogUrl] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [convertedContent, setConvertedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("url");
  const [metadata, setMetadata] = useState<BlogMetadata | undefined>(undefined);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the blog content using FirecrawlService
      const response = await FirecrawlService.crawlWebsite(blogUrl);
      
      if (!response.success) {
        toast.error(response.error || "Failed to fetch blog content");
        return;
      }
      
      const content = response.content || "";
      
      // Process the extracted content with metadata
      const structure = detectStructure(content, response.metadata);
      const formatted = convertToNotionFormat(structure);
      
      setConvertedContent(formatted);
      setMetadata(response.metadata);
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
      setMetadata(undefined); // Reset metadata since we don't have any for pasted content
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

  const downloadAsJSON = () => {
    if (!convertedContent) return;
    
    // Create structure to generate JSON
    const structure = detectStructure(convertedContent, metadata);
    const jsonData = generateFeatherNotionJSON(structure);
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notion-feather-blog.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded as JSON!");
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
                    placeholder="Enter blog URL (e.g., https://blog.example.com/post)"
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
                      Fetching and Converting...
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
                Download MD
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadAsJSON}
                className="flex items-center"
              >
                <Download className="mr-1 h-4 w-4" />
                Download JSON
              </Button>
              <NotionPublishDialog
                content={convertedContent}
                metadata={metadata}
                trigger={
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                  >
                    <Send className="mr-1 h-4 w-4" />
                    Publish to Notion
                  </Button>
                }
              />
            </div>
          </div>
          
          <BlogPreview content={convertedContent} metadata={metadata} />
        </div>
      )}
    </div>
  );
};

export default BlogConverter;
