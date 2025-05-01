import type { LinkProps } from 'expo-router';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type NotificationSize = 'sm' | 'md' | 'lg';

/**
 * Represents a notification item within the system.
 */
export interface NotificationItem {
  id: string;
  /** Main heading of the notification. Keep concise (e.g., < 30 chars for md). */
  title: string;
  /** Body text. Keep brief (e.g., < 100 chars for md) for consistent height. */
  message: string;
  /** Name of the MaterialCommunityIcon to display. */
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Accent color for the icon and action label. */
  accentColor: string;
  /** Optional text for a call-to-action button/link. */
  actionLabel?: string;
  /** Optional Expo Router link target for press actions. */
  linkTo?: LinkProps['href'];
  /** Size variant of the card. Affects padding, font size, and line limits. */
  size?: NotificationSize;
  /** Target area where this notification should be displayed. */
  displayTarget: 'inline' | 'mainFeed';
}

/**
 * Input type for creating new notifications (ID is generated automatically).
 */
export type NotificationInput = Omit<NotificationItem, 'id'> & {
  /** Accent color can be optional on input, provider uses default if missing. */
  accentColor?: string;
};

/**
 * Shape of the global notification context value.
 */
export interface NotificationContextValue {
  notifications: NotificationItem[];
  addNotification: (notification: NotificationInput) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
} 