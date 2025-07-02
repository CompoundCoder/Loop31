import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import * as typographyPresets from '@/presets/typography';

interface SettingsCaptionProps {
  text: string;
}

export default function SettingsCaption({ text }: SettingsCaptionProps) {
  const { colors, spacing } = useThemeStyles();
  return (
    <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.sm }}>
      <Text style={[typographyPresets.metadataTextSmall, { color: colors.tabInactive }]}>
        {text}
      </Text>
    </View>
  );
} 