import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ScrollView as ModalScrollView } from 'react-native';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import { type Theme as AppTheme } from '@/theme/theme'; // IMPORT our app's Theme type
import { type Loop } from '@/context/LoopsContext'; // Assuming Loop type is exported
import { Ionicons } from '@expo/vector-icons'; // For checkmark icon
import Animated, { useAnimatedStyle, withTiming, Easing, runOnJS, useSharedValue, withSpring } from 'react-native-reanimated'; // Import Animated and hooks
import * as Haptics from 'expo-haptics'; // ADD Haptics

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
  loop: Loop | null; // Allow null for initial render if loop might not be ready
  onSave: (updatedData: { id: string; title?: string; color?: string; schedule?: string }) => void;
  typography: AppTheme['typography']; // ADDED typography prop
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
  const styles = createStyles(themeStyles, typography); // Assuming createStyles is accessible or defined globally/passed
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

const LoopEditMenu: React.FC<LoopEditMenuProps> = ({ isVisible, onClose, loop, onSave, typography }) => {
  const themeStyles = useThemeStyles();
  if (!loop || !typography) { return null; }
  const styles = createStyles(themeStyles, typography);

  const [editedTitle, setEditedTitle] = useState(loop.title);
  const [editedColor, setEditedColor] = useState(loop.color || PREDEFINED_COLORS[0]);
  const [editedSchedule, setEditedSchedule] = useState('');
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [dayPickerHeight, setDayPickerHeight] = useState(0);
  
  useEffect(() => {
    if (isVisible && loop) {
      setEditedTitle(loop.title);
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
          else {
            initialScheduleValue = 'Custom';
            initialCustomDays = validDays.map(d => DAYS_FULL.find(fd => fd.toLowerCase() === d.toLowerCase()) || '').filter(Boolean);
          }
        } else if (!SCHEDULE_OPTIONS.find(opt => opt.value.toLowerCase() === scheduleLower)) {
            initialScheduleValue = 'Auto';
        }
      }
      setEditedSchedule(initialScheduleValue);
      setCustomDays(initialCustomDays);
    } else {
        setEditedSchedule('');
        setCustomDays([]);
    }
  }, [loop, isVisible]);

  const handleSaveModified = () => {
    let scheduleToSave = editedSchedule;
    if (editedSchedule === 'Custom') {
        if (customDays.length > 0) {
            const sortedDays = customDays.sort((a, b) => DAYS_FULL.indexOf(a) - DAYS_FULL.indexOf(b));
            scheduleToSave = sortedDays.join(',');
        } else {
            scheduleToSave = 'Weekly'; 
        }
    }
    onSave({ id: loop.id, title: editedTitle, color: editedColor, schedule: scheduleToSave });
  };
  const toggleCustomDayModified = (day: string) => {
    setCustomDays(prevDays => {
      const dayIndex = prevDays.indexOf(day);
      if (dayIndex > -1) {
        return prevDays.filter((d) => d !== day);
      } else {
        return [...prevDays, day];
      }
    });
  };

  const onDayPickerLayoutLocal = (event: any) => {
    const measuredHeight = event.nativeEvent.layout.height;
    if (measuredHeight > 0 && dayPickerHeight !== measuredHeight) { 
         setDayPickerHeight(measuredHeight);
    }
  };

  const animatedDayPickerStyleLocal = useAnimatedStyle(() => {
    const isCustom = editedSchedule === 'Custom';
    return {
      height: withTiming(isCustom ? dayPickerHeight : 0, { duration: 250, easing: Easing.inOut(Easing.ease) }),
      opacity: withTiming(isCustom ? 1 : 0, { duration: 250, easing: Easing.inOut(Easing.ease) }),
      overflow: 'hidden',
    };
  });

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <View style={[styles.menuContainer]}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}><Text style={styles.headerButtonText}>Cancel</Text></TouchableOpacity>
            <Text style={styles.menuTitle}>Edit Loop</Text>
            <TouchableOpacity onPress={handleSaveModified} style={styles.headerButton}><Text style={[styles.headerButtonText, styles.doneButtonText]}>Done</Text></TouchableOpacity>
          </View>

          <ModalScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <View style={[styles.sectionContainer]}>
              <Text style={styles.label}>Loop Name</Text>
              <TextInput style={styles.input} value={editedTitle} onChangeText={setEditedTitle} placeholder="Enter loop name" placeholderTextColor={themeStyles.colors.text + '80'} />
            </View>
            
            <View style={[styles.sectionContainer]}>
              <Text style={styles.label}>Loop Color</Text>
              <View style={styles.colorSwatchesContainer}>
                {PREDEFINED_COLORS.map((color) => (
                  <TouchableOpacity key={color} style={[styles.colorSwatch, { backgroundColor: color }]} onPress={() => setEditedColor(color)}>
                    {editedColor.toLowerCase() === color.toLowerCase() && (<Ionicons name="checkmark-outline" size={20} color={themeStyles.colors.card} />)}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.sectionContainer, { marginBottom: 0}]}>
              <Text style={styles.label}>Posting Schedule</Text>
              <View style={styles.scheduleOptionsContainer}>
                {SCHEDULE_OPTIONS.map((option) => (
                  <TouchableOpacity key={option.value} style={styles.scheduleOption} onPress={() => setEditedSchedule(option.value)}>
                    <View style={styles.scheduleOptionTextContainer}>
                      <Text style={[styles.scheduleOptionText, editedSchedule === option.value && styles.scheduleOptionTextSelected]}>{option.label}</Text>
                      {option.details && (<Text style={[styles.scheduleOptionDetailText, editedSchedule === option.value && styles.scheduleOptionDetailTextSelected]}>{option.details}</Text>)}
                    </View>
                    {editedSchedule === option.value && (<Ionicons name="checkmark" size={22} color={themeStyles.colors.accent} style={styles.scheduleSelectedIcon} />)}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Animated.View style={[animatedDayPickerStyleLocal]}>
              <View 
                style={{
                  position: dayPickerHeight === 0 ? 'absolute' : 'relative', 
                  opacity: dayPickerHeight === 0 ? 0 : 1,
                }}
                onLayout={onDayPickerLayoutLocal} 
              >
                <View style={[{ marginTop: themeStyles.spacing.sm, marginBottom: themeStyles.spacing.md }]}>
                  <Text style={styles.label}>Select Days</Text>
                  <View style={[styles.customDayPickerContainer]}>
                    {DAYS_FULL.map((day, index) => (
                      <AnimatedDayButton
                        key={day}
                        dayCharacter={DAYS_DISPLAY[index]}
                        fullDayName={day}
                        isSelected={customDays.includes(day)}
                        onPress={toggleCustomDayModified}
                        themeStyles={themeStyles}
                        typography={typography}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </Animated.View>
          </ModalScrollView> 
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Define a more specific type for typography if possible, or use `any` as a fallback
// For now, let's assume typography has fontSize and fontWeight, which are objects
interface TypographyStyles {
  fontSize: { [key: string]: number };
  fontWeight: { [key: string]: string };
  // Add other typography properties if used by createStyles
}

const createStyles = (theme: ThemeStyles, typography: AppTheme['typography']) => {
  const { colors, spacing, borderRadius } = theme;
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end', // Aligns menu to bottom
      backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent background
    },
    overlayTouchable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    menuContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md, // Space for header buttons
      paddingBottom: Platform.OS === 'ios' ? spacing.xl + spacing.sm : spacing.lg, // Extra padding for home indicator on iOS
      maxHeight: '80%', // Limit height
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs, // Small horizontal padding for balance
    },
    headerButtonText: {
      fontSize: typography.fontSize.subtitle,
      color: colors.accent,
      fontWeight: typography.fontWeight.medium,
    },
    doneButtonText: {
      // No specific color override needed if accent is desired for Done
    },
    menuTitle: {
      fontSize: typography.fontSize.subtitle,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    sectionContainer: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.fontSize.caption,
      color: colors.text + 'A0', // Slightly less prominent
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      fontWeight: typography.fontWeight.medium,
    },
    input: {
      backgroundColor: colors.background, // Or a slightly different input background from theme
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
      flexWrap: 'wrap', // Allow swatches to wrap
      justifyContent: 'space-between', // Distribute space
      marginTop: spacing.xs,
    },
    colorSwatch: {
      width: 36, // Size of the color swatch
      height: 36,
      borderRadius: 18, // Make it circular
      margin: spacing.xs, // Spacing around swatches
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent', // Default no border
    },
    scheduleOptionsContainer: {
      // Container for all schedule options - can be empty if items have their own margin
    },
    scheduleOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md, // Increased padding for more spacious feel
      paddingHorizontal: spacing.sm, 
      // REMOVED backgroundColor, borderWidth, borderColor from here
      borderRadius: borderRadius.sm, // Keep for touch feedback if any
      marginBottom: spacing.xs, 
    },
    scheduleOptionTextContainer: { // NEW: To group label and details
        flex: 1, // Allow text to take available space before the checkmark
        marginRight: spacing.sm, // Space before checkmark
    },
    scheduleOptionText: {
      fontSize: typography.fontSize.body,
      color: colors.text,
      // flexShrink: 1, // Not needed if textContainer has flex:1
    },
    scheduleOptionDetailText: {
      fontSize: typography.fontSize.caption,
      color: colors.text + '99',
      // marginLeft: spacing.sm, // Not needed if grouped in a column
    },
    scheduleOptionTextSelected: { // This style will apply to both label and details when selected
      color: colors.accent,
      fontWeight: typography.fontWeight.medium, // Keep or make bolder
    },
    scheduleOptionDetailTextSelected: { // Specific for details if different styling needed when selected
        color: colors.accent, // Match accent color
    },
    scheduleSelectedIcon: {
      // marginLeft: spacing.sm, // Let justifycontent handle positioning
    },
    // --- NEW Styles for Custom Day Picker ---
    customDayPickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around', // Distribute days evenly
      alignItems: 'center',
      backgroundColor: colors.background, // Match schedule option background
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.xs, // Space below main schedule options
    },
    dayButton: { // Base style for Animated.View wrapper of the button
      width: 32, 
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: Platform.OS === 'ios' ? spacing.xs : spacing.xs / 2, // Adjust spacing for 7 days
    },
    dayButtonText: { // Base style for Animated.Text
      fontSize: typography.fontSize.body, 
      fontWeight: typography.fontWeight.medium,
    },
  });
};

export default LoopEditMenu; 