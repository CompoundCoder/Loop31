import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import TabNavigator from './tabs';
import { lightTheme, darkTheme } from '../theme/theme';
import { useColorScheme } from 'react-native';
import { NotificationProvider } from '../components/NotificationStack';

// Extend the base theme type with our custom properties
export interface ExtendedTheme extends NavigationTheme {
  spacing: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  opacity: {
    disabled: number;
    medium: number;
    full: number;
  };
  elevation: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  colors: NavigationTheme['colors'] & {
    accent: string;
  };
}

// Create theme based on color scheme
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Convert our theme to navigation theme format
  const navigationTheme: ExtendedTheme = {
    dark: colorScheme === 'dark',
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
      accent: theme.colors.accent,
    },
    fonts: Platform.select({
      web: {
        regular: {
          fontFamily: 'System',
          fontWeight: '400',
        },
        medium: {
          fontFamily: 'System',
          fontWeight: '500',
        },
        bold: {
          fontFamily: 'System',
          fontWeight: '600',
        },
        heavy: {
          fontFamily: 'System',
          fontWeight: '700',
        },
      },
      ios: {
        regular: {
          fontFamily: 'System',
          fontWeight: '400',
        },
        medium: {
          fontFamily: 'System',
          fontWeight: '500',
        },
        bold: {
          fontFamily: 'System',
          fontWeight: '600',
        },
        heavy: {
          fontFamily: 'System',
          fontWeight: '700',
        },
      },
      default: {
        regular: {
          fontFamily: 'sans-serif',
          fontWeight: '400',
        },
        medium: {
          fontFamily: 'sans-serif-medium',
          fontWeight: '500',
        },
        bold: {
          fontFamily: 'sans-serif',
          fontWeight: '600',
        },
        heavy: {
          fontFamily: 'sans-serif',
          fontWeight: '700',
        },
      },
    }) as NavigationTheme['fonts'],
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    opacity: theme.opacity,
    elevation: {
      none: 0,
      xs: 1,
      sm: 2,
      md: 4,
      lg: 8,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <NotificationProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <TabNavigator />
      </NotificationProvider>
    </ThemeProvider>
  );
}
