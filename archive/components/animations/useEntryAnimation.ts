import { useRef, useEffect, useMemo } from 'react';
import { Animated } from 'react-native';
import { ANIMATION } from '@/constants/animation';

type AnimationConfig = {
  /**
   * Whether this is primary content (adds scale)
   * @default false
   */
  isPrimary?: boolean;

  /**
   * Optional override for animation duration in ms
   * @default isPrimary ? WELCOME_DURATION : SECTION_FADE_DURATION
   */
  duration?: number;
};

/**
 * Hook to manage fast, subtle entry animations following Meta best practices
 */
export function useEntryAnimation({
  isPrimary = false,
  duration: customDuration,
}: AnimationConfig = {}) {
  // Set appropriate durations based on content type
  const duration = customDuration ?? (isPrimary ? ANIMATION.WELCOME_DURATION : ANIMATION.SECTION_FADE_DURATION);

  // Memoize animated values to prevent recreating refs
  const animatedValues = useMemo(() => ({
    opacity: new Animated.Value(isPrimary ? 0 : 0.7),
    scale: isPrimary ? new Animated.Value(0.97) : null,
  }), [isPrimary]);

  // Create animation sequence
  useEffect(() => {
    const animations = [
      Animated.timing(animatedValues.opacity, {
        toValue: 1,
        duration,
        easing: isPrimary ? ANIMATION.WELCOME_EASING : ANIMATION.SECTION_FADE_EASING,
        useNativeDriver: true,
      }),
    ];

    // Add subtle scale for primary content only
    if (isPrimary && animatedValues.scale) {
      animations.push(
        Animated.timing(animatedValues.scale, {
          toValue: 1,
          duration,
          easing: ANIMATION.WELCOME_EASING,
          useNativeDriver: true,
        })
      );
    }

    // Start all animations immediately
    const animationController = Animated.parallel(animations);
    animationController.start();

    // Cleanup function to stop animations if component unmounts
    return () => {
      animationController.stop();
      // Reset values to prevent memory leaks
      animatedValues.opacity.setValue(isPrimary ? 0 : 0.7);
      if (animatedValues.scale) {
        animatedValues.scale.setValue(0.97);
      }
    };
  }, [animatedValues, duration, isPrimary]);

  // Return memoized style object
  return useMemo(() => ({
    style: {
      opacity: animatedValues.opacity,
      ...(isPrimary && animatedValues.scale ? {
        transform: [{ scale: animatedValues.scale }]
      } : {}),
    },
  }), [animatedValues, isPrimary]);
} 