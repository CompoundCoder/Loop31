import { useCallback, useEffect } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface UseAnimatedDismissProps {
  /**
   * Duration of the animation in milliseconds
   * @default 300
   */
  duration?: number;
  /**
   * Callback to run after animation completes
   */
  onDismiss?: () => void;
  /**
   * Whether this is part of a stack of cards
   * @default false
   */
  isStack?: boolean;
  /**
   * Number of cards remaining in the stack (only needed if isStack is true)
   * @default 0
   */
  remainingCards?: number;
}

/**
 * A hook that provides smooth dismissal animations for cards and card stacks.
 * Handles both individual card dismissal and stack reflow animations.
 */
export const useAnimatedDismiss = ({
  duration = 300,
  onDismiss,
  isStack = false,
  remainingCards = 0,
}: UseAnimatedDismissProps = {}) => {
  // Configure the layout animation
  const animateLayout = useCallback(() => {
    LayoutAnimation.configureNext({
      duration,
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
      },
    });
  }, [duration]);

  // Handle stack-specific animations
  const animateStackDismiss = useCallback(() => {
    if (remainingCards > 0) {
      // If there are more cards, animate the stack reflow
      LayoutAnimation.configureNext({
        duration: duration * 0.8, // Slightly faster for stack reflow
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
        },
      });
    } else {
      // If it's the last card, use the standard animation
      animateLayout();
    }
  }, [duration, remainingCards, animateLayout]);

  // Main dismiss function that components will call
  const handleDismiss = useCallback(() => {
    if (isStack) {
      animateStackDismiss();
    } else {
      animateLayout();
    }

    // Call onDismiss after a frame to avoid setState during render
    const timer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 0);

    return () => clearTimeout(timer);
  }, [isStack, animateStackDismiss, animateLayout, onDismiss]);

  return {
    handleDismiss,
    animateLayout,
  };
}; 