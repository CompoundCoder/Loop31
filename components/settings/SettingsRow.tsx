import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import * as rowPresets from '@/presets/rows';
import * as typographyPresets from '@/presets/typography';

interface SettingsRowProps {
  label: string;
  onPress: () => void;
  rightText?: string;
  leftIcon?: React.ReactNode;
  showChevron?: boolean;
  disabled?: boolean;
}

export default function SettingsRow({
  label,
  onPress,
  rightText,
  leftIcon,
  showChevron = true,
  disabled = false,
}: SettingsRowProps) {
  const { colors, spacing } = useThemeStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        rowPresets.headerActionRow,
        styles.container,
        {
          backgroundColor: colors.card,
          opacity: disabled ? 0.5 : (pressed ? 0.7 : 1),
          paddingHorizontal: spacing.md
        },
      ]}
    >
      {leftIcon}
      <Text style={[typographyPresets.pageHeaderTitle, { color: colors.text, flex: 1, marginLeft: leftIcon ? spacing.sm : 0 }]}>
        {label}
      </Text>
      <View style={rowPresets.iconTextRow}>
        {rightText && (
          <Text style={[typographyPresets.pageHeaderTitle, { color: colors.tabInactive, marginRight: spacing.xs }]}>
            {rightText}
          </Text>
        )}
        {showChevron && <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
    }
}) 