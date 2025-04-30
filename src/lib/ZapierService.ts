
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
      
      // Use standard fetch with proper CORS handling
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      console.log("Zapier webhook response:", response);
      
      // Check if the response is ok (status code 200-299)
      if (response.ok) {
        console.log("Zapier webhook triggered successfully");
        return true;
      } else {
        console.error("Zapier webhook error response:", response.status, response.statusText);
        return false;
      }
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
