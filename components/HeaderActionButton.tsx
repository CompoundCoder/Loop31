import React from 'react';
import { Pressable, StyleSheet, ViewStyle, AccessibilityRole } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import * as Haptics from 'expo-haptics';

export type HeaderActionButtonProps = {
  iconName: string;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  iconName,
  onPress,
  accessibilityLabel,
  style,
}) => {
  const { colors, spacing } = useThemeStyles();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.6 : 1, padding: spacing.xs },
        style,
      ]}
      hitSlop={8}
    >
      <Ionicons name={iconName as any} size={24} color={colors.text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
});

export default HeaderActionButton; 