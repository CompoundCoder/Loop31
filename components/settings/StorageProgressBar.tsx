import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import { iconTextRow } from '@/presets/rows';

type StorageProgressBarProps = {
  used: number;
  total: number;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
};

export function StorageProgressBar({ used, total, iconName = 'server-outline' }: StorageProgressBarProps) {
  const { colors, typography, spacing, borderRadius } = useThemeStyles();
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
      <View style={[iconTextRow, styles.header]}>
        {iconName && <Ionicons name={iconName} size={18} color={colors.text} />}
        <Text style={{ color: colors.text, fontSize: typography.fontSize.body, fontWeight: typography.fontWeight.medium }}>
          Storage
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.subtleButton, borderRadius: borderRadius.full, marginTop: spacing.sm }]}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: colors.accent, borderRadius: borderRadius.full }]} />
      </View>
      <View style={[styles.footer, { marginTop: spacing.xs }]}>
        <Text style={{ color: colors.tabInactive, fontSize: typography.fontSize.caption }}>
          {used.toFixed(1)} GB used
        </Text>
        <Text style={{ color: colors.tabInactive, fontSize: typography.fontSize.caption }}>
          {total} GB
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
  },
  track: {
    height: 8,
    width: '100%',
  },
  fill: {
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 