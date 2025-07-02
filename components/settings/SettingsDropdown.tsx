import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import * as rowPresets from '@/presets/rows';
import * as typographyPresets from '@/presets/typography';

interface SettingsDropdownProps {
  label: string;
  value: string;
  onPress: () => void;
}

export default function SettingsDropdown({ label, value, onPress }: SettingsDropdownProps) {
  const { colors, spacing } = useThemeStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        rowPresets.headerActionRow,
        {
          backgroundColor: pressed ? colors.border : colors.card,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={[typographyPresets.pageHeaderTitle, { color: colors.text, flex: 1 }]}>
        {label}
      </Text>
      <View style={rowPresets.iconTextRow}>
        <Text style={[typographyPresets.pageHeaderTitle, { color: colors.tabInactive, marginRight: spacing.xs }]}>
          {value}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text} style={{ opacity: 0.5 }} />
      </View>
    </Pressable>
  );
} 