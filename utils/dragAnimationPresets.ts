// 🔁 Unified drag scale/opacity settings — used app-wide
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export const DRAG_SCALE_ACTIVE = 1.06;
export const DRAG_OPACITY_ACTIVE = 0.95;
export const DRAG_ANIMATION_DURATION = 150; // 🧈 Smooth timing

// 📦 Purpose: Default Reanimated style hook for any drag-enabled card or list item
// 🧠 Usage: const animatedStyle = useDefaultDragStyle(isDragActive);
export const useDefaultDragStyle = (isActive: boolean) => {
  return useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? DRAG_OPACITY_ACTIVE : 1, {
        duration: DRAG_ANIMATION_DURATION,
      }),
      transform: [
        {
          scale: withTiming(isActive ? DRAG_SCALE_ACTIVE : 1, {
            duration: DRAG_ANIMATION_DURATION,
          }),
        },
      ],
    };
  }, [isActive]); // Add isActive to dependency array
};