import * as ExpoHaptics from 'expo-haptics';

export const Haptics = {
  /**
   * Trigger light impact feedback
   */
  impactLight: () => {
    try {
      ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail if haptics are not available
    }
  },

  /**
   * Trigger medium impact feedback
   */
  impactMedium: () => {
    try {
      ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Silently fail if haptics are not available
    }
  },

  /**
   * Trigger heavy impact feedback
   */
  impactHeavy: () => {
    try {
      ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Silently fail if haptics are not available
    }
  },

  /**
   * Trigger selection feedback
   */
  selectionLight: () => {
    try {
      ExpoHaptics.selectionAsync();
    } catch (error) {
      // Silently fail if haptics are not available
    }
  },

  /**
   * Trigger notification feedback
   */
  notification: (type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      ExpoHaptics.notificationAsync(
        type === 'success'
          ? ExpoHaptics.NotificationFeedbackType.Success
          : type === 'warning'
          ? ExpoHaptics.NotificationFeedbackType.Warning
          : ExpoHaptics.NotificationFeedbackType.Error
      );
    } catch (error) {
      // Silently fail if haptics are not available
    }
  },
}; 