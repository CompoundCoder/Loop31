import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LoopCard } from '@/components/LoopCard';
import { SubtleSectionHeader } from '@/components/SubtleSectionHeader';
import { LoopPackCard } from '@/components/shop/LoopPackCard';
import type { Loop } from '@/context/LoopsContext';
import type { SwipeableRowRef } from '@/components/common/SwipeableRow';
import { LOOP_ITEM_TYPE, type LoopItemType } from '@/app/constants/loopItemTypes'; // Corrected path

// --- Import the new LoopPlaceholder component ---
import LoopPlaceholder from '@/components/loops/LoopPlaceholder'; // Path will be valid after LoopPlaceholder is moved

// --- Type Definitions (mirrored from app/(loops)/index.tsx for relevant items) ---

export interface LoopsScreenItem {
  id: string;
  type: LoopItemType;
  title?: string;
  loopId?: string;
  loopData?: Loop;
}

// TODO: This data (DiscoverPack[]) should eventually be fetched or imported, not hardcoded or mocked here.
// For now, the type is defined for the context.
export interface DiscoverPack {
  id: string;
  title: string;
  previewImageUrl?: string;
  isLocked: boolean;
  priceLabel?: string;
}

// --- Context for renderLoopItem ---

export interface RenderLoopItemContext {
  // Callbacks
  onLoopPress: (loopId: string | undefined) => void;
  onLongPressLoop: (loopId: string, loopTitle: string, isPinned: boolean) => void;
  onToggleLoopActive: (loopId: string, newIsActive: boolean) => void;
  onPinLoop: (loopId: string) => void;
  onUnpinLoop: (loopId: string) => void;
  onPackPress: (packId: string, isLocked: boolean) => void;

  // Data & State
  pinnedIds: Set<string>;
  swipeableRowRefs: React.MutableRefObject<Map<string, SwipeableRowRef | null>>;
  discoverPacksData: DiscoverPack[];

  // Theme related
  colors: {
    border: string;
    card: string; // For placeholder background
  };
  spacing: {
    sm: number; // For header margin
    md: number; // For placeholder, LoopPackCard marginRight
    lg: number; // For placeholder padding
  };
  borderRadius: {
    lg: number; // For placeholder
    sm: number; // For placeholder
    full: number; // For placeholder color indicator
  };
  // Layout constants
  SCREEN_LAYOUT_CONTENT_HORIZONTAL_PADDING: number;
  LAYOUT_CONTENT_CARD_SPACING: number; // For placeholder marginBottom and listItem marginBottom
}

// --- Main Render Function ---

export const renderLoopItem = (item: LoopsScreenItem, context: RenderLoopItemContext) => {
  const {
    onLoopPress,
    onLongPressLoop,
    onToggleLoopActive,
    onPinLoop,
    onUnpinLoop,
    onPackPress,
    pinnedIds,
    swipeableRowRefs,
    discoverPacksData,
    colors,
    spacing,
    SCREEN_LAYOUT_CONTENT_HORIZONTAL_PADDING,
  } = context;

  const loop = item.loopData;
  const baseHeaderStyle = { marginBottom: spacing.sm };

  switch (item.type) {
    case LOOP_ITEM_TYPE.PINNED_LOOPS_HEADER:
    case LOOP_ITEM_TYPE.FREQUENT_LOOPS_HEADER:
    case LOOP_ITEM_TYPE.DISCOVER_PACKS_HEADER:
      if (!item.title) return null;
      return <View style={baseHeaderStyle}><SubtleSectionHeader title={item.title} /></View>;

    case LOOP_ITEM_TYPE.AUTO_LISTING_LOOP_ACTIVE:
      if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />;
      return (
        <LoopCard
          ref={(ref: SwipeableRowRef | null) => swipeableRowRefs.current.set(item.loopId!, ref)}
          loop={loop}
          onPress={() => onLoopPress(item.loopId)}
          onLongPress={() => item.loopId && loop.title && onLongPressLoop(item.loopId, loop.title, pinnedIds.has(item.loopId!))}
          onToggleActive={onToggleLoopActive}
          style={[localStyles.listItem, { marginBottom: context.LAYOUT_CONTENT_CARD_SPACING }]}
        />
      );

    case LOOP_ITEM_TYPE.PINNED_LOOP_ITEM:
      if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />;
      return (
        <LoopCard
          ref={(ref: SwipeableRowRef | null) => swipeableRowRefs.current.set(item.loopId!, ref)}
          loop={loop}
          isPinned={true}
          onPress={() => onLoopPress(item.loopId)}
          onLongPress={() => item.loopId && loop.title && onLongPressLoop(item.loopId, loop.title, true)}
          onToggleActive={onToggleLoopActive}
          style={[localStyles.listItem, { marginBottom: context.LAYOUT_CONTENT_CARD_SPACING }]}
          onSwipeUnpin={item.loopId ? () => onUnpinLoop(item.loopId!) : undefined}
        />
      );

    case LOOP_ITEM_TYPE.FREQUENT_LOOP_ITEM:
      if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />;
      return (
        <LoopCard
          ref={(ref: SwipeableRowRef | null) => swipeableRowRefs.current.set(item.loopId!, ref)}
          loop={loop}
          isPinned={false}
          onPress={() => onLoopPress(item.loopId)}
          onLongPress={() => item.loopId && loop.title && onLongPressLoop(item.loopId, loop.title, false)}
          onToggleActive={onToggleLoopActive}
          style={[localStyles.listItem, { marginBottom: context.LAYOUT_CONTENT_CARD_SPACING }]}
          onSwipePin={item.loopId ? () => onPinLoop(item.loopId!) : undefined}
        />
      );

    case LOOP_ITEM_TYPE.DISCOVER_PACKS_CAROUSEL: {
      const renderPackItem = ({ item: packItem }: { item: DiscoverPack }) => (
        <LoopPackCard
          pack={packItem}
          style={{ width: 160, height: 240, marginRight: spacing.md }}
          onPress={() => onPackPress(packItem.id, packItem.isLocked)}
        />
      );
      return (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={discoverPacksData}
          renderItem={renderPackItem}
          keyExtractor={(packItem) => packItem.id}
          contentContainerStyle={{ paddingHorizontal: SCREEN_LAYOUT_CONTENT_HORIZONTAL_PADDING }}
          style={[{ marginHorizontal: -SCREEN_LAYOUT_CONTENT_HORIZONTAL_PADDING }]}
        />
      );
    }
    default:
      return null;
  }
};

// --- Local Styles ---
const localStyles = StyleSheet.create({
  listItem: {
    // marginBottom is now applied dynamically using context.LAYOUT_CONTENT_CARD_SPACING
  },
  // Placeholder styles removed as they are now in LoopPlaceholder.tsx
});

export default renderLoopItem; 