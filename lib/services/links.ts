import { ApiResponse } from '../types';

export type LinkStats = {
  clicks: number;
  uniqueClicks: number;
  referrers: { [key: string]: number };
  countries: { [key: string]: number };
  devices: { [key: string]: number };
  browsers: { [key: string]: number };
};

export type ShortenedLink = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
  expiresAt?: Date;
  stats: LinkStats;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
};

export class LinkService {
  private apiBaseUrl: string;
  private defaultDomain: string;

  constructor(
    apiBaseUrl: string = process.env.API_BASE_URL || '',
    defaultDomain: string = process.env.SHORT_LINK_DOMAIN || 'short.ly'
  ) {
    this.apiBaseUrl = apiBaseUrl;
    this.defaultDomain = defaultDomain;
  }

  async shortenLink(
    url: string,
    options: {
      customSlug?: string;
      expiresIn?: number;
      utm?: ShortenedLink['utm'];
    } = {}
  ): Promise<ApiResponse<ShortenedLink>> {
    try {
      // In a real implementation, this would make an API call to a link shortening service
      // For now, we'll return mock data
      return {
        success: true,
        data: this.getMockShortenedLink(url, options),
      };
    } catch (error) {
      console.error('Error shortening link:', error);
      return {
        success: false,
        error: {
          code: 'SHORTENING_FAILED',
          message: 'Failed to shorten link',
        },
      };
    }
  }

  async getLinkStats(shortUrl: string): Promise<ApiResponse<LinkStats>> {
    try {
      // In a real implementation, this would fetch stats from the link shortening service
      // For now, we'll return mock data
      return {
        success: true,
        data: this.getMockLinkStats(),
      };
    } catch (error) {
      console.error('Error getting link stats:', error);
      return {
        success: false,
        error: {
          code: 'STATS_FETCH_FAILED',
          message: 'Failed to fetch link statistics',
        },
      };
    }
  }

  async bulkShorten(
    urls: string[],
    options: {
      utm?: ShortenedLink['utm'];
    } = {}
  ): Promise<ApiResponse<ShortenedLink[]>> {
    try {
      const shortened = urls.map(url => this.getMockShortenedLink(url, options));
      return {
        success: true,
        data: shortened,
      };
    } catch (error) {
      console.error('Error bulk shortening links:', error);
      return {
        success: false,
        error: {
          code: 'BULK_SHORTENING_FAILED',
          message: 'Failed to shorten links in bulk',
        },
      };
    }
  }

  private getMockShortenedLink(
    url: string,
    options: {
      customSlug?: string;
      expiresIn?: number;
      utm?: ShortenedLink['utm'];
    }
  ): ShortenedLink {
    const id = Math.random().toString(36).substring(2, 8);
    const now = new Date();

    return {
      id,
      originalUrl: url,
      shortUrl: `https://${this.defaultDomain}/${options.customSlug || id}`,
      createdAt: now,
      expiresAt: options.expiresIn
        ? new Date(now.getTime() + options.expiresIn)
        : undefined,
      stats: this.getMockLinkStats(),
      utm: options.utm,
    };
  }

  private getMockLinkStats(): LinkStats {
    return {
      clicks: Math.floor(Math.random() * 1000),
      uniqueClicks: Math.floor(Math.random() * 800),
      referrers: {
        'twitter.com': 45,
        'facebook.com': 32,
        'linkedin.com': 28,
        'instagram.com': 15,
      },
      countries: {
        US: 250,
        UK: 120,
        CA: 80,
        AU: 50,
      },
      devices: {
        mobile: 420,
        desktop: 380,
        tablet: 200,
      },
      browsers: {
        chrome: 500,
        safari: 300,
        firefox: 150,
        edge: 50,
      },
    };
  }

  // Helper function to add UTM parameters to a URL
  static addUtmParams(
    url: string,
    params: ShortenedLink['utm'] = {}
  ): string {
    try {
      const urlObj = new URL(url);
      
      if (params?.source) urlObj.searchParams.set('utm_source', params.source);
      if (params?.medium) urlObj.searchParams.set('utm_medium', params.medium);
      if (params?.campaign) urlObj.searchParams.set('utm_campaign', params.campaign);
      if (params?.term) urlObj.searchParams.set('utm_term', params.term);
      if (params?.content) urlObj.searchParams.set('utm_content', params.content);

      return urlObj.toString();
    } catch (error) {
      console.error('Error adding UTM parameters:', error);
      return url;
    }
  }

  // Helper function to extract domain from URL
  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error('Error extracting domain:', error);
      return url;
    }
  }
} 