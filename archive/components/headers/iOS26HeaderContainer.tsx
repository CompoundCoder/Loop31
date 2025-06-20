import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import * as typographyPresets from '@/presets/typography';

// Define constants for header behavior
const LARGE_TITLE_HEIGHT = 96; // Height of the large title area before collapsing
const SMALL_HEADER_HEIGHT = 48; // Height of the sticky header after collapsing

interface iOS26HeaderContainerProps {
  title: string;
  children: React.ReactNode;
  scrollY?: Animated.SharedValue<number>;
}

const IOS26HeaderContainer: React.FC<iOS26HeaderContainerProps> = ({
  title,
  children,
  scrollY: externalScrollY,
}) => {
  const { colors, spacing } = useThemeStyles();
  const insets = useSafeAreaInsets();
  
  // Use external scrollY if provided, otherwise create one internally for self-management
  const internalScrollY = useSharedValue(0);
  const scrollY = externalScrollY || internalScrollY;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  // The distance the user needs to scroll before the header is fully collapsed
  const headerScrollDistance = LARGE_TITLE_HEIGHT - SMALL_HEADER_HEIGHT;

  // Animate the opacity and shadow of the sticky header background
  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [headerScrollDistance, headerScrollDistance + 20], // Fade in over 20px of scroll
      [0, 1],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
      // Add a shadow that fades in with the background for depth
      ...Platform.select({
        ios: {
          shadowOpacity: interpolate(
            scrollY.value,
            [headerScrollDistance, headerScrollDistance + 20],
            [0, 0.08],
            Extrapolate.CLAMP,
          )
        },
        android: {
          elevation: interpolate(
            scrollY.value,
            [headerScrollDistance, headerScrollDistance + 20],
            [0, 4],
            Extrapolate.CLAMP,
          )
        }
      })
    };
  });
  
  // Animate the small title within the sticky header
  const smallTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [headerScrollDistance, headerScrollDistance + 20],
      [0, 1],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [headerScrollDistance, headerScrollDistance + 20],
      [10, 0], // Emerge from bottom for a subtle entrance
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }]
    };
  });
  
  // Animate the large title, fading it out as it scrolls up
  const largeTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, headerScrollDistance / 1.5], // Fade out slightly faster than the scroll
      [1, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
    };
  });
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'pink', // DEBUG
    },
    stickyHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: SMALL_HEADER_HEIGHT + insets.top,
      paddingTop: insets.top,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10, // DEBUG
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
    },
    smallTitle: {
      ...typographyPresets.pageHeaderTitle,
      color: colors.text,
    },
    largeTitleContainer: {
      height: LARGE_TITLE_HEIGHT,
      justifyContent: 'flex-end',
      paddingBottom: spacing.md,
    },
    largeTitle: {
      ...typographyPresets.screenTitle,
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingTop: 120, // DEBUG
      paddingBottom: insets.bottom,
      paddingHorizontal: spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      {/* Sticky Header (appears on scroll) */}
      <Animated.View style={[styles.stickyHeader, stickyHeaderStyle]}>
          <Animated.Text style={[styles.smallTitle, smallTitleStyle]}>{title}</Animated.Text>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Large Title (at the top of the scroll content) */}
        <Animated.View style={[styles.largeTitleContainer, largeTitleStyle]}>
          <Text style={styles.largeTitle}>{title}</Text>
        </Animated.View>

        {/* The actual screen content passed as children */}
        {children}
      </Animated.ScrollView>
    </View>
  );
};

export default IOS26HeaderContainer; 