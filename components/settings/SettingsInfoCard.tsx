import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { iconTextRow } from '@/presets/rows';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';

type SettingsInfoCardProps = {
  iconName: IconSymbolName;
  title: string;
  subtitle: string;
};

export function SettingsInfoCard({ iconName, title, subtitle }: SettingsInfoCardProps) {
  const { colors, typography, spacing, borderRadius } = useThemeStyles();

  return (
    <View style={[
      styles.card,
      iconTextRow,
      { 
        padding: spacing.md,
        gap: spacing.md,
      }
    ]}>
      <IconSymbol name={iconName} size={28} color={colors.text} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.fontSize.subtitle, fontWeight: typography.fontWeight.medium }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.tabInactive, marginTop: spacing.xs, fontSize: typography.fontSize.body }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {},
  subtitle: {},
}); 