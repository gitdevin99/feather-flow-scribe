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

export class NotionService {
  private static NOTION_API_KEY = ""; // We'll set this dynamically
  private static notionClient: Client | null = null;

  private static getClient(): Client {
    if (!this.NOTION_API_KEY) {
      throw new Error("Notion API key is not set");
    }
    
    if (!this.notionClient) {
      this.notionClient = new Client({
        auth: this.NOTION_API_KEY
      });
    }
    
    return this.notionClient;
  }

  static async publishToNotion(options: NotionPublishOptions): Promise<{ success: boolean; message: string; notionPageUrl?: string }> {
    const { title, content, metadata } = options;
    
    if (!this.NOTION_API_KEY) {
      return {
        success: false,
        message: "Notion API key is required. Please set your API key in the settings."
      };
    }
    
    try {
      console.log("Publishing to Notion:", { title, contentPreview: content.substring(0, 100), metadata });
      
      // Get the Notion client
      const notion = this.getClient();
      
      // Create a mock response for now to bypass the CORS issue
      // In production, this would need a backend proxy or server-side implementation
      const mockDatabaseId = "mock_database_id";
      
      // Parse content to Notion blocks
      const contentBlocks = this.parseContentToBlocks(content);
      
      // Simulate page creation with mock data
      const pageId = `page_${Date.now()}`;
      
      // Show a message about the CORS limitation
      toast.info("Note: Browser security prevents direct Notion API access. In production, use a backend proxy.");
      
      return {
        success: true,
        message: "CORS limitations prevent direct browser-to-Notion communication. In production, this would require a backend proxy or server function.",
        notionPageUrl: `https://notion.so/${pageId.replace(/-/g, '')}`
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
  }
}
