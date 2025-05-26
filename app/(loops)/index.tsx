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
import type { Theme as ExtendedTheme } from '@/theme/theme';
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

// --- Import Modalize ---
import { Modalize } from 'react-native-modalize';

// --- Import the new modal content component --- 
import { LoopActionsModalContent } from '@/components/modals/LoopActionsModalContent';

// --- Import Empty State Component ---
import { LoopsEmptyState } from '@/components/loops/LoopsEmptyState';

// --- Notification System ---
import { useNotifications } from '@/modules/notifications';

// --- Import Ref Type --- 
import { SwipeableRowRef } from '@/components/common/SwipeableRow';

// --- Import Mock Posts --- 
import { MOCK_POSTS } from '@/data/mockPosts'; 

import Popover from 'react-native-popover-view';

// --- Import Loops Context Hook ---
import { useLoops } from '@/context/LoopsContext'; 

type LoopsScreenProps = {
  /**
   * Whether the screen is in a loading state
   */
  isLoading?: boolean;
};

// Interface for Loop data USED BY THIS SCREEN's list items
// (The main Loop interface is now defined in the context)
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
  loopData?: import('@/context/LoopsContext').Loop; // Import Loop type from context
}

interface LoopPack {
  id: string;
  title: string;
  benefitSummary: string;
  priceLabel: string; 
  isLocked: boolean; 
  icon?: keyof typeof MaterialCommunityIcons.glyphMap; 
}

// --- Type for Selected Loop Data State (for modal) ---
// (Still needed for local state)
interface SelectedLoopState {
  id: string;
  title: string;
  isPinned: boolean;
}

// --- Interface for Pack Data (for carousel) ---
// (Still needed for inline mock data)
interface DiscoverPack {
  id: string;
  title: string;
  previewImageUrl?: string;
  isLocked: boolean;
  priceLabel?: string; 
}

// Removed Loop interface definition (moved to context)
// Removed DiscoverPack interface definition (only used inline now)
// Removed SelectedLoopState (still local state)
// Removed LoopsState interface definition (moved to context)
// Removed LoopsAction type definition (moved to context)
// Removed initialMockLoopsData definition (moved to context)
// Removed loopsReducer function (moved to context)

// --- Define Param List for the Loops Stack ---
export type LoopsStackParamList = {
  index: undefined; // No params for index screen
  '[loopId]': { loopId: string }; // loopId param for detail screen
  create: undefined; // No params for create screen
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
          {
            backgroundColor: color,
            borderRadius: theme.borderRadius.full,
          }
        ]} />
        <View style={[
          styles.loopTitlePlaceholder,
          {
            backgroundColor: theme.colors.border,
            borderRadius: theme.borderRadius.sm,
          }
        ]} />
      </View>
      <View style={[
        styles.loopStatsPlaceholder,
        {
          backgroundColor: theme.colors.border,
          borderRadius: theme.borderRadius.sm,
          marginTop: theme.spacing.md,
        }
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

  // --- Modalize Ref ---
  const modalizeRef = useRef<Modalize>(null);

  // --- State for Selected Loop for Modal --- 
  const [selectedLoopData, setSelectedLoopData] = useState<SelectedLoopState | null>(null);

  // --- Get State and Dispatch from Context ---
  const { state, dispatch } = useLoops(); 

  // --- Get Notification Function ---
  const { addNotification } = useNotifications();

  // --- Get Router and Typed Navigation Objects ---
  const router = useRouter(); 
  // Type the navigation object using the correct Stack prop type
  const navigation = useNavigation<NativeStackNavigationProp<LoopsStackParamList>>(); 

  // --- Swipeable Row Refs ---
  const swipeableRowRefs = useRef<Map<string, SwipeableRowRef | null>>(new Map());

  // --- Function to close a specific row ---
  const closeSwipeableRow = (loopId: string) => {
    const rowRef = swipeableRowRefs.current.get(loopId);
    rowRef?.close(); // Call close method if ref exists
  };

  // --- Handlers --- 
  const handleToggleLoopActive = useCallback((loopId: string, newIsActive: boolean) => {
    dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId, isActive: newIsActive } });
    // Optional: log or add notification if needed
    // console.log(`Dispatched TOGGLE_ACTIVE for ${loopId} to ${newIsActive}`);
  }, [dispatch]); 

  const handlePinLoop = useCallback((loopId: string) => {
    dispatch({ type: 'PIN', payload: loopId });
    addNotification({ 
      title: 'Loop Pinned', 
      message: '', 
      accentColor: colors.accent, 
      icon: 'pin',
      displayTarget: 'toast' 
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeSwipeableRow(loopId); 
  }, [addNotification, colors.accent, closeSwipeableRow, dispatch]);

  const handleUnpinLoop = useCallback((loopId: string) => {
    dispatch({ type: 'UNPIN', payload: loopId });
     addNotification({ 
      title: 'Loop Unpinned', 
      message: '', 
      accentColor: colors.border, 
      icon: 'pin-off',
      displayTarget: 'toast' 
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    closeSwipeableRow(loopId); 
  }, [addNotification, colors.border, closeSwipeableRow, dispatch]);

  const handleDeleteLoop = useCallback((loopId: string) => {
    // Find loop title from current state for the message
    const loopToDelete = state.loops.find(loop => loop.id === loopId);
    const loopTitle = loopToDelete?.title || 'this loop';

    // Close modal BEFORE showing alert
    modalizeRef.current?.close();

    Alert.alert(
      `Delete Loop?`,
      `Are you sure you want to delete "${loopTitle}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log(`[ACTION] Dispatching DELETE for Loop: ${loopId}`);
            dispatch({ type: 'DELETE', payload: loopId });
            // No need to update other states here, reducer handles it
          }
        }
      ]
    );
  }, [state.loops, dispatch, modalizeRef]); // Dependency: state.loops (for title) and dispatch

  // --- Existing Handlers (Keep Refresh, HeaderAction) ---
  const handleRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }, []);

  // --- New Handler for Pack Press --- 
  const handlePackPress = useCallback((packId: string, isLocked: boolean) => {
    console.log(`Pressed pack: ${packId}, Locked: ${isLocked}`);
    if (isLocked) {
      // TODO: Handle locked pack tap (e.g., show purchase/info modal)
      Alert.alert("Pack Locked", "This pack requires purchase or subscription.");
    } else {
      // Navigate to pack detail screen (placeholder)
      router.push(`/shop/pack/${packId}`);
    }
  }, [router]);

  // --- Update handleLoopPress to use navigation.navigate ---
  const handleLoopPress = useCallback((loopId: string | undefined) => {
    if (!loopId) {
      console.warn('Attempted to navigate to loop without ID');
      return;
    }
    console.log(`Navigating to loop: ${loopId} using navigation.navigate`);
    // Use navigation.navigate with route name and params
    navigation.navigate('[loopId]', { loopId: loopId }); 
    // router.push(`/loops/${loopId}`); // Old method
  }, [navigation]); // Add navigation dependency

  // --- Generate DYNAMIC list structure based on reducer state ---
  const listData = useMemo(() => {
    const pinnedLoops = state.loops.filter(loop => state.pinnedLoopIds.has(loop.id));
    // Make sure to filter out the "Auto-Listing" loop from the frequent list
    const frequentLoops = state.loops.filter(loop => !state.pinnedLoopIds.has(loop.id) && loop.id !== 'auto-listing'); 
    // Find the auto-listing loop
    const autoListingLoop = state.loops.find(loop => loop.id === 'auto-listing');

    const items: LoopsScreenItem[] = [];

    // Add Auto-Listing Loop (if it exists)
    if (autoListingLoop) {
      items.push({
        id: 'auto-listing-loop',
        type: 'autoListingLoopActive', 
        loopId: autoListingLoop.id,
        loopData: autoListingLoop,
      });
    }

    // Add Pinned Loops section (if any)
    if (pinnedLoops.length > 0) {
      items.push({ id: 'pinned-header', type: 'pinnedLoopsHeader', title: 'Pinned Loops' });
      pinnedLoops.forEach(loop => items.push({ 
        id: `pinned-${loop.id}`, 
        type: 'pinnedLoopItem', 
        loopId: loop.id,
        loopData: loop, 
      }));
    }

    // Add Frequent Loops section (if any)
    if (frequentLoops.length > 0) {
      items.push({ id: 'frequent-header', type: 'frequentLoopsHeader', title: 'Loops' });
      frequentLoops.forEach(loop => items.push({ 
        id: `frequent-${loop.id}`, 
        type: 'frequentLoopItem', 
        loopId: loop.id,
        loopData: loop, 
      }));
    }
    
    // Add Discover Packs Section
    items.push({ id: 'discover-packs-header', type: 'discoverPacksHeader', title: 'Discover Loop Packs' });
    items.push({ id: 'discover-packs-carousel', type: 'discoverPacksCarousel' });

    return items;
  }, [state.loops, state.pinnedLoopIds]); // Depend on loops and pinned IDs

  // --- Determine if list is truly empty (excluding headers/carousel) ---
  const isListEmpty = useMemo(() => {
    // Check if there are any items of type 'pinnedLoopItem' or 'frequentLoopItem'
    return !listData.some(item => item.type === 'pinnedLoopItem' || item.type === 'frequentLoopItem');
  }, [listData]);

  // --- Use plain scroll handler for testing --- 
  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  // --- Placeholder Handlers for New Actions ---
  const handleEditLoop = useCallback((loopId: string) => {
    console.log(`[ACTION] Edit Loop: ${loopId}`);
  }, []);

  const handleDuplicateLoop = useCallback((loopId: string) => {
    console.log(`[ACTION] Duplicate Loop: ${loopId}`);
    // TODO: Implement duplication logic
    // TODO: Show notification after duplication logic
    // addNotification({
    //   title: 'Loop Duplicated',
    //   message: 'A copy of the loop has been created.',
    //   icon: 'content-copy',
    //   displayTarget: 'inline',
    // });
  }, [addNotification]); 

  // --- Handler for Long Press on Loop Card - Update for Modalize ---
  const handleLongPressLoop = useCallback((loopId: string, loopTitle: string, isPinned: boolean) => {
    setSelectedLoopData({ id: loopId, title: loopTitle, isPinned });
    // Trigger haptic feedback before opening
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    modalizeRef.current?.open(); 
  }, [setSelectedLoopData, modalizeRef]); 

  // --- Function to close modal (passed to content) ---
  const closeModal = useCallback(() => {
    modalizeRef.current?.close();
    // Note: onClosed prop will handle clearing the state
  }, [modalizeRef]);

  // --- Handler for actions selected within the LoopActionsModalContent ---
  const handleModalAction = useCallback((action: 'edit' | 'duplicate' | 'delete') => {
    if (!selectedLoopData) return; // Guard against missing data

    const loopId = selectedLoopData.id;

    // Close the modal first
    closeModal(); 

    // Call the specific action handler after a short delay (allows modal to close smoothly)
    setTimeout(() => {
        switch (action) {
            case 'edit':
                handleEditLoop(loopId);
                break;
            case 'duplicate':
                handleDuplicateLoop(loopId);
                break;
            case 'delete':
                handleDeleteLoop(loopId);
                break;
        }
    }, 150); // 150ms delay

  }, [selectedLoopData, closeModal, handleEditLoop, handleDuplicateLoop, handleDeleteLoop]);

  // --- Update handleCreateAction for mixed navigation ---
  const handleCreateAction = useCallback((action: 'post' | 'loop') => {
    setIsPopoverVisible(false);
    if (action === 'post') {
      console.log('Navigating to /posts/create using router.push');
      // Use router.push for navigating outside the current stack
      router.push('/posts/create'); 
      // navigation.navigate('/posts/create'); // Invalid for current navigator context
    } else if (action === 'loop') {
      console.log('Navigating to create using navigation.navigate');
      // Use navigation.navigate for navigating within the current stack
      navigation.navigate('create'); 
      // router.push('/loops/create'); // Old method
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [navigation, router, setIsPopoverVisible]); // Add router dependency back

  // --- Render Item Function ---
  const renderItem = useCallback(({ item }: { item: LoopsScreenItem }) => {
    const loop = item.loopData;

    const baseItemStyle = { marginBottom: spacing.lg }; 
    const baseHeaderStyle = { marginBottom: spacing.sm }; 

    switch (item.type) {
      case 'pinnedLoopsHeader':
      case 'frequentLoopsHeader':
        if (!item.title) return null;
        return (
          <View style={baseHeaderStyle}> 
            <SubtleSectionHeader title={item.title} />
          </View>
        );
      case 'discoverPacksHeader':
        if (!item.title) return null;
        return (
          // Revert to base header style (no extra marginTop)
          <View style={baseHeaderStyle}> 
            <SubtleSectionHeader title={item.title} />
          </View>
        );
      case 'autoListingLoopActive':
        if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />; 
        return (
          <LoopCard 
            ref={(ref: SwipeableRowRef | null) => swipeableRowRefs.current.set(item.loopId!, ref)} 
            loop={loop}
            onPress={() => handleLoopPress(item.loopId)} 
            onLongPress={() => item.loopId && loop.title && handleLongPressLoop(item.loopId, loop.title, false)} 
            onToggleActive={(loopId, isActive) => dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId, isActive } })}
            style={styles.listItem} 
          />
        );
      case 'pinnedLoopItem':
        if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />; 
        return (
           <LoopCard 
            ref={(ref: SwipeableRowRef | null) => swipeableRowRefs.current.set(item.loopId!, ref)}
            loop={loop}
            isPinned={true}
            onPress={() => handleLoopPress(item.loopId)} 
            onLongPress={() => item.loopId && loop.title && handleLongPressLoop(item.loopId, loop.title, true)} 
            onToggleActive={(loopId, isActive) => dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId, isActive } })}
            style={styles.listItem} 
            onSwipeUnpin={handleUnpinLoop}
          />
        );
      case 'frequentLoopItem':
        if (!loop || !item.loopId) return <LoopPlaceholder color={colors.border} />; 
        return (
           <LoopCard 
            ref={(ref: SwipeableRowRef | null) => swipeableRowRefs.current.set(item.loopId!, ref)}
            loop={loop}
            isPinned={false}
            onPress={() => handleLoopPress(item.loopId)} 
            onLongPress={() => item.loopId && loop.title && handleLongPressLoop(item.loopId, loop.title, false)} 
            onToggleActive={(loopId, isActive) => dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId, isActive } })}
            style={styles.listItem} 
            onSwipePin={handlePinLoop}
          />
        );
      case 'discoverPacksCarousel': {
          // Use the re-added DiscoverPack type here
          const discoverPacksData: DiscoverPack[] = [
            { id: 'dp1', title: 'New Agent Essentials', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/essentials/300/200' },
            { id: 'dp2', title: 'Luxury Market', isLocked: true, priceLabel: '$19.99', previewImageUrl: 'https://picsum.photos/seed/luxury/300/200' },
            { id: 'dp3', title: 'Holiday Cheer', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/holiday/300/200' },
            { id: 'dp4', title: 'Spring Listings', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/spring/300/200' },
            { id: 'dp5', title: 'Pro Agent Toolkit', isLocked: true, priceLabel: 'Premium', previewImageUrl: 'https://picsum.photos/seed/pro/300/200' },
          ];

          // Use the re-added DiscoverPack type here
          const renderPackItem = ({ item: packItem }: { item: DiscoverPack }) => (
            // Use the redesigned LoopPackCard
            <LoopPackCard
              pack={packItem}
              style={{
                width: 160, 
                height: 240, // Re-add fixed height for uniform card size
                marginRight: spacing.md, // Spacing between cards
              }}
              // Update onPress to use the new handler
              onPress={() => handlePackPress(packItem.id, packItem.isLocked)} 
            />
          );

          return (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={discoverPacksData}
              renderItem={renderPackItem}
              keyExtractor={(packItem) => packItem.id}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding, 
              }}
              style={[
                {
                  marginHorizontal: -SCREEN_LAYOUT.content.horizontalPadding,
                }
              ]} 
            />
          );
        }
      default:
        return null;
    }
  }, [colors.border, handleLoopPress, handleLongPressLoop, handlePinLoop, handleUnpinLoop, handlePackPress, spacing, colors, theme, borderRadius, dispatch, navigation, router]); // Add router dependency back to renderItem dependencies

  // --- Loading State Render --- 
  if (isLoading) {
    return (
      <ScreenContainer>
        <AnimatedHeader 
          title="Loops" 
          scrollY={scrollY}
            actionButton={
                <View ref={addButtonRef}>
                    <HeaderActionButton 
                        iconName="add" 
                        onPress={() => setIsPopoverVisible(true)} 
                        accessibilityLabel="Create" 
                    />
                </View>
            }
        />
        <EmptyState isLoading />
      </ScreenContainer>
    );
  }

  // --- Main Render --- 
  return (
    <ScreenContainer>
      <AnimatedHeader 
        title="Loops" 
        scrollY={scrollY}
        actionButton={
            <View ref={addButtonRef}>
                <HeaderActionButton 
                    iconName="add" 
                    onPress={() => setIsPopoverVisible(true)}
                    accessibilityLabel="Create"
                />
            </View>
        }
      />
      
      {isListEmpty ? (
        <LoopsEmptyState 
          onCreateLoop={() => handleCreateAction('loop')} 
        />
      ) : (
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={100} 
          onScroll={handleScroll} 
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        contentContainerStyle={{
          paddingTop: MINI_HEADER_HEIGHT + 16,
          paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
            paddingBottom: spacing.lg,
          }}
        />
      )}
      
      {/* --- Modalize Instance --- */}
      <Modalize 
        ref={modalizeRef}
        adjustToContentHeight 
        onClosed={() => setSelectedLoopData(null)} 
        modalStyle={{ backgroundColor: colors.card }}
        handleStyle={{ backgroundColor: colors.border }} 
        handlePosition="inside" 
        // --- Add Header Component --- 
        HeaderComponent={
          selectedLoopData ? (
            <View style={[styles.modalHeader, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedLoopData.title}</Text>
        </View>
          ) : null
        }
      >
        {/* Render content conditionally */} 
        {selectedLoopData && (
          <LoopActionsModalContent 
            loopId={selectedLoopData.id}
            loopTitle={selectedLoopData.title}
            isPinned={selectedLoopData.isPinned}
            // Pass refactored handlers
            onPin={handlePinLoop} 
            onUnpin={handleUnpinLoop}
            onEdit={handleEditLoop}
            onDuplicate={handleDuplicateLoop}
            onDelete={handleDeleteLoop} 
            onClose={closeModal}
          />
        )}
      </Modalize>

      {/* --- Popover Menu --- */} 
      <Popover
        from={addButtonRef}
        isVisible={isPopoverVisible}
        onRequestClose={() => setIsPopoverVisible(false)}
        popoverStyle={{
            borderRadius: borderRadius.md,
            backgroundColor: colors.card,
            paddingVertical: spacing.xs,
        }}
        animationConfig={{ duration: 150 }} 
        backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} 
      >
        <View style={styles.popoverMenu}> 
          <TouchableOpacity 
            style={styles.popoverOption} 
            onPress={() => handleCreateAction('post')}
            accessibilityLabel="Create new post"
          >
            <Text style={[styles.popoverText, { color: colors.text }]}>Create Post</Text>
          </TouchableOpacity>
          <View style={[styles.popoverSeparator, { backgroundColor: colors.border }]} />
          <TouchableOpacity 
            style={styles.popoverOption} 
            onPress={() => handleCreateAction('loop')}
            accessibilityLabel="Create new loop"
          >
            <Text style={[styles.popoverText, { color: colors.text }]}>New Loop</Text>
          </TouchableOpacity>
        </View>
      </Popover>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loopCard: {
    borderWidth: 1,
  },
  loopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loopColorIndicator: {
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
  modalHeader: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'grey',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  popoverMenu: {
  },
  popoverOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  popoverText: {
    fontSize: 16,
    fontWeight: '500',
  },
  popoverSeparator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 10,
  },
  listItem: {
    marginBottom: 16,
  },
}); 