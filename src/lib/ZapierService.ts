export interface ZapierWebhookData {
  title: string;
  content: string;
  notionApiKey?: string;
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
}

export class ZapierService {
  private static triggerWebhook = async (
    webhookUrl: string, 
    data: ZapierWebhookData
  ): Promise<boolean> => {
    try {
      console.log("Triggering Zapier webhook with data:", data);
      
      // Check if the webhook URL is valid
      if (!webhookUrl.startsWith("https://hooks.zapier.com/")) {
        console.error("Invalid Zapier webhook URL format");
        return false;
      }

      // Use no-cors mode to bypass CORS restrictions
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // This prevents CORS errors but means we can't read the response
        body: JSON.stringify(data),
      });
      
      console.log("Zapier webhook request sent");
      
      // Since we're using no-cors mode, we can't actually check the response status
      // We'll assume it worked if no error was thrown
      return true;
      
    } catch (error) {
      console.error("Error triggering Zapier webhook:", error);
      return false;
    }
  };

  static publishViaZapier = async (
    webhookUrl: string,
    data: ZapierWebhookData
  ): Promise<{success: boolean; message: string}> => {
    if (!webhookUrl) {
      return {
        success: false,
        message: "No Zapier webhook URL provided"
      };
    }

    try {
      const success = await this.triggerWebhook(webhookUrl, data);
      
      if (success) {
        return {
          success: true,
          message: "Successfully sent to Zapier for processing! Check your Zapier task history."
        };
      } else {
        return {
          success: false,
          message: "Failed to trigger Zapier webhook. Please check your webhook URL and Zapier settings."
        };
      }
    } catch (error) {
      console.error("Error in publishViaZapier:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  static getStoredWebhookUrl(): string {
    return localStorage.getItem("zapier_webhook_url") || "";
  }

  static setWebhookUrl(url: string): void {
    if (url) {
      localStorage.setItem("zapier_webhook_url", url);
    } else {
      localStorage.removeItem("zapier_webhook_url");
    }
  }
}
