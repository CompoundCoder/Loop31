import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';

export interface CreateLoopMenuProps {
  name: string;
  onNameChange: (name: string) => void;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  onFrequencyChange: (freq: 'daily' | 'weekly' | 'biweekly' | 'monthly') => void;
  color: string;
  onColorChange: (color: string) => void;
  onSave?: () => void;
}

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' as const },
  { label: 'Weekly', value: 'weekly' as const },
  { label: 'Bi-Weekly', value: 'biweekly' as const },
  { label: 'Monthly', value: 'monthly' as const },
];

export const PREDEFINED_LOOP_COLORS = [
  '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#7F53AC', '#F778A1',
  '#50C878', '#FF9F1C', '#54A0FF', '#A569BD', '#4ECDC4', '#F9A03F',
  '#FF7F50', '#6A5ACD', '#20B2AA', '#FFC0CB', '#87CEEB', '#DA70D6',
];

const CreateLoopMenu: React.FC<CreateLoopMenuProps> = ({
  name,
  onNameChange,
  frequency,
  onFrequencyChange,
  color,
  onColorChange,
  onSave,
}) => {
  const themeStyles = useThemeStyles();
  const styles = React.useMemo(() => createStyles(themeStyles), [themeStyles]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Loop Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onNameChange}
          placeholder="e.g., Morning Affirmations"
          placeholderTextColor={themeStyles.colors.text + '99'}
        />

        <Text style={styles.sectionTitle}>Frequency</Text>
        <View style={styles.frequencyContainer}>
          {FREQUENCY_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.frequencyButton,
                frequency === option.value && styles.frequencyButtonSelected,
                index === FREQUENCY_OPTIONS.length - 1 && styles.frequencyButtonLast,
              ]}
              onPress={() => onFrequencyChange(option.value)}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === option.value && styles.frequencyButtonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorGrid}>
          {PREDEFINED_LOOP_COLORS.map((loopColor) => (
            <TouchableOpacity
              key={loopColor}
              style={[
                styles.colorSwatch,
                { backgroundColor: loopColor },
                color === loopColor && styles.colorSwatchSelected,
              ]}
              onPress={() => onColorChange(loopColor)}
            >
              {color === loopColor && (
                <View style={styles.colorSwatchCheckmarkContainer}>
                  <View style={styles.colorSwatchCheckmark} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={styles.previewCard}>
          <View
            style={[
              styles.previewColorChip,
              { backgroundColor: color || themeStyles.colors.border },
            ]}
          />
          <View style={styles.previewTextContainer}>
            <Text style={styles.previewNameText} numberOfLines={1}>
              {name || 'Your Loop Name'}
            </Text>
            <Text style={styles.previewFrequencyText}>
              {FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label || 'Select frequency'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: ThemeStyles) => {
  const { colors, spacing, borderRadius, typography, elevation } = theme;

  return StyleSheet.create({
    scrollViewContent: {
      paddingBottom: spacing.xxl,
    },
    container: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    sectionTitle: {
      fontSize: typography.fontSize.subtitle,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    input: {
      backgroundColor: colors.backgroundDefault,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm + 2,
      fontSize: typography.fontSize.body,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    frequencyContainer: {
      flexDirection: 'row',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    frequencyButton: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    frequencyButtonLast: {
      borderRightWidth: 0,
    },
    frequencyButtonSelected: {
      backgroundColor: colors.accent,
      borderRightColor: colors.accent,
    },
    frequencyButtonText: {
      fontSize: typography.fontSize.body,
      color: colors.text,
      fontWeight: typography.fontWeight.regular,
    },
    frequencyButtonTextSelected: {
      color: colors.primary === '#000000' ? '#FFFFFF' : '#000000',
      fontWeight: typography.fontWeight.medium,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      marginHorizontal: -spacing.xs,
    },
    colorSwatch: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      marginHorizontal: spacing.xs,
      marginBottom: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorSwatchSelected: {
      borderColor: colors.primary,
      transform: [{ scale: 1.05 }],
      ...elevation.xs,
    },
    colorSwatchCheckmarkContainer: {
      width: 20,
      height: 20,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorSwatchCheckmark: {
      width: 10,
      height: 10,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
    },
    previewCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...elevation.sm,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    previewColorChip: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      marginRight: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewTextContainer: {
      flex: 1,
    },
    previewNameText: {
      fontSize: typography.fontSize.subtitle,
      fontWeight: typography.fontWeight.medium,
      color: colors.text,
    },
    previewFrequencyText: {
      fontSize: typography.fontSize.caption,
      color: colors.text,
      opacity: 0.7,
      marginTop: spacing.xs,
    },
  });
};

export default CreateLoopMenu;