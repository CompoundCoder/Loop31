import { ViewStyle, ImageStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { lightTheme } from '@/theme/theme';

const { spacing, borderRadius, elevation, colors } = lightTheme;

/**
 * ========================================================================
 * A. Card Presets
 *
 * Reusable styles for base card components and their variants.
 * ========================================================================
 */

/**
 * The default container style for a standard content card.
 * Includes padding, border radius, background color, and a subtle shadow.
 */
export const cardContainer: ViewStyle = {
  borderRadius: borderRadius.lg, // 16px
  backgroundColor: colors.card,
  ...elevation.sm,
};

/**
 * A more compact card variant, with tighter padding and smaller radius.
 */
export const cardVariantCompact: ViewStyle = {
  padding: spacing.sm, // 8px
  borderRadius: borderRadius.sm, // 8px
  backgroundColor: colors.card,
  ...elevation.xs,
};

/**
 * A featured card variant with a more prominent shadow.
 */
export const cardVariantFeatured: ViewStyle = {
  ...cardContainer,
  ...elevation.md,
};

/**
 * Standard styling for media (images/videos) within a card.
 * Enforces a consistent aspect ratio.
 */
export const cardImage: ImageStyle = {
  aspectRatio: 7 / 5, // ~1.4
  width: '100%',
  borderRadius: borderRadius.lg,
  borderBottomLeftRadius: 0, // Often flat on the bottom where content is
  borderBottomRightRadius: 0,
};

/**
 * A different aspect ratio for featured card images.
 */
export const cardImageFeatured: ImageStyle = {
  ...cardImage,
  aspectRatio: 16 / 9, // ~1.77
};


/**
 * ========================================================================
 * B. List Item Presets
 *
 * Styles for items appearing in a list, like LoopCard.
 * ========================================================================
 */

/**
 * Base container for a standard list item row.
 * Includes padding and a bottom border for separation.
 */
export const listItemContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  padding: spacing.md, // 16px
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.border,
  borderRadius: borderRadius.lg, // 16px
  backgroundColor: colors.card,
  ...elevation.sm,
};

/**
 * The container for the small preview image in a list item.
 */
export const listItemPreviewImageContainer: ViewStyle = {
  width: 56,
  height: 56,
  borderRadius: borderRadius.md,
  backgroundColor: colors.border,
  marginRight: spacing.md,
  overflow: 'hidden',
}; 