import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useAccounts } from '../../context/AccountContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsNavigator';

type BrandGroupsScreenNavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  'BrandGroups'
>;

const GROUP_NAME_LIMIT = 30;

export default function BrandGroupsScreen() {
  const navigation = useNavigation<BrandGroupsScreenNavigationProp>();
  const { accounts, brandGroups, addGroup } = useAccounts();

  const handleCreateGroup = () => {
    Alert.prompt(
      'Create Brand Group',
      `Enter group name (max ${GROUP_NAME_LIMIT} characters)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (value) => {
            if (!value?.trim()) {
              Alert.alert('Error', 'Group name cannot be empty');
              return;
            }
            if (value.length > GROUP_NAME_LIMIT) {
              Alert.alert('Error', `Group name must be less than ${GROUP_NAME_LIMIT} characters`);
              return;
            }
            const newGroup = {
              id: `group-${Date.now()}`,
              name: value,
              accounts: [],
            };
            addGroup(newGroup);
            navigation.navigate('BrandGroupDetails', { groupId: newGroup.id });
          }
        }
      ],
      'plain-text'
    );
  };

  const getGroupPlatformIcons = (accountIds: string[]) => {
    const groupAccounts = accounts.filter(a => accountIds.includes(a.id));
    const platforms = [...new Set(groupAccounts.map(a => a.platform))];
    return platforms.map(p => `logo-${p}`).join(',');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SettingsContainer>
        <SettingsSection title="Your Brand Groups">
          {brandGroups.map(group => (
            <SettingItem
              key={group.id}
              label={group.name}
              icon="layers-outline"
              iconColor="#8E44AD"
              detail={`${group.accounts.length} accounts`}
              onPress={() => navigation.navigate('BrandGroupDetails', { groupId: group.id })}
              rightElement="chevron-forward"
            />
          ))}
          <SettingItem
            label="Create New Group"
            icon="add-circle-outline"
            onPress={handleCreateGroup}
            rightElement="chevron-forward"
          />
        </SettingsSection>
      </SettingsContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
}); 