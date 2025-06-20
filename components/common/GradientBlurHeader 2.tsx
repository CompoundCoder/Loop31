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
import tinycolor from 'tinycolor2';

/**
 * Generates an array of color stops to create a smooth, eased gradient.
 * This function takes a base color and creates a "scrim" effect by fading
 * it to transparent along a non-linear curve.
 *
 * @param baseColor The starting color of the gradient.
 * @param steps The number of color stops to generate for the gradient. More steps create a smoother gradient.
 * @returns An array of color strings for use in a LinearGradient component.
 */
const generateEasedGradient = (baseColor: string, steps: number): string[] => {
  const color = tinycolor(baseColor);
  // An easing curve for a smooth "scrim" gradient, inspired by CSS-Tricks.
  const scrimEasing = [0, 0.19, 0.34, 0.47, 0.565, 0.65, 0.73, 0.802, 0.861, 0.91, 0.952, 0.982, 1];
  
  // We'll generate a few more steps than the easing curve to ensure smoothness
  const gradientColors: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1);
    // Find the two points in the easing curve our progress is between
    const lowerIndex = Math.floor(progress * (scrimEasing.length - 1));
    const upperIndex = Math.ceil(progress * (scrimEasing.length - 1));
    const pointProgress = (progress * (scrimEasing.length - 1)) - lowerIndex;

    // Interpolate between the two points
    const easedProgress = scrimEasing[lowerIndex] + (scrimEasing[upperIndex] - scrimEasing[lowerIndex]) * pointProgress;
    
    gradientColors.push(color.setAlpha(1 - easedProgress).toRgbString());
  }

  return gradientColors;
};

/**
 * Configuration for the header's visual effects.
 * Adjust these values to tweak the appearance of the gradient and blur.
 */
const HEADER_EFFECT_CONFIG = {
  // The intensity of the blur effect. iOS and Android have different scaling.
  iosBlurIntensity: 20,
  androidBlurIntensity: 100,
  // The start point of the gradient fade (0.0 = top, 1.0 = bottom).
  gradientStart: 0.4,
  // The end point of the gradient fade. Adjusted to make the effect visible.
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

  // Memoize the generated gradient to avoid recalculating on every render
  const easedGradientColors = React.useMemo(() => generateEasedGradient(colors.background, 15), [colors.background]);

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

    // Create a multi-step gradient for a smoother blur transition.
    // This creates the "gradient style blur" you're looking for.
    return (
      <LinearGradient
        colors={[
          'black',          // Opaque: Full blur visibility
          'rgba(0,0,0,0.8)',
          'rgba(0,0,0,0.6)',
          'rgba(0,0,0,0.3)',
          'transparent',    // Transparent: No blur visibility
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
      {/* Background Effects */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <MaskedView style={StyleSheet.absoluteFill} maskElement={renderMask()}>
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={Platform.OS === 'ios' ? HEADER_EFFECT_CONFIG.iosBlurIntensity : HEADER_EFFECT_CONFIG.androidBlurIntensity}
            tint={colors.background === '#ffffff' ? 'light' : 'dark'}
          />
        </MaskedView>
        <LinearGradient
          colors={easedGradientColors}
          locations={null} // Let the gradient distribute colors evenly
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Small Header Content */}
      <Reanimated.View style={[styles.smallHeader, { top: insets.top }, smallTitleAnimatedStyle]}>
        <Text style={[styles.smallTitle, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </Reanimated.View>
      
      {/* Action Button */}
      {actionButton && (
        <View style={[styles.actionButtonContainer, { top: insets.top + (MINI_HEADER_HEIGHT / 2) - 18, right: spacing.lg }]}>
          {actionButton}
        </View>
      )}

      {/* Large Header Content */}
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