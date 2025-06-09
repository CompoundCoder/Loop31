import { Platform } from 'react-native';

// Spacing system
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 28,
  xxl: 32,
} as const;

// Border radius system
const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

// Helper function to define elevation properly
function getElevation(level: number) {
  return Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: level * 0.5 },
      shadowOpacity: 0.1 + level * 0.01,
      shadowRadius: 1 + level * 0.5,
    },
    android: {
      elevation: level,
    },
  })!;
}

// Platform-specific elevation, fixed for TS
const elevation = {
  none: Platform.select({
    ios: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: {
      elevation: 0,
    },
  }) as object,
  xs: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1.5,
    },
    android: {
      elevation: 1,
    },
  }) as object,
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 2.5,
    },
    android: {
      elevation: 3,
    },
  }) as object,
  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 4.5,
    },
    android: {
      elevation: 5,
    },
  }) as object,
  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.18,
      shadowRadius: 7,
    },
    android: {
      elevation: 8,
    },
  }) as object,
  xl: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
    },
    android: {
      elevation: 12,
    },
  }) as object,
} as const;

export type Elevation = typeof elevation; // Export Elevation type

// Typography
const typography = {
  fontFamily: Platform.select({
    ios: {
      light: 'System',
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    android: {
      light: 'sans-serif-light',
      regular: 'sans-serif',
      medium: 'sans-serif-medium',
      bold: 'sans-serif-bold',
    },
  }),
  fontSize: {
    caption: 12,
    body: 14,
    subtitle: 16,
    title: 20,
    heading: 24,
    hero: 32,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
  },
} as const;

// Color palettes
type ColorPalette = {
  primary: string;
  accent: string;
  background: string;
  backgroundDefault: string;
  backgroundHeader: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  success: string;
  warning: string;
  error: string;
  tabInactive: string;
};

const lightColors: ColorPalette = {
  primary: '#000000',
  accent: '#008AFF',
  background: '#f0f0f0',
  backgroundDefault: '#f0f0f0',
  backgroundHeader: '#FFFFFF',
  card: '#FFFFFF',
  text: '#000000',
  border: '#E9ECEF',
  notification: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  tabInactive: '#8E8E93',
};

const darkColors: ColorPalette = {
  primary: '#FFFFFF',
  accent: '#008AFF',
  background: '#000000',
  backgroundDefault: '#000000',
  backgroundHeader: '#1C1C1E',
  card: '#1C1C1E',
  text: '#FFFFFF',
  border: '#38383A',
  notification: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  tabInactive: '#8E8E93',
};

// Opacity levels
const opacity = {
  disabled: 0.5,
  medium: 0.7,
  full: 1,
} as const;

// Transitions (in milliseconds)
const transitions = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Theme type definition
export type Theme = {
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  elevation: typeof elevation; // Ensure elevation is part of the exported Theme type
  typography: typeof typography;
  colors: ColorPalette;
  opacity: typeof opacity;
  transitions: typeof transitions;
};

// Default light theme
export const lightTheme: Theme = {
  spacing,
  borderRadius,
  elevation, // Ensure elevation is included here
  typography,
  colors: lightColors,
  opacity,
  transitions,
};

// Dark theme
export const darkTheme: Theme = {
  ...lightTheme,
  colors: darkColors,
  elevation, // Ensure elevation is included for dark theme as well
};

export { elevation }; // Export the elevation object itself

// Export default theme (light)
export default lightTheme;