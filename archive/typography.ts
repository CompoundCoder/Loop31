// 🔒 Archived preset - not currently used
import { TextStyle } from 'react-native';
import lightTheme from '@/theme/theme';

const { typography } = lightTheme;

/**
 * The main caption style for standard content cards (e.g., PostCard).
 */
export const cardCaption: TextStyle = {
  fontSize: typography.fontSize.subtitle, // 16px
  fontWeight: typography.fontWeight.regular,
  lineHeight: 22,
};

/**
 * A smaller, secondary title, often used as a subtitle for a section.
 */
export const sectionSubtitle: TextStyle = {
  fontSize: typography.fontSize.body,
  fontWeight: typography.fontWeight.regular,
  opacity: 0.7,
}; 