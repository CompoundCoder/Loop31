import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated, {
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing, 
  runOnJS 
} from 'react-native-reanimated';
import { NotificationCard } from './NotificationCard';
import type { NotificationItem } from '@/modules/notifications';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface NotificationStackFeedProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

// Copied animation timing from Inline stack
const TIMING = {
  ENTRY_DURATION: 400, 
  EXIT_DURATION: 450,
  EXIT_SCALE_TARGET: 0.95, 
  ENTRY_SCALE_START: 0.95, 
} as const;

export const NotificationStackFeed: React.FC<NotificationStackFeedProps> = ({ 
  notifications,
  onDismiss
}) => {
  const { spacing, borderRadius } = useThemeStyles(); // Added borderRadius

  // --- State and Animation Logic from Inline Stack --- 
  const [visibleNotification, setVisibleNotification] = useState<NotificationItem | null>(null);
  const opacity = useSharedValue(0);
  const scale = useSharedValue<number>(TIMING.ENTRY_SCALE_START);

  // Update visible notification and trigger entry animation
  useEffect(() => {
    // Filter for notifications intended for the main feed
    const feedNotifications = notifications.filter(
      (item) => item.displayTarget === 'mainFeed' // <-- Filter for mainFeed
    );
    // Take the first item from the *filtered* list
    const nextNotification = feedNotifications.length > 0 ? feedNotifications[0] : null;

    // Logic copied from Inline, comparing IDs and setting animations
    if (visibleNotification?.id !== nextNotification?.id) {
      setVisibleNotification(nextNotification); 
      
      if (nextNotification) {
        opacity.value = withTiming(1, { duration: TIMING.ENTRY_DURATION, easing: Easing.out(Easing.cubic) });
        scale.value = withTiming(1, { duration: TIMING.ENTRY_DURATION, easing: Easing.out(Easing.cubic) });
      } else {
        opacity.value = 0;
        scale.value = TIMING.ENTRY_SCALE_START;
      }
    }
  }, [notifications, visibleNotification, opacity, scale]);

  // Dismiss handler using Reanimated (Fade + Scale) - Copied from Inline
  const handleDismiss = useCallback(() => {
    if (!visibleNotification) return;
    const dismissedId = visibleNotification.id;
    opacity.value = withTiming(0, { duration: TIMING.EXIT_DURATION, easing: Easing.in(Easing.ease) });
    scale.value = withTiming(TIMING.EXIT_SCALE_TARGET, {
      duration: TIMING.EXIT_DURATION,
      easing: Easing.in(Easing.ease),
    }, (finished) => {
      if (finished && onDismiss) {
        runOnJS(onDismiss)(dismissedId);
      }
    });
  }, [visibleNotification, onDismiss, opacity, scale]);

  // Animated style for the container - Copied from Inline
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
      borderRadius: borderRadius.lg, // Apply border radius for consistency
    };
  });

  // Return null if no visible notification
  if (!visibleNotification) {
    return null;
  }

  // --- Render single card within animated view --- 
  return (
    <Reanimated.View style={[styles.container, animatedStyle]}>
      <NotificationCard
        // Spread item props and ensure size is large
        {...visibleNotification} 
        size={visibleNotification.size || 'lg'} 
        // Pass the dismiss handler
        onDismiss={handleDismiss} 
      />
    </Reanimated.View>
  );
};

// Added container style from Inline stack for overflow/width
const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden', // Important for scale animation
  },
}); 