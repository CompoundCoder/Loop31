import { useState } from 'react';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

export default function AccountSettingsScreen() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  return (
    <SettingsContainer>
      <SettingsSection title="Security">
        <SettingItem
          label="Change Password"
          icon="lock-closed-outline"
          iconColor="#FF3B30"
          onPress={() => {}}
        />
        <SettingItem
          label="Two-Factor Authentication"
          toggle={twoFactorEnabled}
          onToggle={setTwoFactorEnabled}
          icon="shield-checkmark-outline"
          iconColor="#34C759"
        />
        <SettingItem
          label="Biometric Login"
          toggle={biometricEnabled}
          onToggle={setBiometricEnabled}
          icon="finger-print-outline"
          iconColor="#007AFF"
        />
      </SettingsSection>

      <SettingsSection title="Account Management">
        <SettingItem
          label="Email Address"
          value="minimumeffortmeme@gmail.com"
          icon="mail-outline"
          iconColor="#5856D6"
          onPress={() => {}}
        />
        <SettingItem
          label="Phone Number"
          value="Add phone number"
          icon="call-outline"
          iconColor="#FF9500"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Account Actions">
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