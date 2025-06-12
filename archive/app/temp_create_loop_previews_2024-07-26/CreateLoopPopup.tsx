import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import { useLoops, type Loop } from '@/context/LoopsContext';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  ZoomIn,
  ZoomOut,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector, PanGestureHandlerGestureEvent, TapGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export interface CreateLoopPopupProps {
  visible: boolean;
  onClose: () => void;
  onSaveSuccess?: (newLoopId: string) => void;
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

const ColorSwatch: React.FC<{ color: string; isSelected: boolean; onPress: () => void; styles: any }> = ({ color, isSelected, onPress, styles }) => {
  const checkmarkOpacity = useSharedValue(isSelected ? 1 : 0);
  useEffect(() => {
    checkmarkOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected, checkmarkOpacity]);
  const animatedCheckmarkStyle = useAnimatedStyle(() => ({ opacity: checkmarkOpacity.value }));
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.colorSwatch, { backgroundColor: color }]}>
        <Animated.View style={[styles.checkmarkOverlay, animatedCheckmarkStyle]}>
          <Ionicons name="checkmark" size={24} color="white" />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const THUMB_SIZE = 28;
const FrequencySlider: React.FC<{
  selectedIndex: number; onIndexChange: (index: number) => void;
  stops: typeof FREQUENCY_STOPS; theme: ReturnType<typeof useThemeStyles>;
}> = ({ selectedIndex, onIndexChange, stops, theme }) => {
  const styles = useMemo(() => createGlobalStyles(theme), [theme]);
  const [width, setWidth] = useState(0);
  const usableWidth = width > 0 ? width - THUMB_SIZE : 0;
  const snapPoints = useMemo(() => stops.map((_, i) => i * (usableWidth / (stops.length - 1))), [usableWidth, stops]);
  const translateX = useSharedValue(snapPoints[selectedIndex] || 0);
  
  const startX = useSharedValue(0);

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

  const panGesture = Gesture.Pan()
    .onStart(() => {
        startX.value = translateX.value;
    })
    .onUpdate((event) => {
        translateX.value = Math.max(0, Math.min(startX.value + event.translationX, usableWidth));
    })
    .onEnd((event) => {
      const projectedX = translateX.value + event.velocityX * 0.05;
      const closestIndex = snapPoints.reduce((acc, curr, i) => (Math.abs(curr - projectedX) < Math.abs(snapPoints[acc] - projectedX) ? i : acc), 0);
      runOnJS(onSelectIndex)(closestIndex);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const tapX = event.x;
      const closestIndex = snapPoints.reduce((acc, curr, i) => (Math.abs(curr + THUMB_SIZE / 2 - tapX) < Math.abs(snapPoints[acc] + THUMB_SIZE / 2 - tapX) ? i : acc), 0);
      runOnJS(onSelectIndex)(closestIndex);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const isCustomSelected = stops[selectedIndex].value === 'custom';

  return (
    <View>
      <GestureDetector gesture={tapGesture}>
        <Animated.View onLayout={e => setWidth(e.nativeEvent.layout.width)}>
          <View style={styles.sliderContainer}>
            <View style={[styles.sliderTrack, { backgroundColor: theme.colors.border }]}>
              <View style={styles.sliderDotsContainer}>
                {snapPoints.map((point, index) => (
                  <View key={index} style={[styles.sliderDotMarker, { left: point + (THUMB_SIZE / 2) - 2, backgroundColor: theme.colors.background }]}/>
                ))}
              </View>
            </View>
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.sliderThumb, { backgroundColor: theme.colors.accent }, animatedThumbStyle]} />
            </GestureDetector>
          </View>
          <View style={[styles.sliderLabelsContainer, { height: 20 }]}>
            {stops.map((stop, index) => (
               <Text key={stop.value} style={[styles.sliderShortLabel, { color: theme.colors.tabInactive, position: 'absolute', left: snapPoints[index], width: THUMB_SIZE, textAlign: 'center' }]}>{stop.shortLabel}</Text>
            ))}
          </View>
        </Animated.View>
      </GestureDetector>
       <Text style={[styles.sliderLabel, { color: isCustomSelected ? theme.colors.tabInactive : theme.colors.text, fontWeight: 'bold', fontSize: 16, marginTop: 12 }]}>
        {isCustomSelected ? 'Select Days' : stops[selectedIndex].label}
      </Text>
    </View>
  );
};

const CreateLoopPopup: React.FC<CreateLoopPopupProps> = ({ visible, onClose, onSaveSuccess }) => {
  const theme = useThemeStyles();
  const styles = useMemo(() => createGlobalStyles(theme), [theme]);
  const { dispatch } = useLoops();

  const [loopName, setLoopName] = useState('');
  const [selectedFrequencyIndex, setSelectedFrequencyIndex] = useState(0);
  const [customDays, setCustomDays] = useState(new Set<string>());
  const [selectedColor, setSelectedColor] = useState(LOOP_COLORS[0]);

  const canCreate = loopName.trim() !== '';
  const isCustomFrequency = FREQUENCY_STOPS[selectedFrequencyIndex].value === 'custom';

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
    const scheduleString = selectedFrequency.value === 'custom' ? Array.from(customDays).join(', ') : selectedFrequency.label;
    
    const newLoop: Loop = {
      id: String(Date.now()),
      title: loopName.trim(),
      color: selectedColor,
      postCount: 0,
      posts: [],
      schedule: scheduleString,
      isActive: true,
      frequency: selectedFrequency.value,
    };

    dispatch({ type: 'ADD_LOOP', payload: newLoop });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetForm();
    onSaveSuccess?.(newLoop.id);
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };
  
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={handleCancel}>
        <Animated.View style={styles.backdrop} entering={FadeIn} exiting={FadeOut} />
      </TouchableWithoutFeedback>

      <Animated.View style={styles.popupContainer} entering={ZoomIn.withInitialValues({ transform: [{ scale: 0.9 }] })} exiting={ZoomOut}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Loop</Text>
            <TouchableOpacity onPress={handleCreateLoop} style={[styles.headerButton, { opacity: canCreate ? 1 : 0.5 }]} disabled={!canCreate}>
              <Text style={[styles.headerButtonText, { fontWeight: 'bold' }]}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={loopName}
                onChangeText={setLoopName}
                placeholder="e.g. Morning Workout, Daily Journal..."
                placeholderTextColor={theme.colors.tabInactive}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequency</Text>
              <FrequencySlider
                selectedIndex={selectedFrequencyIndex}
                onIndexChange={setSelectedFrequencyIndex}
                stops={FREQUENCY_STOPS}
                theme={theme}
              />
              <Animated.View style={[styles.customDayPicker, animatedCustomPickerStyle]}>
                {WEEKDAYS.map(day => (
                  <TouchableOpacity key={day.value} onPress={() => toggleCustomDay(day.value)}>
                    <View style={[styles.dayButton, { backgroundColor: customDays.has(day.value) ? theme.colors.accent : theme.colors.border }]}>
                      <Text style={[styles.dayButtonText, { color: customDays.has(day.value) ? 'white' : theme.colors.text }]}>{day.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.colorPalette}>
                {LOOP_COLORS.map(color => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    isSelected={selectedColor === color}
                    onPress={() => setSelectedColor(color)}
                    styles={styles}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

const createGlobalStyles = (theme: ThemeStyles) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  popupContainer: {
    width: '95%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
      android: { elevation: 20 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  headerButton: { padding: theme.spacing.sm },
  headerButtonText: { color: theme.colors.accent, fontSize: 17 },
  contentContainer: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  textInput: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderDotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  sliderDotMarker: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sliderThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    position: 'absolute',
    top: '50%',
    marginTop: -THUMB_SIZE / 2,
  },
  sliderLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderShortLabel: {
    fontSize: 12,
  },
  sliderLabel: {
    textAlign: 'center',
  },
  customDayPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 16,
  },
});

export default CreateLoopPopup;