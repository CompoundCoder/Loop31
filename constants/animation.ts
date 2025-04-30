import { Easing } from 'react-native';

/**
 * Global animation constants used throughout the app
 * All durations are in milliseconds
 */
export const ANIMATION = {
  /**
   * Duration for primary content animations (WelcomeMessage)
   * @default 500
   */
  WELCOME_DURATION: 500,

  /**
   * Duration for section fade animations in milliseconds
   */
  SECTION_FADE_DURATION: 300,

  /**
   * Easing function for primary content
   * Smooth deceleration curve for natural feel
   */
  WELCOME_EASING: Easing.out(Easing.ease),

  /**
   * Easing function for section fade animations
   */
  SECTION_FADE_EASING: Easing.out(Easing.ease),
} as const; // Make object immutable

// Type for accessing animation constants with TypeScript support
export type AnimationConstants = typeof ANIMATION; 