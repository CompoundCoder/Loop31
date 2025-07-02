import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import * as rowPresets from '@/presets/rows';
import * as typographyPresets from '@/presets/typography';
import SettingsSection from './SettingsSection';

interface RadioOption {
  label: string;
  value: string;
}

interface SettingsRadioGroupProps {
  label: string;
  options: RadioOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function SettingsRadioGroup({
  label,
  options,
  selected,
  onSelect,
}: SettingsRadioGroupProps) {
  const { colors, spacing } = useThemeStyles();

  return (
    <SettingsSection title={label}>
      {options.map((option, index) => (
        <React.Fragment key={option.value}>
          <Pressable
            onPress={() => onSelect(option.value)}
            style={({ pressed }) => [
              rowPresets.headerActionRow,
              {
                padding: spacing.md,
                backgroundColor: pressed ? colors.border : colors.card,
              },
            ]}
          >
            <Text style={[typographyPresets.pageHeaderTitle, { color: colors.text, flex: 1 }]}>
              {option.label}
            </Text>
            <Ionicons
              name={selected === option.value ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={selected === option.value ? colors.accent : colors.text}
            />
          </Pressable>
          {index < options.length - 1 && <View style={{height: 1, backgroundColor: colors.border, marginLeft: spacing.md}} />}
        </React.Fragment>
      ))}
    </SettingsSection>
  );
} 