// Re-export all notification components and hooks
export { default as NotificationStack } from './components/NotificationStack';
export { default as ReminderCard } from './components/ReminderCard';
export {
  NotificationProvider,
  useNotifications,
  useAddNotification,
} from './components/NotificationStack';
export type { NotificationItem } from './components/NotificationStack';

// Constants
export const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  ALERT: 'alert',
  TIP: 'tip',
} as const;

// Type utilities
export type NotificationType = keyof typeof NOTIFICATION_TYPES; 