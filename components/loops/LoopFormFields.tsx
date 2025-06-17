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
import { getFormsPresets } from '@/presets/forms';

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

const LoopFormFields: React.FC<LoopFormFieldsProps> = ({ loop, isCreateMode = false, onDataChange, typography }) => {
  const themeStyles = useThemeStyles();
  const formPresets = getFormsPresets(themeStyles);
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

  // Destructure styles for easier use, keeping local styles for now
  const styles = createStyles(themeStyles, typography);

  return (
    <ScrollView style={styles.container}>
      {/* SECTION: Loop Name */}
      <View style={formPresets.formSection}>
        <Text style={formPresets.label}>Loop Name</Text>
        <TextInput
          style={formPresets.textInput}
          value={formData.title}
          onChangeText={handleTitleChange}
          placeholder="Enter loop name"
          placeholderTextColor={themeStyles.colors.text + '80'}
        />
      </View>

      {/* SECTION: Loop Color */}
      <View style={formPresets.formSection}>
        <Text style={formPresets.label}>Loop Color</Text>
        <ColorPicker selectedColor={formData.color} onColorChange={handleColorPress} />
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

// We keep the local styles for now, but the idea is to slowly remove
// sectionContainer, label, and input as they are replaced by presets.
const createStyles = (themeStyles: ThemeStyles, typography: AppTheme['typography']) => {
  // ...
  return StyleSheet.create({
    // ...
  });
};

export default LoopFormFields; 