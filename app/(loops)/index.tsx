import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useRouter, useNavigation } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PanGestureHandler, PanGestureHandlerGestureEvent, TapGestureHandler, TapGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

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
import { useLoopSearch } from '@/hooks/useLoopSearch';
import { useLoopActionModal } from '@/hooks/useLoopActionModal';
import { useLoopManager } from '@/hooks/useLoopManager';
import { useLoopsHeader } from '@/hooks/useLoopsHeader';
import { useLoopHeader } from '@/hooks/useLoopHeader';
import LoopListSection from '@/components/loops/LoopListSection';

import { useLoopListRenderers, type HookThemeStyles } from '@/hooks/useLoopListRenderers';
import { useLoopActions } from '@/hooks/useLoopActions';
import { useLoopLayout } from '@/hooks/useLoopLayout';

// --- Inlined CreateLoopModal Component ---

interface CreateLoopModalProps {
  onClose: () => void;
  onSaveSuccess: () => void;
}

const FREQUENCY_STOPS = [
  { label: 'Automatically', value: 'auto', shortLabel: 'Auto' },
  { label: 'Once per Week', value: 'weekly_1x', shortLabel: '1x' },
  { label: '3x per Week', value: 'weekly_3x', shortLabel: '3x' },
  { label: '5x per Week', value: 'weekly_5x', shortLabel: '5x' },
  { label: 'Custom Schedule', value: 'custom', shortLabel: 'Days' },
];

const LOOP_COLORS = ['#FF6B6B', '#4ECDC4', '#54A0FF', '#F9A03F', '#A5D6A7', '#FFD166', '#D4A5FF'];

const WEEKDAYS = [
  { label: 'S', value: 'sun' }, { label: 'M', value: 'mon' }, { label: 'T', value: 'tue' },
  { label: 'W', value: 'wed' }, { label: 'T', value: 'thu' }, { label: 'F', value: 'fri' },
  { label: 'S', value: 'sat' },
];

const SHORT_DAY_NAMES: { [key: string]: string } = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };

const THUMB_SIZE = 28;

const ColorSwatch: React.FC<{ color: string; isSelected: boolean; onPress: () => void; }> = ({ color, isSelected, onPress }) => {
  const checkmarkOpacity = useSharedValue(isSelected ? 1 : 0);
  useEffect(() => {
    checkmarkOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected, checkmarkOpacity]);
  const animatedCheckmarkStyle = useAnimatedStyle(() => ({ opacity: checkmarkOpacity.value }));
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[modalStyles.colorSwatch, { backgroundColor: color }]}>
        <Animated.View style={[modalStyles.checkmarkOverlay, animatedCheckmarkStyle]}>
          <Ionicons name="checkmark" size={24} color="white" />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const FrequencySlider: React.FC<{
  selectedIndex: number; onIndexChange: (index: number) => void;
  stops: typeof FREQUENCY_STOPS; theme: ReturnType<typeof useThemeStyles>;
}> = ({ selectedIndex, onIndexChange, stops, theme }) => {
  const [width, setWidth] = useState(0);
  const usableWidth = width > 0 ? width - THUMB_SIZE : 0;
  const snapPoints = useMemo(() => stops.map((_, i) => i * (usableWidth / (stops.length - 1))), [usableWidth, stops]);
  const translateX = useSharedValue(snapPoints[selectedIndex] || 0);
  useEffect(() => {
    if (width > 0) {
      translateX.value = withSpring(snapPoints[selectedIndex], { damping: 15, stiffness: 150 });
    }
  }, [selectedIndex, snapPoints, translateX, width]);
  const onSelectIndex = (index: number) => {
    if (selectedIndex !== index) {
      onIndexChange(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  const panGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
    onStart: (_, ctx) => { ctx.startX = translateX.value; },
    onActive: (event, ctx) => { translateX.value = Math.max(0, Math.min(ctx.startX + event.translationX, usableWidth)); },
    onEnd: (event) => {
      const projectedX = translateX.value + event.velocityX * 0.05;
      const closestIndex = snapPoints.reduce((acc, curr, i) => (Math.abs(curr - projectedX) < Math.abs(snapPoints[acc] - projectedX) ? i : acc), 0);
      runOnJS(onSelectIndex)(closestIndex);
    },
  });
  const tapGestureHandler = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onEnd: (event) => {
      const tapX = event.x;
      const closestIndex = snapPoints.reduce((acc, curr, i) => (Math.abs(curr + THUMB_SIZE / 2 - tapX) < Math.abs(snapPoints[acc] + THUMB_SIZE / 2 - tapX) ? i : acc), 0);
      runOnJS(onSelectIndex)(closestIndex);
    },
  });
  const animatedThumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const isCustomSelected = stops[selectedIndex].value === 'custom';

  return (
    <View>
      <TapGestureHandler onGestureEvent={tapGestureHandler}>
        <Animated.View onLayout={e => setWidth(e.nativeEvent.layout.width)}>
          <View style={modalStyles.sliderContainer}>
            <View style={[modalStyles.sliderTrack, { backgroundColor: theme.colors.border }]} />
            <PanGestureHandler onGestureEvent={panGestureHandler}>
              <Animated.View style={[modalStyles.sliderThumb, { backgroundColor: theme.colors.accent }, animatedThumbStyle]} />
            </PanGestureHandler>
          </View>
          <View style={modalStyles.sliderLabelsContainer}>
            {stops.map((stop, index) => (
              <Text key={stop.value} style={[
                modalStyles.sliderShortLabel,
                { color: theme.colors.tabInactive, left: snapPoints[index] - (THUMB_SIZE / 2), width: THUMB_SIZE * 2, textAlign: 'center' }
              ]}>
                {stop.shortLabel}
              </Text>
            ))}
          </View>
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
};

const CreateLoopPopupContent: React.FC<CreateLoopModalProps> = ({ onClose, onSaveSuccess }) => {
  const theme = useThemeStyles();
  const { colors, spacing, typography, borderRadius } = theme;
  const { dispatch } = useLoops();
  const [loopName, setLoopName] = useState('');
  const [selectedFrequencyIndex, setSelectedFrequencyIndex] = useState(0);
  const [customDays, setCustomDays] = useState(new Set<string>());
  const [selectedColor, setSelectedColor] = useState(LOOP_COLORS[0]);

  const frequencyTitle = useMemo(() => {
    const selectedFrequency = FREQUENCY_STOPS[selectedFrequencyIndex];
    const { value } = selectedFrequency;

    if (value === 'auto') {
      return "Post Automaticly";
    }

    if (value.startsWith('weekly_')) {
      const times = value.split('_')[1];
      return `Post ${times} per week`;
    }

    if (value === 'custom') {
      if (customDays.size === 0) {
        return 'Posts Every...';
      }

      const orderedSelectedDays = WEEKDAYS
        .filter(day => customDays.has(day.value))
        .map(day => SHORT_DAY_NAMES[day.value]);

      if (orderedSelectedDays.length > 0) {
        return `Post ${orderedSelectedDays.join(', ')}`;
      }

      return 'Post Every: Custom';
    }

    return 'Post Every';
  }, [selectedFrequencyIndex, customDays]);

  const isCustomFrequency = FREQUENCY_STOPS[selectedFrequencyIndex].value === 'custom';
  const canCreate = loopName.trim() !== '' && (!isCustomFrequency || customDays.size > 0);

  const animatedCustomPickerStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(isCustomFrequency ? 100 : 0, { duration: 300 }),
    opacity: withTiming(isCustomFrequency ? 1 : 0, { duration: 300 }),
    overflow: 'hidden',
  }));
  const toggleCustomDay = (dayValue: string) => {
    setCustomDays(prevDays => {
      const newDays = new Set(prevDays);
      newDays.has(dayValue) ? newDays.delete(dayValue) : newDays.add(dayValue);
      return newDays;
    });
  };
  const resetForm = useCallback(() => {
    setLoopName('');
    setSelectedFrequencyIndex(0);
    setCustomDays(new Set());
    setSelectedColor(LOOP_COLORS[0]);
  }, []);
  const handleCreateLoop = () => {
    if (!canCreate) return;
    const selectedFrequency = FREQUENCY_STOPS[selectedFrequencyIndex];
    let schedule: string = selectedFrequency.value;
    if (selectedFrequency.value === 'custom') {
      schedule = Array.from(customDays).join(',');
    }
    const newLoopPayload = {
      id: `loop-${Date.now()}`,
      title: loopName.trim(),
      color: selectedColor,
      frequency: selectedFrequency.value,
      postCount: 0,
      posts: [],
      status: 'draft',
      randomize: false,
      linkedAccounts: [],
      isActive: false,
      schedule: schedule,
    };
    dispatch({ type: 'ADD_LOOP', payload: newLoopPayload as Loop });
    resetForm();
    onSaveSuccess();
  };
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const textFadedColor = colors.tabInactive || '#A0A0A0';
  const backgroundAltColor = colors.background || colors.border;
  const accentContrastColor = '#FFFFFF';
  const primaryMutedColor = colors.border || '#D3D3D3';
  const primaryContrastColor = '#FFFFFF';

  return (
    <View style={[modalStyles.modalContent, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
      <View style={[modalStyles.header, { borderBottomColor: colors.border }]}>
        <Text style={[modalStyles.title, { color: colors.text, fontSize: typography.fontSize.title, fontWeight: '500' }]}>Create Loop</Text>
      </View>
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
        <Text style={[modalStyles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.subtitle, fontWeight: '500', marginBottom: spacing.md, marginTop: spacing.lg }]}>Name</Text>
        <TextInput style={[modalStyles.input, { backgroundColor: colors.backgroundDefault, borderColor: colors.border, color: colors.text, fontSize: typography.fontSize.body, paddingHorizontal: spacing.lg, paddingVertical: Platform.OS === 'ios' ? spacing.md + 2 : spacing.sm + 4, borderRadius: borderRadius.md }]} value={loopName} onChangeText={setLoopName} placeholder="e.g., Morning Motivation" placeholderTextColor={textFadedColor} />
        <Text style={[modalStyles.sectionTitle, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm, fontSize: typography.fontSize.subtitle, fontWeight: '500' }]}>{frequencyTitle}</Text>
        <FrequencySlider stops={FREQUENCY_STOPS} selectedIndex={selectedFrequencyIndex} onIndexChange={setSelectedFrequencyIndex} theme={theme} />
        <Animated.View style={animatedCustomPickerStyle}>
          <View style={[modalStyles.customDayPicker, { marginTop: spacing.xxl }]}>
            {WEEKDAYS.map(day => (
              <TouchableOpacity key={day.value} style={[modalStyles.dayButton, { backgroundColor: customDays.has(day.value) ? colors.accent : backgroundAltColor, borderColor: customDays.has(day.value) ? colors.accent : colors.border }]} onPress={() => toggleCustomDay(day.value)}>
                <Text style={{ color: customDays.has(day.value) ? primaryContrastColor : colors.text, fontWeight: '500' }}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        <Text style={[modalStyles.sectionTitle, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md, fontSize: typography.fontSize.subtitle, fontWeight: '500' }]}>Color</Text>
        <View style={modalStyles.colorGrid}>
          {LOOP_COLORS.map((loopColor) => <ColorSwatch key={loopColor} color={loopColor} isSelected={selectedColor === loopColor} onPress={() => setSelectedColor(loopColor)} />)}
        </View>
      </View>
      <View style={[modalStyles.footer, { borderTopColor: colors.border, padding: spacing.lg, flexDirection: 'row' }]}>
        <TouchableOpacity onPress={handleCancel} style={[modalStyles.footerButtonBase, { backgroundColor: backgroundAltColor, marginRight: spacing.md, flex: 1, borderRadius: borderRadius.md }]}>
          <Text style={{ color: colors.text, fontWeight: '500', fontSize: typography.fontSize.body }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreateLoop} disabled={!canCreate} style={[modalStyles.footerButtonBase, { backgroundColor: canCreate ? colors.accent : primaryMutedColor, flex: 1, borderRadius: borderRadius.md }]}>
          <Text style={{ color: canCreate ? primaryContrastColor : textFadedColor, fontWeight: 'bold', fontSize: typography.fontSize.body }}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CreateLoopPopup: React.FC<{ visible: boolean; onClose: () => void; onSaveSuccess: () => void; }> = ({ visible, onClose, onSaveSuccess }) => {
  const animationProgress = useSharedValue(0);
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      animationProgress.value = withSpring(1, { damping: 18, stiffness: 200 });
    } else {
      animationProgress.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });
    }
  }, [visible, animationProgress]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    const scale = interpolate(animationProgress.value, [0, 1], [0.9, 1]);
    return {
      transform: [{ scale }],
    };
  });

  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View style={[styles.fullScreenContainer, animatedContainerStyle]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
          <CreateLoopPopupContent onClose={onClose} onSaveSuccess={onSaveSuccess} />
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

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

  const { searchQuery, setSearchQuery, filteredLoops, hasMatches } = useLoopSearch({ initialLoops: state.loops });

  const router = useRouter();
  const navigation = useNavigation<NativeStackNavigationProp<LoopsStackParamList>>();
  const swipeableRowRefs = useRef<Map<string, SwipeableRowRef | null>>(new Map());

  const showCreateLoopForm = useCallback(() => {
    setCreateLoopVisible(true);
  }, []);

  const { addButtonRef, isPopoverVisible, openCreatePopover, closeCreatePopover, handlePopoverAction } = useLoopsHeader({ router, onOpenNewLoopForm: showCreateLoopForm });

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
          <TouchableOpacity style={styles.popoverOption} onPress={() => handlePopoverAction('loop')} accessibilityLabel="Create new loop"><Text style={[styles.popoverText, { color: colors.text }]}>New Loop</Text></TouchableOpacity>
        </View>
      </Popover>
      
      <CreateLoopPopup
        visible={isCreateLoopVisible}
        onClose={() => setCreateLoopVisible(false)}
        onSaveSuccess={() => {
          setCreateLoopVisible(false);
          // Optional: Show a success notification
        }}
      />
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
  // Styles for the popup overlay
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  flexContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const modalStyles = StyleSheet.create({
  modalContent: { width: Platform.OS === 'web' ? '60%' : '95%', maxWidth: 500, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1 },
  title: {},
  body: {},
  sectionTitle: {},
  input: { borderWidth: 1 },
  sliderContainer: { height: THUMB_SIZE, justifyContent: 'center', marginTop: 8, marginBottom: 4 },
  sliderTrack: { height: 4, borderRadius: 2, justifyContent: 'center' },
  sliderThumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2, position: 'absolute', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  sliderLabelsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sliderShortLabel: { fontSize: 12, position: 'absolute' },
  sliderLabel: { textAlign: 'center', marginTop: 8, marginBottom: 8 },
  customDayPicker: { flexDirection: 'row', justifyContent: 'center' },
  dayButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginHorizontal: 5 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  colorSwatch: { width: 38, height: 38, borderRadius: 19, margin: 5, justifyContent: 'center', alignItems: 'center' },
  checkmarkOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', borderRadius: 19 },
  footer: { borderTopWidth: 1 },
  footerButtonBase: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});