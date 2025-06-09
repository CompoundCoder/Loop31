import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView, StyleProp, ViewStyle } from 'react-native';
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

// --- Updated Props Interface for LoopFormFields ---
export interface LoopFormData { // Exporting this type for parent components
  title: string;
  color: string;
  schedule: string;
  customDays: string[];
}
interface LoopFormFieldsProps {
  loop: Loop | null; // For initial data; null for create mode
  onDataChange: (data: LoopFormData) => void; // Callback for data changes
  typography: AppTheme['typography']; // Passed from parent
  // themeStyles will be fetched internally via useThemeStyles
  // No isVisible, onClose, onSave directly related to modal actions
}

// --- AnimatedDayButton Internal Component (stays the same) ---
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
  const styles = createStyles(themeStyles, typography); // createStyles will be defined at the end
  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

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

// --- AnimatedPressableOption component (stays the same) ---
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
    scale.value = withSpring(1.0, { dampingRatio: 0.7, stiffness: 150 });
    onPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleActualPress}
        style={style}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};


// --- Renamed Component: LoopFormFields ---
const LoopFormFields: React.FC<LoopFormFieldsProps> = ({ loop, onDataChange, typography }) => {
  const themeStyles = useThemeStyles(); // Fetch theme styles internally
  const styles = createStyles(themeStyles, typography); // Use passed typography
  const insets = useSafeAreaInsets(); // Keep for padding if needed at the bottom of scrollview

  // Determine if the form is for creating a new loop
  const isCreateMode = loop === null;

  // Unified state for form data
  const [formData, setFormData] = useState<LoopFormData>(() => {
    if (isCreateMode) {
      return {
        title: '',
        color: PREDEFINED_COLORS[0],
        schedule: SCHEDULE_OPTIONS[0].value,
        customDays: [],
      };
    } else {
      // Initialize from existing loop data
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
        } else if (!SCHEDULE_OPTIONS.find(opt => opt.value.toLowerCase() === scheduleLower)) {
          initialScheduleValue = 'Auto';
        }
      } else {
        initialScheduleValue = 'Auto';
      }
      return {
        title: loop.title || '',
        color: loop.color || PREDEFINED_COLORS[0],
        schedule: initialScheduleValue,
        customDays: initialCustomDays,
      };
    }
  });
  
  const [isScheduleSectionInitialized, setIsScheduleSectionInitialized] = useState(false);

  // Effect to update parent with data changes
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  // Effect to re-initialize form when `loop` prop changes (e.g. switching from create to edit)
  useEffect(() => {
    if (isCreateMode) {
      setFormData({
        title: '',
        color: PREDEFINED_COLORS[0],
        schedule: SCHEDULE_OPTIONS[0].value,
        customDays: [],
      });
    } else if (loop) { // Ensure loop is not null for edit mode
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
        } else if (!SCHEDULE_OPTIONS.find(opt => opt.value.toLowerCase() === scheduleLower)) { initialScheduleValue = 'Auto';}
      } else {initialScheduleValue = 'Auto'; }

      setFormData({
        title: loop.title || '',
        color: loop.color || PREDEFINED_COLORS[0],
        schedule: initialScheduleValue,
        customDays: initialCustomDays,
      });
    }
    // Allow custom schedule animation to run after initial data is set
    // Small delay to ensure state is set before animation logic runs
    setTimeout(() => setIsScheduleSectionInitialized(true), 50); 
  }, [loop, isCreateMode]);


  const handleTitleChange = (text: string) => {
    setFormData(prev => ({ ...prev, title: text }));
  };

  const handleColorPress = (color: string) => {
    setFormData(prev => ({ ...prev, color: color }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleScheduleOptionPress = (optionValue: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: optionValue,
      customDays: optionValue !== 'Custom' ? [] : prev.customDays, // Clear custom days if not 'Custom'
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleCustomDayModified = (day: string) => {
    setFormData(prev => {
      const newDays = prev.customDays.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...prev.customDays, day];
      return { ...prev, customDays: newDays };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Animation for Custom Schedule Section
  const customScheduleSectionHeight = useSharedValue(0);
  const customScheduleSectionOpacity = useSharedValue(0);

  useEffect(() => {
    if (formData.schedule === 'Custom' && isScheduleSectionInitialized) {
      customScheduleSectionHeight.value = withTiming(100, { duration: 250, easing: Easing.out(Easing.ease) });
      customScheduleSectionOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
    } else {
      customScheduleSectionHeight.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) });
      customScheduleSectionOpacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) });
    }
  }, [formData.schedule, isScheduleSectionInitialized, customScheduleSectionHeight, customScheduleSectionOpacity]);

  const animatedCustomScheduleStyle = useAnimatedStyle(() => {
    return {
      height: customScheduleSectionHeight.value,
      opacity: customScheduleSectionOpacity.value,
      overflow: 'hidden',
    };
  });

  const titleInputRef = useRef<TextInput>(null);
  // Removed isEditingTitle, originalTitle, handleSaveTitle, handleTitleFocus as parent will handle save lifecycle

  // The FormContent is now the main return of this component
  return (
    <ScrollView // Changed from ModalScrollView, assuming general usage
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: themeStyles.spacing.lg, // Directly use the theme value for horizontal padding
        paddingBottom: insets.bottom + 20, // Ensure scroll space, adjust as needed
      }}
      keyboardShouldPersistTaps="handled" // Good for forms
    >
      {/* Title Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Loop Title</Text>
        <View style={styles.inputContainer}>
          <TextInput
            ref={titleInputRef}
            style={styles.textInput}
            placeholder="e.g., Morning Motivation, Weekly Listings"
            placeholderTextColor={themeStyles.colors.border}
            value={formData.title}
            onChangeText={handleTitleChange}
            returnKeyType="done"
            maxLength={60}
            selectionColor={themeStyles.colors.accent}
            // onEndEditing and onFocus removed; parent controls save lifecycle
          />
        </View>
      </View>

      {/* Color Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Color Tag</Text>
        <View style={styles.colorSelectorContainer}>
          {PREDEFINED_COLORS.map((color) => (
            <AnimatedPressableOption
              key={color}
              onPress={() => handleColorPress(color)}
            >
              <View style={styles.colorOptionWrapper}>
                <View style={[styles.colorOption, { backgroundColor: color }]}>
                  {formData.color === color && (
                    <Ionicons name="checkmark-sharp" size={18} color="#FFF" />
                  )}
                </View>
              </View>
            </AnimatedPressableOption>
          ))}
        </View>
      </View>

      {/* Schedule Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Post Frequency</Text>
        {SCHEDULE_OPTIONS.map((option, index) => (
          <AnimatedPressableOption
            key={option.value}
            onPress={() => handleScheduleOptionPress(option.value)}
          >
            <View style={[
              styles.scheduleOption,
              index === SCHEDULE_OPTIONS.length - 1 && styles.scheduleOptionLast,
            ]}>
              <View style={styles.scheduleRadioOuter}>
                {formData.schedule === option.value && <View style={styles.scheduleRadioInner} />}
              </View>
              <View style={styles.scheduleLabelContainer}>
                <Text style={styles.scheduleLabel}>{option.label}</Text>
                {option.details && <Text style={styles.scheduleDetails}>{option.details}</Text>}
              </View>
              {formData.schedule === option.value && option.value === 'Custom' && (
                <Ionicons name="chevron-forward" size={18} color={themeStyles.colors.text} style={styles.chevronIcon} />
              )}
            </View>
          </AnimatedPressableOption>
        ))}
      </View>

      {/* Custom Schedule Day Picker - Animated */}
      {isScheduleSectionInitialized && ( // Render only when ready
        <Animated.View style={[styles.customScheduleContainer, animatedCustomScheduleStyle]}>
          <Text style={styles.customScheduleTitle}>Select days to post:</Text>
          <View style={styles.daysContainer}>
            {DAYS_FULL.map((day, index) => (
              <AnimatedDayButton
                key={day}
                dayCharacter={DAYS_DISPLAY[index]}
                fullDayName={day}
                isSelected={formData.customDays.includes(day)}
                onPress={toggleCustomDayModified} // Directly use the handler
                themeStyles={themeStyles} // Pass themeStyles down
                typography={typography} // Pass typography down
              />
            ))}
          </View>
        </Animated.View>
      )}
      {/* Removed sticky save button and modal wrapper */}
      {/* Spacer to push content up if keyboard is an issue or for final save button */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// --- Styles Definition ---
// createStyles function remains largely the same but without modal-specific styles
// and with typography fixes.
const createStyles = (theme: ThemeStyles, typography: AppTheme['typography']) => StyleSheet.create({
  // Removed: modal, modalContent, headerContainer, headerTitle, dismissButton
  // Removed: saveButton, saveButtonGradient, saveButtonText (these will be handled by parent components)
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.subtitle, // Corrected
    fontWeight: typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.body, // Corrected
    color: theme.colors.text,
    paddingVertical: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm + 2,
    height: Platform.OS === 'ios' ? undefined : 50,
  },
  colorSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOptionWrapper: {
    padding: 4,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  scheduleOptionLast: {
    borderBottomWidth: 0,
  },
  scheduleRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  scheduleRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  scheduleLabelContainer: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: typography.fontSize.body, // Corrected
    color: theme.colors.text,
    fontWeight: typography.fontWeight.regular,
  },
  scheduleDetails: {
    fontSize: typography.fontSize.caption, // Corrected
    color: theme.colors.tabInactive,
    marginTop: 2,
  },
  chevronIcon: {
    marginLeft: theme.spacing.sm,
  },
  customScheduleContainer: {
    paddingHorizontal: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  customScheduleTitle: {
    fontSize: typography.fontSize.body, // Corrected
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs / 2,
  },
  dayButtonText: {
    fontSize: typography.fontSize.body, // Corrected
    fontWeight: typography.fontWeight.medium,
    // color is animated
  },
  // Styles for saveButton, saveButtonGradient, saveButtonText are removed
  // as they are modal-specific and will be handled by parent components.
});

export default LoopFormFields; 