import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import Reanimated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_EFFECT_CONFIG = {
  iosBlurIntensity: 20,
  androidBlurIntensity: 100,
  gradientStart: 0.0,
  gradientEnd: 0.8,
};

export const HEADER_HEIGHT_PERCENT = 0.15;
export const LARGE_TITLE_HEIGHT = 60;
export const MINI_HEADER_HEIGHT = 50;
const SCROLL_THRESHOLD = 50;

interface GradientBlurHeaderProps {
  title?: string;
  scrollY: SharedValue<number>;
  actionButton?: React.ReactNode;
}

export const GradientBlurHeader: React.FC<GradientBlurHeaderProps> = ({ title, scrollY, actionButton }) => {
  const { colors, spacing } = useThemeStyles();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const headerHeight = screenHeight * HEADER_HEIGHT_PERCENT;

  const largeTitleAnimatedStyle = useAnimatedStyle(() => {
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

  const smallTitleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD, SCROLL_THRESHOLD + 20],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const renderMask = () => {
    const { gradientStart, gradientEnd } = HEADER_EFFECT_CONFIG;
    const range = gradientEnd - gradientStart;
    return (
      <LinearGradient
        colors={[
          'black',
          'rgba(0,0,0,0.8)',
          'rgba(0,0,0,0.6)',
          'rgba(0,0,0,0.3)',
          'transparent',
        ]}
        locations={[
          gradientStart,
          gradientStart + range * 0.4,
          gradientStart + range * 0.6,
          gradientStart + range * 0.8,
          gradientEnd,
        ]}
        style={StyleSheet.absoluteFill}
      />
    );
  };

  return (
    <View style={[styles.container, { height: headerHeight }]} pointerEvents="box-none">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <MaskedView style={StyleSheet.absoluteFill} maskElement={renderMask()}>
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={Platform.OS === 'ios' ? HEADER_EFFECT_CONFIG.iosBlurIntensity : HEADER_EFFECT_CONFIG.androidBlurIntensity}
            tint={colors.background === '#ffffff' ? 'light' : 'dark'}
          />
        </MaskedView>
        <LinearGradient
          colors={[
            colors.background,
            `${colors.background}E6`, // 90%
            `${colors.background}B3`, // 70%
            `${colors.background}80`, // 50%
            `${colors.background}33`, // 20%
            `${colors.background}00`, // 0%
          ]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Reanimated.View style={[styles.smallHeader, { top: insets.top }, smallTitleAnimatedStyle]}>
        <Text style={[styles.smallTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </Reanimated.View>
      
      {actionButton && (
        <View style={[styles.actionButtonContainer, { top: insets.top + (MINI_HEADER_HEIGHT / 2) - 18, right: spacing.lg }]}>
          {actionButton}
        </View>
      )}

      <Reanimated.View style={[styles.largeTitleContainer, largeTitleAnimatedStyle]}>
        <Text style={[styles.largeTitle, { color: colors.text }]}>{title || 'Header'}</Text>
      </Reanimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  smallHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MINI_HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  smallTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  largeTitleContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    height: LARGE_TITLE_HEIGHT,
    justifyContent: 'center',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  actionButtonContainer: {
    position: 'absolute',
    zIndex: 10,
    pointerEvents: 'auto'
  },
}); 