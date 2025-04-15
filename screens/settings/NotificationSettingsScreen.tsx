import React from 'react';
import { Alert } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useNotifications } from '../../context/NotificationsContext';

export default function NotificationSettingsScreen() {
  const { settings, updateSetting } = useNotifications();

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    try {
      await updateSetting(key, value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  return (
    <SettingsContainer>
      <SettingsSection title="Push Notifications">
        <SettingItem
          label="Enable Push Notifications"
          toggle={settings.pushEnabled}
          onToggle={(value) => handleToggle('pushEnabled', value)}
          icon="notifications-outline"
          iconColor="#FF3B30"
        />
        <SettingItem
          label="Scheduled Posts"
          toggle={settings.scheduleNotifs}
          onToggle={(value) => handleToggle('scheduleNotifs', value)}
          icon="calendar-outline"
          iconColor="#34C759"
          disabled={!settings.pushEnabled}
        />
        <SettingItem
          label="Failed Posts"
          toggle={settings.failureNotifs}
          onToggle={(value) => handleToggle('failureNotifs', value)}
          icon="alert-circle-outline"
          iconColor="#FF9500"
          disabled={!settings.pushEnabled}
        />
        <SettingItem
          label="Engagement Updates"
          toggle={settings.engagementNotifs}
          onToggle={(value) => handleToggle('engagementNotifs', value)}
          icon="heart-outline"
          iconColor="#FF2D55"
          disabled={!settings.pushEnabled}
        />
      </SettingsSection>

      <SettingsSection title="Email Notifications">
        <SettingItem
          label="Enable Email Notifications"
          toggle={settings.emailEnabled}
          onToggle={(value) => handleToggle('emailEnabled', value)}
          icon="mail-outline"
          iconColor="#007AFF"
        />
        <SettingItem
          label="Weekly Analytics Digest"
          toggle={settings.weeklyDigest}
          onToggle={(value) => handleToggle('weeklyDigest', value)}
          icon="analytics-outline"
          iconColor="#5856D6"
          disabled={!settings.emailEnabled}
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 