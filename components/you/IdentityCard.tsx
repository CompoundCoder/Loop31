import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeOut } from 'react-native-reanimated';

type IdentityCardProps = {
    onDismiss: () => void;
}

export default function IdentityCard({ onDismiss }: IdentityCardProps) {
  const { colors, spacing, borderRadius, elevation, typography } = useThemeStyles();

  return (
    <Animated.View 
        style={[styles.container, { backgroundColor: colors.card, borderRadius: borderRadius.lg, ...elevation.md }]}
        exiting={FadeOut.duration(300)}
    >
      <View style={styles.content}>
        <Text style={{ fontSize: typography.fontSize.title, fontWeight: '600', color: colors.text }}>
          Welcome back, Trevor
        </Text>
        <View style={[styles.insightRow, { marginTop: spacing.sm }]}>
          <MaterialCommunityIcons name="chart-line-variant" size={16} color={colors.text} style={{ opacity: 0.7 }} />
          <Text style={{ fontSize: typography.fontSize.body, color: colors.text, opacity: 0.7, marginLeft: spacing.sm }}>
            You've been using 3 loops consistently.
          </Text>
        </View>
      </View>
      <Pressable onPress={onDismiss} style={styles.closeButton}>
        <Ionicons name="close-circle" size={22} color={colors.text} style={{ opacity: 0.3 }} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
  },
  closeButton: {
    paddingLeft: 16,
    paddingBottom: 16,
    marginTop: -8,
    marginRight: -8,
  },
}); 