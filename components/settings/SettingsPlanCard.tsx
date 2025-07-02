import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';

type SettingsPlanCardProps = {
  title: string;
  subtitle: string;
  badge?: string;
  actionLabel: string;
  onPress: () => void;
};

export function SettingsPlanCard({ title, subtitle, badge, actionLabel, onPress }: SettingsPlanCardProps) {
  const { colors, spacing, borderRadius, typography } = useThemeStyles();

  return (
    <View style={[
      styles.card,
      { padding: spacing.md }
    ]}>
      <View style={styles.content}>
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.primary, marginBottom: spacing.sm, borderRadius: borderRadius.full }]}>
            <Text style={[styles.badgeText, { color: colors.buttonAccentText, fontSize: typography.fontSize.caption, fontWeight: typography.fontWeight.bold }]}>{badge}</Text>
          </View>
        )}
        <Text style={[styles.title, { color: colors.text, fontSize: typography.fontSize.subtitle, fontWeight: typography.fontWeight.bold }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.tabInactive, marginTop: spacing.xs, fontSize: typography.fontSize.body }]}>{subtitle}</Text>
      </View>
      <Pressable style={[styles.button, { backgroundColor: colors.primary, borderRadius: borderRadius.full, padding: spacing.sm }]} onPress={onPress}>
        <Text style={[styles.buttonText, { color: colors.buttonAccentText, fontSize: typography.fontSize.body, fontWeight: typography.fontWeight.medium }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {},
  title: {},
  subtitle: {},
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginHorizontal: 4,
  }
}); 