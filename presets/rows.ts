import { ViewStyle } from 'react-native';
import { lightTheme } from '@/theme/theme';

const { spacing, opacity } = lightTheme;

/**
 * ========================================================================
 * A. Generic Row Layouts
 *
 * Base row structures for common flexbox patterns.
 * ========================================================================
 */

/**
 * A row that places child elements at each end.
 * Perfect for headers with a title on the left and actions on the right.
 */
export const headerActionRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

/**
 * A basic row for aligning items horizontally with a default gap.
 * Ideal for an icon followed by text.
 */
export const iconTextRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
};

/**
 * ========================================================================
 * B. Specialized Row Layouts
 *
 * Rows tailored for specific, recurring UI patterns like metadata or buttons.
 * ========================================================================
 */

/**
 * A row for displaying secondary information, like post counts or dates.
 * It's slightly transparent to de-emphasize it.
 */
export const metadataRow: ViewStyle = {
  ...iconTextRow,
  marginTop: spacing.sm,
  opacity: opacity.medium, // ~70%
};

/**
 * A more compact version of the metadata row, often used inside list items.
 */
export const metadataRowSmall: ViewStyle = {
  ...iconTextRow,
  gap: spacing.xs,
  marginTop: spacing.xs,
};

/**
 * A row designed to space out action buttons evenly.
 * Common at the bottom of forms or modals.
 */
export const buttonRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  marginTop: spacing.lg,
}; 