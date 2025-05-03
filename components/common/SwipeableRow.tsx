import React, { ReactNode, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeStyles } from '@/hooks/useThemeStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sensible defaults, can be overridden by props
const DEFAULT_SWIPE_THRESHOLD_PERCENTAGE = 0.2;
const DEFAULT_ACTION_VIEW_WIDTH = 80;

interface SwipeableRowProps {
  children: ReactNode;
  renderActions?: () => ReactNode;
  actionsWidth?: number;
  swipeThreshold?: number;
  containerStyle?: StyleProp<ViewStyle>;
  actionsContainerStyle?: StyleProp<ViewStyle>;
  actionBackgroundColor?: string;
  borderRadius?: number;
}

export interface SwipeableRowRef {
  close: () => void;
}

type AnimatedGHContext = {
  startX: number;
}

export const SwipeableRow = forwardRef<SwipeableRowRef, SwipeableRowProps>((
  {
    children,
    renderActions,
    actionsWidth = DEFAULT_ACTION_VIEW_WIDTH,
    swipeThreshold = -SCREEN_WIDTH * DEFAULT_SWIPE_THRESHOLD_PERCENTAGE,
    containerStyle,
    actionsContainerStyle,
    actionBackgroundColor,
    borderRadius,
  },
  ref
) => {
  const { colors } = useThemeStyles();
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  useImperativeHandle(ref, () => ({
    close: () => {
      translateX.value = withTiming(0);
      isOpen.value = false;
    }
  }), [translateX, isOpen]);

  // --- Gesture Handler --- 
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, AnimatedGHContext>({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      if (!renderActions) return;
      
      const potentialX = ctx.startX + event.translationX;
      translateX.value = Math.max(Math.min(potentialX, 0), -actionsWidth - 10);
    },
    onEnd: (event) => {
      if (!renderActions) return;
      
      const velocityX = event.velocityX;
      const currentX = translateX.value;
      
      if (currentX < swipeThreshold || velocityX < -500) {
        translateX.value = withTiming(-actionsWidth);
        isOpen.value = true;
      } else {
        translateX.value = withTiming(0);
        isOpen.value = false;
      }
    },
  }, [renderActions, actionsWidth, swipeThreshold]);

  // --- Animated Style for Content --- 
  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      backgroundColor: colors.background,
    };
  });

  // --- Render Logic --- 
  return (
    <View 
      style={[
        styles.outerContainer, 
        { borderRadius: borderRadius, overflow: 'hidden' }, 
        containerStyle
      ]}
    >
      {/* Full-width Action Background (behind everything) */}
      {actionBackgroundColor && (
         <View 
           style={[
             StyleSheet.absoluteFill, 
             { backgroundColor: actionBackgroundColor } 
           ]}
         />
      )}
      {/* Background Action Buttons (positioned right) */}
      {renderActions && (
        <View style={[styles.actionsContainer, styles.rightActions, { width: actionsWidth }, actionsContainerStyle]}>
          {renderActions()}
        </View>
      )}
      {/* Foreground Content (Animated) */}
      <PanGestureHandler 
        onGestureEvent={gestureHandler} 
        activeOffsetX={[-10, 10]}
      >
        <Reanimated.View style={[styles.contentContainer, animatedContentStyle]}>
          {children}
        </Reanimated.View>
      </PanGestureHandler>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    // overflow: 'hidden', // Keep commented unless needed
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    // width is now set inline via prop
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    right: 0,
    // Align items to the left within this container
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  contentContainer: {
    // backgroundColor: 'transparent', // Remove default transparency
  },
}); 