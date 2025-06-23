export const LOOP_ITEM_TYPE = {
  // Types from app/(loops)/index.tsx's LoopsScreenItem
  HEADER_BUTTON: 'headerButton',
  AUTO_LISTING_LOOP_SETUP: 'autoListingLoopSetup',
  AUTO_LISTING_LOOP_ACTIVE: 'autoListingLoopActive',
  PINNED_LOOPS_HEADER: 'pinnedLoopsHeader',
  PINNED_LOOP_ITEM: 'pinnedLoopItem',
  FREQUENT_LOOPS_HEADER: 'frequentLoopsHeader',
  FREQUENT_LOOP_ITEM: 'frequentLoopItem',
  DISCOVER_PACKS_HEADER: 'discoverPacksHeader',
  DISCOVER_PACKS_CAROUSEL: 'discoverPacksCarousel',
} as const;

export type LoopItemType = typeof LOOP_ITEM_TYPE[keyof typeof LOOP_ITEM_TYPE];

export default LOOP_ITEM_TYPE; 