import React, { useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { type Loop } from '@/context/LoopsContext';
import { MOCK_POSTS } from '@/data/mockPosts';
import { getLoopPostCount } from '@/utils/loopHelpers';
import { type SwipeableRowRef } from '@/components/common/SwipeableRow';
import { LoopCard } from '@/components/loops/LoopCard';
import { LoopPackCard } from '@/components/shop/LoopPackCard';
import LoopListPlaceholder from '@/components/loops/LoopListPlaceholder';
import { SCREEN_LAYOUT } from '@/constants/layout';
import LoopListSectionHeader from '@/components/loops/LoopListSectionHeader';
import LoopListSectionFooter from '@/components/loops/LoopListSectionFooter';

// This is the key change: The loopData now includes postCount.
type LoopWithCount = Loop & { postCount: number };

// Data types used by this hook
export interface LoopsScreenItemInternal {
  id: string;
  type:
    | 'autoListingLoopActive'
    | 'pinnedLoopsHeader'
    | 'pinnedLoopItem'
    | 'frequentLoopsHeader'
    | 'frequentLoopItem'
    | 'discoverPacksHeader'
    | 'discoverPacksCarousel';
  title?: string;
  loopId?: string;
  loopData?: LoopWithCount; // Use the enhanced type here
}

interface DiscoverPackInternal {
  id: string;
  title: string;
  previewImageUrl?: string;
  isLocked: boolean;
  priceLabel?: string;
}

// Simplified theme styles structure based on usage in LoopListSection renderItem
export interface HookThemeStyles {
  colors: { [key: string]: string; border: string; card: string; }; // Added border and card for placeholder
  spacing: { [key: string]: number; sm: number; md: number; lg: number }; // Added sm, md, lg for placeholder and pack card
  borderRadius: { [key: string]: number; lg: number; sm: number; full: number }; // Added for placeholder
}

export interface UseLoopListRenderersProps {
  filteredLoops: Loop[];
  swipeableRowRefs: React.MutableRefObject<Map<string, SwipeableRowRef | null>>;
  onLoopPress: (loopId: string | undefined) => void;
  onLongPressLoop: (loopId: string, loopTitle: string, isPinned: boolean) => void;
  onToggleLoopActive: (loopId: string, newIsActive: boolean) => void;
  onPinLoop: (loopId: string) => void;
  onUnpinLoop: (loopId: string) => void;
  onPackPress: (packId: string, isLocked: boolean) => void;
  themeStyles: HookThemeStyles; // Use the more specific type
  listItemStyle?: StyleProp<ViewStyle>; // Optional, as LoopListSection has a default
}

export const useLoopListRenderers = ({
  filteredLoops,
  swipeableRowRefs,
  onLoopPress,
  onLongPressLoop,
  onToggleLoopActive,
  onPinLoop,
  onUnpinLoop,
  onPackPress,
  themeStyles,
  listItemStyle,
}: UseLoopListRenderersProps) => {
  const { colors, spacing, borderRadius } = themeStyles; // Destructure for convenience

  const listData = useMemo(() => {
    const loopsWithCounts: LoopWithCount[] = filteredLoops.map(loop => ({
      ...loop,
      postCount: getLoopPostCount(loop.id, MOCK_POSTS),
    }));

    const currentPinnedLoops = loopsWithCounts.filter(loop => loop.isPinned);
    const currentFrequentLoops = loopsWithCounts.filter(loop => !loop.isPinned && loop.id !== 'auto-listing');
    const autoListingLoopFromFiltered = loopsWithCounts.find(loop => loop.id === 'auto-listing');

    const items: LoopsScreenItemInternal[] = [];

    if (autoListingLoopFromFiltered) {
      items.push({
        id: 'auto-listing-loop',
        type: 'autoListingLoopActive',
        loopId: autoListingLoopFromFiltered.id,
        loopData: autoListingLoopFromFiltered,
      });
    }

    if (currentPinnedLoops.length > 0) {
      items.push({ id: 'pinned-header', type: 'pinnedLoopsHeader', title: 'Pinned Loops' });
      currentPinnedLoops.forEach(loop => items.push({ id: `pinned-${loop.id}`, type: 'pinnedLoopItem', loopId: loop.id, loopData: loop }));
    }
    if (currentFrequentLoops.length > 0) {
      items.push({ id: 'frequent-header', type: 'frequentLoopsHeader', title: 'Loops' });
      currentFrequentLoops.forEach(loop => items.push({ id: `frequent-${loop.id}`, type: 'frequentLoopItem', loopId: loop.id, loopData: loop }));
    }
    items.push({ id: 'discover-packs-header', type: 'discoverPacksHeader', title: 'Discover Loop Packs' });
    items.push({ id: 'discover-packs-carousel', type: 'discoverPacksCarousel' });
    return items;
  }, [filteredLoops]);

  const keyExtractor = useCallback((item: LoopsScreenItemInternal) => item.id, []);

  const renderItem = useCallback(({ item }: { item: LoopsScreenItemInternal }) => {
    const loop = item.loopData;

    // Assuming LoopListPlaceholder is imported correctly and takes these props
    const renderIndividualPlaceholder = () => <LoopListPlaceholder count={1} />;

    switch (item.type) {
      case 'pinnedLoopsHeader':
      case 'frequentLoopsHeader':
      case 'discoverPacksHeader':
        if (!item.title) return null;
        return <LoopListSectionHeader title={item.title} />;
      case 'autoListingLoopActive':
        if (!loop || !item.loopId) return renderIndividualPlaceholder();
        return (
          <LoopCard
            ref={(ref: SwipeableRowRef | null) => item.loopId && swipeableRowRefs.current.set(item.loopId, ref)}
            loop={loop}
            onPress={() => onLoopPress(item.loopId)}
            onLongPress={() => item.loopId && loop.title && onLongPressLoop(item.loopId, loop.title, loop.isPinned)}
            onToggleActive={onToggleLoopActive}
            style={listItemStyle}
          />
        );
      case 'pinnedLoopItem':
        if (!loop || !item.loopId) return renderIndividualPlaceholder();
        return (
          <LoopCard
            ref={(ref: SwipeableRowRef | null) => item.loopId && swipeableRowRefs.current.set(item.loopId, ref)}
            loop={loop}
            isPinned={true}
            onPress={() => onLoopPress(item.loopId)}
            onLongPress={() => item.loopId && loop.title && onLongPressLoop(item.loopId, loop.title, true)}
            onToggleActive={onToggleLoopActive}
            style={listItemStyle}
            onSwipeUnpin={item.loopId ? () => onUnpinLoop(item.loopId!) : undefined}
          />
        );
      case 'frequentLoopItem':
        if (!loop || !item.loopId) return renderIndividualPlaceholder();
        return (
          <LoopCard
            ref={(ref: SwipeableRowRef | null) => item.loopId && swipeableRowRefs.current.set(item.loopId, ref)}
            loop={loop}
            isPinned={false}
            onPress={() => onLoopPress(item.loopId)}
            onLongPress={() => item.loopId && loop.title && onLongPressLoop(item.loopId, loop.title, false)}
            onToggleActive={onToggleLoopActive}
            style={listItemStyle}
            onSwipePin={item.loopId ? () => onPinLoop(item.loopId!) : undefined}
          />
        );
      case 'discoverPacksCarousel': {
        const discoverPacksData: DiscoverPackInternal[] = [
          { id: 'dp1', title: 'New Agent Essentials', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/essentials/300/200' },
          { id: 'dp2', title: 'Luxury Market', isLocked: true, priceLabel: '$19.99', previewImageUrl: 'https://picsum.photos/seed/luxury/300/200' },
          { id: 'dp3', title: 'Holiday Cheer', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/holiday/300/200' },
          { id: 'dp4', title: 'Spring Listings', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/spring/300/200' },
          { id: 'dp5', title: 'Pro Agent Toolkit', isLocked: true, priceLabel: 'Premium', previewImageUrl: 'https://picsum.photos/seed/pro/300/200' },
        ];
        const renderPackCarouselItem = ({ item: packItem }: { item: DiscoverPackInternal }) => (
          <LoopPackCard
            pack={{
                id: packItem.id,
                title: packItem.title,
                priceLabel: packItem.priceLabel || '',
                isLocked: packItem.isLocked,
                previewImageUrl: packItem.previewImageUrl,
            }}
            style={{ width: 160, height: 240, marginRight: spacing.md }}
            onPress={() => onPackPress(packItem.id, packItem.isLocked)}
          />
        );
        return (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={discoverPacksData}
            renderItem={renderPackCarouselItem}
            keyExtractor={(packItem) => packItem.id}
            contentContainerStyle={{ paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding }}
            style={[{ marginHorizontal: -SCREEN_LAYOUT.content.horizontalPadding }]}
          />
        );
      }
      default:
        return null;
    }
  }, [
    themeStyles, // Use the whole themeStyles object as a dependency
    swipeableRowRefs, 
    onLoopPress, onLongPressLoop, onToggleLoopActive, 
    onPinLoop, onUnpinLoop, onPackPress, 
    listItemStyle
    // Destructured colors, spacing, borderRadius are derived from themeStyles, so themeStyles is the true dependency.
  ]);

  // Updated to use the new components
  // Assuming renderSectionHeader might be called with a section object with a title
  const renderSectionHeader = useCallback(({ section }: { section: { title?: string } }) => {
    if (!section || !section.title) return null;
    return <LoopListSectionHeader title={section.title} />;
  }, []);

  const renderSectionFooter = useCallback(() => {
    return <LoopListSectionFooter />;
  }, []);

  return {
    listData,
    renderItem,
    keyExtractor,
    renderSectionHeader,
    renderSectionFooter,
  };
}; 