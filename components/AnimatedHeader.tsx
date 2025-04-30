import React, { useState } from 'react';
import { Animated, StyleSheet, View, Dimensions, TouchableWithoutFeedback } from 'react-native';
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
  scrollY: Animated.Value;
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
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [SCROLL_THRESHOLD, SCROLL_THRESHOLD + 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Main header content animations
  const mainHeaderOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const mainHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  // Mini header content animations
  const miniHeaderOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const miniHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [0, -10],
    extrapolate: 'clamp',
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
      <Animated.View
        style={[
          styles.extendedBackground,
          {
            backgroundColor: headerBackgroundColor,
            opacity: headerBackgroundOpacity,
            height: insets.top,
          },
        ]}
      />

      {/* Header Background Layer */}
      <Animated.View
        style={[
          styles.headerBackground,
          {
            backgroundColor: headerBackgroundColor,
            opacity: headerBackgroundOpacity,
            top: insets.top,
            height: MINI_HEADER_HEIGHT,
          },
        ]}
      />

      {/* Mini Header Content Layer */}
      <Animated.View
        style={[
          styles.miniHeaderContent,
          {
            opacity: headerBackgroundOpacity,
            top: insets.top,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.miniHeaderTitle,
            { color: colors.text },
          ]}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>
      </Animated.View>

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
        <Animated.View 
          style={[
            styles.mainHeaderContent,
            { 
              opacity: mainHeaderOpacity,
              transform: [{ translateY: mainHeaderTranslateY }],
            }
          ]}
        >
          <Animated.Text
            style={[
              styles.mainHeaderTitle,
              { color: colors.text },
            ]}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
        </Animated.View>
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

      {/* Mini Header Background Layer */}
      <Animated.View
        style={[
          styles.miniHeaderBackground,
          {
            opacity: miniHeaderOpacity,
            backgroundColor: 'transparent',
            transform: [{ translateY: miniHeaderTranslateY }],
          },
        ]}
      />

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
  miniHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_TOTAL_HEIGHT,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
});
