import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

export default function LoopScoreCard() {
  const { colors, spacing, borderRadius, elevation, typography } = useThemeStyles();

  const fadeInAnimation = useSharedValue(0);
  const barAnimation = useSharedValue(0);

  useEffect(() => {
    fadeInAnimation.value = withDelay(200, withTiming(1, { duration: 600 }));
    barAnimation.value = withDelay(400, withTiming(1, { duration: 800 }));
  }, [fadeInAnimation, barAnimation]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barAnimation.value * 87}%`,
  }));
  
  const animatedNumberStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnimation.value,
  }));

  const Stat = ({ value, label }: { value: string, label: string }) => (
    <View style={styles.statItem}>
      <Animated.Text style={[{ fontSize: typography.fontSize.title, fontWeight: '600', color: colors.text }, animatedNumberStyle]}>
          {value}
      </Animated.Text>
      <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: borderRadius.lg, ...elevation.md }]}>
      <View style={styles.header}>
        <Text style={{ fontSize: typography.fontSize.title, fontWeight: '600', color: colors.text }}>Loop Score</Text>
        <Animated.Text style={[{ fontSize: typography.fontSize.hero, fontWeight: 'bold', color: colors.accent, marginLeft: spacing.sm }, animatedNumberStyle]}>
            87
        </Animated.Text>
      </View>
      
      <View style={[styles.xpBar, { backgroundColor: colors.border, marginTop: spacing.md, borderRadius: borderRadius.sm }]}>
        <Animated.View style={[styles.xpBarFill, { backgroundColor: colors.accent }, barStyle]} />
      </View>

      <View style={[styles.statsRow, { marginTop: spacing.lg }]}>
        <Stat value="24" label="Posts" />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stat value="6" label="Loops Used" />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Stat value="1,240" label="Journey Points" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  xpBar: {
    height: 8,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
      fontSize: 12,
      marginTop: 2,
  },
  divider: {
      width: StyleSheet.hairlineWidth,
      height: '60%',
  }
}); 