import React, { useRef, useState, useMemo, useCallback, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  RefreshControl,
  FlatList,
  Pressable,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ExtendedTheme } from '@/app/_layout';
import Reanimated, { useSharedValue } from 'react-native-reanimated';
import { FlashList } from "@shopify/flash-list";
import * as Haptics from 'expo-haptics';
import { useRouter, useNavigation } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LoopCreationModal from '@/components/loops/CreateLoopModal';
// Import Theme types for the style function
import type { Theme } from '@/theme/theme';
import type { Elevation } from '@/theme/theme'; // Assuming Elevation type is exported or can be inferred

import AnimatedHeader, { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';
import EmptyState from '@/components/EmptyState';
import ScreenContainer from '@/components/ScreenContainer';
import { LAYOUT, SCREEN_LAYOUT } from '@/constants/layout';
import HeaderActionButton from '@/components/HeaderActionButton';
import { SubtleSectionHeader } from '@/components/SubtleSectionHeader';
import { LoopCard } from '@/components/LoopCard';
import { LoopPackCard } from '@/components/shop/LoopPackCard';

import { Modalize } from 'react-native-modalize';
import { LoopActionsModalContent } from '@/components/modals/LoopActionsModalContent';
import { LoopsEmptyState } from '@/components/loops/LoopsEmptyState';
import { useNotifications } from '@/modules/notifications';
import { SwipeableRowRef } from '@/components/common/SwipeableRow';
import { MOCK_POSTS } from '@/data/mockPosts'; 
import Popover from 'react-native-popover-view';
import { useLoops } from '@/context/LoopsContext'; 
import SlideUpMenu from '@/components/SlideUpMenu'; // Removed SlideUpMenuRef from here
import { type SlideUpMenuRef } from '@/components/SlideUpMenu/types'; // Import type from types.ts
import CreateLoopMenu from '@/components/CreateLoopMenu'; // Added

type LoopsScreenProps = {
  isLoading?: boolean;
};

interface LoopsScreenItem {
  id: string; 
  type: 
    | 'headerButton' 
    | 'autoListingLoopSetup'
    | 'autoListingLoopActive'
    | 'pinnedLoopsHeader'
    | 'pinnedLoopItem'
    | 'frequentLoopsHeader'
    | 'frequentLoopItem'
    | 'discoverPacksHeader' 
    | 'discoverPacksCarousel'; 
  title?: string;
  subtitle?: string;
  loopId?: string; 
  packId?: string; 
  pack?: LoopPack;
  loopData?: import('@/context/LoopsContext').Loop;
}

interface LoopPack {
  id: string;
  title: string;
  benefitSummary: string;
  priceLabel: string; 
  isLocked: boolean; 
  icon?: keyof typeof MaterialCommunityIcons.glyphMap; 
}

interface SelectedLoopState {
  id: string;
  title: string;
  isPinned: boolean;
}

interface DiscoverPack {
  id: string;
  title: string;
  previewImageUrl?: string;
  isLocked: boolean;
  priceLabel?: string; 
}

// Added: Copied from CreateLoopMenu.tsx - ideally this would be in a shared constants file
const PREDEFINED_LOOP_COLORS = [
  '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#7F53AC', '#F778A1',
  '#50C878', '#FF9F1C', '#54A0FF', '#A569BD', '#4ECDC4', '#F9A03F',
  '#FF7F50', '#6A5ACD', '#20B2AA', '#FFC0CB', '#87CEEB', '#DA70D6',
];

export type LoopsStackParamList = {
  index: undefined; 
  '[loopId]': { loopId: string }; 
};

// Removed LoopPlaceholder function definition from here. 
// It should be a separate component with its own internal styling.

// Define createStyles function outside the component
const createStyles = (theme: {
  colors: Theme['colors'];
  spacing: Theme['spacing'];
  borderRadius: Theme['borderRadius'];
  typography: Theme['typography'];
  elevation: Elevation; // Added elevation to the theme type for createStyles
}) => StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
    paddingBottom: LAYOUT.content.cardSpacing + MINI_HEADER_HEIGHT,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text,
  },
  modalStyle: {
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
  },
  listItem: {
    marginBottom: LAYOUT.content.cardSpacing,
  },
  // Add back popover styles if they are used by HeaderRight or other parts of this screen
  popoverMenu: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    ...theme.elevation.md, // Correctly access md from the passed elevation object
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2, // A bit more padding for touchability
  },
  popoverItemText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  popoverSeparator: {
    height: 1,
    marginVertical: theme.spacing.xs,
    // backgroundColor will be applied inline using colors.border
  },
});

export default function LoopsScreen({ isLoading = false }: LoopsScreenProps) {
  const baseTheme = useTheme() as unknown as ExtendedTheme;
  const { colors, spacing, borderRadius, typography, elevation } = useThemeStyles(); // Destructure all needed theme parts

  // Create styles inside the component, memoized
  const styles = React.useMemo(() => createStyles({ colors, spacing, borderRadius, typography, elevation }), // Pass elevation
    [colors, spacing, borderRadius, typography, elevation]
  );

  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const addButtonRef = useRef<View>(null);
  const modalizeRef = useRef<Modalize>(null);
  const [selectedLoopData, setSelectedLoopData] = useState<SelectedLoopState | null>(null);
  const { state, dispatch } = useLoops(); 
  const { addNotification } = useNotifications();
  const router = useRouter();
  const navigation = useNavigation<NativeStackNavigationProp<LoopsStackParamList>>();
  const swipeableRowRefs = useRef<Map<string, SwipeableRowRef | null>>(new Map());

  // Added: State for CreateLoopMenu
  const slideUpMenuRef = useRef<SlideUpMenuRef>(null);
  const [loopName, setLoopName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [loopColor, setLoopColor] = useState<string>(PREDEFINED_LOOP_COLORS[0]);
  const [isCreateLoopMenuVisible, setIsCreateLoopMenuVisible] = useState(false); // Added state for visibility

  const closeSwipeableRow = (loopId: string) => {
    const rowRef = swipeableRowRefs.current.get(loopId);
    rowRef?.close(); 
  };

  const handleToggleLoopActive = useCallback((loopId: string, newIsActive: boolean) => {
    dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId, isActive: newIsActive } });
  }, [dispatch]); 

  const handlePinLoop = useCallback((loopId: string) => {
    dispatch({ type: 'PIN', payload: loopId });
    addNotification({ title: 'Loop Pinned', message: '', accentColor: colors.accent, icon: 'pin', displayTarget: 'toast' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeSwipeableRow(loopId); 
  }, [addNotification, colors.accent, closeSwipeableRow, dispatch]);

  const handleUnpinLoop = useCallback((loopId: string) => {
    dispatch({ type: 'UNPIN', payload: loopId });
     addNotification({ title: 'Loop Unpinned', message: '', accentColor: colors.border, icon: 'pin-off', displayTarget: 'toast' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeSwipeableRow(loopId); 
  }, [addNotification, colors.border, closeSwipeableRow, dispatch]);

  const handleDeleteLoop = useCallback((loopId: string) => {
    const loopToDelete = state.loops.find(loop => loop.id === loopId);
    const loopTitle = loopToDelete?.title || 'this loop';
    modalizeRef.current?.close();
    Alert.alert(
      `Delete Loop?`,
      `Are you sure you want to delete "${loopTitle}"? This cannot be undone.`,
      [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => dispatch({ type: 'DELETE', payload: loopId }) }]
    );
  }, [state.loops, dispatch, modalizeRef]);

  const handleRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }, []);

  const handlePackPress = useCallback((packId: string, isLocked: boolean) => {
    if (isLocked) {
      Alert.alert("Pack Locked", "This pack requires purchase or subscription.");
    } else {
      router.push(`/shop/pack/${packId}`);
    }
  }, [router]);

  const handleLoopPress = useCallback((loopId: string | undefined) => {
    if (!loopId) return;
    console.log(`Navigating to loop: ${loopId} using navigation.navigate`);
    // Use the correct route name from LoopsStackParamList
    navigation.navigate('[loopId]', { loopId: loopId }); 
  }, [navigation]);

  const listData = useMemo(() => {
    const pinnedLoops = state.loops.filter(loop => state.pinnedLoopIds.has(loop.id));
    const frequentLoops = state.loops.filter(loop => !state.pinnedLoopIds.has(loop.id) && loop.id !== 'auto-listing'); 
    const autoListingLoop = state.loops.find(loop => loop.id === 'auto-listing');
    const items: LoopsScreenItem[] = [];
    if (autoListingLoop) items.push({ id: 'auto-listing-loop', type: 'autoListingLoopActive', loopId: autoListingLoop.id, loopData: autoListingLoop });
    if (pinnedLoops.length > 0) {
      items.push({ id: 'pinned-header', type: 'pinnedLoopsHeader', title: 'Pinned Loops' });
      pinnedLoops.forEach(loop => items.push({ id: `pinned-${loop.id}`, type: 'pinnedLoopItem', loopId: loop.id, loopData: loop }));
    }
    if (frequentLoops.length > 0) {
      items.push({ id: 'frequent-header', type: 'frequentLoopsHeader', title: 'Loops' });
      frequentLoops.forEach(loop => items.push({ id: `frequent-${loop.id}`, type: 'frequentLoopItem', loopId: loop.id, loopData: loop }));
    }
    items.push({ id: 'discover-packs-header', type: 'discoverPacksHeader', title: 'Discover Loop Packs' });
    items.push({ id: 'discover-packs-carousel', type: 'discoverPacksCarousel' });
    return items;
  }, [state.loops, state.pinnedLoopIds]);

  const isListEmpty = useMemo(() => !listData.some(item => item.type === 'pinnedLoopItem' || item.type === 'frequentLoopItem'), [listData]);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => { scrollY.value = event.nativeEvent.contentOffset.y; };
  const handleEditLoop = useCallback((loopId: string) => { console.log(`[ACTION] Edit Loop: ${loopId}`); }, []);
  const handleDuplicateLoop = useCallback((loopId: string) => { console.log(`[ACTION] Duplicate Loop: ${loopId}`); }, [addNotification]); 

  const handleLongPressLoop = useCallback((loopId: string, loopTitle: string, isPinned: boolean) => {
    setSelectedLoopData({ id: loopId, title: loopTitle, isPinned });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    modalizeRef.current?.open(); 
  }, [setSelectedLoopData, modalizeRef]); 

  const closeModal = useCallback(() => { modalizeRef.current?.close(); }, [modalizeRef]);

  const handleModalAction = useCallback((action: 'edit' | 'duplicate' | 'delete') => {
    if (!selectedLoopData) return;
    const loopId = selectedLoopData.id;
    closeModal(); 
    setTimeout(() => {
        switch (action) {
            case 'edit': handleEditLoop(loopId); break;
            case 'duplicate': handleDuplicateLoop(loopId); break;
            case 'delete': handleDeleteLoop(loopId); break;
        }
    }, 150); 
  }, [selectedLoopData, closeModal, handleEditLoop, handleDuplicateLoop, handleDeleteLoop]);

  // Added: Handler for saving the new loop
  const handleCreateLoop = () => {
    console.log('Creating Loop with:', { name: loopName, frequency, color: loopColor });
    // dispatch({ type: 'ADD_LOOP', payload: { title: loopName, frequency, color: loopColor, /* other properties */ } });
    setIsCreateLoopMenuVisible(false); // Close menu
    // Reset form after save
    setLoopName('');
    setFrequency('weekly');
    setLoopColor(PREDEFINED_LOOP_COLORS[0]);
    addNotification({
      title: "Loop Created!",
      message: `"${loopName || 'New Loop'}" has been added to your loops.`,
      accentColor: baseTheme.colors.success, // Use baseTheme here for direct access
      icon: 'check-circle-outline',
      displayTarget: 'toast'
    });
  };

  // New handler for opening the Create Loop menu via ref
  const handleOpenCreateLoopMenu = useCallback(() => {
    setIsPopoverVisible(false); // Close the popover
    slideUpMenuRef.current?.open(); // Open the SlideUpMenu using its ref
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [slideUpMenuRef, setIsPopoverVisible]); // Dependencies for useCallback

  const handleCreateAction = useCallback((action: 'post') => { // 'loop' case removed, only 'post' is handled
    setIsPopoverVisible(false);
    if (action === 'post') {
      router.push('/posts/create');
    }
    // Haptics for 'post' action (haptics for 'loop' are in handleOpenCreateLoopMenu)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [router, setIsPopoverVisible]); // Updated dependencies

  const renderItem = useCallback(({ item }: { item: LoopsScreenItem }) => {
    const loop = item.loopData;
    const baseHeaderStyle = { marginBottom: spacing.sm };

    switch (item.type) {
      case 'pinnedLoopsHeader':
      case 'frequentLoopsHeader':
      case 'discoverPacksHeader':
        return item.title ? <View style={baseHeaderStyle}><SubtleSectionHeader title={item.title} /></View> : null;
      case 'autoListingLoopActive':
        if (!loop || !item.loopId) return null; // Removed LoopPlaceholder
        return <LoopCard ref={(ref) => item.loopId && swipeableRowRefs.current.set(item.loopId, ref)} loop={loop} onPress={() => handleLoopPress(item.loopId)} onLongPress={() => item.loopId && loop.title && handleLongPressLoop(item.loopId, loop.title, false)} onToggleActive={handleToggleLoopActive} style={styles.listItem} />;
      case 'pinnedLoopItem':
        if (!loop || !item.loopId) return null; // Removed LoopPlaceholder
        return <LoopCard ref={(ref) => item.loopId && swipeableRowRefs.current.set(item.loopId, ref)} loop={loop} isPinned={true} onPress={() => handleLoopPress(item.loopId)} onLongPress={() => item.loopId && loop.title && handleLongPressLoop(item.loopId, loop.title, true)} onToggleActive={handleToggleLoopActive} style={styles.listItem} onSwipeUnpin={handleUnpinLoop} />;
      case 'frequentLoopItem':
        if (!loop || !item.loopId) return null; // Removed LoopPlaceholder
        return <LoopCard ref={(ref) => item.loopId && swipeableRowRefs.current.set(item.loopId, ref)} loop={loop} isPinned={false} onPress={() => handleLoopPress(item.loopId)} onLongPress={() => item.loopId && loop.title && handleLongPressLoop(item.loopId, loop.title, false)} onToggleActive={handleToggleLoopActive} style={styles.listItem} onSwipePin={handlePinLoop} />;
      case 'discoverPacksCarousel': {
          const discoverPacksData: DiscoverPack[] = [
            { id: 'dp1', title: 'New Agent Essentials', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/essentials/300/200' },
            { id: 'dp2', title: 'Luxury Market', isLocked: true, priceLabel: '$19.99', previewImageUrl: 'https://picsum.photos/seed/luxury/300/200' },
            { id: 'dp3', title: 'Holiday Cheer', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/holiday/300/200' },
            { id: 'dp4', title: 'Spring Listings', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/spring/300/200' },
            { id: 'dp5', title: 'Pro Agent Toolkit', isLocked: true, priceLabel: 'Premium', previewImageUrl: 'https://picsum.photos/seed/pro/300/200' },
          ];
          const renderPackItem = ({ item: packItem }: { item: DiscoverPack }) => (
            <LoopPackCard pack={packItem} style={{ width: 160, height: 240, marginRight: spacing.md }} onPress={() => handlePackPress(packItem.id, packItem.isLocked)} />
          );
          return (
            <FlatList horizontal showsHorizontalScrollIndicator={false} data={discoverPacksData} renderItem={renderPackItem} keyExtractor={(packItem) => packItem.id} contentContainerStyle={{ paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding }} style={[{ marginHorizontal: -SCREEN_LAYOUT.content.horizontalPadding }]} />
          );
        }
      default: return null;
    }
  }, [colors.border, handleLoopPress, handleLongPressLoop, handlePinLoop, handleUnpinLoop, handlePackPress, spacing, colors, theme, borderRadius, dispatch, navigation, router, handleToggleLoopActive]); // Added handleToggleLoopActive dependency

  if (isLoading) {
    return (
      <ScreenContainer>
        <AnimatedHeader title="Loops" scrollY={scrollY} actionButton={<View ref={addButtonRef}><HeaderActionButton iconName="add" onPress={() => setIsPopoverVisible(true)} accessibilityLabel="Create" /></View>} />
        <EmptyState isLoading />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AnimatedHeader title="Loops" scrollY={scrollY} actionButton={<View ref={addButtonRef}><HeaderActionButton iconName="add" onPress={() => setIsPopoverVisible(true)} accessibilityLabel="Create" /></View>} />
      {isListEmpty ? (
        <LoopsEmptyState onCreateLoop={handleOpenCreateLoopMenu} /> // Ensure this uses handleOpenCreateLoopMenu
      ) : (
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={100} 
          onScroll={handleScroll} 
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={baseTheme.colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modalize ref={modalizeRef} adjustToContentHeight withHandle={false} modalStyle={styles.modalStyle}>
        {selectedLoopData && (
          <LoopActionsModalContent 
            loopId={selectedLoopData.id}
            loopTitle={selectedLoopData.title}
            isPinned={selectedLoopData.isPinned}
            onPin={handlePinLoop} onUnpin={handleUnpinLoop} onEdit={handleEditLoop}
            onDuplicate={handleDuplicateLoop} onDelete={handleDeleteLoop} onClose={closeModal}
          />
        )}
      </Modalize>
      <Popover from={addButtonRef} isVisible={isPopoverVisible} onRequestClose={() => setIsPopoverVisible(false)} popoverStyle={{ borderRadius: borderRadius.md, backgroundColor: colors.card, paddingVertical: spacing.xs }} animationConfig={{ duration: 150 }} backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} >
        <View style={styles.popoverMenu}>
          <TouchableOpacity style={styles.popoverOption} onPress={() => handleCreateAction('post')} accessibilityLabel="Create new post"><Text style={[styles.popoverText, { color: colors.text }]}>Create Post</Text></TouchableOpacity>
          <View style={[styles.popoverSeparator, { backgroundColor: colors.border }]} />
          {/* Ensure this TouchableOpacity calls handleOpenCreateLoopMenu */}
          <TouchableOpacity style={styles.popoverOption} onPress={handleOpenCreateLoopMenu} accessibilityLabel="Create new loop"><Text style={[styles.popoverText, { color: colors.text }]}>New Loop</Text></TouchableOpacity>
        </View>
      </Popover>
      {/* Added SlideUpMenu for Create Loop */}
      <SlideUpMenu
        ref={slideUpMenuRef}
        title="Create New Loop"
        isVisible={isCreateLoopMenuVisible}
        onClose={() => setIsCreateLoopMenuVisible(false)}
        onOpenRequest={() => setIsCreateLoopMenuVisible(true)} // Action to take when menu requests open (e.g. via ref.open())
        showSaveButton={true}
        onSave={handleCreateLoop}
      >
        <CreateLoopMenu 
          name={loopName} // Corrected prop name
          onNameChange={setLoopName} // Corrected prop name
          frequency={frequency}
          onFrequencyChange={setFrequency} // Corrected prop name
          color={loopColor} // Corrected prop name
          onColorChange={setLoopColor} // Corrected prop name
        />
      </SlideUpMenu>
    </ScreenContainer>
  );
}