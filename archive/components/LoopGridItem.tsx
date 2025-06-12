import React, { useRef } from 'react';
import { ViewStyle } from 'react-native';
import { GestureDetector, Gesture, PanGesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, SharedValue } from 'react-native-reanimated';
import PostCardS from '@/components/loops/PostCardS'; // Assuming PostCardS is here
import { Post } from '@/app/(loops)/[loopId]'; // Adjust if Post type is defined elsewhere

// Define the layout structure expected in layoutsRef
interface ItemLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LoopGridItemProps {
  item: Post;
  index: number;
  gridItemStyle: ViewStyle;
  onPostClick: (post: Post) => void;
  layoutsRef: React.MutableRefObject<Record<string, ItemLayout>>;
  
  // Shared values from parent
  activePostIdSV: SharedValue<string | null>;
  isDraggingSV: SharedValue<boolean>;
  dragTranslationXSV: SharedValue<number>;
  dragTranslationYSV: SharedValue<number>;
  itemInitialXSV: SharedValue<number>;
  itemInitialYSV: SharedValue<number>;
  gestureStartXSV: SharedValue<number>;
  gestureStartYSV: SharedValue<number>;
  
  currentLoopPosts: Post[]; // Current list of all posts
  updateLoopPostsState: (newPosts: Post[]) => void; // Function to update posts in parent
}

const LoopGridItem: React.FC<LoopGridItemProps> = ({
  item,
  index,
  gridItemStyle,
  onPostClick,
  layoutsRef,
  activePostIdSV,
  isDraggingSV,
  dragTranslationXSV,
  dragTranslationYSV,
  itemInitialXSV,
  itemInitialYSV,
  gestureStartXSV,
  gestureStartYSV,
  currentLoopPosts,
  updateLoopPostsState,
}) => {
  const itemRef = useRef<Animated.View>(null);

  const itemPanGesture = Gesture.Pan()
    .onStart((event) => {
      const layout = layoutsRef.current[item.id];
      if (layout) {
        itemInitialXSV.value = layout.x;
        itemInitialYSV.value = layout.y;
        gestureStartXSV.value = event.absoluteX;
        gestureStartYSV.value = event.absoluteY;
        dragTranslationXSV.value = layout.x; // Initialize drag translation to item's current pos
        dragTranslationYSV.value = layout.y;
        activePostIdSV.value = item.id;
        isDraggingSV.value = true;
      }
    })
    .onUpdate((event) => {
      // Ensure dragging has started and an item is active
      if (isDraggingSV.value && activePostIdSV.value === item.id) {
        dragTranslationXSV.value = itemInitialXSV.value + (event.absoluteX - gestureStartXSV.value);
        dragTranslationYSV.value = itemInitialYSV.value + (event.absoluteY - gestureStartYSV.value);
      }
    })
    .onEnd(() => {
      if (!isDraggingSV.value || activePostIdSV.value !== item.id) {
        // If not dragging this item, or dragging ended prematurely, reset.
        // This check might be redundant if onStart sets activePostId correctly for THIS item.
        if (activePostIdSV.value === item.id) { // Only reset if this item was thought to be active
          isDraggingSV.value = false;
          activePostIdSV.value = null;
        }
        return;
      }

      const draggedItemId = activePostIdSV.value; // Should be item.id
      const draggedItemLayout = layoutsRef.current[draggedItemId!];

      if (!draggedItemLayout) {
        isDraggingSV.value = false;
        activePostIdSV.value = null;
        return;
      }

      const dropX = dragTranslationXSV.value + draggedItemLayout.width / 2;
      const dropY = dragTranslationYSV.value + draggedItemLayout.height / 2;

      let targetIndex = -1;
      for (let i = 0; i < currentLoopPosts.length; i++) {
        const currentItemTarget = currentLoopPosts[i];
        if (currentItemTarget.id === draggedItemId) continue;

        const layout = layoutsRef.current[currentItemTarget.id];
        if (layout &&
            dropX >= layout.x && dropX <= layout.x + layout.width &&
            dropY >= layout.y && dropY <= layout.y + layout.height) {
          targetIndex = i;
          break;
        }
      }
      
      const originalIndex = currentLoopPosts.findIndex(p => p.id === draggedItemId);

      if (targetIndex !== -1 && originalIndex !== -1 && targetIndex !== originalIndex) {
        runOnJS(() => {
          const newLoopPosts = [...currentLoopPosts];
          const [movedItem] = newLoopPosts.splice(originalIndex, 1);
          if (movedItem) {
            newLoopPosts.splice(targetIndex, 0, movedItem);
            updateLoopPostsState(newLoopPosts);
          }
        })();
      }
      // Always reset dragging state for this item
      isDraggingSV.value = false;
      activePostIdSV.value = null;
    })
    .shouldCancelWhenOutside(false);

  const animatedItemStyle = useAnimatedStyle(() => {
    return {
      opacity: activePostIdSV.value === item.id && isDraggingSV.value ? 0.3 : 1,
    };
  });

  return (
    <GestureDetector gesture={itemPanGesture}>
      <Animated.View
        ref={itemRef}
        style={[gridItemStyle, animatedItemStyle]}
        onLayout={() => {
          itemRef.current?.measureInWindow((x, y, width, height) => {
            if (item?.id) { // Ensure item and item.id are valid
                 layoutsRef.current[item.id] = { x, y, width, height };
            }
          });
        }}
      >
        <PostCardS
          post={item}
          variant={index === 0 ? 'featured' : 'mini'}
          onPress={() => {
            // Only allow press if not in a dragging operation (related to any item)
            if (!isDraggingSV.value) {
                onPostClick(item);
            }
          }}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default LoopGridItem; 