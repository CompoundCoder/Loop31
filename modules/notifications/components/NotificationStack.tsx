import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { View, LayoutAnimation, Platform, UIManager, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useRouter } from 'expo-router';
import { cardRegistry, CardType } from '../cards/cardRegistry';
import { NOTIFICATION_TYPES } from '../index';
import { Snackbar } from 'react-native-paper';

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
} as const;

// Storage keys
const STORAGE_KEYS = {
  NOTIFICATIONS: '@notifications/items',
  DISMISSED_IDS: '@notifications/dismissed',
} as const;

export type NotificationItem = {
  id: string;
  type: keyof typeof NOTIFICATION_TYPES;
  title: string;
  message: string;
  icon: string;
  actionLabel: string;
  navigationTarget?: 'Home' | 'Scheduled' | 'Published' | 'Loops' | 'Analytics' | 'You';
  accentColor?: string;
  navigationParams?: Record<string, any>;
  // Add expiry date for auto-cleanup
  expiresAt?: number;
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
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const dismissTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const router = useRouter();
  const [undoVisible, setUndoVisible] = useState(false);
  const [lastDismissed, setLastDismissed] = useState<NotificationItem | null>(null);

  // Load persisted notifications and dismissed IDs
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [notificationsJson, dismissedIdsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.DISMISSED_IDS),
        ]);

        if (notificationsJson) {
          const parsedNotifications: NotificationItem[] = JSON.parse(notificationsJson);
          // Filter out expired notifications
          const now = Date.now();
          const validNotifications = parsedNotifications.filter(
            n => !n.expiresAt || n.expiresAt > now
          );
          setNotifications(validNotifications);

          // Clean up if we filtered any expired notifications
          if (validNotifications.length !== parsedNotifications.length) {
            AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(validNotifications));
          }
        }

        if (dismissedIdsJson) {
          setDismissedIds(new Set(JSON.parse(dismissedIdsJson)));
        }
      } catch (error) {
        console.warn('Error loading persisted notifications:', error);
      }
    };

    loadPersistedData();
  }, []);

  // Persist notifications when they change
  useEffect(() => {
    const persistNotifications = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      } catch (error) {
        console.warn('Error persisting notifications:', error);
      }
    };

    persistNotifications();
  }, [notifications]);

  // Persist dismissed IDs when they change
  useEffect(() => {
    const persistDismissedIds = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.DISMISSED_IDS, JSON.stringify([...dismissedIds]));
      } catch (error) {
        console.warn('Error persisting dismissed IDs:', error);
      }
    };

    persistDismissedIds();
  }, [dismissedIds]);

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
      // Add default expiry of 7 days if not specified
      expiresAt: notification.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    
    // Don't add if already dismissed
    if (dismissedIds.has(newNotification.id)) {
      return;
    }

    LayoutAnimation.configureNext(AnimationPresets.spring);
    setNotifications(prev => [...prev, newNotification]);
  }, [dismissedIds]);

  const dismissNotification = useCallback((id: string) => {
    const notificationToDismiss = notifications.find(n => n.id === id);
    if (notificationToDismiss) {
      setLastDismissed(notificationToDismiss);
      setUndoVisible(true);
    }
    setDismissingIds(prev => new Set(prev).add(id));
    setDismissedIds(prev => new Set(prev).add(id));
    LayoutAnimation.configureNext(AnimationPresets.collapse);
    dismissTimeouts.current[id] = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDismissingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      delete dismissTimeouts.current[id];
    }, 300);
  }, [notifications]);

  const handleUndo = useCallback(() => {
    if (lastDismissed) {
      setNotifications(prev => [...prev, lastDismissed]);
      setDismissedIds(prev => {
        const next = new Set(prev);
        next.delete(lastDismissed.id);
        return next;
      });
      setLastDismissed(null);
      setUndoVisible(false);
    }
  }, [lastDismissed]);

  const clearAllNotifications = useCallback(() => {
    const ids = notifications.map(n => n.id);
    setDismissingIds(prev => new Set([...prev, ...ids]));
    setDismissedIds(prev => new Set([...prev, ...ids]));
    LayoutAnimation.configureNext(AnimationPresets.collapse);

    notifications.forEach((notification, index) => {
      dismissTimeouts.current[notification.id] = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setDismissingIds(prev => {
          const next = new Set(prev);
          next.delete(notification.id);
          return next;
        });
        delete dismissTimeouts.current[notification.id];
      }, 100 * index);
    });
  }, [notifications]);

  const handleCardPress = useCallback((notification: NotificationItem) => {
    if (notification.navigationTarget) {
      router.push({
        pathname: '/tabs',
        params: {
          screen: notification.navigationTarget.toLowerCase(),
          ...notification.navigationParams,
        },
      });

      dismissNotification(notification.id);
    }
  }, [router, dismissNotification]);

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
      <Snackbar
        visible={undoVisible}
        onDismiss={() => setUndoVisible(false)}
        action={{ label: 'Undo', onPress: handleUndo }}
        duration={4000}
      >
        Notification dismissed
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// Convenience hook for adding common notifications
export const useAddNotification = () => {
  const { addNotification } = useNotifications();

  const showScheduledPostReminder = (postId: string, postTitle: string) => {
    addNotification({
      type: 'REMINDER',
      title: 'Post Due Soon',
      message: `Your post "${postTitle}" is scheduled to publish in 1 hour`,
      icon: 'clock-outline',
      actionLabel: 'View Post',
      navigationTarget: 'Scheduled',
      navigationParams: { postId },
      accentColor: '#FF6B6B',
    });
  };

  const showLoopCreatedAlert = (loopId: string, loopName: string) => {
    addNotification({
      type: 'ALERT',
      title: 'Loop Created',
      message: `Your new loop "${loopName}" has been created successfully`,
      icon: 'repeat',
      actionLabel: 'View Loop',
      navigationTarget: 'Loops',
      navigationParams: { loopId },
      accentColor: '#4CAF50',
    });
  };

  const showAnalyticsTip = (metricId: string) => {
    addNotification({
      type: 'TIP',
      title: 'Analytics Insight',
      message: 'Your engagement rate has increased by 25% this week',
      icon: 'chart-line',
      actionLabel: 'View Details',
      navigationTarget: 'Analytics',
      navigationParams: { metricId },
      accentColor: '#2196F3',
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

function NotificationStack({ 
  notifications,
  dismissingIds,
  onDismiss,
  onCardPress,
}: NotificationStackProps) {
  const { spacing } = useThemeStyles();
  const [fadeAnims] = useState(() => 
    notifications.map(() => new Animated.Value(0))
  );

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
        {notifications.map((notification, index) => {
          const type = notification.type?.toLowerCase?.() as CardType;
          const CardComponent = cardRegistry[type] || null;
          if (!CardComponent) return null;
          return (
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
              <CardComponent
                {...notification}
                isDismissing={dismissingIds.has(notification.id)}
                onPress={() => onCardPress(notification)}
                onDismiss={() => onDismiss(notification.id)}
              />
            </Animated.View>
          );
        })}
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

export default NotificationStack; 