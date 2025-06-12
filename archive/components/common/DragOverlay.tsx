import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import Reanimated, { useAnimatedStyle, withSpring, runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { useDragOverlay, type DraggedItemDetails, type Post as DragOverlayPost } from '@/context/DragOverlayContext';
import PostCardS, { type Post as PostCardSPost } from '@/components/loops/PostCardS';

// Define a default/fallback post to use when draggedItemDetails is null
// This helps prevent crashes and satisfies PostCardS prop requirements if it were
// to render before details are fully set or after they are cleared abruptly.
const FALLBACK_POST: PostCardSPost = {
  id: '__fallback__',
  caption: '',
  previewImageUrl: undefined,
};

const DragOverlay: React.FC = () => {
  const {
    draggedItemDetails,
    currentDragX,
    currentDragY,
    isDraggingActive,
  } = useDragOverlay();

  // React state for props to PostCardS, synced from shared values
  const [displayPost, setDisplayPost] = useState<PostCardSPost | null>(null);
  const [displayVariant, setDisplayVariant] = useState<'featured' | 'mini'>('mini');
  const [displayCardWidth, setDisplayCardWidth] = useState<number | undefined>(undefined);

  // Sync draggedItemDetails to React state for safe prop passing
  useAnimatedReaction(
    () => ({
        details: draggedItemDetails.value,
        isActive: isDraggingActive.value,
    }),
    (result, previousResult) => {
      if (result.isActive && result.details) {
        runOnJS(setDisplayPost)(result.details.post as PostCardSPost); // Ensure type assertion if necessary
        runOnJS(setDisplayVariant)(result.details.variant);
        runOnJS(setDisplayCardWidth)(result.details.cardWidth);
      } else if (!result.isActive && displayPost !== null) {
        // Optionally clear or set to fallback when not dragging to avoid stale display
        // For now, let opacity handle immediate hiding. If PostCardS needs to reset, clear here.
        // runOnJS(setDisplayPost)(null); 
      }
    },
    [draggedItemDetails, isDraggingActive] // Dependencies for the reaction
  );

  const floatingCardAnimatedStyle = useAnimatedStyle(() => {
    const isActive = isDraggingActive.value;
    const detailsAvailable = draggedItemDetails.value !== null;

    const opacity = isActive && detailsAvailable ? 1 : 0;
    const display = isActive && detailsAvailable ? 'flex' : 'none';
    const scale = isActive && detailsAvailable ? withSpring(1.03) : withSpring(1);
    const left = currentDragX.value; // These are fine as they are used for direct style properties
    const top = currentDragY.value;
    const width = draggedItemDetails.value?.width ?? 0;
    const height = draggedItemDetails.value?.height ?? 0;

    return {
      position: 'absolute',
      left,
      top,
      width,
      height,
      opacity,
      display,
      transform: [{ scale }],
      // Ensure it does not accept pointer events if not displayed, though parent has it.
      pointerEvents: display === 'none' ? 'none' : 'auto',
    };
  }, []); // currentDragX, currentDragY, draggedItemDetails, isDraggingActive are implicitly dependencies

  // const currentDetails = draggedItemDetails.value; // REMOVED: Unsafe direct read in render

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      {/* This Reanimated.View is always in the tree. Its style controls visibility and position. */}
      <Reanimated.View style={floatingCardAnimatedStyle}>
        {/* TEMPORARY TEST: Replace PostCardS with a simple View and Text */}
        <View style={{ flex: 1, backgroundColor: 'rgba(255,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>OVERLAY CARD TEST</Text>
        </View>
      </Reanimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    // pointerEvents: 'none', // Moved to the View props for clarity
  },
});

export default DragOverlay; 