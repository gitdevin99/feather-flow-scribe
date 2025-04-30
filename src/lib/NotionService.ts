
import { Client } from "@notionhq/client";
import { toast } from "sonner";

interface NotionPublishOptions {
  title: string;
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
}

interface NotionOAuthConfig {
  clientId: string;
  redirectUri: string;
  authorizationEndpoint: string;
}

export class NotionService {
  private static NOTION_API_KEY = ""; // We'll set this dynamically
  private static notionClient: Client | null = null;
  private static accessToken: string | null = null;
  private static notionUserId: string | null = null;
  
  // Default database ID for Notion
  private static databaseId: string | null = null;

  // OAuth configuration
  private static oauthConfig: NotionOAuthConfig = {
    clientId: "27386952-527b-4d14-a9c1-3f0945c19484", // Replace with your actual client ID
    redirectUri: window.location.origin + "/notion-callback",
    authorizationEndpoint: "https://api.notion.com/v1/oauth/authorize"
  };

  static getOAuthURL(): string {
    const params = new URLSearchParams({
      client_id: this.oauthConfig.clientId,
      redirect_uri: this.oauthConfig.redirectUri,
      response_type: 'code',
      owner: 'user'
    });
    
    return `${this.oauthConfig.authorizationEndpoint}?${params.toString()}`;
  }

  static handleOAuthCallback(code: string): Promise<boolean> {
    console.log("OAuth code received:", code);
    
    // In a production environment, you would have a backend endpoint to handle the OAuth token exchange
    // For example POST to your-backend.com/api/notion/oauth with the code
    // The backend would then exchange the code for an access token using Notion's token endpoint
    
    // For the purposes of this demo, we'll simulate a successful OAuth flow
    this.accessToken = `mock_access_token_${Date.now()}`;
    this.notionUserId = `mock_user_${Date.now()}`;
    localStorage.setItem("notion_access_token", this.accessToken);
    localStorage.setItem("notion_user_id", this.notionUserId);
    
    // In a real implementation, we would also store the workspace ID and find available databases
    // For the demo, we'll use a mock database ID
    this.databaseId = "mock_database_id_" + Date.now().toString().substring(8);
    localStorage.setItem("notion_database_id", this.databaseId);
    
    return Promise.resolve(true);
  }
  
  static checkSavedAuth(): boolean {
    const savedToken = localStorage.getItem("notion_access_token");
    const savedUserId = localStorage.getItem("notion_user_id");
    
    if (savedToken && savedUserId) {
      this.accessToken = savedToken;
      this.notionUserId = savedUserId;
      this.databaseId = localStorage.getItem("notion_database_id");
      return true;
    }
    
    return false;
  }

  private static getClient(): Client {
    if (this.accessToken) {
      // Use OAuth token if available
      this.notionClient = new Client({
        auth: this.accessToken
      });
    } else if (this.NOTION_API_KEY) {
      // Fall back to API key
      this.notionClient = new Client({
        auth: this.NOTION_API_KEY
      });
    } else {
      throw new Error("No authentication credentials available. Please authorize with Notion.");
    }
    
    return this.notionClient;
  }

  static async publishToNotion(options: NotionPublishOptions): Promise<{ success: boolean; message: string; notionPageUrl?: string }> {
    const { title, content, metadata } = options;
    
    try {
      console.log("Publishing to Notion:", { title, contentPreview: content.substring(0, 100), metadata });
      
      // Check for saved auth first
      if (!this.isAuthenticated()) {
        this.checkSavedAuth();
      }
      
      // Get the Notion client
      const notion = this.getClient();
      
      // In a production environment, we would:
      // 1. Make an API call to our backend to handle the Notion API request
      // 2. The backend would use the access token to create a page in the database
      
      // Parse content to Notion blocks
      const contentBlocks = this.parseContentToBlocks(content);
      
      // Generate a realistic page ID that looks like a Notion UUID
      const generateNotionLikeId = () => {
        return Array.from({ length: 4 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('') + '-' + 
        Array.from({ length: 12 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
      };
      
      const pageId = generateNotionLikeId();
      
      // Show information about the CORS limitation
      toast.info("Note: Browser security prevents direct Notion API access. In production, this would use a backend proxy.");
      
      return {
        success: true,
        message: "Post has been published to Notion (mock). In production, this would create a real Notion page.",
        notionPageUrl: `https://www.notion.so/${pageId}`
      };
    } catch (error) {
      console.error("Error publishing to Notion:", error);
      return {
        success: false,
        message: error instanceof Error ? `Error: ${error.message}` : "Unknown error occurred while publishing to Notion"
      };
    }
  }
  
  private static parseContentToBlocks(content: string): any[] {
    // Simple parser to convert markdown content to Notion blocks
    const blocks: any[] = [];
    const lines = content.split('\n');
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        i++;
        continue;
      }
      
      // Parse headings
      if (line.startsWith('# ')) {
        blocks.push({
          object: "block",
          heading_1: {
            rich_text: [{ text: { content: line.substring(2) } }]
          }
        });
      } else if (line.startsWith('## ')) {
        blocks.push({
          object: "block",
          heading_2: {
            rich_text: [{ text: { content: line.substring(3) } }]
          }
        });
      } else if (line.startsWith('### ')) {
        blocks.push({
          object: "block",
          heading_3: {
            rich_text: [{ text: { content: line.substring(4) } }]
          }
        });
      }
      // Parse bullet lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletItems = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          bulletItems.push(lines[i].trim().substring(2));
          i++;
        }
        
        blocks.push({
          object: "block",
          bulleted_list_item: {
            rich_text: bulletItems.map(item => ({ text: { content: item } }))
          }
        });
        
        continue; // Skip the increment at the end since we already advanced
      }
      // Parse numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const numberItems = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          numberItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
          i++;
        }
        
        blocks.push({
          object: "block",
          numbered_list_item: {
            rich_text: numberItems.map(item => ({ text: { content: item } }))
          }
        });
        
        continue; // Skip the increment at the end
      }
      // Default to paragraph
      else {
        blocks.push({
          object: "block",
          paragraph: {
            rich_text: [{ text: { content: line } }]
          }
        });
      }
      
      i++;
    }
    
    return blocks;
  }
  
  static setApiKey(apiKey: string): void {
    this.NOTION_API_KEY = apiKey;
    // Reset the client so it will be recreated with the new API key
    this.notionClient = null;
    this.accessToken = null;
    
    // Store the API key in localStorage
    if (apiKey) {
      localStorage.setItem("notion_api_key", apiKey);
    } else {
      localStorage.removeItem("notion_api_key");
    }
  }

  static isAuthenticated(): boolean {
    return !!(this.NOTION_API_KEY || this.accessToken);
  }

  static logout(): void {
    this.NOTION_API_KEY = "";
    this.accessToken = null;
    this.notionClient = null;
    this.notionUserId = null;
    this.databaseId = null;
    
    // Clear localStorage
    localStorage.removeItem("notion_access_token");
    localStorage.removeItem("notion_user_id");
    localStorage.removeItem("notion_api_key");
    localStorage.removeItem("notion_database_id");
  }
  
  static getDatabaseId(): string | null {
    return this.databaseId;
  }
  
  static getUserId(): string | null {
    return this.notionUserId;
  }
}
