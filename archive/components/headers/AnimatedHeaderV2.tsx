import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Reanimated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import iOS26HeaderBackground from './iOS26HeaderBackground';
import {
  SCROLL_THRESHOLD,
  MINI_HEADER_HEIGHT,
  HEADER_TOTAL_HEIGHT,
} from '../AnimatedHeader'; // Import constants from the original

// Re-export constants for easy access
export { MINI_HEADER_HEIGHT, HEADER_TOTAL_HEIGHT };

type AnimatedHeaderV2Props = {
  title: string;
  scrollY: SharedValue<number>;
  headerRightButton?: React.ReactNode;
  actionButton?: React.ReactNode;
};

export default function AnimatedHeaderV2({
  title,
  scrollY,
  headerRightButton,
  actionButton,
}: AnimatedHeaderV2Props) {
  const { colors, spacing } = useThemeStyles();
  const insets = useSafeAreaInsets();

  // Main header content animations (copied from original)
  const mainHeaderContentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, -10],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Mini header content animations (copied from original)
  const miniHeaderContentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD, SCROLL_THRESHOLD + 40],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <>
      {/* New iOS Style Background */}
      <iOS26HeaderBackground
        scrollY={scrollY}
        fadeStart={SCROLL_THRESHOLD}
        fadeEnd={SCROLL_THRESHOLD + 40}
        height={MINI_HEADER_HEIGHT}
        topInset={insets.top}
      />
      
      {/* Mini Header Content Layer (z-index 3) */}
      <Reanimated.View
        style={[
          styles.miniHeaderContent,
          { top: insets.top },
          miniHeaderContentAnimatedStyle,
        ]}
      >
        <Text style={[styles.miniHeaderTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </Reanimated.View>
      
      {/* Main Header (z-index 1) */}
      <View style={[styles.mainHeader, { paddingTop: insets.top }]}>
        <Reanimated.View style={[styles.mainHeaderContent, mainHeaderContentAnimatedStyle]}>
          <Text style={[styles.mainHeaderTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        </Reanimated.View>
        {headerRightButton && (
          <View style={[styles.headerButtonContainer, { right: spacing.lg }]}>
            {headerRightButton}
          </View>
        )}
      </View>
      
      {/* Action Button (z-index 10) - This floats above the mini header */}
      {actionButton && (
        <View style={[styles.actionButtonContainer, { top: insets.top + (MINI_HEADER_HEIGHT / 2) - 18, right: spacing.lg }]}>
          {actionButton}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  miniHeaderContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MINI_HEADER_HEIGHT,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  mainHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: 20, // Standard padding
    height: HEADER_TOTAL_HEIGHT - MINI_HEADER_HEIGHT,
  },
  mainHeaderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  mainHeaderTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  headerButtonContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
  },
  actionButtonContainer: {
    position: 'absolute',
    zIndex: 10,
  },
}); 