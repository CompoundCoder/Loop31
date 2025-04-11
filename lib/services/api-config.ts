import { Platform } from '../types';

export type ApiKeys = {
  [key in Platform]?: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
};

export type ApiEndpoints = {
  [key in Platform]: {
    base: string;
    auth: string;
    posts: string;
    analytics: string;
    media: string;
    insights: string;
  };
};

export class ApiConfigService {
  private static instance: ApiConfigService;
  private apiKeys: ApiKeys = {};
  private endpoints: ApiEndpoints = {
    twitter: {
      base: 'https://api.twitter.com/2',
      auth: '/oauth2/token',
      posts: '/tweets',
      analytics: '/tweets/metrics',
      media: '/media/upload',
      insights: '/insights',
    },
    instagram: {
      base: 'https://graph.instagram.com',
      auth: '/oauth/access_token',
      posts: '/media',
      analytics: '/insights',
      media: '/media',
      insights: '/insights',
    },
    facebook: {
      base: 'https://graph.facebook.com/v17.0',
      auth: '/oauth/access_token',
      posts: '/me/feed',
      analytics: '/insights',
      media: '/photos',
      insights: '/insights',
    },
    linkedin: {
      base: 'https://api.linkedin.com/v2',
      auth: '/oauth/v2/accessToken',
      posts: '/ugcPosts',
      analytics: '/organizationalEntityShareStatistics',
      media: '/assets',
      insights: '/organizationPageStatistics',
    },
    pinterest: {
      base: 'https://api.pinterest.com/v5',
      auth: '/oauth/token',
      posts: '/pins',
      analytics: '/user_account/analytics',
      media: '/media',
      insights: '/boards/analytics',
    },
    tiktok: {
      base: 'https://open.tiktokapis.com/v2',
      auth: '/oauth/token',
      posts: '/video',
      analytics: '/research/video/query',
      media: '/video/upload',
      insights: '/business/video/analytics',
    },
  };

  private constructor() {}

  public static getInstance(): ApiConfigService {
    if (!ApiConfigService.instance) {
      ApiConfigService.instance = new ApiConfigService();
    }
    return ApiConfigService.instance;
  }

  public setApiKey(platform: Platform, keys: ApiKeys[Platform]): void {
    this.apiKeys[platform] = keys;
  }

  public getApiKey(platform: Platform): ApiKeys[Platform] | undefined {
    return this.apiKeys[platform];
  }

  public getEndpoint(platform: Platform, type: keyof ApiEndpoints[Platform]): string {
    return this.endpoints[platform][type];
  }

  public isConfigured(platform: Platform): boolean {
    return !!this.apiKeys[platform]?.apiKey;
  }

  public getPlatformStatus(platform: Platform): {
    configured: boolean;
    authenticated: boolean;
    tokenExpired: boolean;
  } {
    const keys = this.apiKeys[platform];
    const now = new Date();

    return {
      configured: !!keys?.apiKey,
      authenticated: !!keys?.accessToken,
      tokenExpired: keys?.expiresAt ? keys.expiresAt < now : false,
    };
  }

  public getAllPlatformStatuses(): { [key in Platform]: ReturnType<typeof this.getPlatformStatus> } {
    const platforms = Object.keys(this.endpoints) as Platform[];
    return platforms.reduce((acc, platform) => {
      acc[platform] = this.getPlatformStatus(platform);
      return acc;
    }, {} as { [key in Platform]: ReturnType<typeof this.getPlatformStatus> });
  }
} 