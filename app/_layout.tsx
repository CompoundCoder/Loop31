import 'react-native-gesture-handler';
import { Tabs } from 'expo-router';
import { ThemeProvider, type Theme as NavigationRNTheme } from '@react-navigation/native'; // Changed import alias
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { NotificationProvider } from '../modules/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastStack } from '../components/notifications/ToastStack';
import { lightTheme, darkTheme } from '../theme/theme';
import { LoopsProvider } from '@/context/LoopsContext'; // Import LoopsProvider
import 'react-native-get-random-values';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';

// Define the comprehensive theme type that components will use.
// This includes React Navigation's required fields and all our custom theme properties.
export type ExtendedTheme = {
  dark: boolean;
  colors: typeof lightTheme.colors; // Our full ColorPalette
  spacing: typeof lightTheme.spacing;
  borderRadius: typeof lightTheme.borderRadius;
  opacity: typeof lightTheme.opacity;
  elevation: typeof lightTheme.elevation;
  typography: typeof lightTheme.typography;
  fonts: NavigationRNTheme['fonts']; // React Navigation's font structure
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const baseTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  // Construct the theme object that will be provided via context.
  // This object must be assignable to NavigationRNTheme for the ThemeProvider,
  // and it also serves as our ExtendedTheme for components.
  const themeForProvider: ExtendedTheme = {
    dark: colorScheme === 'dark',
    colors: baseTheme.colors, // Our ColorPalette is compatible as a superset of NavigationRNTheme['colors']
    spacing: baseTheme.spacing,
    borderRadius: baseTheme.borderRadius,
    opacity: baseTheme.opacity,
    elevation: baseTheme.elevation,
    typography: baseTheme.typography,
    fonts: Platform.select({ // Ensure this structure matches NavigationRNTheme['fonts'] expectations
      web: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '600' as const },
        heavy: { fontFamily: 'System', fontWeight: '700' as const },
      },
      ios: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '600' as const },
        heavy: { fontFamily: 'System', fontWeight: '700' as const },
      },
      default: { // For Android and other platforms
        regular: { fontFamily: 'sans-serif', fontWeight: '400' as const },
        medium: { fontFamily: 'sans-serif-medium', fontWeight: '500' as const },
        bold: { fontFamily: 'sans-serif', fontWeight: '600' as const }, // Or 'sans-serif-bold' if that's the specific font face
        heavy: { fontFamily: 'sans-serif', fontWeight: '700' as const }, // Or 'sans-serif-black'
      },
    }) as NavigationRNTheme['fonts'], // Cast to assert compatibility
  };

  // Common Tab Icon component with animation
  const AnimatedTabIcon = ({ focused, iconName, color, size }: { focused: boolean; iconName: keyof typeof Ionicons.glyphMap; color: string; size: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: withTiming(focused ? 1.2 : 1.0, { duration: 150 }) }],
      };
    });

    return (
      <Animated.View style={animatedStyle}>
        <Ionicons name={iconName} size={size} color={color} />
      </Animated.View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Pass the fully constructed theme object to ThemeProvider */}
        {/* It's typed as ExtendedTheme, which is compatible with NavigationRNTheme */}
        <ThemeProvider value={themeForProvider}>
          <NotificationProvider>
            {/* Wrap the navigator and ToastStack with LoopsProvider */}
            <LoopsProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Tabs
              screenOptions={{                
                tabBarActiveTintColor: themeForProvider.colors.accent, // Use themeForProvider
                tabBarInactiveTintColor: themeForProvider.colors.tabInactive, // Use themeForProvider
                headerShown: false,
                tabBarStyle: {
                  borderTopWidth: 0,
                  elevation: 0, // Consider using themeForProvider.elevation.none or similar if defined
                  shadowOpacity: 0,
                  height: 50 + insets.bottom,
                  paddingBottom: 10 + insets.bottom,
                  paddingTop: 10,
                  backgroundColor: themeForProvider.colors.card, // Use themeForProvider
                },
              }}
            >
              <Tabs.Screen
                name="(loops)"
                options={{
                  title: 'Loops',
                  tabBarIcon: ({ focused, color, size }) => (
                    <AnimatedTabIcon focused={focused} iconName="repeat" color={color} size={size} />
                  ),
                }}
              />
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Home',
                  tabBarIcon: ({ focused, color, size }) => (
                    <AnimatedTabIcon focused={focused} iconName="home-outline" color={color} size={size} />
                  ),
                }}
              />
              <Tabs.Screen
                name="you" // This will look for app/you.tsx
                options={{
                  title: 'You',
                  tabBarIcon: ({ focused, color, size }) => (
                    <AnimatedTabIcon focused={focused} iconName="person-outline" color={color} size={size} />
                  ),
                }}
              />
              <Tabs.Screen
                name="test" 
                options={{
                  title: 'Test',
                  tabBarIcon: ({ focused, color, size }) => (
                    <AnimatedTabIcon focused={focused} iconName="settings-outline" color={color} size={size} />
                  ),
                }}
              />
              {/* Screens to hide from the tab bar */}
              <Tabs.Screen name="shop/pack/[packId]" options={{ href: null }} />
              <Tabs.Screen name="+not-found" options={{ href: null }} />
            </Tabs>
            <ToastStack />
            </LoopsProvider>
          </NotificationProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
