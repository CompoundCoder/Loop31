import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import { headerActionRow } from '@/presets/rows';

type SettingsLinkRowProps = {
  label: string;
  url: string;
  openInBrowser?: boolean; // This prop isn't directly used by Linking, but good for clarity.
};

export function SettingsLinkRow({ label, url }: SettingsLinkRowProps) {
  const { colors, typography, spacing } = useThemeStyles();

  const handlePress = async () => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row, 
        headerActionRow,
        { backgroundColor: pressed ? colors.subtleButton : colors.card, padding: spacing.md }
      ]}
    >
      <Text style={[styles.label, { color: colors.text, fontSize: typography.fontSize.body }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.tabInactive} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    flex: 1,
  },
}); 