import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useLoops, type Loop } from '@/context/LoopsContext';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { PanGestureHandler, PanGestureHandlerGestureEvent, TapGestureHandler, TapGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

interface CreateLoopModalProps {
  onClose: () => void;
}

// Updated frequency options for the slider
const FREQUENCY_STOPS = [
  { label: 'Automatically', value: 'auto', shortLabel: 'Auto' },
  { label: 'Once per Week', value: 'weekly_1x', shortLabel: '1x' },
  { label: '3x per Week', value: 'weekly_3x', shortLabel: '3x' },
  { label: '5x per Week', value: 'weekly_5x', shortLabel: '5x' },
  { label: 'Custom Schedule', value: 'custom', shortLabel: 'Days' },
];

const LOOP_COLORS = ['#FF6B6B', '#4ECDC4', '#54A0FF', '#F9A03F', '#A5D6A7', '#FFD166', '#D4A5FF'];

// Replaced simple array with an array of objects for unique keys
const WEEKDAYS = [
  { label: 'S', value: 'sun' },
  { label: 'M', value: 'mon' },
  { label: 'T', value: 'tue' },
  { label: 'W', value: 'wed' },
  { label: 'T', value: 'thu' },
  { label: 'F', value: 'fri' },
  { label: 'S', value: 'sat' },
];

const ColorSwatch: React.FC<{
  color: string;
  isSelected: boolean;
  onPress: () => void;
}> = ({ color, isSelected, onPress }) => {
  const checkmarkOpacity = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    checkmarkOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected, checkmarkOpacity]);

  const animatedCheckmarkStyle = useAnimatedStyle(() => ({
    opacity: checkmarkOpacity.value,
  }));

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

const FrequencySlider = ({
  selectedIndex,
  onIndexChange,
  stops,
  theme,
}: {
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  stops: typeof FREQUENCY_STOPS;
  theme: ReturnType<typeof useThemeStyles>;
}) => {
  const [width, setWidth] = useState(0);
  const usableWidth = width > 0 ? width - THUMB_SIZE : 0;
  
  const snapPoints = useMemo(() => 
    stops.map((_, i) => i * (usableWidth / (stops.length - 1))),
    [usableWidth, stops]
  );

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
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = Math.max(0, Math.min(ctx.startX + event.translationX, usableWidth));
    },
    onEnd: (event) => {
      const projectedX = translateX.value + event.velocityX * 0.05;
      const closestIndex = snapPoints.reduce(
        (acc, curr, i) => (Math.abs(curr - projectedX) < Math.abs(snapPoints[acc] - projectedX) ? i : acc),
        0
      );
      translateX.value = withSpring(snapPoints[closestIndex], { damping: 15, stiffness: 150 });
      runOnJS(onSelectIndex)(closestIndex);
    },
  });

  const tapGestureHandler = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onEnd: (event) => {
      const tapX = event.x;
      const closestIndex = snapPoints.reduce(
        (acc, curr, i) => (Math.abs(curr + THUMB_SIZE / 2 - tapX) < Math.abs(snapPoints[acc] + THUMB_SIZE / 2 - tapX) ? i : acc),
        0
      );
      translateX.value = withSpring(snapPoints[closestIndex], { damping: 15, stiffness: 150 });
      runOnJS(onSelectIndex)(closestIndex);
    },
  });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isCustomSelected = stops[selectedIndex].value === 'custom';

  return (
    <View>
      <TapGestureHandler onGestureEvent={tapGestureHandler}>
        <Animated.View onLayout={e => setWidth(e.nativeEvent.layout.width)}>
          <View style={styles.sliderContainer}>
            <View style={[styles.sliderTrack, { backgroundColor: theme.colors.border }]}>
              <View style={styles.sliderDotsContainer}>
                {snapPoints.map((point, index) => (
                  <View
                    key={index}
                    style={[
                      styles.sliderDotMarker,
                      { 
                        left: point + (THUMB_SIZE / 2) - 2,
                        backgroundColor: theme.colors.background,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
            <PanGestureHandler onGestureEvent={panGestureHandler}>
              <Animated.View style={[styles.sliderThumb, { backgroundColor: theme.colors.accent }, animatedThumbStyle]} />
            </PanGestureHandler>
          </View>
          <View style={[styles.sliderLabelsContainer, { height: 20 }]}>
            {stops.map((stop, index) => (
               <Text key={stop.value} style={[
                 styles.sliderShortLabel, 
                 { 
                   color: theme.colors.tabInactive,
                   position: 'absolute',
                   left: snapPoints[index],
                   width: THUMB_SIZE,
                   textAlign: 'center',
                  }
                ]}>{stop.shortLabel}</Text>
            ))}
          </View>
        </Animated.View>
      </TapGestureHandler>
       <Text style={[
         styles.sliderLabel,
         {
           color: isCustomSelected ? theme.colors.tabInactive : theme.colors.text,
           fontWeight: isCustomSelected ? theme.typography.fontWeight.bold : theme.typography.fontWeight.bold,
           fontSize: theme.typography.fontSize.body,
           marginTop: theme.spacing.md,
         },
       ]}>
        {isCustomSelected ? 'Select Days' : stops[selectedIndex].label}
      </Text>
    </View>
  );
};

const CreateLoopModal: React.FC<CreateLoopModalProps> = ({ onClose }) => {
  const theme = useThemeStyles();
  const { colors, spacing, typography, borderRadius } = theme;
  const { dispatch } = useLoops();

  const [loopName, setLoopName] = useState('');
  const [selectedFrequencyIndex, setSelectedFrequencyIndex] = useState(0);
  const [customDays, setCustomDays] = useState(new Set<string>());
  const [selectedColor, setSelectedColor] = useState(LOOP_COLORS[0]);

  const canCreate = loopName.trim() !== '';

  const isCustomFrequency = FREQUENCY_STOPS[selectedFrequencyIndex].value === 'custom';

  const animatedCustomPickerStyle = useAnimatedStyle(() => {
    return {
      maxHeight: withTiming(isCustomFrequency ? 100 : 0, { duration: 300 }),
      opacity: withTiming(isCustomFrequency ? 1 : 0, { duration: 300 }),
      overflow: 'hidden',
    };
  });

  const toggleCustomDay = (dayValue: string) => { // Expects 'sun', 'mon', etc.
    setCustomDays(prevDays => {
      const newDays = new Set(prevDays);
      if (newDays.has(dayValue)) {
        newDays.delete(dayValue);
      } else {
        newDays.add(dayValue);
      }
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
    onClose();
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
    <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text, fontSize: typography.fontSize.title, fontWeight: typography.fontWeight.medium }]}>
          Create a New Loop
        </Text>
      </View>

      <ScrollView 
        style={styles.body}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.subtitle, fontWeight: typography.fontWeight.medium, marginBottom: spacing.md, marginTop: spacing.lg }]}>Loop Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundDefault, borderColor: colors.border, color: colors.text, fontSize: typography.fontSize.body, paddingHorizontal: spacing.lg, paddingVertical: Platform.OS === 'ios' ? spacing.md + 2 : spacing.sm + 4, borderRadius: borderRadius.md }]}
          value={loopName}
          onChangeText={setLoopName}
          placeholder="e.g., Morning Motivation"
          placeholderTextColor={textFadedColor}
        />

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm, fontSize: typography.fontSize.subtitle, fontWeight: typography.fontWeight.medium }]}>Frequency</Text>
        
        <FrequencySlider
          stops={FREQUENCY_STOPS}
          selectedIndex={selectedFrequencyIndex}
          onIndexChange={setSelectedFrequencyIndex}
          theme={theme}
        />
        
        <Animated.View style={animatedCustomPickerStyle}>
          <View style={[styles.customDayPicker, { marginTop: spacing.md }]}>
            {WEEKDAYS.map(day => (
              <TouchableOpacity
                key={day.value}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: customDays.has(day.value) ? colors.accent : backgroundAltColor,
                    borderColor: customDays.has(day.value) ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => toggleCustomDay(day.value)}
              >
                <Text style={{ color: customDays.has(day.value) ? primaryContrastColor : colors.text, fontWeight: '500' }}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md, fontSize: typography.fontSize.subtitle, fontWeight: typography.fontWeight.medium }]}>Color</Text>
        <View style={styles.colorGrid}>
          {LOOP_COLORS.map((loopColor) => (
            <ColorSwatch
              key={loopColor}
              color={loopColor}
              isSelected={selectedColor === loopColor}
              onPress={() => setSelectedColor(loopColor)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, padding: spacing.lg, flexDirection: 'row' }]}>
        <TouchableOpacity 
          onPress={handleCancel} 
          style={[styles.footerButtonBase, { backgroundColor: backgroundAltColor, marginRight: spacing.md, flex: 1, borderRadius: borderRadius.md }]}
        >
          <Text style={{ color: colors.text, fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.body }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleCreateLoop} 
          disabled={!canCreate}
          style={[styles.footerButtonBase, { backgroundColor: canCreate ? colors.accent : primaryMutedColor, flex: 1, borderRadius: borderRadius.md }]}
        >
          <Text style={{ color: canCreate ? primaryContrastColor : textFadedColor, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.body }}>Create Loop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: { width: Platform.OS === 'web' ? '60%' : '95%', maxWidth: 500, maxHeight: '90%', overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  title: {},
  body: {},
  sectionTitle: {},
  input: { borderWidth: 1 },
  sliderContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    justifyContent: 'center',
  },
  sliderDotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  sliderDotMarker: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  sliderThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  sliderLabelsContainer: {
    marginTop: 8,
  },
  sliderShortLabel: {
    fontSize: 12,
  },
  sliderLabel: { textAlign: 'center', marginTop: 8, marginBottom: 8 },
  customDayPicker: { flexDirection: 'row', justifyContent: 'center' },
  dayButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginHorizontal: 5 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  colorSwatch: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    margin: 5, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  checkmarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
  },
  footer: { borderTopWidth: 1 },
  footerButtonBase: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});

export default CreateLoopModal; 