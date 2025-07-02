import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';

type SettingsRestoreDefaultsProps = {
  onReset: () => void;
};

export function SettingsRestoreDefaults({ onReset }: SettingsRestoreDefaultsProps) {
  const { colors, typography, spacing, borderRadius } = useThemeStyles();

  const handlePress = () => {
    Alert.alert(
      "Restore Defaults",
      "Are you sure you want to restore all settings to their default values? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Restore", 
          onPress: onReset,
          style: "destructive"
        }
      ]
    );
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { 
          backgroundColor: pressed ? colors.border : 'transparent',
          borderColor: colors.error,
          padding: spacing.md,
          borderRadius: borderRadius.lg,
        }
      ]}
    >
      <Text style={[styles.label, { color: colors.error, fontSize: typography.fontSize.body, fontWeight: typography.fontWeight.medium }]}>
        Restore Default Settings
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {},
}); 