import { Platform } from '../types';

export type HashtagSuggestion = {
  tag: string;
  popularity: number;
  recentPosts: number;
  engagement: number;
  isRecommended: boolean;
  categories: string[];
};

export type HashtagAnalytics = {
  reach: number;
  impressions: number;
  engagement: number;
  topPosts: string[];
};

export class HashtagService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.API_BASE_URL || '') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getSuggestions(
    content: string,
    platform: Platform,
    limit: number = 10
  ): Promise<HashtagSuggestion[]> {
    try {
      // In a real implementation, this would make an API call to a hashtag suggestion service
      // For now, we'll return mock data
      return this.getMockSuggestions(content, platform, limit);
    } catch (error) {
      console.error('Error getting hashtag suggestions:', error);
      return [];
    }
  }

  async getAnalytics(hashtag: string, platform: Platform): Promise<HashtagAnalytics> {
    try {
      // In a real implementation, this would fetch analytics data from the platform's API
      // For now, we'll return mock data
      return this.getMockAnalytics(hashtag);
    } catch (error) {
      console.error('Error getting hashtag analytics:', error);
      return {
        reach: 0,
        impressions: 0,
        engagement: 0,
        topPosts: [],
      };
    }
  }

  async getTrendingHashtags(platform: Platform): Promise<HashtagSuggestion[]> {
    try {
      // In a real implementation, this would fetch trending hashtags from the platform's API
      // For now, we'll return mock data
      return this.getMockTrendingHashtags(platform);
    } catch (error) {
      console.error('Error getting trending hashtags:', error);
      return [];
    }
  }

  private getMockSuggestions(
    content: string,
    platform: Platform,
    limit: number
  ): HashtagSuggestion[] {
    // Mock data - in a real implementation, this would use NLP to analyze content
    // and return relevant hashtags based on the platform
    const suggestions: HashtagSuggestion[] = [
      {
        tag: 'tech',
        popularity: 0.95,
        recentPosts: 1500000,
        engagement: 0.82,
        isRecommended: true,
        categories: ['technology', 'digital'],
      },
      {
        tag: 'startup',
        popularity: 0.88,
        recentPosts: 800000,
        engagement: 0.75,
        isRecommended: true,
        categories: ['business', 'entrepreneurship'],
      },
      {
        tag: 'innovation',
        popularity: 0.85,
        recentPosts: 600000,
        engagement: 0.79,
        isRecommended: true,
        categories: ['technology', 'business'],
      },
    ];

    return suggestions.slice(0, limit);
  }

  private getMockAnalytics(hashtag: string): HashtagAnalytics {
    return {
      reach: 150000,
      impressions: 300000,
      engagement: 0.75,
      topPosts: [
        'post_id_1',
        'post_id_2',
        'post_id_3',
      ],
    };
  }

  private getMockTrendingHashtags(platform: Platform): HashtagSuggestion[] {
    return [
      {
        tag: 'trending1',
        popularity: 0.98,
        recentPosts: 2000000,
        engagement: 0.85,
        isRecommended: true,
        categories: ['trending', 'viral'],
      },
      {
        tag: 'trending2',
        popularity: 0.95,
        recentPosts: 1800000,
        engagement: 0.82,
        isRecommended: true,
        categories: ['trending', 'popular'],
      },
    ];
  }
}

// Helper function to format hashtag metrics
export function formatHashtagMetrics(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

// Helper function to calculate hashtag score
export function calculateHashtagScore(
  popularity: number,
  engagement: number,
  recentPosts: number
): number {
  // Weighted scoring algorithm
  const weights = {
    popularity: 0.4,
    engagement: 0.4,
    recentPosts: 0.2,
  };

  // Normalize recentPosts to a 0-1 scale (assuming 2M posts is max)
  const normalizedPosts = Math.min(recentPosts / 2000000, 1);

  return (
    popularity * weights.popularity +
    engagement * weights.engagement +
    normalizedPosts * weights.recentPosts
  );
} 