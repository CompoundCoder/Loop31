import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useRouter, useNavigation } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated from 'react-native-reanimated';

import AnimatedHeader from '@/components/AnimatedHeader';
import EmptyState from '@/components/EmptyState';
import ScreenContainer from '@/components/ScreenContainer';
import HeaderActionButton from '@/components/HeaderActionButton';
import CreateLoopPopup from '@/components/loops/CreateLoopPopup';
import EditLoopPopup from '@/components/loops/EditLoopPopup';

import { Modalize } from 'react-native-modalize';
import { LoopActionsModalContent } from '@/components/modals/LoopActionsModalContent';
import { LoopsEmptyState } from '@/components/loops/LoopsEmptyState';
import { useNotifications } from '@/modules/notifications';
import { SwipeableRowRef } from '@/components/common/SwipeableRow';
import Popover from 'react-native-popover-view';
import { useLoops, type Loop } from '@/context/LoopsContext';
import { useLoopSearch } from '@/hooks/useLoopSearch';
import { useLoopActionModal } from '@/hooks/useLoopActionModal';
import { useLoopManager } from '@/hooks/useLoopManager';
import { useLoopsHeader } from '@/hooks/useLoopsHeader';
import { useLoopHeader } from '@/hooks/useLoopHeader';
import LoopListSection from '@/components/loops/LoopListSection';

import { useLoopListRenderers, type HookThemeStyles } from '@/hooks/useLoopListRenderers';
import { useLoopActions } from '@/hooks/useLoopActions';
import { useLoopLayout } from '@/hooks/useLoopLayout';
import { useEditLoopPopup } from '@/hooks/useEditLoopPopup';
import * as typography from '@/presets/typography';
import { appIcons } from '@/presets/icons';
import { CircleButton } from '@/components/common/CircleButton';
import { getButtonPresets } from '@/presets/buttons';
import { getLoopPostCount } from '@/utils/loopHelpers';
import { MOCK_POSTS } from '@/data/mockPosts';

export type LoopsStackParamList = {
  index: undefined;
  '[loopId]': { loopId: string };
  create: undefined;
};

interface LoopsScreenProps {
  isLoading?: boolean;
}

export default function LoopsScreen({ isLoading = false }: LoopsScreenProps) {
  const { colors, spacing, borderRadius } = useThemeStyles();
  const theme = useThemeStyles();
  const buttonPresets = getButtonPresets(theme);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateLoopVisible, setCreateLoopVisible] = useState(false);

  const {
    scrollY,
    handleScroll,
  } = useLoopHeader();

  const { state, dispatch } = useLoops();
  const { addNotification } = useNotifications();

  const { deleteLoop, duplicateLoop } = useLoopManager({
    addNotification,
    themeColors: { accent: colors.accent, border: colors.border, warning: colors.warning },
  });

  const { loopToEdit, isEditPopupVisible, openEditPopup, closeEditPopup } = useEditLoopPopup();
  
  const loopsWithPostCounts = useMemo(() => {
    return state.loops.map(loop => ({
      ...loop,
      postCount: getLoopPostCount(loop.id, MOCK_POSTS),
    }));
  }, [state.loops]);

  const { searchQuery, setSearchQuery, filteredLoops, hasMatches } = useLoopSearch({ initialLoops: loopsWithPostCounts });

  const router = useRouter();
  const navigation = useNavigation<NativeStackNavigationProp<LoopsStackParamList>>();
  const swipeableRowRefs = useRef<Map<string, SwipeableRowRef | null>>(new Map());

  const showCreateLoopForm = useCallback(() => {
    setCreateLoopVisible(true);
  }, []);

  const { addButtonRef, isPopoverVisible, openCreatePopover, closeCreatePopover, handlePopoverAction } = useLoopsHeader({ router, onOpenNewLoopForm: showCreateLoopForm });

  const handleEditRequest = (loopId: string) => {
    const loop = state.loops.find(l => l.id === loopId);
    if (loop) {
      console.log('Attempting to open edit popup for loop:', JSON.stringify(loop, null, 2));
      openEditPopup(loop);
    } else {
      console.log(`[EditLoop] Error: Could not find loop with ID ${loopId}`);
    }
    modalRef.current?.close();
  };
  
  const handleDuplicateLoopForModalInternal = useCallback((loopId: string) => { duplicateLoop(loopId); }, [duplicateLoop]);
  const handleDeleteLoopInternal = useCallback((loopId: string) => { deleteLoop(loopId); }, [deleteLoop]);

  const { modalRef, selectedLoopData: modalSelectedLoopData, handleLongPressLoop: openLoopActionModalForModalize, handleModalAction, handleModalCloseConfirmed } = useLoopActionModal({
    onEdit: handleEditRequest,
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
        <AnimatedHeader title="Loops" scrollY={scrollY} actionButton={<View ref={addButtonRef}><CircleButton preset={buttonPresets.add} onPress={showCreateLoopForm} accessibilityLabel="Create" /></View>} />
        <EmptyState isLoading />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AnimatedHeader title="Loops" scrollY={scrollY} actionButton={<View ref={addButtonRef}><CircleButton preset={buttonPresets.add} onPress={showCreateLoopForm} accessibilityLabel="Create" /></View>} />
      {showOverallEmptyState ? (
        <LoopsEmptyState onCreateLoop={showCreateLoopForm} />
      ) : noResultsAfterSearch ? (
        // TODO: This icon might need to be standardized later
        <EmptyState title="No Loops Found" message={`We couldn't find any loops matching "${searchQuery}". Try a different search?`} iconName="magnify-close" />
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
        HeaderComponent={ modalSelectedLoopData ? <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}><Text style={[typography.sectionTitle, { color: colors.text }]}>{modalSelectedLoopData.title}</Text></View> : null }
      >
        {modalSelectedLoopData && (
          <LoopActionsModalContent
            loopId={modalSelectedLoopData.id}
            loopTitle={modalSelectedLoopData.title}
            isPinned={modalSelectedLoopData.isPinned}
            onEdit={() => {
              if (modalSelectedLoopData?.id) {
                handleEditRequest(modalSelectedLoopData.id);
              }
            }}
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
          <TouchableOpacity style={styles.popoverOption} onPress={() => handlePopoverAction('loop')} accessibilityLabel="Create new loop"><Text style={[typography.metadataText, { color: colors.text }]}>New Loop</Text></TouchableOpacity>
        </View>
      </Popover>
      
      <CreateLoopPopup
        visible={isCreateLoopVisible}
        onClose={() => setCreateLoopVisible(false)}
        onSaveSuccess={() => {
          setCreateLoopVisible(false);
        }}
      />
      <EditLoopPopup
        visible={isEditPopupVisible}
        onClose={closeEditPopup}
        onSaveSuccess={closeEditPopup}
        loop={loopToEdit}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listItem: {
    marginBottom: 16,
  },
  modalHeader: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  popoverMenu: {},
  popoverOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
