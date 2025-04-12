import { View, StyleSheet, Alert } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useAccounts } from '../../context/AccountContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { SettingsStackParamList } from '../../navigation/SettingsNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SocialAccountDetailsRouteProp = RouteProp<SettingsStackParamList, 'SocialAccountDetails'>;
type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SocialAccountDetailsScreen() {
  const route = useRoute<SocialAccountDetailsRouteProp>();
  const navigation = useNavigation<SettingsNavigationProp>();
  const { accounts, removeAccount } = useAccounts();
  const { accountId } = route.params;

  const account = accounts.find(a => a.id === accountId);

  if (!account) {
    return null;
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to remove this account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeAccount(accountId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRefreshConnection = () => {
    // In a real app, this would refresh the OAuth token
    Alert.alert('Success', 'Connection refreshed successfully');
  };

  return (
    <SettingsContainer>
      <SettingsSection title="Account Information">
        <SettingItem
          label="Username"
          value={account.username}
          icon="person-outline"
          iconColor="#007AFF"
          showChevron={false}
        />
        <SettingItem
          label="Platform"
          value={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
          icon={`logo-${account.type}`}
          iconColor="#FF9500"
          showChevron={false}
        />
        <SettingItem
          label="Status"
          value={account.isConnected ? 'Connected' : 'Disconnected'}
          icon="radio-outline"
          iconColor="#34C759"
          showChevron={false}
        />
      </SettingsSection>

      <SettingsSection title="Actions">
        <SettingItem
          label="Refresh Connection"
          icon="refresh-outline"
          iconColor="#007AFF"
          onPress={handleRefreshConnection}
        />
        <SettingItem
          label="Delete Account"
          icon="trash-outline"
          iconColor="#FF3B30"
          onPress={handleDeleteAccount}
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 