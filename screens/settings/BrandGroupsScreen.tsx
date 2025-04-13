import { View, StyleSheet, Alert } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useAccounts } from '../../context/AccountContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsNavigator';

type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function BrandGroupsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { brandGroups, accounts } = useAccounts();

  const handleCreateGroup = () => {
    Alert.alert('Coming Soon', 'Group creation feature coming soon!');
  };

  const getGroupPlatformIcons = (accountIds: string[]) => {
    const groupAccounts = accounts.filter(a => accountIds.includes(a.id));
    const platforms = [...new Set(groupAccounts.map(a => a.type))];
    return platforms.map(p => `logo-${p}`).join(',');
  };

  return (
    <SettingsContainer>
      <SettingsSection title="Your Brand Groups">
        {brandGroups.map(group => (
          <SettingItem
            key={group.id}
            label={group.name}
            icon="layers-outline"
            iconColor="#5856D6"
            value={`${group.accounts.length} accounts`}
            platformIcons={getGroupPlatformIcons(group.accounts)}
            numberOfLines={1}
            onPress={() => {}}
          />
        ))}
        <SettingItem
          label="Create New Group"
          icon="add-circle-outline"
          iconColor="#34C759"
          onPress={handleCreateGroup}
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 