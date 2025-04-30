import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import type { ExtendedTheme } from '@/app/_layout';
import { Haptics } from '@/utils/haptics';
import type { BaseCardProps } from './BaseCardProps';

export interface ReminderCardProps extends BaseCardProps {
  /**
   * The title of the reminder/notification
   */
  title: string;
  /**
   * The message/description to display
   */
  message: string;
  /**
   * MaterialCommunityIcons icon name for the card
   */
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /**
   * Custom accent color for the icon and action label
   */
  accentColor?: string;
  /**
   * The action button/link label
   */
  actionLabel: string;
  /**
   * Whether to show a loading state
   */
  isLoading?: boolean;
  /**
   * Whether the card is currently being dismissed
   */
  isDismissing?: boolean;
  /**
   * Callback when the card is pressed (for navigation)
   */
  onPress: () => void;
  /**
   * Callback when the dismiss button is pressed
   */
  onDismiss: () => void;
  /**
   * Optional test ID for testing
   */
  testID?: string;
}

export default function ReminderCard({
  id,
  type,
  title,
  message,
  icon,
  accentColor,
  actionLabel,
  isLoading = false,
  isDismissing = false,
  onPress,
  onDismiss,
  testID,
}: ReminderCardProps) {
  const theme = useTheme() as ExtendedTheme;
  const dismissAnim = React.useRef(new Animated.Value(1)).current;
  
  // Use theme accent color if none provided
  const cardAccentColor = accentColor || theme.colors.accent;

  useEffect(() => {
    if (isDismissing) {
      Animated.timing(dismissAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isDismissing]);

  const handleDismiss = () => {
    Haptics.impactLight();
    onDismiss();
  };

  const handlePress = () => {
    if (!isDismissing) {
      Haptics.selectionLight();
      onPress();
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
          }
        ]}
        testID={testID ? `${testID}-loading` : 'reminder-card-loading'}
      >
        {/* Add loading skeleton UI here if needed */}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: dismissAnim,
          transform: [{
            scale: dismissAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          }],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            opacity: pressed && !isDismissing ? 0.7 : 1,
            transform: [{ scale: pressed && !isDismissing ? 0.98 : 1 }],
          }
        ]}
        testID={testID}
        disabled={isDismissing}
      >
        {/* Dismiss Button */}
        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [
            styles.dismissButton,
            {
              opacity: pressed ? 0.7 : theme.opacity.medium,
            }
          ]}
          hitSlop={12}
          testID={testID ? `${testID}-dismiss` : 'reminder-card-dismiss'}
          disabled={isDismissing}
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={theme.colors.text}
          />
        </Pressable>

        {/* Icon and Content */}
        <View style={styles.header}>
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: cardAccentColor + '10',
            }
          ]}>
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={cardAccentColor}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text 
              style={[
                styles.title,
                { color: theme.colors.text }
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text 
              style={[
                styles.message,
                {
                  color: theme.colors.text,
                  opacity: theme.opacity.medium,
                }
              ]}
              numberOfLines={2}
            >
              {message}
            </Text>
          </View>
        </View>

        {/* Action Label */}
        <Text 
          style={[
            styles.action,
            { color: cardAccentColor }
          ]}
          numberOfLines={1}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    padding: 16,
  },
  loadingContainer: {
    height: 100,
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 15,
  },
  action: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 44,
  },
}); 