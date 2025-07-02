import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import * as rowPresets from '@/presets/rows';
import * as typographyPresets from '@/presets/typography';

interface MultiSelectOption {
  label: string;
  value: string;
}

interface SettingsMultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (newSelectedValues: string[]) => void;
}

export default function SettingsMultiSelect({
  label,
  options,
  selectedValues,
  onChange,
}: SettingsMultiSelectProps) {
  const { colors, spacing } = useThemeStyles();

  const handleSelect = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    onChange(newSelection);
  };

  return (
    <View>
      <Text style={[typographyPresets.inputLabel, { color: colors.text, opacity: 0.6, marginLeft: spacing.md, marginBottom: spacing.sm, textTransform: 'uppercase'}]}>{label}</Text>
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value)}
            style={({ pressed }) => [
              rowPresets.headerActionRow,
              {
                padding: spacing.md,
                backgroundColor: pressed ? colors.border : 'transparent',
                borderRadius: spacing.sm,
              },
            ]}
          >
            <Text style={[typographyPresets.pageHeaderTitle, { color: colors.text, flex: 1 }]}>
              {option.label}
            </Text>
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected ? colors.accent : colors.text}
            />
          </Pressable>
        );
      })}
    </View>
  );
} 