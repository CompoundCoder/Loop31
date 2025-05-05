import 'react-native-gesture-handler';
import { Tabs } from 'expo-router';
import { ThemeProvider, useTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useColorScheme } from 'react-native';
import { NotificationProvider } from '../modules/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastStack } from '../components/notifications/ToastStack';
import { lightTheme, darkTheme } from '../theme/theme';

// Define ExtendedTheme based on NavigationTheme and our custom theme structure
interface ExtendedTheme extends NavigationTheme {
  spacing: typeof lightTheme.spacing;
  borderRadius: typeof lightTheme.borderRadius;
  opacity: typeof lightTheme.opacity;
  elevation: typeof lightTheme.elevation;
  // Colors already includes NavigationTheme colors via intersection
  colors: NavigationTheme['colors'] & typeof lightTheme.colors;
}

// NOTE: The RootLayout now directly exports the Tabs navigator layout.
// Providers are wrapped around the Tabs component.

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const baseTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  // Construct the full navigation theme conforming to ExtendedTheme
  const navigationTheme: ExtendedTheme = {
    dark: colorScheme === 'dark',
    colors: {
      // Spread standard navigation colors (React Navigation might provide defaults)
      // We overwrite them with our theme colors where defined
      primary: baseTheme.colors.primary,
      background: baseTheme.colors.background,
      card: baseTheme.colors.card,
      text: baseTheme.colors.text,
      border: baseTheme.colors.border,
      notification: baseTheme.colors.notification,
      // Add our custom colors
      accent: baseTheme.colors.accent,
      // Add missing required colors from baseTheme.colors
      backgroundDefault: baseTheme.colors.backgroundDefault,
      backgroundHeader: baseTheme.colors.backgroundHeader,
      success: baseTheme.colors.success,
      warning: baseTheme.colors.warning,
      error: baseTheme.colors.error,
    },
    // Add the other custom properties
    spacing: baseTheme.spacing,
    borderRadius: baseTheme.borderRadius,
    opacity: baseTheme.opacity,
    elevation: baseTheme.elevation,
    // Provide default fonts if necessary for NavigationTheme conformance
    fonts: Platform.select({ 
        // ... (Copy default font definitions from previous version) ...
      web: {
        regular: { fontFamily: 'System', fontWeight: '400' },
        medium: { fontFamily: 'System', fontWeight: '500' },
        bold: { fontFamily: 'System', fontWeight: '600' },
        heavy: { fontFamily: 'System', fontWeight: '700' },
      },
      ios: {
        regular: { fontFamily: 'System', fontWeight: '400' },
        medium: { fontFamily: 'System', fontWeight: '500' },
        bold: { fontFamily: 'System', fontWeight: '600' },
        heavy: { fontFamily: 'System', fontWeight: '700' },
      },
      default: {
        regular: { fontFamily: 'sans-serif', fontWeight: '400' },
        medium: { fontFamily: 'sans-serif-medium', fontWeight: '500' },
        bold: { fontFamily: 'sans-serif', fontWeight: '600' },
        heavy: { fontFamily: 'sans-serif', fontWeight: '700' },
      },
    }) as NavigationTheme['fonts'],
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <NotificationProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Tabs
              screenOptions={{                
                tabBarActiveTintColor: navigationTheme.colors.primary,
                headerShown: false,
                tabBarStyle: {
                  borderTopWidth: 0,
                  elevation: 0,
                  shadowOpacity: 0,
                  height: 50 + insets.bottom,
                  paddingBottom: 10 + insets.bottom,
                  paddingTop: 10,
                  backgroundColor: navigationTheme.colors.card,
                },
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Home',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home-outline" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="(loops)"
                options={{
                  title: 'Loops',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="repeat" size={size} color={color} />
                  ),
                }}
              />
            </Tabs>
            <ToastStack />
          </NotificationProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
