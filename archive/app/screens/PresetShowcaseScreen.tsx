import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { type Theme } from '@/theme/theme';
import * as typographyPresets from '@/presets/typography';
import * as animationPresets from '@/presets/animations';
import { getModalsPresets } from '@/presets/modals';
import { getFormsPresets } from '@/presets/forms';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { appIcons } from '@/presets/icons';

const iconPackComponents = {
  MaterialCommunityIcons,
  Ionicons,
};

// --- Section Rendering Functions ---

const renderTypographySamples = (theme: Theme) => {
  const styles = createStyles(theme);
  const textStyles = Object.entries(typographyPresets);
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Typography</Text>
      {textStyles.map(([name, style]) => (
        <View key={name} style={styles.showcaseItem}>
          <Text style={[styles.presetLabel, { color: theme.colors.text }]}>{name}</Text>
          <Text style={[style, { color: theme.colors.text }]}>Aa Bb Cc Dd</Text>
        </View>
      ))}
    </View>
  );
};

const renderColorSwatches = (theme: Theme) => {
  const styles = createStyles(theme);
  const colorEntries = Object.entries(theme.colors);
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Colors</Text>
      <View style={styles.grid}>
        {colorEntries.map(([name, color]) => (
          <View key={name} style={styles.gridItem}>
            <View style={[styles.colorSwatch, { backgroundColor: color as string }]} />
            <Text style={[styles.presetLabel, { color: theme.colors.text }]}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const renderElevationExamples = (theme: Theme) => {
  const styles = createStyles(theme);
  const elevationEntries = Object.entries(theme.elevation);
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Elevation (Shadows)</Text>
      <View style={styles.grid}>
        {elevationEntries.map(([name, shadowStyle]) => (
          <View key={name} style={styles.gridItem}>
            <View style={[styles.elevationBox, { backgroundColor: theme.colors.card }, shadowStyle]} />
            <Text style={[styles.presetLabel, { color: theme.colors.text }]}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const renderSpacingGrid = (theme: Theme) => {
  const styles = createStyles(theme);
  const spacingEntries = Object.entries(theme.spacing);
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Spacing</Text>
      {spacingEntries.map(([name, size]) => (
        <View key={name} style={styles.spacingItem}>
          <Text style={[styles.presetLabel, { color: theme.colors.text, flex: 1 }]}>{name} ({size}px)</Text>
          <View style={{ width: size, height: size, backgroundColor: theme.colors.accent }} />
        </View>
      ))}
    </View>
  );
};

const renderButtons = (theme: Theme) => {
    const styles = createStyles(theme);
    const buttonPrimary = {
        backgroundColor: theme.colors.accent,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    } as ViewStyle;
    const buttonSecondary = { ...buttonPrimary, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border } as ViewStyle;
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Buttons (Examples)</Text>
      <TouchableOpacity style={[buttonPrimary, {marginBottom: theme.spacing.md}]}>
          <Text style={{color: '#FFF', fontWeight: 'bold' }}>Primary Button</Text>
      </TouchableOpacity>
      <TouchableOpacity style={buttonSecondary}>
          <Text style={{color: theme.colors.text, fontWeight: 'bold' }}>Secondary Button</Text>
      </TouchableOpacity>
    </View>
  );
};

const AnimatedBox: React.FC<{ config: any; type: 'spring' | 'timing'; label: string, theme: Theme }> = ({ config, type, label, theme }) => {
  const styles = createStyles(theme);
  const progress = useSharedValue(0.5);
  useEffect(() => {
    const animation = type === 'spring' ? withSpring : withTiming;
    progress.value = withRepeat( withSequence( animation(1, config), animation(0.5, config) ), -1, true );
  }, [config, progress, type]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: progress.value }], opacity: progress.value }));
  return (
    <View style={[styles.showcaseItem, { alignItems: 'center'}]}>
      <Text style={[styles.presetLabel, { color: theme.colors.text }]}>{label}</Text>
      <Animated.View style={[styles.animatedBox, { backgroundColor: theme.colors.accent }, animatedStyle]} />
    </View>
  );
};

const renderAnimationPresets = (theme: Theme) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Animation Presets</Text>
      <AnimatedBox config={animationPresets.dragActivation} type="spring" label="dragActivation" theme={theme} />
      <AnimatedBox config={animationPresets.dragRelease} type="spring" label="dragRelease" theme={theme} />
      <AnimatedBox config={animationPresets.slideUpSpring} type="spring" label="slideUpSpring" theme={theme} />
      <AnimatedBox config={animationPresets.slideUpTiming} type="timing" label="slideUpTiming" theme={theme} />
    </View>
  );
};

const renderModalPresets = (theme: Theme) => {
  const styles = createStyles(theme);
  const modalPresets = getModalsPresets(theme);
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Modal Presets</Text>
      <View style={styles.showcaseItem}>
        <Text style={[styles.presetLabel, { color: theme.colors.text }]}>modalContainer, modalHeader</Text>
        <View style={styles.modalShowcaseContainer}>
          <View style={modalPresets.modalContainer}>
            <View style={modalPresets.modalHeader}>
                <Text style={{color: theme.colors.text}}>Modal Header</Text>
            </View>
            <Text style={{color: theme.colors.text}}>This is the modal content area.</Text>
          </View>
        </View>
      </View>
      <View style={styles.showcaseItem}>
        <Text style={[styles.presetLabel, { color: theme.colors.text }]}>slideUpHandle</Text>
        <View style={modalPresets.slideUpHandle} />
      </View>
    </View>
  );
};

const renderFormPresets = (theme: Theme) => {
  const styles = createStyles(theme);
  const formPresets = getFormsPresets(theme);
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Form Presets</Text>
      <View style={formPresets.formSection}>
        <Text style={formPresets.label}>formSection & label</Text>
        <TextInput
          style={formPresets.textInput}
          placeholder="textInput preset"
          placeholderTextColor={theme.colors.border}
        />
        <Text style={formPresets.errorText}>errorText preset</Text>
      </View>
    </View>
  );
};

const renderIconShowcase = (theme: Theme) => {
  const styles = createStyles(theme);
  const iconGroups = Object.entries(appIcons);

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>App Icon System</Text>
      {iconGroups.map(([groupName, icons]) => (
        <View key={groupName} style={styles.groupContainer}>
          <Text style={styles.subSectionTitle}>{groupName.charAt(0).toUpperCase() + groupName.slice(1)}</Text>
          <View style={styles.grid}>
            {Object.entries(icons).map(([key, iconDef]) => {
              const IconComponent = iconPackComponents[iconDef.library];
              return (
                <View key={key} style={styles.gridItem}>
                  <IconComponent name={iconDef.name as any} size={32} color={theme.colors.text} />
                  <Text style={[styles.presetLabel, { color: theme.colors.text, textAlign: 'center' }]}>{key}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

// --- Main Screen Component ---

export default function PresetShowcaseScreen() {
  const theme = useThemeStyles() as Theme;
  const styles = createStyles(theme);

  return (
    <ScrollView
      style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {renderTypographySamples(theme)}
      {renderColorSwatches(theme)}
      {renderElevationExamples(theme)}
      {renderSpacingGrid(theme)}
      {renderButtons(theme)}
      {renderAnimationPresets(theme)}
      {renderModalPresets(theme)}
      {renderFormPresets(theme)}
      {renderIconShowcase(theme)}
    </ScrollView>
  );
}


// --- Stylesheet ---

const createStyles = (theme: Theme) => {
  const { colors, spacing, typography, borderRadius } = theme;
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
    },
    sectionContainer: {
      marginBottom: spacing.xl,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
    },
    sectionTitle: {
      ...typographyPresets.sectionTitle,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    showcaseItem: {
      marginBottom: spacing.lg,
      alignItems: 'flex-start',
    },
    presetLabel: {
      ...typographyPresets.metadataTextSmall,
      color: colors.text,
      marginBottom: spacing.sm,
      fontFamily: 'monospace',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    gridItem: {
      alignItems: 'center',
      minWidth: 80,
      gap: spacing.sm,
    },
    colorSwatch: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    elevationBox: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
    },
    spacingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    animatedBox: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.sm,
    },
    modalShowcaseContainer: {
      height: 200,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: theme.colors.backgroundDefault
    },
    groupContainer: {
      marginBottom: spacing.lg,
    },
    subSectionTitle: {
      ...typographyPresets.sectionSubtitle,
      color: colors.text,
      marginBottom: spacing.md,
      textTransform: 'capitalize',
    },
  });
}; 