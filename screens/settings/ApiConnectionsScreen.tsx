import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from '../../lib/types';
import { ApiConfigService } from '../../lib/services/api-config';
import { AuthService, AuthConfig } from '../../lib/services/auth';

const apiConfig = ApiConfigService.getInstance();
const authService = new AuthService();

type PlatformConfig = {
  name: Platform;
  label: string;
  icon: string;
  scopes: string[];
};

const PLATFORMS: PlatformConfig[] = [
  {
    name: 'twitter',
    label: 'Twitter',
    icon: 'logo-twitter',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  },
  {
    name: 'instagram',
    label: 'Instagram',
    icon: 'logo-instagram',
    scopes: ['basic', 'publish_media', 'pages_read_engagement'],
  },
  {
    name: 'facebook',
    label: 'Facebook',
    icon: 'logo-facebook',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'publish_video'],
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    icon: 'logo-linkedin',
    scopes: ['r_organization_social', 'w_organization_social', 'rw_organization_admin'],
  },
  {
    name: 'pinterest',
    label: 'Pinterest',
    icon: 'logo-pinterest',
    scopes: ['boards:read', 'pins:read', 'pins:write'],
  },
  {
    name: 'tiktok',
    label: 'TikTok',
    icon: 'logo-tiktok',
    scopes: ['user.info.basic', 'video.list', 'video.upload'],
  },
];

export default function ApiConnectionsScreen() {
  const [loading, setLoading] = useState<Record<Platform, boolean>>({} as Record<Platform, boolean>);
  const [statuses, setStatuses] = useState(apiConfig.getAllPlatformStatuses());

  useEffect(() => {
    // In a real app, you would load the API configurations from secure storage
    PLATFORMS.forEach(platform => {
      const mockConfig: AuthConfig = {
        clientId: `mock_client_id_${platform.name}`,
        clientSecret: `mock_client_secret_${platform.name}`,
        redirectUri: `yourapp://auth/${platform.name}/callback`,
        scopes: platform.scopes,
      };
      authService.setAuthConfig(platform.name, mockConfig);
    });
  }, []);

  const handleConnect = async (platform: Platform) => {
    try {
      setLoading(prev => ({ ...prev, [platform]: true }));
      
      const authUrl = authService.getAuthUrl(platform);
      if (!authUrl) {
        throw new Error('Failed to generate auth URL');
      }

      // In a real app, this would open the auth URL in a web browser
      // and handle the OAuth callback
      // For now, we'll simulate a successful auth
      const result = await authService.handleAuthCallback(
        platform,
        'mock_code',
        'mock_state'
      );

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed');
      }

      setStatuses(apiConfig.getAllPlatformStatuses());
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      setLoading(prev => ({ ...prev, [platform]: true }));
      
      const success = await authService.revokeAccess(platform);
      if (!success) {
        throw new Error('Failed to revoke access');
      }

      setStatuses(apiConfig.getAllPlatformStatuses());
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  const renderPlatform = (platform: PlatformConfig) => {
    const status = statuses[platform.name];
    const isLoading = loading[platform.name];

    return (
      <View key={platform.name} style={styles.platformCard}>
        <View style={styles.platformInfo}>
          <Ionicons
            name={platform.icon as any}
            size={24}
            color={status?.authenticated ? '#4caf50' : '#666'}
          />
          <Text style={styles.platformLabel}>{platform.label}</Text>
        </View>
        <View style={styles.platformActions}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#2f95dc" />
          ) : (
            <TouchableOpacity
              style={[
                styles.connectButton,
                status?.authenticated && styles.disconnectButton,
              ]}
              onPress={() =>
                status?.authenticated
                  ? handleDisconnect(platform.name)
                  : handleConnect(platform.name)
              }
            >
              <Text
                style={[
                  styles.connectButtonText,
                  status?.authenticated && styles.disconnectButtonText,
                ]}
              >
                {status?.authenticated ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Connections</Text>
        <Text style={styles.subtitle}>
          Connect your social media accounts to enable posting and analytics
        </Text>
      </View>
      <View style={styles.platforms}>
        {PLATFORMS.map(renderPlatform)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  platforms: {
    padding: 16,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  platformActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2f95dc',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  disconnectButtonText: {
    color: '#fff',
  },
}); 