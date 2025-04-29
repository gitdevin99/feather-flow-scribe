
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
  private static NOTION_API_KEY = ""; // This should be provided by the user
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
      
      // First, we need to find the database to add the page to
      // In a real-world scenario, you would store this database ID
      // For now, we'll list databases and try to find one that looks like a blog
      const response = await notion.search({
        filter: {
          value: "database",
          property: "object"
        },
        page_size: 10
      });
      
      if (response.results.length === 0) {
        return {
          success: false,
          message: "No databases found. Make sure your integration has access to the Feather blog database."
        };
      }
      
      // For demo purposes, we'll use the first database found
      // In a production app, you would want to let users select the database or save it in settings
      const databaseId = response.results[0].id;
      
      console.log(`Found database: ${databaseId}`);
      
      // Create a new page in the database
      const newPage = await notion.pages.create({
        parent: {
          database_id: databaseId,
        },
        properties: {
          // Map to common properties found in blog databases
          // The actual property names might vary based on the Feather template
          "Name": {
            title: [
              {
                text: {
                  content: metadata?.title || title
                }
              }
            ]
          },
          ...(metadata?.slug && {
            "Slug": {
              rich_text: [
                {
                  text: {
                    content: metadata.slug
                  }
                }
              ]
            }
          }),
          ...(metadata?.publishDate && {
            "Publish Date": {
              date: {
                start: metadata.publishDate
              }
            }
          }),
          ...(metadata?.featured !== undefined && {
            "Featured": {
              checkbox: metadata.featured
            }
          }),
          // Add more mappings based on the Feather template structure
        },
        // Add the content as blocks
        children: [
          {
            object: "block",
            paragraph: {
              rich_text: [
                {
                  text: {
                    content: content.substring(0, 2000) // Truncating for demo purposes
                  }
                }
              ]
            }
          }
          // In a production app, you would properly parse the markdown into Notion blocks
        ]
      });
      
      console.log("Created new Notion page:", newPage.id);
      
      // Construct the URL to the new page
      const notionPageUrl = `https://notion.so/${newPage.id.replace(/-/g, '')}`;
      
      return {
        success: true,
        message: "Successfully published to Notion!",
        notionPageUrl
      };
    } catch (error) {
      console.error("Error publishing to Notion:", error);
      return {
        success: false,
        message: error instanceof Error ? `Error: ${error.message}` : "Unknown error occurred while publishing to Notion"
      };
    }
  }
  
  static setApiKey(apiKey: string): void {
    this.NOTION_API_KEY = apiKey;
    // Reset the client so it will be recreated with the new API key
    this.notionClient = null;
  }
}
