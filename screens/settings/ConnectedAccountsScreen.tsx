import { View, StyleSheet, Alert } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useAccounts } from '../../context/AccountContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsNavigator';

type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function ConnectedAccountsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { accounts } = useAccounts();

  const platformCounts = {
    instagram: accounts.filter(a => a.type === 'instagram' && a.isConnected).length,
    facebook: accounts.filter(a => a.type === 'facebook' && a.isConnected).length,
    twitter: accounts.filter(a => a.type === 'twitter' && a.isConnected).length,
    linkedin: accounts.filter(a => a.type === 'linkedin' && a.isConnected).length,
    tiktok: accounts.filter(a => a.type === 'tiktok' && a.isConnected).length,
  };

  const handleAddAccount = () => {
    // In a real app, this would open the OAuth flow
    // For now, just show an alert
    Alert.alert('Coming Soon', 'Account connection feature coming soon!');
  };

  return (
    <SettingsContainer>
      <SettingsSection title="Your Accounts">
        {accounts.map(account => (
          <SettingItem
            key={account.id}
            label={account.username}
            icon={`logo-${account.type}`}
            iconColor={getPlatformColor(account.type)}
            value={account.isConnected ? 'Connected' : 'Disconnected'}
            onPress={() => navigation.navigate('SocialAccountDetails', { accountId: account.id })}
          />
        ))}
        <SettingItem
          label="Add New Account"
          icon="add-circle-outline"
          iconColor="#34C759"
          onPress={handleAddAccount}
        />
      </SettingsSection>

      <SettingsSection title="Account Management">
        <SettingItem
          label="Auto-Connect Settings"
          icon="git-branch-outline"
          iconColor="#FF9500"
          onPress={() => {}}
        />
        <SettingItem
          label="Refresh All Connections"
          icon="refresh-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
      </SettingsSection>
    </SettingsContainer>
  );
}

function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'instagram':
      return '#E4405F';
    case 'facebook':
      return '#1877F2';
    case 'twitter':
      return '#1DA1F2';
    case 'linkedin':
      return '#0A66C2';
    case 'tiktok':
      return '#000000';
    default:
      return '#8E8E93';
  }
} 