import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function SettingsDivider() {
  const { colors, spacing } = useThemeStyles();
  return (
    <View style={[
      styles.divider,
      { 
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
      }
    ]} />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.8,
  },
}); 