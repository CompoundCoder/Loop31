import { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useAccounts } from '../../context/AccountContext';

export default function ProfileSettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const { accounts } = useAccounts();
  const connectedCount = accounts.filter(a => a.isConnected).length;

  return (
    <SettingsContainer>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
      </View>

      <SettingsSection title="Account Information">
        <SettingItem
          label="Display Name"
          value="Vinyl Wrap Chicago"
          icon="person-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Email Address"
          value="minimumeffortmeme@gmail.com"
          icon="mail-outline"
          iconColor="#FF9500"
          onPress={() => {}}
        />
        <SettingItem
          label="Phone Number"
          value="Add phone number"
          icon="call-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
        <SettingItem
          label="Time Zone"
          value="London - Europe"
          icon="time-outline"
          iconColor="#5856D6"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingItem
          label="Change Password"
          icon="lock-closed-outline"
          iconColor="#FF3B30"
          onPress={() => {}}
        />
        <SettingItem
          label="Two-Factor Authentication"
          icon="shield-checkmark-outline"
          iconColor="#34C759"
          value="Off"
          onPress={() => {}}
        />
        <SettingItem
          label="Login History"
          icon="time-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingItem
          label="Dark Mode"
          toggle={darkMode}
          onToggle={setDarkMode}
          icon="moon-outline"
          iconColor="#8E8E93"
        />
        <SettingItem
          label="Language"
          value="English"
          icon="language-outline"
          iconColor="#5856D6"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Account Actions">
        <SettingItem
          label="Export Account Data"
          icon="download-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Deactivate Account"
          icon="pause-circle-outline"
          iconColor="#FF9500"
          onPress={() => {}}
        />
        <SettingItem
          label="Delete Account"
          icon="trash-outline"
          iconColor="#FF3B30"
          onPress={() => {}}
        />
      </SettingsSection>
    </SettingsContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
}); 