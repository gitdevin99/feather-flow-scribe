
import { toast } from "sonner";

interface ScrapeResponse {
  success: boolean;
  url: string;
  markdown?: string;
  html?: string;
  metadata?: any;
  error?: string;
  data?: {
    markdown?: string;
    html?: string;
    title?: string;
    metaDescription?: string;
  };
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
  relatedPosts?: string[];
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
      
      // Use the scrape endpoint
      const response = await fetch(`${this.BASE_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown', 'html']
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
      const content = (data.data?.markdown || data.markdown || '');
      
      // Create metadata object from page title and other info
      const metadata: BlogMetadata = {};
      
      // Try to extract a title from the content first
      let titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        metadata.title = titleMatch[1].trim();
      } else if (data.data?.title) {
        // Use the title from the data object if available
        metadata.title = data.data.title;
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
      
      // Set meta description from the data if available
      if (data.data?.metaDescription) {
        metadata.metaDescription = data.data.metaDescription;
      }
      
      // Default values
      metadata.publishDate = new Date().toISOString().split('T')[0];
      metadata.featured = false;
      
      // Extract related posts from content
      const relatedPostsSection = content.match(/## Related Reading\n\n([\s\S]*?)(?=\n\n##|$)/);
      if (relatedPostsSection && relatedPostsSection[1]) {
        // Extract links from related posts section
        const relatedPostLinks = relatedPostsSection[1].match(/\[([^\]]+)\]\(([^)]+)\)/g);
        if (relatedPostLinks) {
          metadata.relatedPosts = relatedPostLinks.map(link => {
            const titleMatch = link.match(/\[([^\]]+)\]/);
            return titleMatch ? titleMatch[1] : link;
          });
        }
      }
      
      // Attempt to extract potential tags from content
      const potentialTags = new Set<string>();
      
      // Look for an explicit Tags or Categories section
      const tagsSection = content.match(/(?:Tags|Categories):\s*([\s\S]*?)(?=\n\n|$)/);
      if (tagsSection && tagsSection[1]) {
        const tagsList = tagsSection[1].split(',').map(tag => tag.trim());
        tagsList.forEach(tag => {
          if (tag) potentialTags.add(tag);
        });
      }
      
      // Check for keywords in the content if we don't have tags yet
      if (potentialTags.size === 0) {
        const keywords = ['email', 'design', 'responsive', 'marketing', 'template', 'html', 'css', 
                          'mobile', 'analytics', 'automation', 'newsletter', 'campaign'];
        
        keywords.forEach(keyword => {
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            potentialTags.add(keyword);
          }
        });
      }
      
      if (potentialTags.size > 0) {
        metadata.tags = Array.from(potentialTags).slice(0, 5); // Limit to 5 tags
      }
      
      // Extract author information
      const authorMatch = content.match(/(?:Author|By):\s*([^\n]+)/i);
      if (authorMatch && authorMatch[1]) {
        metadata.authors = [authorMatch[1].trim()];
      } else {
        // Default author
        metadata.authors = ['Content Team'];
      }
      
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
