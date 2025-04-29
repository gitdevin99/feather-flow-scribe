
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
import { Loader2 } from "lucide-react";
import { NotionService } from "@/lib/NotionService";
import { toast } from "sonner";

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
        setNotionPageUrl(result.notionPageUrl);
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
