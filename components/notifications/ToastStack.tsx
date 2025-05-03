import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Dimensions, Platform, SafeAreaView } from 'react-native';
import Reanimated, { Layout } from 'react-native-reanimated';
import { useNotifications, NotificationItem } from '@/modules/notifications';
import { ToastNotification } from './ToastNotification';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AUTO_DISMISS_DURATION = 1000; // 1 second
const PADDING_ABOVE_SAFE_AREA = 60; // Set padding to 60

export const ToastStack: React.FC = () => {
  const { notifications, dismissNotification } = useNotifications();
  const [visibleToast, setVisibleToast] = useState<NotificationItem | null>(null);
  const insets = useSafeAreaInsets();

  // Find the latest toast notification
  useEffect(() => {
    const toastNotifications = notifications.filter(n => n.displayTarget === 'toast');
    const latestToast = toastNotifications.length > 0 ? toastNotifications[toastNotifications.length - 1] : null;

    // Only update if the latest toast is different from the currently visible one
    if (latestToast?.id !== visibleToast?.id) {
      setVisibleToast(latestToast);
    }
  }, [notifications, visibleToast?.id]);

  // Auto-dismiss the visible toast
  useEffect(() => {
    if (visibleToast) {
      const timer = setTimeout(() => {
        handleDismiss(visibleToast.id);
      }, AUTO_DISMISS_DURATION);

      // Clear timeout if the toast changes or component unmounts
      return () => clearTimeout(timer);
    }
  }, [visibleToast]); // Dependency on visibleToast object itself

  // Manual dismiss handler
  const handleDismiss = useCallback((id: string) => {
    // Only dismiss from the global state.
    // The useEffect watching [notifications] will handle setting visibleToast to null,
    // which will trigger the FadeOut animation in ToastNotification upon unmount.
    dismissNotification(id);
    
  }, [dismissNotification]);

  // If no toast to show, render nothing
  if (!visibleToast) {
    return null;
  }

  return (
    // Use View for absolute positioning.
    <View 
      style={[
        styles.container,
        // Position relative to the safe area bottom inset
        { bottom: insets.bottom + PADDING_ABOVE_SAFE_AREA }, 
      ]}
      pointerEvents="box-none" // Allow touches to pass through the container
    >
      {/* 
        Layout animation helps if we ever decide to stack multiple toasts, 
        but for a single toast, ToastNotification's enter/exit is enough.
        <Reanimated.Layout animation={Layout.springify()}> 
      */}
      <ToastNotification
        key={visibleToast.id} // Ensure component remounts on change
        notification={visibleToast}
        onDismiss={() => handleDismiss(visibleToast.id)}
      />
      {/* </Reanimated.Layout> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center', // Center the ToastNotification horizontally
    zIndex: 1000, // Ensure it's above other content
  },
}); 