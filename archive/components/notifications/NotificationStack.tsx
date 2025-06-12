import React, { useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { NotificationCard } from './NotificationCard';
import { useDismissableCard } from '@/hooks/useDismissableCard';
import type { LinkProps } from 'expo-router';
import type { NotificationItem as GlobalNotificationItem } from '@/modules/notifications';

interface NotificationStackProps {
  notifications: GlobalNotificationItem[];
  onDismiss: (id: string) => void;
  onPress?: (notification: GlobalNotificationItem) => void;
}

export const NotificationStack = ({
  notifications,
  onDismiss,
  onPress,
}: NotificationStackProps) => {
  const { spacing } = useThemeStyles();

  const handlePress = useCallback((notification: GlobalNotificationItem) => {
    if (onPress) {
      onPress(notification);
    }
  }, [onPress]);

  const handleDismiss = useCallback((id: string) => {
    onDismiss(id);
  }, [onDismiss]);

  // Return null if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.md }]}>
      {notifications.map((notification, index) => (
        <NotificationCardContainer
          key={notification.id}
          notification={notification}
          index={index}
          spacing={spacing.md}
          onPress={handlePress}
          onDismiss={handleDismiss}
        />
      ))}
    </View>
  );
};

// Separate component to handle individual card animations
const NotificationCardContainer = ({
  notification,
  index,
  spacing,
  onPress,
  onDismiss,
}: {
  notification: GlobalNotificationItem;
  index: number;
  spacing: number;
  onPress: (notification: GlobalNotificationItem) => void;
  onDismiss: (id: string) => void;
}) => {
  const { fadeAnim, scaleAnim, animateDismiss } = useDismissableCard({
    onEnd: () => onDismiss(notification.id),
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        index > 0 && { marginTop: spacing },
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <NotificationCard
        title={notification.title}
        message={notification.message}
        actionLabel={notification.actionLabel}
        icon={notification.icon}
        accentColor={notification.accentColor}
        linkTo={notification.linkTo}
        onPress={() => onPress(notification)}
        onDismiss={animateDismiss}
        showDismissButton={true}
        size={notification.size}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cardContainer: {
    width: '100%',
  },
}); 