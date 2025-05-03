import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Reanimated, { Layout, FadeOut, FadeIn } from 'react-native-reanimated';
import { NotificationCard } from './NotificationCard';
import type { NotificationItem } from '@/modules/notifications';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface NotificationStackFeedProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  target: NotificationItem['displayTarget'];
}

export const NotificationStackFeed: React.FC<NotificationStackFeedProps> = React.memo(({ 
  notifications,
  onDismiss,
  target
}) => {
  const { spacing } = useThemeStyles(); 

  // Filter notifications based on the passed target prop
  const feedNotifications = notifications.filter(
    (item) => item.displayTarget === target
  );

  // Directly call parent onDismiss when card's internal dismiss animation finishes
  const handleDismiss = useCallback((id: string) => {
    onDismiss(id);
  }, [onDismiss]);

  // Return null if no feed notifications
  if (feedNotifications.length === 0) {
    return null;
  }

  // Render all feed notifications vertically
  return (
    <View style={styles.container}>
      {feedNotifications.map((notification) => (
        // Remove layout, add entering fade animation
        <Reanimated.View 
          key={notification.id} 
          // layout={Layout.springify().delay(100)} // REMOVE layout animation
          entering={FadeIn.duration(300)} // ADD simple fade-in
          exiting={FadeOut.duration(300)} 
          style={{ marginBottom: spacing.md }} 
        >
          <NotificationCard
            {...notification} 
            onDismiss={() => handleDismiss(notification.id)} 
            // Let card handle its own size, or force lg?
            // size={notification.size || 'lg'} 
          />
        </Reanimated.View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // No overflow hidden needed now
  },
}); 