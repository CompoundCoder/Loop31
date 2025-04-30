import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import type { ExtendedTheme } from '../app/_layout';

/**
 * Hook that provides memoized access to theme values.
 * Returns commonly used theme properties in a structured format.
 */
export function useThemeStyles() {
  const theme = useTheme() as unknown as ExtendedTheme;

  return useMemo(() => ({
    spacing: theme.spacing,
    colors: theme.colors,
    borderRadius: theme.borderRadius,
    opacity: theme.opacity,
    elevation: Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  }), [theme]);
}

// Type definition for the return value of useThemeStyles
export type ThemeStyles = ReturnType<typeof useThemeStyles>; 