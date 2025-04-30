export interface BaseCardProps {
  /**
   * Unique identifier for the card (for animation, dismissal, etc.)
   */
  id: string;
  /**
   * The type of card (e.g., 'reminder', 'alert', 'tip', etc.)
   */
  type: string;
  /**
   * Optional callback when the card is pressed (for navigation or action)
   */
  onPress?: () => void;
  /**
   * Callback when the card is dismissed (required)
   */
  onDismiss: () => void;
  /**
   * Whether the card is currently being dismissed (for animation)
   */
  isDismissing?: boolean;
  /**
   * Optional test ID for testing
   */
  testID?: string;
} 