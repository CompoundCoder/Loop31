import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent } from 'react-native';

// Track the number of instances to ensure sequential animation
let instanceCount = 0;

export type FadeSlideInViewProps = {
  /**
   * Child components to animate
   */
  children: React.ReactNode;

  /**
   * Index for staggered animations. Each increment adds 100ms delay.
   * @default 0
   */
  index?: number;

  /**
   * Optional override for animation duration in ms
   * @default 300
   */
  duration?: number;
};

export default function FadeSlideInView({
  children,
  index = 0,
  duration = 300,
}: FadeSlideInViewProps) {
  // Track if component has been laid out
  const [isLaidOut, setIsLaidOut] = useState(false);
  
  // Assign a unique instance number when component mounts
  const instanceNumber = useRef(instanceCount++).current;
  
  // Cleanup instance count on unmount
  useEffect(() => {
    return () => {
      instanceCount = 0;
    };
  }, []);
  
  // Create animated value for opacity
  const opacity = useRef(new Animated.Value(0)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    if (!isLaidOut) {
      const { y } = event.nativeEvent.layout;
      
      // Base delay is 100ms per index
      const baseDelay = index * 100;
      
      // Y position adds subtle variation (0.2ms per pixel)
      const yDelay = y * 0.2;
      
      // Combine delays with a reasonable maximum
      const dynamicDelay = Math.min(baseDelay + yDelay, 800);
      
      // Configure smooth easing
      const easing = Easing.out(Easing.ease);

      // Animate opacity only
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay: dynamicDelay,
        easing,
        useNativeDriver: true,
      }).start();

      setIsLaidOut(true);
    }
  };

  return (
    <Animated.View
      onLayout={handleLayout}
      style={{ opacity }}
    >
      {children}
    </Animated.View>
  );
} 