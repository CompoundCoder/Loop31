import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type {
  NotificationContextValue,
  NotificationItem,
  NotificationInput,
} from './types';
import { dispatchInitialNotifications } from './notificationLogic';

// Create context with a default value
const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  addNotification: () => {},
  dismissNotification: () => {},
  clearAllNotifications: () => {},
});

// Generate a unique ID for each notification
const generateId = () => Math.random().toString(36).substring(2, 10);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  // State for notifications array
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const initialDispatchDone = useRef(false);

  // Add a new notification
  const addNotification = useCallback((notification: NotificationInput) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: generateId(),
      // Ensure accentColor has a default value
      accentColor: notification.accentColor || '#007AFF',
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  // Dismiss a notification by ID
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      notifications,
      addNotification,
      dismissNotification,
      clearAllNotifications,
    }),
    [notifications, addNotification, dismissNotification, clearAllNotifications]
  );

  // Trigger initial notifications *only once* on mount
  useEffect(() => {
    if (!initialDispatchDone.current) {
      dispatchInitialNotifications(addNotification);
      initialDispatchDone.current = true;
    }
  }, [addNotification]);

  // Handle notification press
  const handleNotificationPress = useCallback((notification: NotificationItem) => {
    // Press handling can be added here if needed
    // Currently, linkTo prop handles navigation automatically
  }, []);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const styles = StyleSheet.create({}); 