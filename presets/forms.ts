import { ViewStyle, TextStyle } from 'react-native';
import { type Theme } from '@/theme/theme';

export const getFormsPresets = (theme: Theme) => {
  const { colors, spacing, borderRadius, typography } = theme;

  return {
    /**
     * A container for a logical grouping of form elements.
     * // from components/loops/LoopEditMenu.tsx
     */
    formSection: {
      marginBottom: spacing.xl,
    } as ViewStyle,
    
    /**
     * The standard style for a text label above a form input.
     * // from components/loops/LoopFormFields.tsx
     */
    label: {
      fontSize: typography.fontSize.body,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      marginBottom: spacing.sm,
    } as TextStyle,

    /**
     * The default appearance for a text input field.
     * // from components/loops/LoopFormFields.tsx
     */
    textInput: {
      height: 44,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
      color: colors.text,
      fontSize: typography.fontSize.body,
    } as TextStyle,
    
    /**
     * The style for validation error text displayed below an input.
     * // from components/loops/LoopEditMenu.tsx
     */
    errorText: {
      color: colors.error,
      fontSize: typography.fontSize.caption,
      marginTop: spacing.xs,
    } as TextStyle,
  };
}; 