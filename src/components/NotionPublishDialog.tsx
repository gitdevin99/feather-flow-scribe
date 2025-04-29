
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { NotionService } from "@/lib/NotionService";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotionPublishDialogProps {
  content: string;
  metadata?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    tags?: string[];
    authors?: string[];
    publishDate?: string;
    featured?: boolean;
    metaDescription?: string;
    metaTitle?: string;
    relatedPosts?: string[];
  };
  trigger: React.ReactNode;
}

const NotionPublishDialog = ({ content, metadata, trigger }: NotionPublishDialogProps) => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [notionPageUrl, setNotionPageUrl] = useState<string | undefined>(undefined);

  const handlePublish = async () => {
    if (!apiKey) {
      toast.error("Please enter your Notion API key");
      return;
    }

    setIsPublishing(true);
    NotionService.setApiKey(apiKey);

    try {
      const result = await NotionService.publishToNotion({
        title: metadata?.title || "Untitled Blog Post",
        content,
        metadata,
      });

      if (result.success) {
        toast.success(result.message);
        // Format the Notion URL properly with correct page ID
        if (result.notionPageUrl) {
          // Ensure URL has proper format with UUID if needed
          const formattedUrl = result.notionPageUrl.includes('https://') 
            ? result.notionPageUrl
            : `https://www.notion.so/${result.notionPageUrl.replace(/^page_/, '')}`;
            
          setNotionPageUrl(formattedUrl);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error publishing to Notion:", error);
      toast.error("Failed to publish to Notion. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish to Notion</DialogTitle>
          <DialogDescription>
            Publish your converted content directly to Notion using the Feather blog template.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="warning" className="mt-2 bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Browser security (CORS) prevents direct API calls to Notion. In a production application, this would require a backend proxy or server function.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notion-api-key" className="col-span-4">
              Notion API Key
            </Label>
            <Input
              id="notion-api-key"
              type="password"
              placeholder="Enter your Notion integration token"
              className="col-span-4"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2 mb-2">
            <p className="text-xs text-gray-500">
              Make sure you've shared your Notion Content database with your integration.
              The app will automatically search for a database named "Content".
            </p>
          </div>
          
          {notionPageUrl && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notion-page-url" className="col-span-4">
                Published Page URL:
              </Label>
              <Input
                id="notion-page-url"
                type="text"
                readOnly
                value={notionPageUrl}
                className="col-span-3"
              />
              <Button
                variant="outline"
                className="col-span-1"
                onClick={() => {
                  window.open(notionPageUrl, "_blank");
                }}
              >
                Open
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="default"
            onClick={handlePublish}
            disabled={isPublishing || !apiKey}
            className="w-full"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish to Notion"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionPublishDialog;
