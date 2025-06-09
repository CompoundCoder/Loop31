import React from 'react'; // Added import
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS, // To call JS functions from worklets
  } from 'react-native-reanimated';
  // import type { PanGestureHandlerEventPayload } from 'react-native-gesture-handler'; // Not used directly here
  
  // Spring configuration for the main slide animation
  export const slideSpringConfig = {
    damping: 20, // Slightly more damped for a smoother, less bouncy feel
    stiffness: 180,
    mass: 0.7,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
  };
  
  // Timing configuration for the backdrop opacity
  export const backdropTimingConfig = {
    duration: 250, // Quick fade for backdrop
  };
  
  // Timing configuration for closing the menu (either via swipe or button)
  export const closeTimingConfig = {
    duration: 200, // Faster close animation
  };
  
  export const useSlideUpAnimation = (
    isVisible: boolean,
    menuActualHeight: number,
    translateY: Animated.SharedValue<number>
  ) => {
    // Animate translateY based on isVisible state
    React.useEffect(() => {
      if (isVisible) {
        translateY.value = withSpring(0, slideSpringConfig);
      } else {
        // When closing, animate to full height (off-screen)
        translateY.value = withTiming(menuActualHeight, closeTimingConfig);
      }
    }, [isVisible, menuActualHeight]);
  
    const animatedMenuSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });
  
    const animatedBackdropStyle = useAnimatedStyle(() => {
      return {
        // Fade in/out backdrop based on isVisible
        // Use translateY to make opacity animation sync with menu visibility more accurately
        opacity: translateY.value < menuActualHeight * 0.9 ? 1 : 0,
        // Alternative: withTiming(isVisible ? 1 : 0, backdropTimingConfig),
      };
    });
  
    return { animatedMenuSheetStyle, animatedBackdropStyle };
  };
  
  export const callOnJS = <T extends (...args: any[]) => any>(fn: T) => {
    'worklet';
    return (...args: Parameters<T>): void => { // Changed return type to void if fn is void
      runOnJS(fn)(...args);
    };
  };
