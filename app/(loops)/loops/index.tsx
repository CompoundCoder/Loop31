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

export type LoopsStackParamList = {
  index: undefined; 
  '[loopId]': { loopId: string }; 
  create: undefined; 
};

function LoopPlaceholder({ color }: { color: string }) {
  const theme = useTheme() as unknown as ExtendedTheme;
  return (
    <View style={[
      styles.loopCard,
      {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        marginBottom: LAYOUT.content.cardSpacing,
      }
    ]}>
      <View style={styles.loopHeader}>
        <View style={[
          styles.loopColorIndicator,
          { backgroundColor: color, borderRadius: theme.borderRadius.full }
        ]} />
        <View style={[
          styles.loopTitlePlaceholder,
          { backgroundColor: theme.colors.border, borderRadius: theme.borderRadius.sm }
        ]} />
      </View>
      <View style={[
        styles.loopStatsPlaceholder,
        { backgroundColor: theme.colors.border, borderRadius: theme.borderRadius.sm, marginTop: theme.spacing.md }
      ]} />
    </View>
  );
}

export default function LoopsScreen({ isLoading = false }: LoopsScreenProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const { colors, spacing, borderRadius } = useThemeStyles();
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
    // Use the correct route name including the directory
    navigation.navigate('loops/[loopId]', { loopId: loopId }); 
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

  const handleCreateAction = useCallback((action: 'post' | 'loop') => {
    setIsPopoverVisible(false);
    if (action === 'post') {
      router.push('/posts/create'); 
    } else if (action === 'loop') {
      // Use the correct route name including the directory
      navigation.navigate('loops/create'); 
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [navigation, router, setIsPopoverVisible]);

  const renderItem = useCallback(({ item }: { item: LoopsScreenItem }) => {
    const loop = item.loopData;
    const baseHeaderStyle = { marginBottom: spacing.sm }; 

    switch (item.type) {
      case 'pinnedLoopsHeader':
      case 'frequentLoopsHeader':
      case 'discoverPacksHeader':
        return item.title ? <View style={baseHeaderStyle}><SubtleSectionHeader title={item.title} /></View> : null;
      case 'autoListingLoopActive':
        if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />; 
        return <LoopCard ref={(ref) => item.loopId && swipeableRowRefs.current.set(item.loopId, ref)} loop={loop} onPress={() => handleLoopPress(item.loopId)} onLongPress={() => item.loopId && loop.title && handleLongPressLoop(item.loopId, loop.title, false)} onToggleActive={handleToggleLoopActive} style={styles.listItem} />;
      case 'pinnedLoopItem':
        if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />; 
        return <LoopCard ref={(ref) => item.loopId && swipeableRowRefs.current.set(item.loopId, ref)} loop={loop} isPinned={true} onPress={() => handleLoopPress(item.loopId)} onLongPress={() => item.loopId && loop.title && handleLongPressLoop(item.loopId, loop.title, true)} onToggleActive={handleToggleLoopActive} style={styles.listItem} onSwipeUnpin={handleUnpinLoop} />;
      case 'frequentLoopItem':
        if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />; 
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
        <LoopsEmptyState onCreateLoop={() => handleCreateAction('loop')} />
      ) : (
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={100} 
          onScroll={handleScroll} 
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={{ paddingTop: MINI_HEADER_HEIGHT + 16, paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding, paddingBottom: spacing.lg }}
        />
      )}
      <Modalize ref={modalizeRef} adjustToContentHeight onClosed={() => setSelectedLoopData(null)} modalStyle={{ backgroundColor: colors.card }} handleStyle={{ backgroundColor: colors.border }} handlePosition="inside" 
        HeaderComponent={selectedLoopData ? <View style={[styles.modalHeader, { backgroundColor: colors.card }]}><Text style={[styles.modalTitle, { color: colors.text }]}>{selectedLoopData.title}</Text></View> : null}
      >
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
          <TouchableOpacity style={styles.popoverOption} onPress={() => handleCreateAction('loop')} accessibilityLabel="Create new loop"><Text style={[styles.popoverText, { color: colors.text }]}>New Loop</Text></TouchableOpacity>
        </View>
      </Popover>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loopCard: { borderWidth: 1 },
  loopHeader: { flexDirection: 'row', alignItems: 'center' },
  loopColorIndicator: { width: 24, height: 24, marginRight: 12 },
  loopTitlePlaceholder: { height: 24, width: 160, opacity: 0.5 },
  loopStatsPlaceholder: { height: 16, width: 120, opacity: 0.5 },
  modalHeader: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'grey' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  popoverMenu: { },
  popoverOption: { paddingVertical: 12, paddingHorizontal: 16 },
  popoverText: { fontSize: 16, fontWeight: '500' },
  popoverSeparator: { height: StyleSheet.hairlineWidth, marginHorizontal: 10 },
  listItem: { marginBottom: 16 },
}); 