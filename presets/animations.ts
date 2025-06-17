import { Easing } from 'react-native-reanimated';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * ========================================================================
 * A. Spring Animation Presets
 *
 * Reusable spring configurations for `withSpring`.
 * ========================================================================
 */

// from utils/dragAnimationPresets.ts
export const dragActivation: WithSpringConfig = {
  stiffness: 220,
  damping: 18,
};

// from utils/dragAnimationPresets.ts
export const dragRelease: WithSpringConfig = {
  stiffness: 180,
  damping: 20,
};

// from SlideUpMenu/animations.ts
export const slideUpSpring: WithSpringConfig = {
  damping: 15,
  stiffness: 120,
  mass: 0.9,
};

/**
 * ========================================================================
 * B. Timing Animation Presets
 *
 * Reusable timing configurations for `withTiming`.
 * ========================================================================
 */

// from SlideUpMenu/animations.ts
export const slideUpTiming: WithTimingConfig = {
  duration: 350,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}; 