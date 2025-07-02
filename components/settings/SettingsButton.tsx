import React from 'react';
import { Text, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import * as typographyPresets from '@/presets/typography';

interface SettingsButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
}

export default function SettingsButton({ text, onPress, variant = 'default' }: SettingsButtonProps) {
  const { colors, spacing } = useThemeStyles();
  const textColor = variant === 'danger' ? colors.error : colors.accent;
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.border : colors.card,
        padding: spacing.md,
        alignItems: 'center',
      })}
    >
      <Text style={[typographyPresets.pageHeaderTitle, { color: textColor }]}>
        {text}
      </Text>
    </Pressable>
  );
} 