import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler'; // Using RNGH Swipeable directly for clarity
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeStyles } from '@/hooks/useThemeStyles'; // For styling actions

// Assuming Loop data structure from context/index.tsx will have at least an 'id'
interface LoopDataItem {
  id: string;
  // Add other properties from the Loop type if needed by this component,
  // but for now, only id is strictly necessary for onPinToggle.
}

interface SwipeableLoopItemProps {
  loop: LoopDataItem;
  isPinned: boolean;
  onPinToggle: (loopId: string, newPinState: boolean) => void;
  children: React.ReactNode;
  // Optional: if you need to coordinate closing other rows
  // onSwipeableWillOpen?: () => void;
}

const SwipeableLoopItem: React.FC<SwipeableLoopItemProps> = ({
  loop,
  isPinned,
  onPinToggle,
  children,
  // onSwipeableWillOpen,
}) => {
  const swipeableRowRef = useRef<Swipeable>(null);
  const { colors, spacing, borderRadius, typography } = useThemeStyles();
  const contrastColor = '#FFFFFF'; // Direct fallback for a contrasting text/icon color

  const handlePinPress = useCallback(() => {
    onPinToggle(loop.id, true); // Request pin
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRowRef.current?.close();
  }, [loop.id, onPinToggle]);

  const handleUnpinPress = useCallback(() => {
    onPinToggle(loop.id, false); // Request unpin
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRowRef.current?.close();
  }, [loop.id, onPinToggle]);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const action = isPinned
      ? {
          text: 'Unpin',
          color: colors.warning, // Example color
          icon: 'pin-off-outline',
          onPress: handleUnpinPress,
        }
      : {
          text: 'Pin',
          color: colors.primary, // Example color
          icon: 'pin-outline',
          onPress: handlePinPress,
        };

    // Simple translation, you might want more complex animations
    const trans = dragX.interpolate({
      inputRange: [-100, 0], // Swipe distance to fully reveal
      outputRange: [0, 60],   // How far the button itself moves (adjust based on button width)
      extrapolate: 'clamp',
    });
    
    // Scale progress for opacity or other effects
    const scale = dragX.interpolate({
      inputRange: [-75, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });


    return (
      <Animated.View style={{ transform: [{ translateX: trans }], flexDirection: 'row' }}>
        <TouchableOpacity
          style={[styles.rightAction, { backgroundColor: action.color, opacity: scale }]}
          onPress={action.onPress}
        >
          <MaterialCommunityIcons
            name={action.icon as any}
            size={24}
            color={contrastColor}
            style={{ marginBottom: spacing.xs }}
          />
          <Text style={[styles.actionText, { color: contrastColor, fontSize: typography.fontSize.caption, fontWeight: typography.fontWeight.medium }]}>
            {action.text}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRowRef}
      friction={2}
      rightThreshold={40} // How far user must drag to trigger full swipe
      renderRightActions={renderRightActions}
      // onSwipeableWillOpen={onSwipeableWillOpen} // Hook for parent if needed
      containerStyle={ Platform.OS === 'ios' ? styles.iosContainer : styles.androidContainer }
      childrenContainerStyle={{overflow: 'hidden', borderRadius: borderRadius.lg}} // Ensures children conform to border radius
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 85, // Width of the action button
    // height: '100%', // Ensure it matches the child's height visually
    // borderRadius: borderRadius.lg, // If you want the action button to also be rounded
  },
  actionText: {
    // fontSize: 13, // Moved to typography
    // fontWeight: '500', // Moved to typography
    marginTop: 2,
  },
  // Fix for Android where swipeable container might not clip children correctly with borderRadius
  androidContainer: {
    // overflow: 'hidden', // this can sometimes clip shadows from children
  },
  iosContainer: {
    // iOS handles overflow and border radius more predictably
  }
});

export default SwipeableLoopItem; 