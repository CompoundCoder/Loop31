import { useMemo } from 'react';
import type { Loop } from '@/context/LoopsContext';
import { LOOP_ITEM_TYPE } from '../app/constants/loopItemTypes'; // Adjusted path

// Local definition for LoopsScreenItem, mirrors what was in app/(loops)/index.tsx
export interface LoopsScreenItem {
  id: string;
  type: string; // Using string for LOOP_ITEM_TYPE values
  title?: string;
  subtitle?: string;
  loopId?: string;
  packId?: string;
  // pack?: LoopPack; // Assuming LoopPack is not strictly needed for this hook's direct outputs
  loopData?: Loop;
}

// Local definitions for SimpleListItem and SIMPLE_LOOP_ITEM_TYPE due to persistent linter issues
// These should ideally be imported from useLoopListRenderers if resolvable
export const SIMPLE_LOOP_ITEM_TYPE = {
  HEADER: 'header',
  LOOP: 'loop',
  PLACEHOLDER: 'placeholder',
} as const;

export type SimpleListItem =
  | { id: string; type: typeof SIMPLE_LOOP_ITEM_TYPE.HEADER; title: string }
  | { id: string; type: typeof SIMPLE_LOOP_ITEM_TYPE.LOOP; loopData: Loop; isPinned: boolean }
  | { id: string; type: typeof SIMPLE_LOOP_ITEM_TYPE.PLACEHOLDER; placeholderText: string };

interface UseLoopLayoutProps {
  filteredLoops: Loop[];
  loopList: Loop[];
  pinnedLoopIds: Set<string>;
  searchQuery: string;
  isLoading: boolean;
  hasMatches: boolean;
}

export const useLoopLayout = ({
  filteredLoops,
  loopList,
  pinnedLoopIds,
  searchQuery,
  isLoading,
  hasMatches,
}: UseLoopLayoutProps) => {

  const listDataForLoopListSection = useMemo((): LoopsScreenItem[] => {
    const currentPinnedLoops = filteredLoops.filter(loop => pinnedLoopIds.has(loop.id));
    const currentFrequentLoops = filteredLoops.filter(loop => !pinnedLoopIds.has(loop.id) && loop.id !== 'auto-listing');
    const autoListingLoop = loopList.find(loop => loop.id === 'auto-listing');
    const items: LoopsScreenItem[] = [];

    if (autoListingLoop) {
      items.push({
        id: 'auto-listing-loop',
        type: LOOP_ITEM_TYPE.AUTO_LISTING_LOOP_ACTIVE,
        loopId: autoListingLoop.id,
        loopData: autoListingLoop
      });
    }
    if (currentPinnedLoops.length > 0) {
      items.push({ id: 'pinned-header', type: LOOP_ITEM_TYPE.PINNED_LOOPS_HEADER, title: 'Pinned Loops' });
      currentPinnedLoops.forEach(loop => items.push({
        id: `pinned-${loop.id}`,
        type: LOOP_ITEM_TYPE.PINNED_LOOP_ITEM,
        loopId: loop.id,
        loopData: loop
      }));
    }
    if (currentFrequentLoops.length > 0) {
      items.push({ id: 'frequent-header', type: LOOP_ITEM_TYPE.FREQUENT_LOOPS_HEADER, title: 'Loops' });
      currentFrequentLoops.forEach(loop => items.push({
        id: `frequent-${loop.id}`,
        type: LOOP_ITEM_TYPE.FREQUENT_LOOP_ITEM,
        loopId: loop.id,
        loopData: loop
      }));
    }
    return items;
  }, [filteredLoops, pinnedLoopIds, loopList]);

  const simpleListData = useMemo((): SimpleListItem[] => {
    const items: SimpleListItem[] = [];
    if (isLoading && loopList.length === 0) {
      items.push({ id: 'loading-placeholder', type: SIMPLE_LOOP_ITEM_TYPE.PLACEHOLDER, placeholderText: 'Loading Loops...' });
      return items;
    }
    const currentPinnedLoops = filteredLoops.filter(loop => pinnedLoopIds.has(loop.id));
    const currentFrequentLoops = filteredLoops.filter(loop => !pinnedLoopIds.has(loop.id) && loop.id !== 'auto-listing');
    const autoListingLoop = loopList.find(loop => loop.id === 'auto-listing');

    if (autoListingLoop) {
      items.push({ id: autoListingLoop.id, type: SIMPLE_LOOP_ITEM_TYPE.LOOP, loopData: autoListingLoop, isPinned: false });
    }

    if (currentPinnedLoops.length > 0) {
      items.push({ id: 'pinned-loops-header', type: SIMPLE_LOOP_ITEM_TYPE.HEADER, title: 'Pinned Loops' });
      currentPinnedLoops.forEach(loop => {
        items.push({ id: loop.id, type: SIMPLE_LOOP_ITEM_TYPE.LOOP, loopData: loop, isPinned: true });
      });
    }

    if (currentFrequentLoops.length > 0) {
      if (currentPinnedLoops.length === 0 || currentFrequentLoops.length > 0) { // Ensure header logic is correct
         items.push({ id: 'frequent-loops-header', type: SIMPLE_LOOP_ITEM_TYPE.HEADER, title: 'Loops' });
      }
      currentFrequentLoops.forEach(loop => {
        items.push({ id: loop.id, type: SIMPLE_LOOP_ITEM_TYPE.LOOP, loopData: loop, isPinned: false });
      });
    }
    return items;
  }, [isLoading, filteredLoops, pinnedLoopIds, loopList]);

  const initiallyHadLoops = useMemo(() => loopList.some(loop => loop.id !== 'auto-listing'), [loopList]);

  const isListEmpty = useMemo(() => {
    return !listDataForLoopListSection.some(item =>
        item.type === LOOP_ITEM_TYPE.PINNED_LOOP_ITEM ||
        item.type === LOOP_ITEM_TYPE.FREQUENT_LOOP_ITEM ||
        item.type === LOOP_ITEM_TYPE.AUTO_LISTING_LOOP_ACTIVE
    );
  }, [listDataForLoopListSection]);

  const showOverallEmptyState = useMemo(() => !searchQuery && isListEmpty, [searchQuery, isListEmpty]);

  const noResultsAfterSearch = useMemo(() => searchQuery && !hasMatches && initiallyHadLoops, [searchQuery, hasMatches, initiallyHadLoops]);

  return {
    listDataForLoopListSection,
    simpleListData,
    isListEmpty,
    showOverallEmptyState,
    noResultsAfterSearch,
    initiallyHadLoops,
  };
}; 