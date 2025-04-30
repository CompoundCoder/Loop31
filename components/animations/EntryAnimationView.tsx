import React, { memo } from 'react';
import { Animated } from 'react-native';
import { useEntryAnimation } from './useEntryAnimation';
import { ANIMATION } from '@/constants/animation';

export type EntryAnimationViewProps = {
  children: React.ReactNode;
  /**
   * Whether this is primary content (adds scale)
   * @default false
   */
  isPrimary?: boolean;
  /**
   * Optional override for animation duration in ms
   * @default isPrimary ? ANIMATION.WELCOME_DURATION : ANIMATION.SECTION_FADE_DURATION
   */
  duration?: number;
};

/**
 * A component that animates its children with a fade-in effect.
 * Primary content (like WelcomeMessage) gets additional scale animation.
 * Secondary content (like sections) gets a subtle fade with linear easing.
 */
function EntryAnimationView({
  children,
  isPrimary = false,
  duration,
}: EntryAnimationViewProps) {
  const { style } = useEntryAnimation({
    isPrimary,
    duration,
  });

  return (
    <Animated.View style={style}>
      {children}
    </Animated.View>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(EntryAnimationView); 