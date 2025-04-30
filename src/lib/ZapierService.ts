
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
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Handle CORS issues
        body: JSON.stringify(data),
      });
      
      // Since we're using no-cors, we won't get a proper response status
      // We'll assume it worked if no error was thrown
      console.log("Zapier webhook triggered");
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
          message: "Successfully sent to Zapier for processing!"
        };
      } else {
        return {
          success: false,
          message: "Failed to trigger Zapier webhook"
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
