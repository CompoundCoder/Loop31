import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Link, type LinkProps } from 'expo-router';
import type { NotificationSize } from '@/modules/notifications';

interface NotificationCardProps {
  size?: NotificationSize;
  title: string;
  message: string;
  actionLabel?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accentColor: string;
  onDismiss?: () => void;
  onPress?: () => void;
  linkTo?: LinkProps['href'];
  showDismissButton?: boolean;
}

const getSizeStyles = (size: NotificationSize) => {
  switch (size) {
    case 'sm':
      return {
        iconSize: 20,
        titleSize: 15,
        messageSize: 13,
        actionSize: 13,
        padding: 12,
        titleLines: 1,
        messageLines: 2,
      };
    case 'lg':
      return {
        iconSize: 28,
        titleSize: 18,
        messageSize: 15,
        actionSize: 15,
        padding: 20,
        titleLines: 2,
        messageLines: 4,
      };
    default: // 'md'
      return {
        iconSize: 24,
        titleSize: 16,
        messageSize: 14,
        actionSize: 14,
        padding: 16,
        titleLines: 1,
        messageLines: 3,
      };
  }
};

export const NotificationCard = ({
  size = 'md',
  title,
  message,
  actionLabel,
  icon,
  accentColor,
  onDismiss,
  onPress,
  linkTo,
  showDismissButton = true,
}: NotificationCardProps) => {
  const { colors, borderRadius, elevation } = useThemeStyles();
  const sizeStyles = getSizeStyles(size);

  const cardContent = (
    <View style={[
      styles.container,
      {
        padding: sizeStyles.padding,
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        ...elevation,
      },
    ]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={sizeStyles.iconSize}
          color={accentColor}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text 
          style={[
            styles.title,
            { fontSize: sizeStyles.titleSize, color: colors.text }
          ]}
          numberOfLines={sizeStyles.titleLines}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text 
          style={[
            styles.message,
            { fontSize: sizeStyles.messageSize, color: colors.text + '99' }
          ]}
          numberOfLines={sizeStyles.messageLines}
          ellipsizeMode="tail"
        >
          {message}
        </Text>
        {actionLabel && (
          <Text style={[
            styles.action,
            {
              fontSize: sizeStyles.actionSize,
              color: accentColor,
              marginTop: sizeStyles.padding / 2,
            }
          ]}>
            {actionLabel}
          </Text>
        )}
      </View>

      {showDismissButton && onDismiss && (
        <TouchableOpacity
          style={[
            styles.dismissButton,
            {
              top: size === 'sm' ? 6 : size === 'lg' ? 12 : 10,
              right: size === 'sm' ? 6 : size === 'lg' ? 12 : 10,
            }
          ]}
          onPress={onDismiss}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={colors.text + '66'}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (linkTo) {
    return <Link href={linkTo}>{cardContent}</Link>;
  }

  return (
    <Pressable onPress={onPress}>
      {cardContent}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    lineHeight: 20,
  },
  action: {
    fontWeight: '500',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
}); 