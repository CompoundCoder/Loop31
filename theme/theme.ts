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

// Platform-specific elevation
const elevation = Platform.select({
  ios: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
  },
  android: {
    none: {
      elevation: 0,
    },
    xs: {
      elevation: 2,
    },
    sm: {
      elevation: 4,
    },
    md: {
      elevation: 6,
    },
    lg: {
      elevation: 8,
    },
  },
});

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
  elevation: typeof elevation;
  typography: typeof typography;
  colors: ColorPalette;
  opacity: typeof opacity;
  transitions: typeof transitions;
};

// Default light theme
export const lightTheme: Theme = {
  spacing,
  borderRadius,
  elevation,
  typography,
  colors: lightColors,
  opacity,
  transitions,
};

// Dark theme
export const darkTheme: Theme = {
  ...lightTheme,
  colors: darkColors,
};

// Export default theme (light)
export default lightTheme; 