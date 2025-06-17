import { ViewStyle } from 'react-native';
import { spacing } from '@/theme/theme';
import { SCREEN_LAYOUT } from '@/constants/layout';

/**
 * ========================================================================
 * A. Container & Screen Layouts
 * ========================================================================
 */

/**
 * A basic container that fills the available space.
 * Used as the root view for most screens.
 */
export const screenContainer: ViewStyle = {
  flex: 1,
};

/**
 * The standard padding for the main scrollable content area on a screen.
 * Accounts for the animated header and bottom navigation space.
 */
export const screenContentPadding: ViewStyle = {
  paddingTop: SCREEN_LAYOUT.content.topPadding + spacing.md,
  paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
  paddingBottom: spacing.lg,
};

/**
 * Simple vertical padding for lists that don't have complex headers.
 */
export const listVerticalPadding: ViewStyle = {
  paddingVertical: spacing.md,
};

/**
 * ========================================================================
 * B. Row & Item Layouts
 * ========================================================================
 */

/**
 * A row layout that places items at each end, typically a title and an action.
 * Common in screen headers or settings rows.
 */
export const headerActionRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

/**
 * A standard row for displaying metadata text and icons below a title.
 */
export const metadataRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: spacing.sm,
  opacity: 0.7, // Note: Consider moving opacity to a color token if it varies
};

/**
 * A more compact metadata row, often used within list items.
 */
export const metadataRowSmall: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: spacing.xs,
};

/**
 * ========================================================================
 * C. Component-Specific Layouts
 * ========================================================================
 */

/**
 * Base properties for a horizontal, snapping carousel component.
 * Note: `snapToInterval` is dynamic and must be applied in the component.
 */
export const horizontalCarousel: object = {
  snapToAlignment: 'start',
  decelerationRate: 'fast',
};

/**
 * Defines the necessary padding for a full-bleed horizontal carousel.
 * The right padding is calculated dynamically in the component to ensure
 * the last item can snap correctly to the start.
 */
export const horizontalCarouselPadding = (
  screenWidth: number,
  cardWidth: number
): ViewStyle => ({
  paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
  // Ensures there's enough space on the right for the last card to snap to the left edge
  paddingRight:
    screenWidth - cardWidth - SCREEN_LAYOUT.content.horizontalPadding,
}); 