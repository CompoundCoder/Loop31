import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { View, LayoutAnimation, Platform, UIManager, Animated, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useRouter } from 'expo-router';
import ReminderCard from './ReminderCard';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Enhanced animation configurations
const AnimationPresets = {
  easeInOut: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
      springDamping: 0.7,
    },
  },
  spring: {
    duration: 400,
    create: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.7,
    },
    update: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.7,
    },
    delete: {
      type: LayoutAnimation.Types.spring,
      property: LayoutAnimation.Properties.scaleXY,
      springDamping: 0.7,
    },
  },
  collapse: {
    duration: 250,
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
  },
};

export type NotificationItem = {
  id: string;
  type: 'reminder' | 'alert' | 'tip';
  title: string;
  message: string;
  icon: string;
  actionLabel: string;
  // The screen to navigate to when card is pressed
  navigationTarget?: 'Home' | 'Scheduled' | 'Published' | 'Loops' | 'Analytics' | 'You';
  // Optional accent color for the card
  accentColor?: string;
  // Optional data to pass to the navigation target
  navigationParams?: Record<string, any>;
};

type NotificationContextType = {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
  const dismissTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const router = useRouter();

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(dismissTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
    };
    
    LayoutAnimation.configureNext(AnimationPresets.spring);
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    // Mark the notification as dismissing
    setDismissingIds(prev => new Set(prev).add(id));

    // Configure collapse animation
    LayoutAnimation.configureNext(AnimationPresets.collapse);

    // Set a timeout to actually remove the notification
    dismissTimeouts.current[id] = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDismissingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      delete dismissTimeouts.current[id];
    }, 300); // Slightly longer than animation duration to ensure smooth transition
  }, []);

  const clearAllNotifications = useCallback(() => {
    // Mark all notifications as dismissing
    setDismissingIds(prev => new Set([...prev, ...notifications.map(n => n.id)]));

    // Configure collapse animation
    LayoutAnimation.configureNext(AnimationPresets.collapse);

    // Clear with staggered delay
    notifications.forEach((notification, index) => {
      dismissTimeouts.current[notification.id] = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setDismissingIds(prev => {
          const next = new Set(prev);
          next.delete(notification.id);
          return next;
        });
        delete dismissTimeouts.current[notification.id];
      }, 100 * index); // Stagger the removal
    });
  }, [notifications]);

  const handleCardPress = useCallback((notification: NotificationItem) => {
    if (notification.navigationTarget) {
      // Navigate using expo-router with proper path format
      router.push({
        pathname: '/tabs',
        params: {
          screen: notification.navigationTarget.toLowerCase(),
          ...notification.navigationParams,
        },
      });

      // Optionally dismiss the notification after navigation
      dismissNotification(notification.id);
    }
  }, [router]);

  const value = {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationStack 
        notifications={notifications}
        dismissingIds={dismissingIds}
        onDismiss={dismissNotification}
        onCardPress={handleCardPress}
      />
    </NotificationContext.Provider>
  );
};

// Example usage function
export const useAddNotification = () => {
  const { addNotification } = useNotifications();

  const showScheduledPostReminder = (postId: string, postTitle: string) => {
    addNotification({
      type: 'reminder',
      title: 'Post Due Soon',
      message: `Your post "${postTitle}" is scheduled to publish in 1 hour`,
      icon: 'clock-outline',
      actionLabel: 'View Post',
      navigationTarget: 'Scheduled',
      navigationParams: { postId },
      accentColor: '#FF6B6B', // Example color for urgency
    });
  };

  const showLoopCreatedAlert = (loopId: string, loopName: string) => {
    addNotification({
      type: 'alert',
      title: 'Loop Created',
      message: `Your new loop "${loopName}" has been created successfully`,
      icon: 'repeat',
      actionLabel: 'View Loop',
      navigationTarget: 'Loops',
      navigationParams: { loopId },
      accentColor: '#4CAF50', // Success green
    });
  };

  const showAnalyticsTip = (metricId: string) => {
    addNotification({
      type: 'tip',
      title: 'Analytics Insight',
      message: 'Your engagement rate has increased by 25% this week',
      icon: 'chart-line',
      actionLabel: 'View Details',
      navigationTarget: 'Analytics',
      navigationParams: { metricId },
      accentColor: '#2196F3', // Info blue
    });
  };

  return {
    showScheduledPostReminder,
    showLoopCreatedAlert,
    showAnalyticsTip,
  };
};

type NotificationStackProps = {
  notifications: NotificationItem[];
  dismissingIds: Set<string>;
  onDismiss: (id: string) => void;
  onCardPress: (notification: NotificationItem) => void;
};

export default function NotificationStack({ 
  notifications,
  dismissingIds,
  onDismiss,
  onCardPress,
}: NotificationStackProps) {
  const { spacing } = useThemeStyles();
  const [fadeAnims] = useState(() => 
    notifications.map(() => new Animated.Value(0))
  );

  // Handle staggered fade-in animations for notifications
  useEffect(() => {
    fadeAnims.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  if (notifications.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.stack, { gap: spacing.md }]}>
        {notifications.map((notification, index) => (
          <Animated.View
            key={notification.id}
            style={[
              styles.cardContainer,
              {
                opacity: fadeAnims[index],
                transform: [{
                  translateY: fadeAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              },
            ]}
          >
            <ReminderCard
              title={notification.title}
              message={notification.message}
              icon={notification.icon as any}
              actionLabel={notification.actionLabel}
              accentColor={notification.accentColor}
              isDismissing={dismissingIds.has(notification.id)}
              onPress={() => onCardPress(notification)}
              onDismiss={() => onDismiss(notification.id)}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  stack: {
    paddingHorizontal: 16,
  },
  cardContainer: {
    position: 'relative',
  },
}); 