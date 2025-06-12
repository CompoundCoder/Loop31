import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp, Easing } from 'react-native';

interface AnimatedCardProps {
  visible: boolean;
  onDismiss?: () => void;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  collapse?: boolean;
}

const DEFAULT_DURATION = 400;
const MAX_HEIGHT = 500;

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  visible,
  onDismiss,
  duration = DEFAULT_DURATION,
  style,
  children,
  collapse = false,
}) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(visible ? 1 : 0.95)).current;
  const maxHeight = useRef(new Animated.Value(visible ? MAX_HEIGHT : 0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      if (collapse) {
        maxHeight.setValue(0);
        Animated.timing(maxHeight, {
          toValue: MAX_HEIGHT,
          duration,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }).start();
      } else {
        opacity.setValue(0);
        scale.setValue(0.95);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false,
          }),
        ]).start();
      }
    } else {
      // Animate out
      if (collapse) {
        Animated.timing(maxHeight, {
          toValue: 0,
          duration,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished && onDismiss) onDismiss();
        });
      } else {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false,
          }),
          Animated.timing(scale, {
            toValue: 0.95,
            duration,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: false,
          }),
        ]).start(({ finished }) => {
          if (finished && onDismiss) onDismiss();
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, collapse]);

  return (
    <Animated.View
      style={[
        collapse
          ? { maxHeight, overflow: 'hidden' }
          : { opacity, transform: [{ scale }], overflow: 'hidden' },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedCard; 