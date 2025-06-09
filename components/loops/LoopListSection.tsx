import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  RefreshControl,
  FlatList, // For DiscoverPacks carousel
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import Reanimated from 'react-native-reanimated';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { type Loop } from '@/context/LoopsContext';
import { LoopsEmptyState } from '@/components/loops/LoopsEmptyState';
import EmptyStateMessage from '@/components/loops/EmptyStateMessage';
import { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader'; // For paddingTop
import { SCREEN_LAYOUT } from '@/constants/layout';
import type { MaterialCommunityIcons } from '@expo/vector-icons'; // For LoopPack icon type
import LoopListPlaceholder from '@/components/loops/LoopListPlaceholder';

// Data types used within this component's listData
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
  loopData?: Loop;
}

interface DiscoverPackInternal {
  id: string;
  title: string;
  previewImageUrl?: string;
  isLocked: boolean;
  priceLabel?: string;
}

export interface LoopListSectionProps {
  isLoading: boolean;
  searchQuery: string;
  hasMatches: boolean;
  initiallyHadLoops: boolean;
  refreshing: boolean;
  scrollY: Reanimated.SharedValue<number>;
  onRefresh: () => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onOpenCreateLoopForm: () => void;
  listData: LoopsScreenItemInternal[];
  renderItem: ListRenderItem<LoopsScreenItemInternal>;
  keyExtractor: (item: LoopsScreenItemInternal, index?: number) => string;
}

export const LoopListSection: React.FC<LoopListSectionProps> = ({
  isLoading,
  searchQuery,
  hasMatches,
  initiallyHadLoops,
  refreshing,
  scrollY,
  onRefresh,
  onScroll,
  onOpenCreateLoopForm,
  listData,
  renderItem,
  keyExtractor,
}) => {
  const { spacing } = useThemeStyles();

  const isListEmpty = useMemo(() => {
    return !listData.some(item => 
        item.type === 'pinnedLoopItem' || 
        item.type === 'frequentLoopItem' || 
        item.type === 'autoListingLoopActive'
    );
  }, [listData]);

  if (isLoading && !searchQuery && listData.length === 0) {
    return <LoopListPlaceholder count={3} />;
  }

  const showOverallEmptyState = !searchQuery && isListEmpty;
  const noResultsAfterSearch = searchQuery && !hasMatches && initiallyHadLoops;

  if (showOverallEmptyState) {
    return <LoopsEmptyState onCreateLoop={onOpenCreateLoopForm} />;
  }

  if (noResultsAfterSearch) {
    return (
      <EmptyStateMessage
        title="No Loops Found"
        message={`We couldn\'t find any loops matching "${searchQuery}". Try a different search?`}
        iconName="magnify-close"
      />
    );
  }
  
  if (listData.length > 0 && (!isListEmpty || (searchQuery && hasMatches))) {
    return (
      <FlashList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={100}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingTop: MINI_HEADER_HEIGHT + 16,
          paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
          paddingBottom: spacing.lg,
        }}
      />
    );
  }

  return null;
};

const styles = StyleSheet.create({
  listItem: {
    marginBottom: 16, // Same as original styles.listItem
  },
  loopCardPlaceholder: {
    borderWidth: 1,
  },
  loopHeaderPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loopColorIndicatorPlaceholder: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  loopTitlePlaceholder: {
    height: 24,
    width: 160,
    opacity: 0.5,
  },
  loopStatsPlaceholder: {
    height: 16,
    width: 120,
    opacity: 0.5,
  },
});

export default LoopListSection; 