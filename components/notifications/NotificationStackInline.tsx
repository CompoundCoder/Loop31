import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  ViewStyle,
  Platform,
  UIManager,
} from 'react-native';
// Import Reanimated
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS, // To call non-worklet functions like onDismiss
} from 'react-native-reanimated';
import { NotificationCard } from './NotificationCard';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { NotificationItem } from '@/modules/notifications';

// Removed LayoutAnimation setup

interface NotificationStackInlineProps {
  notifications: NotificationItem[];
  onDismiss?: (id: string) => void;
  style?: ViewStyle;
}

// Animation timing constants
const TIMING = {
  ENTRY_DURATION: 400, // New duration for entry
  EXIT_DURATION: 450, // <-- Align with Layout animation
  EXIT_SCALE_TARGET: 0.95, // Scale down target for exit
  ENTRY_SCALE_START: 0.95, // Scale up start for entry
} as const;

export const NotificationStackInline: React.FC<NotificationStackInlineProps> = ({
  notifications,
  onDismiss,
  style,
}) => {
  const { borderRadius } = useThemeStyles();
  const [visibleNotification, setVisibleNotification] = useState<NotificationItem | null>(null);

  // Reanimated Shared Values
  const opacity = useSharedValue(0); // Start transparent for entry animation
  const scale = useSharedValue<number>(TIMING.ENTRY_SCALE_START); // Explicitly type as number

  // Update visible notification and trigger entry animation
  useEffect(() => {
    // Filter for inline notifications first
    const inlineNotifications = notifications.filter(
      (item) => item.displayTarget === 'inline'
    );
    // Take the first item from the *filtered* list
    const nextNotification = inlineNotifications.length > 0 ? inlineNotifications[0] : null;

    if (visibleNotification?.id !== nextNotification?.id) {
      setVisibleNotification(nextNotification); // Set content first
      
      if (nextNotification) {
        // Start animation from current values (or initial state if first render)
        opacity.value = withTiming(1, { 
          duration: TIMING.ENTRY_DURATION, 
          easing: Easing.out(Easing.cubic) 
        });
        scale.value = withTiming(1, { 
          duration: TIMING.ENTRY_DURATION, 
          easing: Easing.out(Easing.cubic) 
        });
      } else {
        // If next is null, instantly reset to base state (invisible)
        // Although exiting animation should handle this visually
        opacity.value = 0;
        scale.value = TIMING.ENTRY_SCALE_START;
      }
    }
  }, [notifications, visibleNotification, opacity, scale]);

  // Dismiss handler using Reanimated (Fade + Scale)
  const handleDismiss = useCallback(() => {
    if (!visibleNotification) return;

    const dismissedId = visibleNotification.id;

    // Animate out (Fade + Scale)
    opacity.value = withTiming(0, {
      duration: TIMING.EXIT_DURATION,
      easing: Easing.in(Easing.ease), // Use ease-in for exit
    });
    scale.value = withTiming(TIMING.EXIT_SCALE_TARGET, {
      duration: TIMING.EXIT_DURATION,
      easing: Easing.in(Easing.ease),
    }, (finished) => {
      if (finished && onDismiss) {
        runOnJS(onDismiss)(dismissedId);
        // Opacity/Scale will be reset by useEffect when next notification appears
      }
    });

  }, [visibleNotification, onDismiss, opacity, scale]);

  // Animated style for the container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }], // Use scale instead of translateY
      borderRadius: borderRadius.lg,
    };
  });

  // Return null if no visible notification (or if animating out, opacity handles visual)
  if (!visibleNotification) {
    return null;
  }

  return (
    <Reanimated.View style={[styles.container, style, animatedStyle]}>
      <NotificationCard
        title={visibleNotification.title}
        message={visibleNotification.message}
        icon={visibleNotification.icon}
        accentColor={visibleNotification.accentColor}
        actionLabel={visibleNotification.actionLabel}
        linkTo={visibleNotification.linkTo}
        onDismiss={handleDismiss}
        size={visibleNotification.size}
      />
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
}); 