import { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

export default function ProfileSettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);

  return (
    <SettingsContainer>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
      </View>

      <SettingsSection title="Profile Information">
        <SettingItem
          label="Display Name"
          value="Vinyl Wrap Chicago"
          icon="person-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Username"
          value="vinyl.wrap.chicago"
          icon="at-outline"
          iconColor="#FF9500"
          onPress={() => {}}
        />
        <SettingItem
          label="Bio"
          value="Edit bio"
          icon="text-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
        <SettingItem
          label="Website"
          value="Add website"
          icon="link-outline"
          iconColor="#5856D6"
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
          label="Private Profile"
          toggle={privateProfile}
          onToggle={setPrivateProfile}
          icon="lock-closed-outline"
          iconColor="#FF9500"
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