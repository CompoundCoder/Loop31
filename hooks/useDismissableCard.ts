// useDismissableCard.ts
// Reusable hook for smooth fade+scale dismiss animations on large cards.
// Matches Facebook-style card dismissal behavior.

import { useRef } from 'react';
import { Animated, LayoutAnimation, Platform, UIManager, Easing } from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Animation timing constants (matching existing system)
const TIMING = {
  TOTAL_DURATION: 300,
  FADE_DURATION: 200, // Faster fade for snappiness
  SPRING: {
    STIFFNESS: 170,
    DAMPING: 12,
    MASS: 0.8,
  },
} as const;

// Layout animation configuration for smooth collapse
const LAYOUT_CONFIG = {
  duration: TIMING.TOTAL_DURATION,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
    springDamping: 0.8,
  },
} as const;

interface UseDismissableCardConfig {
  onEnd?: () => void;
}

/**
 * Hook for smooth Facebook-style card dismissal animations
 * Combines visual fade+scale with layout collapse
 */
export function useDismissableCard({ onEnd }: UseDismissableCardConfig = {}) {
  // Initialize animated values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateDismiss = () => {
    // Configure layout animation first
    LayoutAnimation.configureNext(LAYOUT_CONFIG);

    // Run visual animations in parallel
    Animated.parallel([
      // Quick fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: TIMING.FADE_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Natural spring scale-down
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        stiffness: TIMING.SPRING.STIFFNESS,
        damping: TIMING.SPRING.DAMPING,
        mass: TIMING.SPRING.MASS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Ensure layout animation completes before triggering onEnd
      setTimeout(() => {
        if (onEnd) {
          onEnd();
        }
      }, TIMING.TOTAL_DURATION);
    });
  };

  return { fadeAnim, scaleAnim, animateDismiss };
} 