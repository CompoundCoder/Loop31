import { View, StyleSheet } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useState } from 'react';

export default function ComposingSettingsScreen() {
  const [spellCheck, setSpellCheck] = useState(true);

  return (
    <SettingsContainer>
      <SettingsSection title="Text & Links">
        <SettingItem
          label="Spell Check"
          toggle={spellCheck}
          onToggle={setSpellCheck}
          icon="checkmark-circle-outline"
          iconColor="#34C759"
        />
        <SettingItem
          label="Link Shortening"
          icon="link-outline"
          iconColor="#007AFF"
          value="Off"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Formatting">
        <SettingItem
          label="Emoji Keyboard"
          icon="happy-outline"
          iconColor="#FF9500"
          value="Enabled"
          onPress={() => {}}
        />
        <SettingItem
          label="Character Counter"
          icon="text-outline"
          iconColor="#34C759"
          value="Enabled"
          onPress={() => {}}
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 