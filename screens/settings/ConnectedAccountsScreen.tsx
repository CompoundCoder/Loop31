import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAccounts } from '../../context/AccountContext';
import type { Account } from '../../context/AccountContext';
import { useNavigation } from '@react-navigation/native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsNavigator';

type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

type SocialPlatform = Account['platform'];

const PLATFORM_CONFIGS: Record<SocialPlatform, {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  name: string;
}> = {
  instagram: {
    icon: 'logo-instagram',
    color: '#E4405F',
    name: 'Instagram',
  },
  facebook: {
    icon: 'logo-facebook',
    color: '#1877F2',
    name: 'Facebook',
  },
  twitter: {
    icon: 'logo-twitter',
    color: '#1DA1F2',
    name: 'Twitter',
  },
  linkedin: {
    icon: 'logo-linkedin',
    color: '#0A66C2',
    name: 'LinkedIn',
  },
  tiktok: {
    icon: 'logo-tiktok',
    color: '#000000',
    name: 'TikTok',
  },
};

export default function ConnectedAccountsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { accounts } = useAccounts();

  const [fadeAnims] = useState<Record<string, Animated.Value>>(() =>
    accounts.reduce((acc, account) => ({
      ...acc,
      [account.id]: new Animated.Value(1),
    }), {})
  );

  const handleConnect = (platform: SocialPlatform) => {
    const platformConfig = PLATFORM_CONFIGS[platform];
    if (!platformConfig) return;

    Alert.alert(
      'Connect Account',
      `This will open ${platformConfig.name} authentication.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => {
            console.log(`Connecting to ${platform}...`);
            // Simulate API call
            setTimeout(() => {
              Alert.alert('Success', `Connected to ${platformConfig.name}`);
            }, 1000);
          },
        },
      ]
    );
  };

  const handleDisconnect = (accountId: string, platform: SocialPlatform) => {
    const platformConfig = PLATFORM_CONFIGS[platform];
    if (!platformConfig) return;

    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect your ${platformConfig.name} account? This will remove the account from all brand groups and scheduled posts.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            // Animate fade out
            Animated.sequence([
              Animated.timing(fadeAnims[accountId], {
                toValue: 0.5,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnims[accountId], {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();

            // In a real app, this would call the API to disconnect the account
            setTimeout(() => {
              Alert.alert('Success', `Disconnected from ${platformConfig.name}`);
            }, 1000);
          },
        },
      ]
    );
  };

  const handleRefreshConnection = (accountId: string, platform: SocialPlatform) => {
    const platformConfig = PLATFORM_CONFIGS[platform];
    if (!platformConfig) return;

    Alert.alert(
      'Refresh Connection',
      `Would you like to refresh your ${platformConfig.name} connection? This may require re-authentication.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: () => {
            // Animate fade
            Animated.sequence([
              Animated.timing(fadeAnims[accountId], {
                toValue: 0.5,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnims[accountId], {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();

            // Simulate refresh
            setTimeout(() => {
              Alert.alert('Success', `Refreshed ${platformConfig.name} connection`);
            }, 1000);
          },
        },
      ]
    );
  };

  const handleAddNewAccount = () => {
    Alert.alert(
      'Add New Account',
      'Select a platform to connect:',
      [
        ...Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => ({
          text: config.name,
          onPress: () => handleConnect(platform as SocialPlatform),
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsContainer>
          <SettingsSection title="Connected Accounts">
            {accounts.map(account => {
              const platformConfig = PLATFORM_CONFIGS[account.platform];
              if (!platformConfig) return null;

              return (
                <Animated.View
                  key={account.id}
                  style={{ opacity: fadeAnims[account.id] }}
                >
                  <SettingItem
                    label={account.name}
                    icon={platformConfig.icon}
                    iconColor={platformConfig.color}
                    onPress={() => {}}
                    rightElement={
                      <View style={styles.accountActions}>
                        <TouchableOpacity
                          onPress={() => handleRefreshConnection(account.id, account.platform)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="refresh" size={18} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDisconnect(account.id, account.platform)}
                          style={[styles.actionButton, styles.deleteButton]}
                        >
                          <Ionicons name="close" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    }
                  />
                </Animated.View>
              );
            })}

            <SettingItem
              label="Add New Account"
              icon="add-circle-outline"
              onPress={handleAddNewAccount}
              rightElement={<Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
            />
          </SettingsSection>
        </SettingsContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
}); 