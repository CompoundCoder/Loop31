import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import {
  SettingsSection,
  SettingsCaption,
  SocialMediaAccountRow,
  SettingsRow,
} from '@/components/settings';
import SettingsHeader from '@/components/headers/SettingsHeader';
import ComingSoonModal from '@/components/modals/ComingSoonModal';
import { Ionicons } from '@expo/vector-icons';

const mockAccounts = [
  { platform: 'instagram', handle: 'loopmaster.pro', connected: true },
  { platform: 'twitter', handle: 'LoopMaster', connected: true },
  { platform: 'facebook', handle: 'Trevor.Loop.31', connected: true },
];

export default function ConnectedAccountsScreen() {
  const { colors, spacing } = useThemeStyles();
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddNew = () => {
    setModalVisible(true);
  };

  const handleAccountPress = (account: (typeof mockAccounts)[0]) => {
    // For now, this will also open the coming soon modal
    // In the future, it could navigate to a detail screen for that account
    setModalVisible(true);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SettingsHeader title="Connected Accounts" />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
        <SettingsSection>
          <SettingsRow
            label="Add New Account"
            onPress={handleAddNew}
            leftIcon={<Ionicons name="add-circle-outline" size={24} color={colors.accent} />}
          />
        </SettingsSection>
        <SettingsSection title="Your Accounts">
          {mockAccounts.map((account, index) => (
            <SocialMediaAccountRow
              key={index}
              platform={account.platform as any}
              handle={account.handle}
              connected={account.connected}
              onPress={() => handleAccountPress(account)}
            />
          ))}
        </SettingsSection>
        <SettingsCaption text="Connect your social accounts to easily share content and track performance." />
      </ScrollView>
      <ComingSoonModal
        visible={isModalVisible}
        onDismiss={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
}); 