import React from 'react';
import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import SettingsCaption from './SettingsCaption';
import * as rowPresets from '@/presets/rows';
import * as typographyPresets from '@/presets/typography';

interface SettingsToggleProps {
  label: string;
  value: boolean;
  onToggle: (newValue: boolean) => void;
  caption?: string;
}

export default function SettingsToggle({ label, value, onToggle, caption }: SettingsToggleProps) {
  const { colors, spacing, borderRadius } = useThemeStyles();
  return (
    <View>
      <Pressable 
        style={({pressed}) => [
            rowPresets.headerActionRow,
            { 
                backgroundColor: pressed ? colors.border : colors.card,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
            }
        ]}
        onPress={() => onToggle(!value)}
    >
        <Text style={[typographyPresets.pageHeaderTitle, { color: colors.text, flex: 1 }]}>{label}</Text>
        <Switch onValueChange={onToggle} value={value} trackColor={{ false: colors.border, true: colors.accent }} ios_backgroundColor={colors.border}/>
      </Pressable>
      {caption && <SettingsCaption text={caption} />}
    </View>
  );
} 