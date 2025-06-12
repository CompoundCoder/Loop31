import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export type PrimaryFadeInViewProps = {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  scaleAmount?: number;
};

export default function PrimaryFadeInView({
  children,
  duration = 1000,
  delay = 0,
  scaleAmount = 1.02, // Subtle scale
}: PrimaryFadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const easing = Easing.bezier(0.2, 0, 0, 1); // Smooth bezier

    // Start with slight scale down
    scale.setValue(0.98);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }),
      Animated.sequence([
        // Scale up slightly past 1
        Animated.timing(scale, {
          toValue: scaleAmount,
          duration: duration * 0.6,
          delay,
          easing,
          useNativeDriver: true,
        }),
        // Settle back to 1
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.4,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ scale }],
      }}
    >
      {children}
    </Animated.View>
  );
} 