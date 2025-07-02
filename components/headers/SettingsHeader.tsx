import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useRouter } from 'expo-router';
import { CircleButton } from '@/components/common/CircleButton';
import { getButtonPresets } from '@/presets/buttons';

interface SettingsHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const HEADER_HEIGHT = 50;

export default function SettingsHeader({ title, onBack, rightAction }: SettingsHeaderProps) {
  const theme = useThemeStyles();
  const { colors, spacing } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = onBack || (() => router.back());
  const buttonPresets = getButtonPresets(theme);

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.card, paddingTop: insets.top, borderBottomColor: colors.border }]}>
      <View style={[styles.header, { height: HEADER_HEIGHT, paddingHorizontal: spacing.md }]}>
        {/* Left Action: Back Button */}
        <CircleButton
          preset={buttonPresets.back}
          onPress={handleBack}
          accessibilityLabel="Go back"
        />

        {/* Centered Title */}
        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>

        {/* Right Action: Optional */}
        <View style={styles.actionButton}>
          {rightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    left: 60,
    right: 60,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 