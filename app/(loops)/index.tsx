import React, { useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  RefreshControl,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { Theme as ExtendedTheme } from '@/theme/theme';
import { useRouter, useNavigation } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedHeader from '@/components/AnimatedHeader';
import EmptyState from '@/components/EmptyState';
import ScreenContainer from '@/components/ScreenContainer';
import HeaderActionButton from '@/components/HeaderActionButton';

import { Modalize } from 'react-native-modalize';
import { LoopActionsModalContent } from '@/components/modals/LoopActionsModalContent';
import { LoopsEmptyState } from '@/components/loops/LoopsEmptyState';
import { useNotifications } from '@/modules/notifications';
import { SwipeableRowRef } from '@/components/common/SwipeableRow';
import Popover from 'react-native-popover-view';
import { useLoops, type Loop } from '@/context/LoopsContext';
import { useLoopSearch } from '../../hooks/useLoopSearch';
import { useLoopActionModal } from '../../hooks/useLoopActionModal';
import { useLoopManager } from '../../hooks/useLoopManager';
import { useLoopsHeader as useOriginalLoopsHeader } from '../../hooks/useLoopsHeader';
import LoopListSection from '@/components/loops/LoopListSection';

import { LOOP_ITEM_TYPE, type LoopItemType } from '../constants/loopItemTypes';
import { useLoopListRenderers, type LoopsScreenItemInternal, type HookThemeStyles } from '../../hooks/useLoopListRenderers';
import { useLoopActions } from '../../hooks/useLoopActions';
import { useLoopLayout } from '../../hooks/useLoopLayout';
import { useLoopHeader } from '../../hooks/useLoopHeader';

export type LoopsStackParamList = {
  index: undefined;
  '[loopId]': { loopId: string };
  create: undefined;
};

interface DiscoverPack {
  id: string;
  title: string;
  previewImageUrl?: string;
  isLocked: boolean;
  priceLabel?: string; 
}

interface LoopsScreenProps {
  isLoading?: boolean;
}

export default function LoopsScreen({ isLoading = false }: LoopsScreenProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const { colors, spacing, borderRadius } = useThemeStyles();
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    scrollY,
    handleScroll
  } = useLoopHeader();

  const { state, dispatch } = useLoops(); 
  const { addNotification } = useNotifications();

  const { deleteLoop, duplicateLoop } = useLoopManager({
    addNotification,
    themeColors: { accent: colors.accent, border: colors.border, warning: colors.warning },
  });
  
  const { searchQuery, setSearchQuery, filteredLoops, hasMatches } = useLoopSearch({ initialLoops: state.loops });

  const router = useRouter(); 
  const navigation = useNavigation<NativeStackNavigationProp<LoopsStackParamList>>(); 
  const swipeableRowRefs = useRef<Map<string, SwipeableRowRef | null>>(new Map());

  const showCreateLoopForm = useCallback(() => {
    router.push('/(modals)/create-loop');
  }, [router]);

  const { addButtonRef, isPopoverVisible, openCreatePopover, closeCreatePopover, handlePopoverAction } = useOriginalLoopsHeader({ router, onOpenNewLoopForm: showCreateLoopForm });

  const handleEditLoopForModal = useCallback((loopId: string) => { router.push(`/loops/edit/${loopId}`); }, [router]);
  const handleDuplicateLoopForModalInternal = useCallback((loopId: string) => { duplicateLoop(loopId); }, [duplicateLoop]);
  const handleDeleteLoopInternal = useCallback((loopId: string) => { deleteLoop(loopId); }, [deleteLoop]);

  const { modalRef, selectedLoopData: modalSelectedLoopData, handleLongPressLoop: openLoopActionModalForModalize, handleModalAction, handleModalCloseConfirmed } = useLoopActionModal({
    onEdit: handleEditLoopForModal, 
    onDuplicate: handleDuplicateLoopForModalInternal,
    onDelete: handleDeleteLoopInternal, 
  });

  const memoizedNavigate = useCallback((screen: string, params?: Record<string, any>) => {
    if (screen === '[loopId]' && params?.loopId) {
      navigation.navigate('[loopId]', { loopId: params.loopId as string });
    } else {
      console.warn(`Navigation to screen "${screen}" not fully handled by adapter.`);
    }
  }, [navigation]);

  const { 
    handleLoopPress, 
    handleLongPressLoop,
    handleToggleLoopActive, 
    handlePinLoop, 
    handleUnpinLoop 
  } = useLoopActions({
    navigation: memoizedNavigate,
    dispatch: dispatch,
    setSelectedLoop: openLoopActionModalForModalize,
  });

  const handleRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); }, []);
  const handlePackPress = useCallback((packId: string, isLocked: boolean) => {
    if (isLocked) Alert.alert("Pack Locked", "This pack requires purchase or subscription.");
    else router.push(`/shop/pack/${packId}`);
  }, [router]);

  const hookThemeStyles: HookThemeStyles = { colors, spacing, borderRadius };
  
  const { 
    listData,
    renderItem,
    keyExtractor
  } = useLoopListRenderers({
    filteredLoops: filteredLoops,
    pinnedIds: state.pinnedLoopIds,
    swipeableRowRefs: swipeableRowRefs,
    onLoopPress: handleLoopPress,
    onLongPressLoop: handleLongPressLoop,
    onToggleLoopActive: handleToggleLoopActive,
    onPinLoop: handlePinLoop,
    onUnpinLoop: handleUnpinLoop,
    onPackPress: handlePackPress,
    themeStyles: hookThemeStyles,
    listItemStyle: styles.listItem,
  });

  const { 
    isListEmpty: isLayoutListEmpty,
    showOverallEmptyState,
    noResultsAfterSearch,
    initiallyHadLoops
  } = useLoopLayout({
    filteredLoops,
    loopList: state.loops,
    pinnedLoopIds: state.pinnedLoopIds,
    searchQuery,
    isLoading, 
    hasMatches,
  });
  
  if (isLoading && !searchQuery && state.loops.length === 0 && listData.length === 0) {
    return (
      <ScreenContainer>
        <AnimatedHeader title="Loops" scrollY={scrollY} actionButton={<View ref={addButtonRef}><HeaderActionButton iconName="add" onPress={openCreatePopover} accessibilityLabel="Create" /></View>} />
        <EmptyState isLoading />
      </ScreenContainer>
    );
  }

  const discoverPacksForLoopListSection: DiscoverPack[] = [
    { id: 'dp1', title: 'New Agent Essentials', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/essentials/300/200' },
    { id: 'dp2', title: 'Luxury Market', isLocked: true, priceLabel: '$19.99', previewImageUrl: 'https://picsum.photos/seed/luxury/300/200' },
    { id: 'dp3', title: 'Holiday Cheer', isLocked: false, previewImageUrl: 'https://picsum.photos/seed/holiday/300/200' },
  ];

  return (
    <ScreenContainer>
      <AnimatedHeader title="Loops" scrollY={scrollY} actionButton={<View ref={addButtonRef}><HeaderActionButton iconName="add" onPress={openCreatePopover} accessibilityLabel="Create" /></View>} />
      {showOverallEmptyState ? (
        <LoopsEmptyState onCreateLoop={showCreateLoopForm} />
      ) : noResultsAfterSearch ? (
        <EmptyState title="No Loops Found" message={`We couldn\'t find any loops matching "${searchQuery}". Try a different search?`} iconName="magnify-close" />
      ) : (
        <LoopListSection
          isLoading={isLoading}
          searchQuery={searchQuery}
          hasMatches={hasMatches}
          initiallyHadLoops={initiallyHadLoops}
          refreshing={refreshing}
          scrollY={scrollY}
          onRefresh={handleRefresh}
          onScroll={handleScroll}
          onOpenCreateLoopForm={showCreateLoopForm}
          listData={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      )}
      <Modalize 
        ref={modalRef}
        adjustToContentHeight 
        onClosed={handleModalCloseConfirmed}
        modalStyle={{ backgroundColor: colors.card }}
        handleStyle={{ backgroundColor: colors.border }} 
        handlePosition="inside" 
        HeaderComponent={ modalSelectedLoopData ? <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}><Text style={[styles.modalTitle, { color: colors.text }]}>{modalSelectedLoopData.title}</Text></View> : null }
      >
        {modalSelectedLoopData && (
          <LoopActionsModalContent 
            loopId={modalSelectedLoopData.id}
            loopTitle={modalSelectedLoopData.title}
            isPinned={modalSelectedLoopData.isPinned}
            onEdit={() => handleModalAction('edit')} 
            onDuplicate={() => handleModalAction('duplicate')} 
            onDelete={() => handleModalAction('delete')} 
            onPin={handlePinLoop} 
            onUnpin={handleUnpinLoop}
            onClose={() => modalRef.current?.close()}
          />
        )}
      </Modalize>
      <Popover from={addButtonRef} isVisible={isPopoverVisible} onRequestClose={closeCreatePopover} popoverStyle={{ borderRadius: borderRadius.md, backgroundColor: colors.card, paddingVertical: spacing.xs }} animationConfig={{ duration: 150 }} backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} >
        <View style={styles.popoverMenu}> 
          <TouchableOpacity style={styles.popoverOption} onPress={() => handlePopoverAction('post')} accessibilityLabel="Create new post"><Text style={[styles.popoverText, { color: colors.text }]}>Create Post</Text></TouchableOpacity>
          <View style={[styles.popoverSeparator, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.popoverOption} onPress={() => handlePopoverAction('loop')} accessibilityLabel="Create new loop"><Text style={[styles.popoverText, { color: colors.text }]}>New Loop</Text></TouchableOpacity>
        </View>
      </Popover>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listItem: {
    marginBottom: 16,
  },
  modalHeader: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  popoverMenu: {},
  popoverOption: { paddingVertical: 12, paddingHorizontal: 16 },
  popoverText: { fontSize: 16, fontWeight: '500' },
  popoverSeparator: { height: StyleSheet.hairlineWidth, marginHorizontal: 10 },
});