import 'react-native-gesture-handler';
import { Tabs } from 'expo-router';
import { ThemeProvider, useTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { NotificationProvider } from '../modules/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastStack } from '../components/notifications/ToastStack';
import { lightTheme, darkTheme } from '../theme/theme';
import { useThemeStyles } from '../hooks/useThemeStyles';

// Define ExtendedTheme based on NavigationTheme and our custom theme structure
interface ExtendedTheme extends NavigationTheme {
  spacing: typeof lightTheme.spacing;
  borderRadius: typeof lightTheme.borderRadius;
  opacity: typeof lightTheme.opacity;
  elevation: typeof lightTheme.elevation;
  typography: typeof lightTheme.typography;
  // Colors already includes NavigationTheme colors via intersection
  colors: NavigationTheme['colors'] & typeof lightTheme.colors;
}

// NOTE: The RootLayout now directly exports the Tabs navigator layout.
// Providers are wrapped around the Tabs component.

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const baseTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const themeStyles = useThemeStyles();

  // Construct the full navigation theme conforming to ExtendedTheme
  const navigationTheme: ExtendedTheme = {
    dark: colorScheme === 'dark',
    colors: baseTheme.colors,
    spacing: baseTheme.spacing,
    borderRadius: baseTheme.borderRadius,
    opacity: baseTheme.opacity,
    elevation: baseTheme.elevation,
    typography: baseTheme.typography,
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
        <ThemeProvider value={navigationTheme}>
          <NotificationProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Tabs
              screenOptions={{                
                tabBarActiveTintColor: navigationTheme.colors.accent,
                tabBarInactiveTintColor: navigationTheme.colors.tabInactive,
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
              {/* Screens to hide from the tab bar */}
              <Tabs.Screen name="posts/create" options={{ href: null }} />
              <Tabs.Screen name="shop/pack/[packId]" options={{ href: null }} />
              <Tabs.Screen name="+not-found" options={{ href: null }} />
            </Tabs>
            <ToastStack />
          </NotificationProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
