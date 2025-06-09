import React, { useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LoopCard } from '@/components/LoopCard';
import { SubtleSectionHeader } from '@/components/SubtleSectionHeader';
import type { Loop } from '@/context/LoopsContext';
import type { SwipeableRowRef } from '@/components/common/SwipeableRow';
import { LAYOUT } from '@/constants/layout';


// Simplified item types for this hook
export const SIMPLE_LOOP_ITEM_TYPE = {
  LOOP: 'LOOP',
  HEADER: 'HEADER',
  PLACEHOLDER: 'PLACEHOLDER',
} as const;

export type SimpleLoopItemType = typeof SIMPLE_LOOP_ITEM_TYPE[keyof typeof SIMPLE_LOOP_ITEM_TYPE];

export interface SimpleListItem {
  id: string;
  key?: string; // For keyExtractor fallback
  type: SimpleLoopItemType;
  loopData?: Loop; // For LOOP type
  isPinned?: boolean; // For LOOP type
  title?: string;    // For HEADER type
  placeholderText?: string; // Optional text for placeholder
}

export interface UseLoopListRenderersDeps {
  handleLongPressLoop: (loopId: string, loopTitle: string, isPinned: boolean) => void;
  onLoopPress: (loopId: string | undefined) => void;
  onToggleLoopActive: (loopId: string, newIsActive: boolean) => void;
  onPinLoop: (loopId: string) => void;
  onUnpinLoop: (loopId: string) => void;
  swipeableRowRefs?: React.MutableRefObject<Map<string, SwipeableRowRef | null>>;
  themeColors: {
    border: string;
    text: string; // Added for placeholder text
    card: string; // Added for placeholder background
  };
}

export const useLoopListRenderers = (deps: UseLoopListRenderersDeps) => {
  const { 
    handleLongPressLoop,
    onLoopPress,
    onToggleLoopActive,
    onPinLoop,
    onUnpinLoop,
    swipeableRowRefs,
    themeColors 
  } = deps;

  const keyExtractor = useCallback((item: SimpleListItem, index: number) => {
    return item.id || item.key || String(index);
  }, []);

  const renderItem = useCallback(({ item }: { item: SimpleListItem }) => {
    switch (item.type) {
      case SIMPLE_LOOP_ITEM_TYPE.LOOP:
        if (!item.loopData || !item.loopData.id) return null;

        const loopId = item.loopData.id;
        const loopTitle = item.loopData.title;
        const isPinned = item.isPinned || false;

        const swipePinHandler = !isPinned ? () => onPinLoop(loopId) : undefined;
        const swipeUnpinHandler = isPinned ? () => onUnpinLoop(loopId) : undefined;

        const loopCardProps = {
          loop: item.loopData,
          isPinned: isPinned,
          onPress: () => onLoopPress(loopId),
          onLongPress: () => handleLongPressLoop(loopId, loopTitle, isPinned),
          onToggleActive: onToggleLoopActive, 
          style: { marginBottom: LAYOUT.content.cardSpacing },
          onSwipePin: swipePinHandler,
          onSwipeUnpin: swipeUnpinHandler
        };

        return <LoopCard {...loopCardProps} />;
      case SIMPLE_LOOP_ITEM_TYPE.HEADER:
        if (!item.title) return null;
        return <SubtleSectionHeader title={item.title} />;
      case SIMPLE_LOOP_ITEM_TYPE.PLACEHOLDER:
        // Inline styled View for placeholder
        return (
          <View 
            style={{
              height: 100, // Default height
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              borderWidth: 1,
              borderRadius: 8, // Default border radius
              marginBottom: LAYOUT.content.cardSpacing, // Valid: LAYOUT.content.cardSpacing
              padding: 16, // Default padding, matches LAYOUT.screen.horizontalPadding
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: themeColors.text, fontSize: 14, opacity: 0.6 }}>
              {item.placeholderText || 'Loading Loop...'}
            </Text>
          </View>
        );
      default:
        return null;
    }
  }, [handleLongPressLoop, onLoopPress, onToggleLoopActive, onPinLoop, onUnpinLoop, swipeableRowRefs, themeColors]);

  return { renderItem, keyExtractor };
};

// Default export for router compatibility if placed in certain directories
export default useLoopListRenderers; 