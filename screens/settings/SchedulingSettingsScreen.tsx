import { View, StyleSheet } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

export default function SchedulingSettingsScreen() {
  return (
    <SettingsContainer>
      <SettingsSection title="Time Zone">
        <SettingItem
          label="Time Zone"
          icon="time-outline"
          iconColor="#007AFF"
          value="London - Europe"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Default Schedule">
        <SettingItem
          label="Default Time"
          icon="calendar-outline"
          iconColor="#FF9500"
          value="10:00 AM"
          onPress={() => {}}
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 