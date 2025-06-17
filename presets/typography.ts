import { TextStyle } from 'react-native';
import lightTheme from '@/theme/theme';

const { typography } = lightTheme;

/**
 * ========================================================================
 * A. Page & Section Titles
 *
 * Presets for main headings and section titles across screens.
 * ========================================================================
 */

/**
 * The primary, largest title on a screen.
 * Used for the main heading of a detail page like LoopDetailsScreen.
 */
export const screenTitle: TextStyle = {
  fontSize: 28,
  fontWeight: typography.fontWeight.bold,
};

/**
 * A title for a distinct content section within a screen (e.g., "Up Next", "Quick Insights").
 */
export const sectionTitle: TextStyle = {
  fontSize: 22,
  fontWeight: typography.fontWeight.bold,
};

/**
 * A smaller, secondary title used for sub-labels or less important text.
 */
export const inputLabel: TextStyle = {
  fontSize: typography.fontSize.body,
  fontWeight: typography.fontWeight.regular,
  opacity: 0.7,
};

/**
 * The title style used in a sticky/animated header that appears on scroll.
 */
export const pageHeaderTitle: TextStyle = {
  fontSize: 17,
  fontWeight: '600', // Semibold
};

/**
 * ========================================================================
 * B. Card & Component-Specific Text
 *
 * Text styles tailored for specific components like PostCard.
 * ========================================================================
 */

/**
 * A smaller caption variant for compact cards (e.g., PostCardS).
 */
export const captionSmall: TextStyle = {
  fontSize: typography.fontSize.body, // 14px
  fontWeight: typography.fontWeight.regular,
  lineHeight: 18,
};

/**
 * ========================================================================
 * C. Metadata & Secondary Text
 *
 * Styles for less prominent text like dates, counts, or statuses.
 * ========================================================================
 */

/**
 * Standard text style for metadata rows (e.g., post count on LoopDetailsScreen).
 */
export const metadataText: TextStyle = {
  fontSize: 15,
  fontWeight: typography.fontWeight.regular,
  opacity: 0.8,
};

/**
 * A smaller variant of metadata text, typically used in dense list items like LoopCard.
 */
export const metadataTextSmall: TextStyle = {
  fontSize: 13,
  fontWeight: typography.fontWeight.regular,
  opacity: 0.7, // Slightly more subtle
}; 