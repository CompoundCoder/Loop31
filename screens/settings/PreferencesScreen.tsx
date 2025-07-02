import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import {
  SettingsSection,
  SettingsToggle,
  SettingsButton,
  SettingsCaption,
  SettingsDivider,
} from '@/components/settings';
import SettingsDropdownInline from '@/components/settings/SettingsDropdownInline';
import SettingsHeader from '@/components/headers/SettingsHeader';

export default function PreferencesScreen() {
  const { colors, spacing } = useThemeStyles();

  const [autoRemix, setAutoRemix] = useState(false);
  const [remixTone, setRemixTone] = useState('Friendly');
  const [hideTips, setHideTips] = useState(false);
  
  const toneOptions = ["Friendly", "Neutral", "Salesy"];

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Tutorial Progress",
      "Are you sure you want to reset all tutorials and in-app tips?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => console.log("Progress Reset") }
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SettingsHeader title="Preferences" />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
        <SettingsSection title="Automation">
          <SettingsToggle
            label="Auto-remix captions"
            caption="Automatically generate a new caption every time a post is reused."
            value={autoRemix}
            onToggle={setAutoRemix}
          />
          <SettingsDivider />
          <SettingsDropdownInline
            label="Caption remix tone"
            options={toneOptions}
            value={remixTone}
            onChange={setRemixTone}
            caption="Learn my personal tone (coming soon)"
          />
        </SettingsSection>

        <SettingsSection title="In-App Experience">
          <SettingsToggle
            label="Hide in-app tips"
            value={hideTips}
            onToggle={setHideTips}
          />
          <SettingsDivider />
           <SettingsButton
            text="Reset tutorial progress"
            variant="danger"
            onPress={handleResetProgress}
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
}); 