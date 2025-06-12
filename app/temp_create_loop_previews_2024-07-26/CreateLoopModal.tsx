import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useLoopSchedule } from '@/hooks/useLoopSchedule';
import { type Theme as AppTheme } from '@/theme/theme';
import { type Loop } from '@/context/LoopsContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const LOOP_COLORS = ['#FF6B6B', '#4ECDC4', '#54A0FF', '#F9A03F', '#A5D6A7', '#FFD166', '#D4A5FF'];

interface CreateLoopModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (loop: Loop) => void;
  typography: AppTheme['typography'];
}

const CreateLoopModal: React.FC<CreateLoopModalProps> = ({ isVisible, onClose, onSave, typography }) => {
  const themeStyles = useThemeStyles();
  const { colors, spacing, borderRadius } = themeStyles;
  const { SCHEDULE_OPTIONS, WEEKDAYS, formatCustomDays } = useLoopSchedule();

  const [loopName, setLoopName] = useState('');
  const [selectedFrequencyIndex, setSelectedFrequencyIndex] = useState(0);
  const [customDays, setCustomDays] = useState(new Set<string>());
  const [selectedColor, setSelectedColor] = useState(LOOP_COLORS[0]);

  const resetForm = () => {
    setLoopName('');
    setSelectedFrequencyIndex(0);
    setCustomDays(new Set());
    setSelectedColor(LOOP_COLORS[0]);
  };

  const isCustomFrequency = SCHEDULE_OPTIONS[selectedFrequencyIndex]?.value === 'custom';
  const canCreate = loopName.trim() !== '' && (!isCustomFrequency || customDays.size > 0);

  const handleCreateLoop = () => {
    if (!canCreate) return;
    
    const selectedFrequency = SCHEDULE_OPTIONS[selectedFrequencyIndex];
    let schedule: string = selectedFrequency.value;
    if (selectedFrequency.value === 'custom') {
      schedule = formatCustomDays(Array.from(customDays));
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
    onSave(newLoopPayload as Loop);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const toggleCustomDay = (dayValue: string) => {
    setCustomDays(prevDays => {
      const newDays = new Set(prevDays);
      newDays.has(dayValue) ? newDays.delete(dayValue) : newDays.add(dayValue);
      return newDays;
    });
  };

  const textFadedColor = colors.tabInactive || '#A0A0A0';
  const backgroundAltColor = colors.background || colors.border;
  const accentContrastColor = '#FFFFFF';
  const primaryMutedColor = colors.border || '#D3D3D3';
  const primaryContrastColor = '#FFFFFF';

  // Updated frequency options for the slider
  const FREQUENCY_STOPS = [
    { label: 'Automatically (recommended)', value: 'auto', shortLabel: 'Auto' },
    { label: 'Once per Week', value: 'weekly_1x', shortLabel: '1x' },
    { label: 'A Few Times a Week', value: 'weekly_3x', shortLabel: '3x' },
    { label: 'Every Day', value: 'weekly_5x', shortLabel: '5x' },
    { label: 'Custom Schedule', value: 'custom', shortLabel: 'Days' },
  ];

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Create New Loop</Text>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Loop Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={loopName}
            onChangeText={setLoopName}
            placeholder="Enter loop name"
            placeholderTextColor={textFadedColor}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Color Tag</Text>
          <View style={styles.colorSwatchesContainer}>
            {LOOP_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  selectedColor === color && { borderColor: colors.accent },
                ]}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Post Frequency</Text>
          <View style={styles.frequencyOptions}>
            {SCHEDULE_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  selectedFrequencyIndex === index && { backgroundColor: backgroundAltColor },
                ]}
                onPress={() => setSelectedFrequencyIndex(index)}
              >
                <Text
                  style={[
                    styles.frequencyLabel,
                    { color: selectedFrequencyIndex === index ? colors.accent : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
                {option.details && (
                  <Text
                    style={[
                      styles.frequencyDetails,
                      { color: selectedFrequencyIndex === index ? colors.accent : textFadedColor },
                    ]}
                  >
                    {option.details}
                  </Text>
                )}
                {selectedFrequencyIndex === index && (
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={colors.accent}
                    style={styles.checkmark}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isCustomFrequency && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Days</Text>
            <View style={styles.daysContainer}>
              {WEEKDAYS.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: customDays.has(day.value)
                        ? colors.accent
                        : backgroundAltColor,
                    },
                  ]}
                  onPress={() => toggleCustomDay(day.value)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      {
                        color: customDays.has(day.value)
                          ? accentContrastColor
                          : colors.text,
                      },
                    ]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton,
            { backgroundColor: backgroundAltColor },
          ]}
          onPress={handleCancel}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.createButton,
            {
              backgroundColor: canCreate ? colors.accent : primaryMutedColor,
            },
          ]}
          onPress={handleCreateLoop}
          disabled={!canCreate}
        >
          <Text
            style={[
              styles.buttonText,
              { color: canCreate ? accentContrastColor : primaryContrastColor },
            ]}
          >
            Create Loop
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  colorSwatchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequencyOptions: {
    marginTop: 8,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  frequencyLabel: {
    flex: 1,
    fontSize: 16,
  },
  frequencyDetails: {
    fontSize: 14,
    marginLeft: 8,
  },
  checkmark: {
    marginLeft: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
  },
  createButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateLoopModal; 