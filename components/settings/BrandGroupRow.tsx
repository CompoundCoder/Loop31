import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import { headerActionRow, iconTextRow } from '@/presets/rows';

type BrandGroupRowProps = {
  name: string;
  postCount: number;
  color?: string;
  onPress: () => void;
};

export function BrandGroupRow({ name, postCount, color, onPress }: BrandGroupRowProps) {
  const { colors, typography, spacing, borderRadius } = useThemeStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        headerActionRow,
        styles.row,
        { 
          backgroundColor: pressed ? colors.subtleButton : 'transparent',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }
      ]}
    >
      <View style={iconTextRow}>
        {color && (
            <View style={[styles.badge, { backgroundColor: color, borderRadius: borderRadius.full }]} />
        )}
        <View>
          <Text style={[styles.nameText, { color: colors.text, fontSize: typography.fontSize.body, fontWeight: typography.fontWeight.medium }]}>
            {name}
          </Text>
          <Text style={[styles.countText, { color: colors.tabInactive, fontSize: typography.fontSize.caption }]}>
            {postCount} {postCount === 1 ? 'Post' : 'Posts'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.tabInactive} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
  },
  badge: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  nameText: {},
  countText: {
    marginTop: 2,
  },
}); 