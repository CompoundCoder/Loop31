import React, { createContext, useContext, useMemo } from 'react';
import Reanimated, { useSharedValue, type SharedValue, runOnJS } from 'react-native-reanimated';
import type { Post as OriginalPostType } from '@/components/loops/PostCardS'; // Assuming PostCardS exports its Post type

// Re-export or redefine Post type if not directly available or to avoid circular deps
export interface Post extends OriginalPostType {}

export interface DraggedItemDetails {
  post: Post;
  initialX: number; // Absolute screen X of the original item
  initialY: number; // Absolute screen Y of the original item
  width: number;
  height: number;
  variant: 'featured' | 'mini';
  cardWidth?: number; // For mini variant
}

interface DragOverlayContextType {
  draggedItemDetails: Readonly<SharedValue<DraggedItemDetails | null>>;
  currentDragX: Readonly<SharedValue<number>>; // Absolute screen X for the overlay item
  currentDragY: Readonly<SharedValue<number>>; // Absolute screen Y for the overlay item
  isDraggingActive: Readonly<SharedValue<boolean>>;
  startDrag: (details: DraggedItemDetails) => void;
  updateDragPosition: (translationX: number, translationY: number) => void;
  endDrag: () => void;
}

const DragOverlayContext = createContext<DragOverlayContextType | undefined>(undefined);

export const useDragOverlay = () => {
  const context = useContext(DragOverlayContext);
  if (!context) {
    throw new Error('useDragOverlay must be used within a DragOverlayProvider');
  }
  return context;
};

interface DragOverlayProviderProps {
  children: React.ReactNode;
}

export const DragOverlayProvider: React.FC<DragOverlayProviderProps> = ({ children }) => {
  const draggedItemDetailsShared = useSharedValue<DraggedItemDetails | null>(null);
  const currentDragXShared = useSharedValue(0);
  const currentDragYShared = useSharedValue(0);
  const isDraggingActiveShared = useSharedValue(false);

  const startDrag = (details: DraggedItemDetails) => {
    'worklet';
    runOnJS(console.log)('[DragOverlayContext] startDrag called with details:', JSON.stringify(details));
    draggedItemDetailsShared.value = { ...details };
    currentDragXShared.value = details.initialX;
    currentDragYShared.value = details.initialY;
    isDraggingActiveShared.value = true;
    runOnJS(console.log)('[DragOverlayContext] isDraggingActive after startDrag:', isDraggingActiveShared.value);
  };

  const updateDragPosition = (translationX: number, translationY: number) => {
    'worklet';
    if (draggedItemDetailsShared.value) {
      currentDragXShared.value = draggedItemDetailsShared.value.initialX + translationX;
      currentDragYShared.value = draggedItemDetailsShared.value.initialY + translationY;
    } else {
      runOnJS(console.warn)('[DragOverlayContext] updateDragPosition called but no draggedItemDetails');
    }
  };

  const endDrag = () => {
    'worklet';
    runOnJS(console.log)('[DragOverlayContext] endDrag called');
    isDraggingActiveShared.value = false;
    // Setting details to null after a short delay can help if there's an outro animation for the overlay item.
    // For now, we'll clear it immediately or let DragOverlay handle disappearance via isDraggingActive.
    // To ensure PostCardS in overlay doesn't hold stale data if it remounts, clearing is safer.
    // draggedItemDetailsShared.value = null; // Clear details on endDrag
  };
  
  // Note: useMemo is for React's render cycle. Here, we are defining functions that will be called from worklets or UI thread.
  // The functions themselves don't need to be memoized with useMemo unless their identity stability is critical for React pure components.
  // The shared values themselves are stable.
  const contextValue = {
    draggedItemDetails: draggedItemDetailsShared,
    currentDragX: currentDragXShared,
    currentDragY: currentDragYShared,
    isDraggingActive: isDraggingActiveShared,
    startDrag,
    updateDragPosition,
    endDrag,
  };

  return (
    <DragOverlayContext.Provider value={contextValue}>
      {children}
    </DragOverlayContext.Provider>
  );
}; 