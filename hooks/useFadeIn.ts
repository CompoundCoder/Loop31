import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ANIMATION } from '../constants/animation';

export function useFadeIn() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: ANIMATION.SECTION_FADE_DURATION,
      easing: ANIMATION.SECTION_FADE_EASING,
      useNativeDriver: true,
    }).start();
  }, []);

  return {
    opacityStyle: { opacity },
  };
} 