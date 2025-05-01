import type { NotificationInput, NotificationContextValue } from './types';

/**
 * Dispatches initial notifications for testing or onboarding.
 * In a real app, this would contain more complex logic based on user state, etc.
 *
 * @param addNotification - The function to add a notification to the global state.
 */
export function dispatchInitialNotifications(
  addNotification: NotificationContextValue['addNotification']
) {
  // Clear existing notifications first? (Optional, consider implications)
  // clearAllNotifications();

  // Check if notifications should be added (e.g., based on user state)
  // For now, we just add them for testing.

  addNotification({
    title: 'Content Strategy Tip',
    message: 'Try posting at peak hours to maximize engagement. Our data shows your audience is most active between 6-8pm.',
    icon: 'lightbulb-on-outline',
    accentColor: '#FFB800',
    actionLabel: 'View Best Times',
    size: 'md',
    displayTarget: 'inline',
  });

  addNotification({
    title: 'Engagement Milestone',
    message: "Your latest post is performing 45% better than average. Check out what's working!",
    icon: 'trending-up',
    accentColor: '#34C759',
    actionLabel: 'View Analytics',
    size: 'md',
    displayTarget: 'inline',
  });

  addNotification({
    title: 'New Feature: Loops',
    message: 'Automate your content schedule with Loops. Set it up once and let it run!',
    icon: 'sync',
    accentColor: '#5E5CE6', // iOS Purple
    actionLabel: 'Create a Loop',
    size: 'md',
    displayTarget: 'inline',
  });

  // --- Add Notifications for the Main Feed --- 

  addNotification({
    title: 'Weekly Performance Summary',
    message: 'Last week saw a 15% increase in Audience Reach and a 5% rise in Engagement. Consider boosting your top post from last week to capitalize on this momentum. Remember to check detailed analytics for insights.',
    icon: 'chart-line',
    accentColor: '#007AFF', // iOS Blue
    actionLabel: 'View Weekly Report',
    size: 'lg', // Larger size for feed
    displayTarget: 'mainFeed', 
  });

  addNotification({
    title: 'Account Security Recommendation',
    message: 'We recommend enabling two-factor authentication (2FA) to enhance your account security. Protecting your account is crucial, especially as your audience grows.',
    icon: 'shield-lock-outline',
    accentColor: '#FF9500', // iOS Orange
    actionLabel: 'Enable 2FA',
    size: 'lg', 
    displayTarget: 'mainFeed',
  });

  // Add more initial notification logic here...
} 