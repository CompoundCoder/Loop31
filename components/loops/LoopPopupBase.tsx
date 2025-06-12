import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
} from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useLoopSchedule } from '@/hooks/useLoopSchedule';
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
import type { Loop } from '@/context/LoopsContext';

const LOOP_COLORS = ['#FF6B6B', '#4ECDC4', '#54A0FF', '#F9A03F', '#A5D6A7', '#FFD166', '#D4A5FF'];

const WEEKDAYS = [
  { label: 'S', value: 'sun' }, { label: 'M', value: 'mon' }, { label: 'T', value: 'tue' },
  { label: 'W', value: 'wed' }, { label: 'T', value: 'thu' }, { label: 'F', value: 'fri' },
  { label: 'S', value: 'sat' },
];

const SHORT_DAY_NAMES: { [key: string]: string } = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };

const THUMB_SIZE = 28;

export interface LoopFormData {
  title: string;
  color: string;
  frequency: string;
  schedule: string;
}

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
    if (width > 0 && snapPoints[selectedIndex] !== undefined) {
      translateX.value = withSpring(snapPoints[selectedIndex], { damping: 15, stiffness: 150 });
    }
  }, [selectedIndex, snapPoints, width]);

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

interface LoopPopupContentProps {
  onClose: () => void;
  onSave: (data: LoopFormData) => void;
  title: string;
  saveButtonText: string;
  initialValues?: Partial<Loop>;
}

const LoopPopupContent: React.FC<LoopPopupContentProps> = ({ onClose, onSave, title, saveButtonText, initialValues }) => {
  const theme = useThemeStyles();
  const { colors, spacing, typography, borderRadius } = theme;
  const { SCHEDULE_OPTIONS, WEEKDAYS, getFrequencyTitle } = useLoopSchedule();

  const [loopName, setLoopName] = useState('');
  const [selectedFrequencyIndex, setSelectedFrequencyIndex] = useState(0);
  const [customDays, setCustomDays] = useState(new Set<string>());
  const [selectedColor, setSelectedColor] = useState(LOOP_COLORS[0]);

  useEffect(() => {
    if (initialValues) {
      setLoopName(initialValues.title || '');
      setSelectedColor(initialValues.color || LOOP_COLORS[0]);
      
      const freqIndex = SCHEDULE_OPTIONS.findIndex(f => f.value === initialValues.frequency);
      setSelectedFrequencyIndex(freqIndex >= 0 ? freqIndex : 0);
      
      if (initialValues.frequency === 'custom' && typeof initialValues.schedule === 'string') {
        setCustomDays(new Set(initialValues.schedule.split(',').filter(Boolean)));
      } else {
        setCustomDays(new Set());
      }
    } else {
      setLoopName('');
      setSelectedFrequencyIndex(0);
      setCustomDays(new Set());
      setSelectedColor(LOOP_COLORS[0]);
    }
  }, [initialValues, SCHEDULE_OPTIONS]);

  const frequencyTitle = useMemo(() => {
    const selectedFrequency = SCHEDULE_OPTIONS[selectedFrequencyIndex];
    if (!selectedFrequency) return 'Post Every';
    return getFrequencyTitle(selectedFrequency.value, Array.from(customDays));
  }, [selectedFrequencyIndex, customDays, SCHEDULE_OPTIONS, getFrequencyTitle]);
  
  const isCustomFrequency = SCHEDULE_OPTIONS[selectedFrequencyIndex]?.value === 'custom';
  const canSave = loopName.trim() !== '' && (!isCustomFrequency || customDays.size > 0);

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

  const handleSave = () => {
    if (!canSave) return;
    const selectedFrequency = SCHEDULE_OPTIONS[selectedFrequencyIndex];
    let schedule = selectedFrequency.value;
    if (selectedFrequency.value === 'custom') {
      schedule = Array.from(customDays).join(',');
    }

    onSave({
      title: loopName.trim(),
      color: selectedColor,
      frequency: selectedFrequency.value,
      schedule,
    });
  };
  
  const textFadedColor = colors.tabInactive || '#A0A0A0';
  const backgroundAltColor = colors.background || colors.border;
  const accentContrastColor = '#FFFFFF';
  const primaryMutedColor = colors.border || '#D3D3D3';
  const primaryContrastColor = '#FFFFFF';

  return (
    <View style={[modalStyles.modalContent, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
      <View style={[modalStyles.header, { borderBottomColor: colors.border }]}>
        <Text style={[modalStyles.title, { color: colors.text, fontSize: typography.fontSize.title, fontWeight: '500' }]}>{title}</Text>
      </View>
      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
        <Text style={[modalStyles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.subtitle, fontWeight: '500', marginBottom: spacing.md, marginTop: spacing.lg }]}>Name</Text>
        <TextInput style={[modalStyles.input, { backgroundColor: colors.backgroundDefault, borderColor: colors.border, color: colors.text, fontSize: typography.fontSize.body, paddingHorizontal: spacing.lg, paddingVertical: Platform.OS === 'ios' ? spacing.md + 2 : spacing.sm + 4, borderRadius: borderRadius.md }]} value={loopName} onChangeText={setLoopName} placeholder="e.g., Morning Motivation" placeholderTextColor={textFadedColor} />
        
        <Text style={[modalStyles.sectionTitle, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm, fontSize: typography.fontSize.subtitle, fontWeight: '500' }]}>{frequencyTitle}</Text>
        <FrequencySlider stops={SCHEDULE_OPTIONS} selectedIndex={selectedFrequencyIndex} onIndexChange={setSelectedFrequencyIndex} theme={theme} />
        
        <Animated.View style={animatedCustomPickerStyle}>
          <View style={[modalStyles.customDayPicker, { marginTop: spacing.xl }]}>
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
        <TouchableOpacity onPress={onClose} style={[modalStyles.footerButtonBase, { backgroundColor: backgroundAltColor, marginRight: spacing.md, flex: 1, borderRadius: borderRadius.md }]}>
          <Text style={{ color: colors.text, fontWeight: '500', fontSize: typography.fontSize.body }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} disabled={!canSave} style={[modalStyles.footerButtonBase, { backgroundColor: canSave ? colors.accent : primaryMutedColor, flex: 1, borderRadius: borderRadius.md }]}>
          <Text style={{ color: canSave ? primaryContrastColor : textFadedColor, fontWeight: 'bold', fontSize: typography.fontSize.body }}>{saveButtonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface LoopPopupBaseProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: LoopFormData) => void;
  title: string;
  saveButtonText: string;
  initialValues?: Partial<Loop>;
}

const LoopPopupBase: React.FC<LoopPopupBaseProps> = ({ visible, onClose, onSave, title, saveButtonText, initialValues }) => {
  const animationProgress = useSharedValue(0);
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      animationProgress.value = withTiming(1, { duration: 300 });
    } else {
      animationProgress.value = withTiming(0, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });
    }
  }, [visible, animationProgress]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: animationProgress.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => {
    const opacity = animationProgress.value;
    const translateY = interpolate(animationProgress.value, [0, 1], [40, 0]);
    return {
      opacity,
      transform: [{ translateY }],
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
          <LoopPopupContent 
            onClose={onClose} 
            onSave={onSave} 
            title={title} 
            saveButtonText={saveButtonText}
            initialValues={initialValues}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

export default LoopPopupBase;

const styles = StyleSheet.create({
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
  sectionTitle: {},
  input: { borderWidth: 1 },
  sliderContainer: { height: THUMB_SIZE, justifyContent: 'center', marginTop: 8, marginBottom: 4 },
  sliderTrack: { height: 4, borderRadius: 2, justifyContent: 'center' },
  sliderThumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2, position: 'absolute', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  sliderLabelsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sliderShortLabel: { fontSize: 12, position: 'absolute' },
  customDayPicker: { flexDirection: 'row', justifyContent: 'center' },
  dayButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginHorizontal: 5 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  colorSwatch: { width: 38, height: 38, borderRadius: 19, margin: 5, justifyContent: 'center', alignItems: 'center' },
  checkmarkOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', borderRadius: 19 },
  footer: { borderTopWidth: 1 },
  footerButtonBase: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
}); 