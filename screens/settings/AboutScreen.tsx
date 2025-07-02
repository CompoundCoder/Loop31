import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import {
  SettingsSection,
  SettingsCaption,
  SettingsDivider,
  SettingsLinkRow,
} from '@/components/settings';
import SettingsHeader from '@/components/headers/SettingsHeader';
import * as typography from '@/presets/typography';

export default function AboutScreen() {
  const { colors, spacing } = useThemeStyles();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SettingsHeader title="About" />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
        
        <SettingsSection>
            <View style={styles.appInfoContainer}>
                <Text style={[typography.screenTitle, { color: colors.text }]}>Loop31</Text>
                <Text style={[typography.metadataText, { color: colors.tabInactive, marginTop: spacing.xs }]}>v0.1.0 (build 69)</Text>
                <Text style={[typography.captionSmall, { color: colors.text, marginTop: spacing.sm, opacity: 0.8 }]}>Set it and forget it.</Text>
            </View>
        </SettingsSection>

        <SettingsCaption text="Loop31 helps realtors and creators stay consistent without burning out." />

        <SettingsSection>
            <SettingsLinkRow
                label="Privacy Policy"
                url="https://loop31.com/privacy"
            />
            <SettingsDivider />
            <SettingsLinkRow
                label="Terms of Use"
                url="https://loop31.com/terms"
            />
        </SettingsSection>

        <SettingsCaption text="© 2025 Compound Coder LLC" />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  }
}); 