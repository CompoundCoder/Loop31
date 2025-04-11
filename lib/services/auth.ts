import { Platform } from '../types';
import { ApiConfigService, ApiKeys } from './api-config';

export type AuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
};

export type AuthResult = {
  success: boolean;
  platform: Platform;
  error?: string;
  data?: ApiKeys[Platform];
};

export class AuthService {
  private apiConfig: ApiConfigService;
  private authConfigs: Partial<Record<Platform, AuthConfig>> = {};

  constructor() {
    this.apiConfig = ApiConfigService.getInstance();
  }

  public setAuthConfig(platform: Platform, config: AuthConfig): void {
    this.authConfigs[platform] = config;
  }

  public getAuthUrl(platform: Platform): string | null {
    const config = this.authConfigs[platform];
    if (!config) return null;

    const baseUrl = this.getOAuthBaseUrl(platform);
    if (!baseUrl) return null;

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      state: this.generateState(platform),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  public async handleAuthCallback(
    platform: Platform,
    code: string,
    state: string
  ): Promise<AuthResult> {
    try {
      // In a real implementation, this would:
      // 1. Verify the state parameter
      // 2. Exchange the code for access tokens
      // 3. Store the tokens securely
      // 4. Update the ApiConfigService

      // For now, we'll just return a mock successful result
      const mockTokens: ApiKeys[Platform] = {
        apiKey: 'mock_api_key',
        apiSecret: 'mock_api_secret',
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      this.apiConfig.setApiKey(platform, mockTokens);

      return {
        success: true,
        platform,
        data: mockTokens,
      };
    } catch (error) {
      console.error('Auth callback error:', error);
      return {
        success: false,
        platform,
        error: 'Failed to authenticate',
      };
    }
  }

  public async refreshToken(platform: Platform): Promise<AuthResult> {
    try {
      const currentKeys = this.apiConfig.getApiKey(platform);
      if (!currentKeys?.refreshToken) {
        throw new Error('No refresh token available');
      }

      // In a real implementation, this would:
      // 1. Call the platform's token refresh endpoint
      // 2. Update the stored tokens
      // 3. Update the ApiConfigService

      // For now, we'll just return a mock successful result
      const mockTokens: ApiKeys[Platform] = {
        ...currentKeys,
        accessToken: 'new_mock_access_token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      this.apiConfig.setApiKey(platform, mockTokens);

      return {
        success: true,
        platform,
        data: mockTokens,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        platform,
        error: 'Failed to refresh token',
      };
    }
  }

  public async revokeAccess(platform: Platform): Promise<boolean> {
    try {
      const currentKeys = this.apiConfig.getApiKey(platform);
      if (!currentKeys?.accessToken) {
        return true; // Already revoked
      }

      // In a real implementation, this would:
      // 1. Call the platform's token revocation endpoint
      // 2. Clear stored tokens
      // 3. Update the ApiConfigService

      this.apiConfig.setApiKey(platform, undefined);
      return true;
    } catch (error) {
      console.error('Access revocation error:', error);
      return false;
    }
  }

  private getOAuthBaseUrl(platform: Platform): string | null {
    const platformUrls: Partial<Record<Platform, string>> = {
      twitter: 'https://twitter.com/i/oauth2/authorize',
      facebook: 'https://www.facebook.com/v17.0/dialog/oauth',
      instagram: 'https://api.instagram.com/oauth/authorize',
      linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
      pinterest: 'https://www.pinterest.com/oauth',
      tiktok: 'https://www.tiktok.com/auth/authorize/',
    };

    return platformUrls[platform] || null;
  }

  private generateState(platform: Platform): string {
    // In a real implementation, this would:
    // 1. Generate a secure random string
    // 2. Store it with the platform info for verification
    // 3. Include a timestamp for expiration
    return `${platform}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  // Helper function to check if tokens need refresh
  public needsTokenRefresh(platform: Platform): boolean {
    const status = this.apiConfig.getPlatformStatus(platform);
    return status.authenticated && status.tokenExpired;
  }

  // Helper function to ensure valid authentication
  public async ensureValidAuth(platform: Platform): Promise<boolean> {
    const status = this.apiConfig.getPlatformStatus(platform);
    
    if (!status.configured || !status.authenticated) {
      return false;
    }

    if (status.tokenExpired) {
      const result = await this.refreshToken(platform);
      return result.success;
    }

    return true;
  }
} 