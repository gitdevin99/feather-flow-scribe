
import { toast } from "sonner";

interface CrawlStatusResponse {
  success: boolean;
  status: string;
  completed?: number;
  total?: number;
  creditsUsed?: number;
  expiresAt?: string;
  pages?: any[];
  error?: string;
}

export interface BlogMetadata {
  title?: string;
  slug?: string;
  excerpt?: string;
  tags?: string[];
  authors?: string[];
  publishDate?: string;
  featured?: boolean;
  metaDescription?: string;
  metaTitle?: string;
}

export class FirecrawlService {
  private static API_KEY = "fc-3bcb6a99768c41248598a69ff4ed039b";
  private static BASE_URL = "https://api.firecrawl.dev/v1";

  static async crawlWebsite(url: string): Promise<{ 
    success: boolean; 
    content?: string; 
    metadata?: BlogMetadata;
    error?: string 
  }> {
    try {
      console.log('Making crawl request to Firecrawl API for URL:', url);
      
      // First, initiate a crawl
      const crawlResponse = await fetch(`${this.BASE_URL}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          url: url,
          limit: 1, // We only need the main article page
          scrapeOptions: {
            formats: ['markdown', 'metadata'],
          }
        })
      });
      
      if (!crawlResponse.ok) {
        const errorText = await crawlResponse.text();
        console.error('Crawl API error:', errorText);
        return { 
          success: false, 
          error: `API Error (${crawlResponse.status}): ${errorText.substring(0, 100)}...` 
        };
      }
      
      const crawlData = await crawlResponse.json();
      console.log('Crawl initiated:', crawlData);
      
      if (!crawlData.success) {
        return {
          success: false,
          error: crawlData.error || 'Failed to initiate crawl'
        };
      }
      
      // Extract the article content and metadata from response
      if (crawlData.pages && crawlData.pages.length > 0) {
        const mainPage = crawlData.pages[0];
        let content = '';
        let metadata: BlogMetadata = {};
        
        // Extract content
        if (mainPage.content && mainPage.content.markdown) {
          content = mainPage.content.markdown;
        }
        
        // Extract metadata
        if (mainPage.metadata) {
          // Try to extract title
          if (mainPage.metadata.title) {
            metadata.title = mainPage.metadata.title;
          } else if (mainPage.metadata.ogTitle) {
            metadata.title = mainPage.metadata.ogTitle;
          }
          
          // Try to extract description/excerpt
          if (mainPage.metadata.description) {
            metadata.excerpt = mainPage.metadata.description;
            metadata.metaDescription = mainPage.metadata.description;
          } else if (mainPage.metadata.ogDescription) {
            metadata.excerpt = mainPage.metadata.ogDescription;
            metadata.metaDescription = mainPage.metadata.ogDescription;
          }

          // Generate a slug from the title or URL
          if (metadata.title) {
            metadata.slug = metadata.title
              .toLowerCase()
              .replace(/[^\w\s]/gi, '')
              .replace(/\s+/g, '-');
          } else {
            // Extract the last part of the URL path as the slug
            const urlPath = new URL(url).pathname;
            const pathSegments = urlPath.split('/').filter(Boolean);
            if (pathSegments.length > 0) {
              metadata.slug = pathSegments[pathSegments.length - 1];
            }
          }
          
          // Try to extract publish date
          if (mainPage.metadata.published_time) {
            metadata.publishDate = new Date(mainPage.metadata.published_time).toISOString().split('T')[0];
          } else if (mainPage.metadata.article && mainPage.metadata.article.published_time) {
            metadata.publishDate = new Date(mainPage.metadata.article.published_time).toISOString().split('T')[0];
          } else {
            // Default to current date
            metadata.publishDate = new Date().toISOString().split('T')[0];
          }
          
          // Extract authors if available
          if (mainPage.metadata.author) {
            if (typeof mainPage.metadata.author === 'string') {
              metadata.authors = [mainPage.metadata.author];
            } else if (Array.isArray(mainPage.metadata.author)) {
              metadata.authors = mainPage.metadata.author;
            }
          }
          
          // Extract tags/keywords if available
          if (mainPage.metadata.keywords) {
            if (typeof mainPage.metadata.keywords === 'string') {
              metadata.tags = mainPage.metadata.keywords.split(',').map(tag => tag.trim());
            } else if (Array.isArray(mainPage.metadata.keywords)) {
              metadata.tags = mainPage.metadata.keywords;
            }
          }
          
          // Default values
          metadata.featured = false;
        }
        
        return {
          success: true,
          content,
          metadata
        };
      }
      
      return {
        success: false,
        error: 'No content found in the crawled page'
      };
      
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}
