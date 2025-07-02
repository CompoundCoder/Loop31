import { HEADER_TOTAL_HEIGHT } from '@/components/AnimatedHeader';

export const LAYOUT = {
  screen: {
    horizontalPadding: 16,
  },
  content: {
    horizontalMargin: 16, // spacing.lg (16px) for consistent content width
    cardSpacing: 16, // spacing.lg (16px) for vertical gaps
  },
} as const;

/**
 * Screen layout constants for consistent spacing and padding across all screens
 */
export const SCREEN_LAYOUT = {
  content: {
    topPadding: HEADER_TOTAL_HEIGHT,
    firstItemTopMargin: -24, // Negative margin for first item overlap with header
    horizontalPadding: LAYOUT.content.horizontalMargin,
    sectionSpacing: LAYOUT.content.cardSpacing,
    listItemSpacing: LAYOUT.content.cardSpacing,
  },
} as const; 