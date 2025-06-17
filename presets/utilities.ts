import { StyleSheet, ViewStyle } from 'react-native';
import { lightTheme } from '@/theme/theme';

const { spacing } = lightTheme;

/**
 * ========================================================================
 * A. Layout & Positioning Tokens
 * ========================================================================
 */

/**
 * Z-index values for managing layers and stacking order.
 */
export const zIndex = {
  base: 1,
  header: 10,
  modal: 100,
  overlay: 50,
} as const;

/**
 * A utility style to automatically push an element to the far right of a flex container.
 * Useful for switches or action buttons in a row.
 */
export const alignFarRight: ViewStyle = {
  marginLeft: 'auto',
};

/**
 * Common gap values, aliased from the theme's spacing system for clarity in components.
 */
export const commonGaps = {
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
} as const;

/**
 * ========================================================================
 * B. Sizing & Dimension Tokens
 * ========================================================================
 */

/**
 * Common aspect ratios for images and media containers.
 */
export const aspectRatios = {
  square: 1,
  landscape: 16 / 9,
  portrait: 3 / 4,
  cardDefault: 7 / 5,
} as const;

/**
 * Standardized image dimension constants.
 */
export const imageSizes = {
  thumbnail: 56,
} as const;

/**
 * Standardized border widths.
 */
export const borderWidths = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  regular: 2,
} as const; 