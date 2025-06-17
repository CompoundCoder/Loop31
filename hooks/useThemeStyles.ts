import { useMemo } from 'react';
import { useTheme } from '@react-navigation/native';
import { type Theme as AppTheme, elevation as appElevation } from '@/theme/theme'; // Import concrete elevation object

/**
 * Hook that provides memoized access to theme values.
 * Returns commonly used theme properties in a structured format.
 */
export function useThemeStyles() {
  const theme = useTheme() as unknown as AppTheme;

  return useMemo(() => ({
    spacing: theme.spacing,
    colors: theme.colors,
    borderRadius: theme.borderRadius,
    opacity: theme.opacity,
    typography: theme.typography,
    elevation: appElevation, // Use the imported elevation object directly
    transitions: theme.transitions,
  }), [theme]);
}

// Type definition for the return value of useThemeStyles
export type ThemeStyles = ReturnType<typeof useThemeStyles>;