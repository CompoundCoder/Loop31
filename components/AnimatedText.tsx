import React from 'react';
import { Animated, Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { useFadeIn } from '@/hooks/useFadeIn';

type AnimatedTextProps = TextProps & {
  /**
   * The text content to display and animate
   */
  children: React.ReactNode;
  /**
   * Optional style overrides
   */
  style?: StyleProp<TextStyle>;
};

export default function AnimatedText({ children, style, ...props }: AnimatedTextProps) {
  const { opacityStyle } = useFadeIn();

  return (
    <Animated.Text style={[style, opacityStyle]} {...props}>
      {children}
    </Animated.Text>
  );
} 