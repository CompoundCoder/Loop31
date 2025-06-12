import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Reanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { NotificationItem } from '@/modules/notifications';

interface ToastNotificationProps {
  notification: Omit<NotificationItem, 'displayTarget' | 'id'>;
  onDismiss: () => void;
}

const TOAST_HEIGHT = 40; // Can be slightly smaller without icon
const ANIMATION_DURATION = 250; // Faster fade

export const ToastNotification: React.FC<ToastNotificationProps> = React.memo(({
  notification,
  onDismiss,
}) => {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();

  // Determine the text to display
  const displayText = notification.title || notification.message;

  return (
    <Reanimated.View 
      entering={FadeIn.duration(ANIMATION_DURATION)} 
      exiting={FadeOut.duration(ANIMATION_DURATION)}
      style={[
        styles.container,
        { 
          backgroundColor: colors.card, 
          borderRadius: borderRadius.full, // Make it a pill shape
          ...elevation, 
          height: TOAST_HEIGHT,
        }
      ]}
    >
      <Pressable onPress={onDismiss} style={styles.pressable}>
        {/* Icon Removed */}
        {/* 
        <MaterialCommunityIcons 
          name={notification.icon} 
          size={20} 
          color={notification.accentColor || colors.primary} 
          style={{ marginRight: spacing.sm }} 
        /> 
        */}
        <View style={styles.textContainer}>
          {/* Display only title or message */}
          {displayText && (
            <Text 
              style={[styles.text, { color: colors.text }]} 
              numberOfLines={1}
            >
              {displayText}
            </Text>
          )}
        </View>
      </Pressable>
    </Reanimated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 'auto', 
    maxWidth: '90%',
    alignSelf: 'center', 
    justifyContent: 'center',
    overflow: 'hidden', 
    marginBottom: 10, 
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally now
    paddingHorizontal: 20, // More padding for pill shape
    paddingVertical: 8,
    flex: 1, 
  },
  textContainer: {
    flexShrink: 1, // Allow text to shrink if needed, but centered
    justifyContent: 'center',
    alignItems: 'center', // Center text vertically too
  },
  // Combined text style
  text: {
    fontSize: 14,
    fontWeight: '500', // Medium weight often looks good for toasts
    textAlign: 'center',
  },
  // Removed title/message specific styles
}); 