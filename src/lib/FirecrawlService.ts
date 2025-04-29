
import { toast } from "sonner";

interface CrawlStatusResponse {
  success: boolean;
  status: string;
  completed?: number;
  total?: number;
  creditsUsed?: number;
  expiresAt?: string;
  data?: any[];
  error?: string;
}

export class FirecrawlService {
  private static API_KEY = "fc-3bcb6a99768c41248598a69ff4ed039b";
  private static BASE_URL = "https://api.firecrawl.dev";

  static async crawlWebsite(url: string): Promise<{ 
    success: boolean; 
    content?: string; 
    error?: string 
  }> {
    try {
      console.log('Making crawl request to Firecrawl API for URL:', url);
      
      // First, initiate a crawl
      const crawlResponse = await fetch(`${this.BASE_URL}/api/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          url: url,
          limit: 1, // We only need the main article page
          scrapeOptions: {
            formats: ['markdown'],
          }
        })
      });
      
      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        console.error('Crawl API error:', errorData);
        return { 
          success: false, 
          error: errorData.error || 'Failed to crawl website' 
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
      
      // Extract the article content from response
      if (crawlData.pages && crawlData.pages.length > 0) {
        const mainPage = crawlData.pages[0];
        if (mainPage.content && mainPage.content.markdown) {
          return {
            success: true,
            content: mainPage.content.markdown
          };
        }
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
