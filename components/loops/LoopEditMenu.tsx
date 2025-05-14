import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView as ModalScrollView, StyleProp, ViewStyle, TouchableWithoutFeedback } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import { type Theme as AppTheme } from '@/theme/theme';
import { type Loop } from '@/context/LoopsContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, Easing, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// --- Define a list of selectable colors ---
const PREDEFINED_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#FFA07A', // Light Salmon
  '#96CEB4', // Pastel Green
  '#FFD700', // Gold
  '#D7AED1', // Lilac
];

// --- Define NEW Schedule Options ---
interface ScheduleOption {
  label: string; 
  value: string; 
  details?: string; 
}

const SCHEDULE_OPTIONS: ScheduleOption[] = [
  { label: 'Automatically (recommended)', value: 'Auto' },
  { label: 'Every Day', value: 'Daily', details: '(7x per week)' },
  { label: 'A Few Times a Week', value: 'MWF', details: '(Mon, Wed, Fri)' }, 
  { label: 'Once a Week', value: 'Weekly', details: '(e.g., Every Tuesday)' }, 
  { label: 'Custom Schedule…', value: 'Custom' },
];

// --- Define Days for Custom Picker ---
const DAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_DISPLAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // For button labels

interface LoopEditMenuProps {
  isVisible: boolean;
  onClose: () => void;
  loop: Loop | null;
  onSave: (updatedData: { id: string; title?: string; color?: string; schedule?: string }) => void;
  typography: AppTheme['typography'];
}

// --- NEW: AnimatedDayButton Internal Component ---
interface AnimatedDayButtonProps {
  dayCharacter: string;
  fullDayName: string;
  isSelected: boolean;
  onPress: (dayName: string) => void;
  themeStyles: ThemeStyles;
  typography: AppTheme['typography'];
}

const AnimatedDayButton: React.FC<AnimatedDayButtonProps> = ({ 
  dayCharacter, 
  fullDayName, 
  isSelected, 
  onPress, 
  themeStyles, 
  typography 
}) => {
  const styles = createStyles(themeStyles, typography);
  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Animated styles for selection (background, border, text color)
  // This uses withTiming for smooth transition between selected/unselected states
  const animatedSelectionStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(isSelected ? themeStyles.colors.accent : themeStyles.colors.card, { duration: 150 }),
      borderColor: withTiming(isSelected ? themeStyles.colors.accent : themeStyles.colors.border, { duration: 150 }),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isSelected ? themeStyles.colors.card : themeStyles.colors.text, { duration: 150 }),
    };
  });

  const handlePress = () => {
    onPress(fullDayName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <TouchableOpacity 
      onPressIn={() => (scale.value = withSpring(0.9))} 
      onPressOut={() => (scale.value = withSpring(1.0))} 
      onPress={handlePress}
    >
      <Animated.View style={[styles.dayButton, animatedButtonStyle, animatedSelectionStyle]}>
        <Animated.Text style={[styles.dayButtonText, animatedTextStyle]}>
          {dayCharacter}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// New AnimatedPressableOption component
interface AnimatedPressableOptionProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressableOption: React.FC<AnimatedPressableOptionProps> = ({ onPress, children, style }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.97, { dampingRatio: 0.7, stiffness: 150 }); };
  const handlePressOut = () => { scale.value = withSpring(1.0, { dampingRatio: 0.7, stiffness: 150 }); };
  const handleActualPress = () => {
    scale.value = withSpring(1.0, { dampingRatio: 0.7, stiffness: 150 }); // Ensure reset before calling onPress
    onPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Added haptic feedback
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleActualPress}
        style={style}
        activeOpacity={1} // Disable default opacity change as we have scale
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const LoopEditMenu: React.FC<LoopEditMenuProps> = ({ isVisible, onClose, loop, onSave, typography }) => {
  const themeStyles = useThemeStyles();
  const styles = createStyles(themeStyles, typography);
  const insets = useSafeAreaInsets();

  const [editedTitle, setEditedTitle] = useState(loop?.title || '');
  const [originalTitle, setOriginalTitle] = useState(loop?.title || '');
  const [editedColor, setEditedColor] = useState(loop?.color || PREDEFINED_COLORS[0]);
  const [editedSchedule, setEditedSchedule] = useState('');
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [isScheduleInitialized, setIsScheduleInitialized] = useState(false);

  const isDismissingRef = useRef(false);

  useEffect(() => {
    let mountTimer: NodeJS.Timeout;
    if (isVisible) {
      mountTimer = setTimeout(() => {
        setHasMounted(true);
        if (loop) {
          setEditedTitle(loop.title);
          setOriginalTitle(loop.title);
          setEditedColor(loop.color || PREDEFINED_COLORS[0]);
          const schedule = loop.schedule || '';
          const scheduleLower = schedule.toLowerCase();
          let initialScheduleValue = SCHEDULE_OPTIONS.find(opt => opt.value.toLowerCase() === scheduleLower)?.value || SCHEDULE_OPTIONS[0].value;
          let initialCustomDays: string[] = [];
          const matchedOption = SCHEDULE_OPTIONS.find(opt => opt.value.toLowerCase() === scheduleLower);
          if (matchedOption && matchedOption.value !== 'Custom') {
            initialScheduleValue = matchedOption.value;
          } else if (schedule) {
            const potentialDays = schedule.split(',').map(d => d.trim()).filter(Boolean);
            const validDays = potentialDays.filter(d => DAYS_FULL.some(kd => kd.toLowerCase() === d.toLowerCase()));
            if (validDays.length > 0 && validDays.length === potentialDays.length) {
              if (validDays.length === 7) initialScheduleValue = 'Daily';
              else if (validDays.length === 3 && validDays.map(d => d.toLowerCase()).sort().join(',') === 'fri,mon,wed') initialScheduleValue = 'MWF';
              else { initialScheduleValue = 'Custom'; initialCustomDays = validDays.map(d => DAYS_FULL.find(fd => fd.toLowerCase() === d.toLowerCase()) || '').filter(Boolean); }
            } else if (!SCHEDULE_OPTIONS.find(opt => opt.value.toLowerCase() === scheduleLower)) { initialScheduleValue = 'Auto'; }
          } else { initialScheduleValue = 'Auto'; }
          setEditedSchedule(initialScheduleValue);
          setCustomDays(initialCustomDays);
          setIsScheduleInitialized(true);
        }
      }, 50);
    }
    return () => clearTimeout(mountTimer);
  }, [isVisible, loop]);

  const handleModalHide = () => {
    setHasMounted(false);
    setIsScheduleInitialized(false);
    isDismissingRef.current = false; // Reset dismiss flag
  };

  const handleDismiss = () => {
    console.log('[LoopEditMenu] handleDismiss triggered.');
    if (isDismissingRef.current) {
      console.log('[LoopEditMenu] handleDismiss: Already dismissing, returning.');
      return; // Already dismissing, do nothing
    }
    console.log('[LoopEditMenu] handleDismiss: Proceeding with dismiss.');
    isDismissingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose(); // Call onClose directly
  };

  const commitScheduleChange = useCallback(() => {
    if (!loop) return;
    let scheduleToSave = editedSchedule;
    if (editedSchedule === 'Custom') {
      if (customDays.length > 0) {
        const sortedDays = [...customDays].sort((a, b) => DAYS_FULL.indexOf(a) - DAYS_FULL.indexOf(b));
        scheduleToSave = sortedDays.join(',');
      } else {
        scheduleToSave = 'Weekly'; 
      }
    }
    if (scheduleToSave !== loop.schedule) {
        onSave({ id: loop.id, schedule: scheduleToSave });
    }
  }, [loop, editedSchedule, customDays, onSave]);

  const handleTitleEndEditing = () => {
    console.log('[LoopEditMenu] handleTitleEndEditing triggered.');
    console.log('[LoopEditMenu] Current loop ID:', loop?.id);
    console.log('[LoopEditMenu] Edited Title:', editedTitle);
    console.log('[LoopEditMenu] Original Title:', originalTitle);

    if (loop && editedTitle.trim() !== originalTitle) {
      const newTitle = editedTitle.trim();
      console.log('[LoopEditMenu] Title has changed. newTitle:', newTitle);
      if(newTitle){
        console.log('[LoopEditMenu] Calling onSave with payload:', { id: loop.id, title: newTitle });
        onSave({ id: loop.id, title: newTitle });
        setOriginalTitle(newTitle); // Keep originalTitle in sync after a successful save
      } else {
        console.log('[LoopEditMenu] New title is empty, reverting to originalTitle.');
        setEditedTitle(originalTitle);
      }
    } else {
      console.log('[LoopEditMenu] Title has NOT changed or loop is null. No save action taken.');
    }
  };

  const handleColorPress = (color: string) => {
    setEditedColor(color);
    if (loop && color !== loop.color) {
      onSave({ id: loop.id, color: color });
    }
  };

  const handleScheduleOptionPress = (optionValue: string) => {
    console.log('[LoopEditMenu] handleScheduleOptionPress called with:', optionValue);
    setEditedSchedule(optionValue);
  };
  
  const toggleCustomDayModified = (day: string) => {
    console.log('[LoopEditMenu] toggleCustomDayModified called with:', day);
    const newCustomDays = customDays.includes(day)
      ? customDays.filter((d) => d !== day)
      : [...customDays, day];
    setCustomDays(newCustomDays);
    if (editedSchedule !== 'Custom' && newCustomDays.length > 0) {
      setEditedSchedule('Custom');
    } else if (newCustomDays.length === 0 && editedSchedule === 'Custom'){
    }
  };

  useEffect(() => {
    if (isVisible && loop && isScheduleInitialized && hasMounted) {
      commitScheduleChange();
    }
  }, [editedSchedule, customDays, commitScheduleChange, isVisible, loop, isScheduleInitialized, hasMounted]);

  const animatedDayPickerStyleLocal = useAnimatedStyle(() => {
    const isCustomActive = editedSchedule === 'Custom';
    const easingConfigOpen = Easing.inOut(Easing.ease);
    const easingConfigClose = Easing.out(Easing.cubic); // Smoother deceleration for exit

    return {
      maxHeight: withTiming(isCustomActive ? 120 : 0, { 
        duration: 280, 
        easing: isCustomActive ? easingConfigOpen : easingConfigClose 
      }),
      opacity: withTiming(isCustomActive ? 1 : 0, { 
        duration: isCustomActive ? 250 : 220, 
        easing: Easing.inOut(Easing.ease) 
      }),
      overflow: 'hidden',
      marginTop: withTiming(isCustomActive ? themeStyles.spacing.sm : 0, { 
        duration: 280, 
        easing: isCustomActive ? easingConfigOpen : easingConfigClose 
      }),
    };
  });
  
  if (!loop && isVisible) { 
    return null; 
  }
  if (!loop && !isVisible) {
    return null;
  }

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modalStyle}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={350}
      animationOutTiming={300}
      backdropOpacity={0}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      onSwipeComplete={handleDismiss}
      swipeDirection="down"
      avoidKeyboard={true}
      propagateSwipe={true}
      onModalHide={handleModalHide}
    >
      {/* Custom Tappable Backdrop Area - Sits behind the panel */}
      <TouchableWithoutFeedback onPress={handleDismiss} accessible={false}>
        <View style={StyleSheet.absoluteFillObject} />
      </TouchableWithoutFeedback>

      {/* Shadow Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.85)']}
        locations={[0.05, 0.85]} // Top 5% transparent, fades to dark over next 80%, bottom 15% fully dark
        style={styles.shadowGradientOverlay}
        pointerEvents="none" // Make sure it doesn't block interactions
      />

      {hasMounted && loop && (
        <View style={[styles.contentView, { paddingBottom: insets.bottom || themeStyles.spacing.lg }]}>
          <View style={styles.grabber} />
          <View style={styles.headerContainer}>
            <Text style={styles.menuTitle}>Edit Loop</Text>
          </View>

          <ModalScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            style={styles.scrollViewStyle}
            contentContainerStyle={styles.scrollViewContentContainer}
          >
            <View style={styles.sectionContainer}>
              <Text style={styles.label}>Loop Name</Text>
              <TextInput 
                style={styles.input}
                value={editedTitle}
                onChangeText={setEditedTitle}
                onEndEditing={handleTitleEndEditing}
                placeholder="Enter loop name"
                placeholderTextColor={themeStyles.colors.text + '80'}
              />
            </View>
            
            <View style={styles.sectionContainer}>
              <Text style={styles.label}>Loop Color</Text>
              <View style={styles.colorSwatchesContainer}>
                {PREDEFINED_COLORS.map((color) => (
                  <TouchableOpacity key={color} style={[styles.colorSwatch, { backgroundColor: color }]} onPress={() => handleColorPress(color)}>
                    {editedColor.toLowerCase() === color.toLowerCase() && (<Ionicons name="checkmark-outline" size={20} color={themeStyles.colors.card} />)}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.sectionContainer, { marginBottom: 0}]} pointerEvents="auto">
              <Text style={styles.label}>Posting Schedule</Text>
              <View style={styles.scheduleOptionsContainer}>
                {SCHEDULE_OPTIONS.map((option) => {
                  const scheduleOptionContent = (
                    <>
                      <View style={styles.scheduleOptionTextContainer}>
                        <Text style={[styles.scheduleOptionText, editedSchedule === option.value && styles.scheduleOptionTextSelected]}>{option.label}</Text>
                        {option.details && (<Text style={[styles.scheduleOptionDetailText, editedSchedule === option.value && styles.scheduleOptionDetailTextSelected]}>{option.details}</Text>)}
                      </View>
                      {editedSchedule === option.value && (<Ionicons name="checkmark" size={22} color={themeStyles.colors.accent} style={styles.scheduleSelectedIcon} />)}
                    </>
                  );

                  if (option.value === 'Custom') {
                    return (
                      <AnimatedPressableOption
                        key={option.value}
                        onPress={() => handleScheduleOptionPress(option.value)}
                        style={styles.scheduleOption} 
                      >
                        {scheduleOptionContent}
                      </AnimatedPressableOption>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.scheduleOption}
                      onPress={() => handleScheduleOptionPress(option.value)}
                    >
                      {scheduleOptionContent}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Animated.View style={[animatedDayPickerStyleLocal]} pointerEvents="auto">
              <View> 
                <Text style={styles.label}>Select Days</Text>
                <View style={styles.customDayPickerContainer}>
                  {DAYS_FULL.map((day, index) => (
                    <AnimatedDayButton
                      key={day}
                      themeStyles={themeStyles}
                      typography={typography}
                      dayCharacter={DAYS_DISPLAY[index]}
                      fullDayName={day}
                      isSelected={customDays.includes(day)}
                      onPress={toggleCustomDayModified}
                    />
                  ))}
                </View>
              </View>
            </Animated.View>
          </ModalScrollView> 
        </View>
      )}
    </Modal>
  );
};

const createStyles = (theme: ThemeStyles, typography: AppTheme['typography']) => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    modalStyle: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    shadowGradientOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    contentView: {
      backgroundColor: colors.card,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      width: '100%',
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    grabber: {
      width: 48,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      marginBottom: spacing.sm,
    },
    menuTitle: {
      fontSize: typography.fontSize.subtitle,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    scrollViewStyle: {
    },
    scrollViewContentContainer: {
      paddingBottom: spacing.lg,
    },
    sectionContainer: {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.fontSize.caption,
      color: colors.text + 'A0',
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      fontWeight: typography.fontWeight.medium,
    },
    input: {
      backgroundColor: colors.background,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: Platform.OS === 'ios' ? spacing.sm + spacing.xs : spacing.sm,
      borderRadius: borderRadius.sm,
      fontSize: typography.fontSize.body,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    colorSwatchesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    colorSwatch: {
      width: 36, height: 36, borderRadius: 18, margin: spacing.xs,
      justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
    },
    scheduleOptionsContainer: {},
    scheduleOption: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.sm, marginBottom: spacing.xs,
    },
    scheduleOptionTextContainer: { flex: 1, marginRight: spacing.sm },
    scheduleOptionText: { fontSize: typography.fontSize.body, color: colors.text },
    scheduleOptionDetailText: { fontSize: typography.fontSize.caption, color: colors.text + '99' },
    scheduleOptionTextSelected: { color: colors.accent, fontWeight: typography.fontWeight.medium },
    scheduleOptionDetailTextSelected: { color: colors.accent },
    scheduleSelectedIcon: {},
    customDayPickerContainer: {
      flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
      paddingVertical: spacing.sm, 
      paddingHorizontal: spacing.xs, 
      marginTop: spacing.xs,
    },
    dayButton: {
      width: 32, height: 32, borderRadius: 16,
      justifyContent: 'center', alignItems: 'center',
      marginHorizontal: Platform.OS === 'ios' ? spacing.xs : spacing.xs / 2,
    },
    dayButtonText: {
      fontSize: typography.fontSize.body, fontWeight: typography.fontWeight.medium,
    },
  });
};

export default LoopEditMenu; 