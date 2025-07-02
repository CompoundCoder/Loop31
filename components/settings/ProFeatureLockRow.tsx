import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import { iconTextRow } from '@/presets/rows';

type ProFeatureLockRowProps = {
  label: string;
  caption: string;
  onPress: () => void;
};

export function ProFeatureLockRow({ label, caption, onPress }: ProFeatureLockRowProps) {
  const { colors, typography, spacing, opacity } = useThemeStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        iconTextRow,
        styles.row,
        { 
          opacity: pressed ? opacity.medium : opacity.full,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }
      ]}
    >
      <Ionicons name="lock-closed" size={24} color={colors.tabInactive} />
      <View style={styles.textContainer}>
        <Text style={[styles.labelText, { color: colors.tabInactive, fontSize: typography.fontSize.body, fontWeight: typography.fontWeight.medium }]}>
          {label}
        </Text>
        <Text style={[styles.captionText, { color: colors.tabInactive, fontSize: typography.fontSize.caption }]}>
          {caption}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  labelText: {},
  captionText: {
    marginTop: 2,
    opacity: 0.8,
  },
}); 