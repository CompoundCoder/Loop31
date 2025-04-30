import React from 'react';
import { View, Platform, ViewStyle, StyleProp } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { BlurView } from 'expo-blur';

interface InsightsCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const InsightsCard: React.FC<InsightsCardProps> = ({ children, style }) => {
  const { colors, borderRadius, spacing } = useThemeStyles();
  // Platform-specific elevation/shadow
  const cardShadow = Platform.OS === 'ios'
    ? {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }
    : { elevation: 4 };

  // Glassmorphism: semi-transparent background, border, blur
  return (
    <BlurView
      intensity={30}
      tint={colors.card === '#FFFFFF' ? 'light' : 'dark'}
      style={[
        {
          backgroundColor: colors.card + 'CC', // semi-transparent
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border + '55',
          overflow: 'hidden',
          ...cardShadow,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
};

export default InsightsCard; 