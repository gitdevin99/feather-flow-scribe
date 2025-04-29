
import { toast } from "sonner";

interface ScrapeResponse {
  success: boolean;
  url: string;
  markdown?: string;
  html?: string;
  metadata?: any;
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
      console.log('Making scrape request to Firecrawl API for URL:', url);
      
      // Use the scrape endpoint instead of crawl
      const response = await fetch(`${this.BASE_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown']
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Firecrawl API error:', errorText);
        return { 
          success: false, 
          error: `API Error (${response.status}): ${errorText.substring(0, 100)}...` 
        };
      }
      
      const data = await response.json() as ScrapeResponse;
      console.log('Scrape response:', data);
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to scrape website'
        };
      }
      
      // Extract content from the response
      const content = data.markdown || '';
      
      // Create metadata object from page title and other info
      const metadata: BlogMetadata = {};
      
      // Try to extract a title from the content
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        metadata.title = titleMatch[1].trim();
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
      
      // Extract potential excerpt from first paragraph
      const paragraphs = content.split('\n\n');
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim();
        if (paragraph && !paragraph.startsWith('#') && !paragraph.startsWith('!')) {
          metadata.excerpt = paragraph.length > 160 ? paragraph.substring(0, 157) + '...' : paragraph;
          metadata.metaDescription = metadata.excerpt;
          break;
        }
      }
      
      // Default values
      metadata.publishDate = new Date().toISOString().split('T')[0];
      metadata.featured = false;
      
      // Attempt to extract potential tags from content
      const potentialTags = new Set<string>();
      const keywords = ['email', 'design', 'responsive', 'marketing', 'template', 'html', 'css', 'mobile'];
      
      // Check for keywords in the content
      keywords.forEach(keyword => {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          potentialTags.add(keyword);
        }
      });
      
      if (potentialTags.size > 0) {
        metadata.tags = Array.from(potentialTags).slice(0, 5); // Limit to 5 tags
      }
      
      // Add a default author
      metadata.authors = ['Content Team'];
      
      return {
        success: true,
        content,
        metadata
      };
      
    } catch (error) {
      console.error('Error during scrape:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }
}
