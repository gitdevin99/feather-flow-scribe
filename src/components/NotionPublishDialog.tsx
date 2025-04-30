
import React, { useState, useEffect } from "react";
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
import { Loader2, AlertTriangle, LogIn, Database, User } from "lucide-react";
import { NotionService } from "@/lib/NotionService";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "react-router-dom";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notionUserId, setNotionUserId] = useState<string | null>(null);
  const [databaseId, setDatabaseId] = useState<string | null>(null);
  const location = useLocation();

  // Check authentication status when dialog opens
  useEffect(() => {
    if (open) {
      // Load API key from localStorage if available
      const savedApiKey = localStorage.getItem("notion_api_key");
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      
      // Check if we have a saved auth session
      const hasSavedAuth = NotionService.checkSavedAuth();
      
      setIsAuthenticated(NotionService.isAuthenticated());
      setNotionUserId(NotionService.getUserId());
      setDatabaseId(NotionService.getDatabaseId());
    }
  }, [open]);

  const handleStartOAuth = () => {
    // Redirect to Notion OAuth authorization endpoint
    window.location.href = NotionService.getOAuthURL();
  };

  const handleLogout = () => {
    NotionService.logout();
    setIsAuthenticated(false);
    setNotionUserId(null);
    setDatabaseId(null);
    setNotionPageUrl(undefined);
    toast.info("Logged out from Notion");
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      NotionService.setApiKey(apiKey.trim());
      setIsAuthenticated(true);
      toast.success("API key saved");
    }
  };

  const handlePublish = async () => {
    if (!isAuthenticated && !apiKey) {
      toast.error("Please authenticate with Notion or enter your API key");
      return;
    }

    if (apiKey && !NotionService.isAuthenticated()) {
      NotionService.setApiKey(apiKey);
    }

    setIsPublishing(true);

    try {
      const result = await NotionService.publishToNotion({
        title: metadata?.title || "Untitled Blog Post",
        content,
        metadata,
      });

      if (result.success) {
        toast.success("Successfully published to Notion!");
        if (result.notionPageUrl) {
          setNotionPageUrl(result.notionPageUrl);
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
            This is a demo implementation. In a production environment, a backend service would handle the authentication and API calls to Notion.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-4 py-4">
          {isAuthenticated ? (
            <div className="bg-green-50 p-3 rounded-md border border-green-200 space-y-2">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <span className="bg-green-100 p-1 rounded-full">✓</span>
                Authorized with Notion
              </p>
              
              {notionUserId && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-1.5 rounded border border-gray-100">
                  <User className="h-3.5 w-3.5" />
                  <span>User ID: {notionUserId}</span>
                </div>
              )}
              
              {databaseId && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-1.5 rounded border border-gray-100">
                  <Database className="h-3.5 w-3.5" />
                  <span>Database ID: {databaseId}</span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={handleLogout}
              >
                Logout from Notion
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
                onClick={handleStartOAuth}
              >
                <LogIn className="h-4 w-4" />
                Authorize with Notion
              </Button>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or use API Key</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notion-api-key">
                  Notion API Key (Integration Token)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="notion-api-key"
                    type="password"
                    placeholder="Enter your Notion integration token"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    onClick={handleApiKeySubmit}
                    disabled={!apiKey.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </>
          )}
          
          <div className="grid grid-cols-1 gap-2 mb-2">
            <p className="text-xs text-gray-500">
              In a production environment, you would need to share your Notion database with your integration.
            </p>
          </div>
          
          {notionPageUrl && (
            <div className="grid gap-2">
              <Label htmlFor="notion-page-url">
                Published Page URL:
              </Label>
              <div className="flex gap-2">
                <Input
                  id="notion-page-url"
                  type="text"
                  readOnly
                  value={notionPageUrl}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => window.open(notionPageUrl, "_blank")}
                >
                  Open
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="default"
            onClick={handlePublish}
            disabled={isPublishing || (!isAuthenticated && !apiKey)}
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
