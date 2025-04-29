
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
  private static NOTION_API_KEY = "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"; // Using the provided API key
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
      // Based on the image, we're looking for the "Content" database in the Feather Blog Template
      const response = await notion.search({
        query: "Content", // Looking for the "Content" section from the template
        filter: {
          value: "database",
          property: "object"
        },
        page_size: 10
      });
      
      if (response.results.length === 0) {
        // If "Content" search fails, try a general database search
        const fallbackResponse = await notion.search({
          filter: {
            value: "database",
            property: "object"
          },
          page_size: 10
        });
        
        if (fallbackResponse.results.length === 0) {
          return {
            success: false,
            message: "No databases found. Make sure you've shared your Feather Blog Template database with the integration."
          };
        }
        
        // Use the first database found as a fallback
        const databaseId = fallbackResponse.results[0].id;
        console.log(`No Content database found. Using first database: ${databaseId}`);
        
        const newPage = await this.createPageInDatabase(notion, databaseId, title, content, metadata);
        return {
          success: true,
          message: "Successfully published to Notion!",
          notionPageUrl: `https://notion.so/${newPage.id.replace(/-/g, '')}`
        };
      }
      
      // Find the Content database from the results
      const contentDatabase = response.results.find(result => 
        result.object === 'database' && 
        'title' in result && 
        result.title.some(text => 
          text.plain_text.toLowerCase().includes('content')
        )
      );
      
      if (!contentDatabase) {
        // If we couldn't find a database with "Content" in its title
        const databaseId = response.results[0].id;
        console.log(`Content database not found. Using: ${databaseId}`);
        
        const newPage = await this.createPageInDatabase(notion, databaseId, title, content, metadata);
        return {
          success: true,
          message: "Successfully published to Notion!",
          notionPageUrl: `https://notion.so/${newPage.id.replace(/-/g, '')}`
        };
      }
      
      // Use the found Content database
      const databaseId = contentDatabase.id;
      console.log(`Found Content database: ${databaseId}`);
      
      const newPage = await this.createPageInDatabase(notion, databaseId, title, content, metadata);
      
      return {
        success: true,
        message: "Successfully published to Notion Feather Blog Template!",
        notionPageUrl: `https://notion.so/${newPage.id.replace(/-/g, '')}`
      };
    } catch (error) {
      console.error("Error publishing to Notion:", error);
      return {
        success: false,
        message: error instanceof Error ? `Error: ${error.message}` : "Unknown error occurred while publishing to Notion"
      };
    }
  }
  
  private static async createPageInDatabase(
    notion: Client, 
    databaseId: string, 
    title: string, 
    content: string, 
    metadata?: NotionPublishOptions['metadata']
  ) {
    // Map content to Notion blocks
    const contentBlocks = this.parseContentToBlocks(content);
    
    // Create a new page in the database with properties matching the Feather template
    return await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        // Based on the Feather Blog Template structure seen in the image
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
        "Ready to Publish": {
          checkbox: true
        },
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
        ...(metadata?.excerpt && {
          "Excerpt": {
            rich_text: [
              {
                text: {
                  content: metadata.excerpt.substring(0, 2000)
                }
              }
            ]
          }
        }),
        ...(metadata?.metaDescription && {
          "Meta Description": {
            rich_text: [
              {
                text: {
                  content: metadata.metaDescription.substring(0, 2000)
                }
              }
            ]
          }
        }),
        ...(metadata?.metaTitle && {
          "Meta Title": {
            rich_text: [
              {
                text: {
                  content: metadata.metaTitle.substring(0, 2000)
                }
              }
            ]
          }
        }),
        // Default values for other fields observed in the template
        "Hide Cover": {
          checkbox: false
        },
        "Hide in Main Feed": {
          checkbox: false
        },
        "Do not index": {
          checkbox: false
        },
        "Hide CTA": {
          checkbox: false
        }
      },
      // Add the content as blocks
      children: contentBlocks
    });
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
