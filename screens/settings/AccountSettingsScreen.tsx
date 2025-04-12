import { View, StyleSheet } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useAccounts } from '../../context/AccountContext';

export default function AccountSettingsScreen() {
  const { accounts, brandGroups } = useAccounts();

  const platformCounts = {
    instagram: accounts.filter(a => a.type === 'instagram' && a.isConnected).length,
    facebook: accounts.filter(a => a.type === 'facebook' && a.isConnected).length,
    twitter: accounts.filter(a => a.type === 'twitter' && a.isConnected).length,
    linkedin: accounts.filter(a => a.type === 'linkedin' && a.isConnected).length,
    tiktok: accounts.filter(a => a.type === 'tiktok' && a.isConnected).length,
  };

  return (
    <SettingsContainer>
      <SettingsSection title="Connected Accounts">
        <SettingItem
          label="Instagram"
          icon="logo-instagram"
          iconColor="#E4405F"
          value={platformCounts.instagram > 0 ? `${platformCounts.instagram} connected` : 'Connect'}
          onPress={() => {}}
        />
        <SettingItem
          label="Facebook"
          icon="logo-facebook"
          iconColor="#1877F2"
          value={platformCounts.facebook > 0 ? `${platformCounts.facebook} connected` : 'Connect'}
          onPress={() => {}}
        />
        <SettingItem
          label="Twitter"
          icon="logo-twitter"
          iconColor="#1DA1F2"
          value={platformCounts.twitter > 0 ? `${platformCounts.twitter} connected` : 'Connect'}
          onPress={() => {}}
        />
        <SettingItem
          label="LinkedIn"
          icon="logo-linkedin"
          iconColor="#0A66C2"
          value={platformCounts.linkedin > 0 ? `${platformCounts.linkedin} connected` : 'Connect'}
          onPress={() => {}}
        />
        <SettingItem
          label="TikTok"
          icon="logo-tiktok"
          iconColor="#000000"
          value={platformCounts.tiktok > 0 ? `${platformCounts.tiktok} connected` : 'Connect'}
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Brand Groups">
        {brandGroups.map(group => (
          <SettingItem
            key={group.id}
            label={group.name}
            icon="layers-outline"
            iconColor="#5856D6"
            value={`${group.accountIds.length} accounts`}
            onPress={() => {}}
          />
        ))}
        <SettingItem
          label="Create New Group"
          icon="add-circle-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Account Management">
        <SettingItem
          label="Default Posting Account"
          icon="arrow-forward-circle-outline"
          iconColor="#007AFF"
          value="Instagram"
          onPress={() => {}}
        />
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