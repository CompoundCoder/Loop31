import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import Reanimated, {
  useSharedValue, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation,
} from 'react-native-reanimated';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DropdownMenu from '@/components/DropdownMenu';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Constants for header measurements
const MAIN_HEADER_HEIGHT = SCREEN_HEIGHT * 0.12; // 12% of screen height
export const MINI_HEADER_HEIGHT = 50; // Keep fixed for consistent mini header
const SCROLL_THRESHOLD = MAIN_HEADER_HEIGHT / 2; // Scale threshold with header

// Export total height for content padding
export const HEADER_TOTAL_HEIGHT = MAIN_HEADER_HEIGHT + MINI_HEADER_HEIGHT;

type AnimatedHeaderProps = {
  title: string;
  scrollY: Reanimated.SharedValue<number>;
  headerRightButton?: React.ReactNode;
  actionButton?: React.ReactNode;
  menuVisible?: boolean;
  onMenuVisibleChange?: (visible: boolean) => void;
};

export default function AnimatedHeader({ 
  title, 
  scrollY, 
  headerRightButton, 
  actionButton,
  menuVisible = false,
  onMenuVisibleChange,
}: AnimatedHeaderProps) {
  const { colors, spacing } = useThemeStyles();
  const insets = useSafeAreaInsets();

  // Define header background color in one place
  const headerBackgroundColor = colors.background;

  // Header background opacity animation
  const headerBackgroundAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD, SCROLL_THRESHOLD + 40],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Main header content animations
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

  // Mini header content animations (Only opacity needed for container)
  const miniHeaderContentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD, SCROLL_THRESHOLD + 40], // Matches background fade-in
      [0, 1], // Fade in with background
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const handleOptionSelect = (option: 'post' | 'loop') => {
    onMenuVisibleChange?.(false);
    // TODO: Implement navigation or logic for each option
    if (option === 'post') {
      // Navigate or trigger create post logic
    } else if (option === 'loop') {
      // Navigate or trigger create loop logic
    }
  };

  return (
    <>
      {/* Extended Background Layer */}
      <Reanimated.View
        style={[
          styles.extendedBackground,
          {
            backgroundColor: headerBackgroundColor,
            height: insets.top,
          },
          headerBackgroundAnimatedStyle,
        ]}
      />

      {/* Header Background Layer */}
      <Reanimated.View
        style={[
          styles.headerBackground,
          {
            backgroundColor: headerBackgroundColor,
            top: insets.top,
            height: MINI_HEADER_HEIGHT,
          },
          headerBackgroundAnimatedStyle,
        ]}
      />

      {/* Mini Header Content Layer */}
      <Reanimated.View
        style={[
          styles.miniHeaderContent,
          {
            top: insets.top,
          },
          miniHeaderContentAnimatedStyle,
        ]}
      >
        <Text 
          style={[
            styles.miniHeaderTitle,
            { color: colors.text },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </Reanimated.View>

      {/* Main Header */}
      <View
        style={[
          styles.mainHeader,
          {
            paddingTop: insets.top,
            paddingHorizontal: spacing.lg,
            height: MAIN_HEADER_HEIGHT,
          },
        ]}
      >
        <Reanimated.View 
          style={[
            styles.mainHeaderContent,
            mainHeaderContentAnimatedStyle,
          ]}
        >
          <Text 
            style={[
              styles.mainHeaderTitle,
              { color: colors.text },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </Reanimated.View>
        {headerRightButton && (
          <View
            style={{
              position: 'absolute',
              right: spacing.lg,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            {headerRightButton}
          </View>
        )}
      </View>

      {actionButton && (
        <View
          style={{
            position: 'absolute',
            right: spacing.lg,
            top: insets.top + spacing.md - 4,
            zIndex: 1000,
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          {React.cloneElement(actionButton as React.ReactElement, {
            onPress: () => onMenuVisibleChange?.(!menuVisible),
          })}
          <DropdownMenu
            visible={menuVisible}
            onClose={() => onMenuVisibleChange?.(false)}
            onSelect={(option) => {
              handleOptionSelect(option);
            }}
            style={{
              position: 'absolute',
              top: 36,
              right: 0,
            }}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  extendedBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 2,
  },
  headerBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
  },
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
});
