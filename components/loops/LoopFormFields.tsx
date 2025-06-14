import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import { useLoopSchedule } from '@/hooks/useLoopSchedule';
import { type Theme as AppTheme } from '@/theme/theme';
import { type Loop } from '@/context/LoopsContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, Easing, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import ColorPicker from '@/components/common/ColorPicker';
import DropdownSelector from '@/components/common/DropdownSelector';
import { POST_FREQUENCIES } from '@/constants/loopFrequencies';

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

// --- Updated Props Interface for LoopFormFields ---
export interface LoopFormData {
  title: string;
  color: string;
  schedule: string;
  customDays: string[];
}

interface LoopFormFieldsProps {
  loop?: Loop | null;
  isCreateMode?: boolean;
  onDataChange: (data: LoopFormData) => void;
  typography: AppTheme['typography'];
}

const createStyles = (themeStyles: ThemeStyles, typography: AppTheme['typography']) => {
  const { colors, spacing, borderRadius } = themeStyles;
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    sectionContainer: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize.subtitle,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      marginBottom: spacing.sm,
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
      width: 36,
      height: 36,
      borderRadius: 18,
      margin: spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    scheduleOptionsContainer: {},
    scheduleOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.xs,
    },
    scheduleOptionTextContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    scheduleOptionText: {
      fontSize: typography.fontSize.body,
      color: colors.text,
    },
    scheduleOptionDetailText: {
      fontSize: typography.fontSize.caption,
      color: colors.text + '99',
    },
    scheduleOptionTextSelected: {
      color: colors.accent,
      fontWeight: typography.fontWeight.medium,
    },
    scheduleOptionDetailTextSelected: {
      color: colors.accent,
    },
    scheduleSelectedIcon: {},
    customDayPickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      marginTop: spacing.xs,
    },
    dayButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: Platform.OS === 'ios' ? spacing.xs : spacing.xs / 2,
    },
    dayButtonText: {
      fontSize: typography.fontSize.body,
      fontWeight: typography.fontWeight.medium,
    },
    fieldContainer: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.fontSize.body,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      marginBottom: spacing.xs,
    },
  });
};

const LoopFormFields: React.FC<LoopFormFieldsProps> = ({ loop, isCreateMode = false, onDataChange, typography }) => {
  const themeStyles = useThemeStyles();
  const styles = createStyles(themeStyles, typography);
  const { SCHEDULE_OPTIONS, parseSchedule } = useLoopSchedule();

  const [formData, setFormData] = useState<LoopFormData>(() => {
    if (isCreateMode) {
      return {
        title: '',
        color: PREDEFINED_COLORS[0],
        schedule: SCHEDULE_OPTIONS[0].value,
        customDays: [],
      };
    }
    
    if (loop) {
      const { frequency, customDays } = parseSchedule(loop.schedule || '');
      return {
        title: loop.title || '',
        color: loop.color || PREDEFINED_COLORS[0],
        schedule: frequency,
        customDays,
      };
    }
    
    return {
      title: '',
      color: PREDEFINED_COLORS[0],
      schedule: SCHEDULE_OPTIONS[0].value,
      customDays: [],
    };
  });
  
  const [isScheduleSectionInitialized, setIsScheduleSectionInitialized] = useState(false);

  // Effect to update parent with data changes
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  // Effect to re-initialize form when `loop` prop changes
  useEffect(() => {
    if (isCreateMode) {
      setFormData({
        title: '',
        color: PREDEFINED_COLORS[0],
        schedule: SCHEDULE_OPTIONS[0].value,
        customDays: [],
      });
    } else if (loop) {
      const { frequency, customDays } = parseSchedule(loop.schedule || '');
      setFormData({
        title: loop.title || '',
        color: loop.color || PREDEFINED_COLORS[0],
        schedule: frequency,
        customDays,
      });
    }
    setTimeout(() => setIsScheduleSectionInitialized(true), 50);
  }, [loop, isCreateMode, SCHEDULE_OPTIONS, parseSchedule]);

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
      customDays: optionValue !== 'custom' ? [] : prev.customDays,
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Loop Name</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={handleTitleChange}
          placeholder="Enter loop name"
          placeholderTextColor={themeStyles.colors.text + '80'}
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Color Tag</Text>
        <View style={styles.colorSwatchesContainer}>
          {PREDEFINED_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => handleColorPress(color)}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                formData.color === color && { borderColor: themeStyles.colors.accent },
              ]}
            >
              {formData.color === color && (
                <Ionicons name="checkmark" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Post Frequency</Text>
        <View style={styles.scheduleOptionsContainer}>
          {SCHEDULE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.scheduleOption,
                formData.schedule === option.value && { backgroundColor: themeStyles.colors.background },
              ]}
              onPress={() => handleScheduleOptionPress(option.value)}
            >
              <View style={styles.scheduleOptionTextContainer}>
                <Text
                  style={[
                    styles.scheduleOptionText,
                    formData.schedule === option.value && styles.scheduleOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {option.details && (
                  <Text
                    style={[
                      styles.scheduleOptionDetailText,
                      formData.schedule === option.value && styles.scheduleOptionDetailTextSelected,
                    ]}
                  >
                    {option.details}
                  </Text>
                )}
              </View>
              {formData.schedule === option.value && (
                <Ionicons
                  name="checkmark"
                  size={22}
                  color={themeStyles.colors.accent}
                  style={styles.scheduleSelectedIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Frequency</Text>
        <DropdownSelector
          options={POST_FREQUENCIES}
          selectedValue={formData.schedule}
          onValueChange={handleScheduleOptionPress}
          placeholder="Select a frequency"
        />
      </View>
    </ScrollView>
  );
};

export default LoopFormFields; 