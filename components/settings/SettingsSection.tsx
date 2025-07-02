import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import * as typographyPresets from '@/presets/typography';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {title && (
        <Text style={[
          typographyPresets.sectionTitle, 
          { 
            color: colors.text, 
            opacity: 0.6,
            marginLeft: spacing.md, 
            marginBottom: spacing.sm,
            marginTop: spacing.md,
            fontSize: 14,
            textTransform: 'uppercase'
          }
        ]}>
          {title}
        </Text>
      )}
      <View style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          ...elevation.sm,
          marginHorizontal: spacing.md,
        }
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
}); 