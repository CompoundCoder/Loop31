import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import * as typographyPresets from '@/presets/typography';
import SettingsCaption from './SettingsCaption';

interface SettingsTextInputProps extends TextInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  description?: string;
}

export default function SettingsTextInput({
  label,
  value,
  placeholder,
  onChangeText,
  description,
  ...rest
}: SettingsTextInputProps) {
  const { colors, spacing, borderRadius } = useThemeStyles();

  return (
    <View style={{ padding: spacing.md }}>
      <Text style={[typographyPresets.inputLabel, { color: colors.text, marginBottom: spacing.sm, opacity: 1, fontWeight: '500' }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        placeholderTextColor={colors.tabInactive}
        style={[
          typographyPresets.pageHeaderTitle,
          styles.input,
          {
            backgroundColor: colors.backgroundDefault,
            borderColor: colors.border,
            color: colors.text,
            borderRadius: borderRadius.sm,
            padding: spacing.sm,
          },
        ]}
        {...rest}
      />
      {description && <SettingsCaption text={description} />}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  },
}); 