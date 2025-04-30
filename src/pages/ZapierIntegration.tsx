
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ZapierService } from "@/lib/ZapierService";
import { AlertTriangle, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ZapierIntegration = () => {
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    // Load saved webhook URL
    const savedUrl = ZapierService.getStoredWebhookUrl();
    setWebhookUrl(savedUrl);
  }, []);

  const handleSaveWebhook = () => {
    ZapierService.setWebhookUrl(webhookUrl);
    toast.success("Zapier webhook URL saved successfully");
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    try {
      const result = await ZapierService.publishViaZapier(webhookUrl, {
        title: "Test Blog Post",
        content: "This is a test post to verify the Zapier integration is working correctly.",
        metadata: {
          title: "Test Blog Post",
          slug: "test-blog-post",
          excerpt: "Test excerpt"
        }
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to test Zapier webhook");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex items-center mb-6">
          <Button variant="outline" asChild className="mr-4">
            <Link to="/">← Back to Home</Link>
          </Button>
          <h1 className="text-3xl font-bold text-blue-900">Zapier Integration</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configure Zapier Webhook</CardTitle>
              <CardDescription>
                Connect your Zapier account to automate publishing to Notion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="warning" className="bg-amber-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This integration requires a Zapier account with access to the Notion integration.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                <Input 
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleTestWebhook}>
                Test Connection
              </Button>
              <Button onClick={handleSaveWebhook}>Save Webhook URL</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Set Up</CardTitle>
              <CardDescription>
                Follow these steps to create your Zapier integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-3 text-sm">
                <li>
                  <strong>Create a new Zap in Zapier</strong>
                  <p className="text-gray-600">Log in to your Zapier account and click "Create Zap"</p>
                </li>
                <li>
                  <strong>Set up your trigger</strong>
                  <p className="text-gray-600">Choose "Webhooks by Zapier" as your trigger app and select "Catch Hook"</p>
                </li>
                <li>
                  <strong>Copy your webhook URL</strong>
                  <p className="text-gray-600">Zapier will generate a custom webhook URL for your Zap. Copy this URL and paste it into the field on the left.</p>
                </li>
                <li>
                  <strong>Set up Notion action</strong>
                  <p className="text-gray-600">Choose "Notion" as your action app and select "Create Page" as the action.</p>
                </li>
                <li>
                  <strong>Configure Notion connection</strong>
                  <p className="text-gray-600">Connect your Notion account and select the database where you want to publish blog posts.</p>
                </li>
                <li>
                  <strong>Map the data fields</strong>
                  <p className="text-gray-600">Map the incoming data fields to your Notion database properties: title, content, tags, etc.</p>
                </li>
              </ol>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://zapier.com/apps/notion/integrations" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Visit Zapier Notion Integration
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ZapierIntegration;
