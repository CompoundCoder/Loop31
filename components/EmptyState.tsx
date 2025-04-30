import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ExtendedTheme } from '../app/_layout';

type EmptyStateProps = {
  /**
   * The main title to display (e.g., "No Posts Yet!")
   */
  title?: string;
  /**
   * An encouraging message to display below the title
   */
  message?: string;
  /**
   * Optional MaterialCommunityIcons icon name to display
   */
  iconName?: string;
  /**
   * Optional action button label
   */
  actionLabel?: string;
  /**
   * Optional action button handler
   */
  onAction?: () => void;
  /**
   * Optional additional content to render below the message
   */
  children?: React.ReactNode;
  /**
   * Whether to show loading skeleton
   */
  isLoading?: boolean;
  /**
   * Optional container style overrides
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Optional title style overrides
   */
  titleStyle?: StyleProp<TextStyle>;
  /**
   * Optional message style overrides
   */
  messageStyle?: StyleProp<TextStyle>;
  /**
   * Optional button style overrides
   */
  buttonStyle?: StyleProp<ViewStyle>;
  /**
   * Optional background color override
   */
  backgroundColor?: string;
  /**
   * Optional accent color override
   */
  accentColor?: string;
};

function EmptyState({
  title = "Let's Get Started!",
  message = "Take your first step towards consistent growth 🌱",
  iconName,
  actionLabel,
  onAction,
  children,
  isLoading = false,
  containerStyle,
  titleStyle,
  messageStyle,
  buttonStyle,
  backgroundColor,
  accentColor,
}: EmptyStateProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const elevation = Platform.select({
    ios: {
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  });

  if (isLoading) {
    return (
      <View style={[
        styles.container,
        { 
          padding: theme.spacing.xl,
          backgroundColor: backgroundColor || theme.colors.background,
        },
        containerStyle,
      ]}>
        {/* Skeleton Icon */}
        <View style={[
          styles.skeletonIcon,
          { 
            backgroundColor: theme.colors.border,
            marginBottom: theme.spacing.md,
            borderRadius: theme.borderRadius.full,
          }
        ]} />

        {/* Skeleton Title */}
        <View style={[
          styles.skeletonTitle,
          { 
            backgroundColor: theme.colors.border,
            marginBottom: theme.spacing.sm,
            borderRadius: theme.borderRadius.sm,
          }
        ]} />

        {/* Skeleton Message */}
        <View style={[
          styles.skeletonMessage,
          { 
            backgroundColor: theme.colors.border,
            marginBottom: theme.spacing.xl,
            borderRadius: theme.borderRadius.sm,
          }
        ]} />

        {/* Skeleton Button */}
        <View style={[
          styles.skeletonButton,
          { 
            backgroundColor: theme.colors.border,
            borderRadius: theme.borderRadius.lg,
          }
        ]} />
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      { 
        padding: theme.spacing.xl,
        backgroundColor: backgroundColor || theme.colors.background,
      },
      containerStyle,
    ]}>
      {/* Icon */}
      {iconName && (
        <View style={[
          styles.iconContainer, 
          { 
            backgroundColor: theme.colors.card,
            marginBottom: theme.spacing.md,
            borderRadius: theme.borderRadius.full,
            ...elevation,
          }
        ]}>
          <MaterialCommunityIcons
            name={iconName as any}
            size={32}
            color={accentColor || theme.colors.primary}
            style={[styles.icon, { opacity: theme.opacity.medium }]}
          />
        </View>
      )}

      {/* Title */}
      <Text style={[
        styles.title, 
        { 
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: theme.spacing.xs,
        },
        titleStyle,
      ]}>
        {title}
      </Text>

      {/* Message */}
      <Text style={[
        styles.message, 
        { 
          color: theme.colors.text,
          fontSize: 16,
          opacity: theme.opacity.medium,
          marginBottom: theme.spacing.xl,
        },
        messageStyle,
      ]}>
        {message}
      </Text>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Pressable
          style={[
            styles.actionButton, 
            { 
              backgroundColor: accentColor || theme.colors.primary,
              paddingHorizontal: theme.spacing.xl,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.lg,
              marginBottom: theme.spacing.md,
            },
            buttonStyle,
          ]}
          onPress={onAction}
        >
          <Text style={[
            styles.actionLabel, 
            { 
              color: theme.colors.background,
              fontSize: 16,
              fontWeight: '500',
            }
          ]}>
            {actionLabel}
          </Text>
        </Pressable>
      )}

      {/* Additional Content */}
      {children}
    </View>
  );
}

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {},
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {},
  actionLabel: {},
  // Skeleton styles
  skeletonIcon: {
    width: 64,
    height: 64,
    opacity: 0.5,
  },
  skeletonTitle: {
    width: 200,
    height: 24,
    opacity: 0.5,
  },
  skeletonMessage: {
    width: 280,
    height: 40,
    opacity: 0.5,
  },
  skeletonButton: {
    width: 160,
    height: 40,
    opacity: 0.5,
  },
}); 