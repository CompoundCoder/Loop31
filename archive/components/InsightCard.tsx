import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import lightTheme from '@/theme/theme';

interface InsightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendColor?: string;
  isLarge?: boolean;
  style?: ViewStyle;
}

const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendColor,
  isLarge = false,
  style,
}) => {
  const { colors, spacing } = useThemeStyles();
  const { typography, colors: themeColors } = lightTheme;
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: isLarge ? spacing.lg : spacing.md,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.card,
        },
        style,
      ]}
    >
      {/* Icon */}
      <View style={{ marginRight: spacing.lg }}>{icon}</View>
      {/* Label and Value */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.text + 'B3', // fallback for textSecondary
            fontSize: isLarge ? typography.fontSize.subtitle : typography.fontSize.body,
            fontWeight: typography.fontWeight.medium,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: isLarge ? typography.fontSize.heading : typography.fontSize.title,
            fontWeight: typography.fontWeight.bold,
          }}
        >
          {value}
        </Text>
      </View>
      {/* Trend/Percentage */}
      {trend && (
        <Text
          style={{
            color: trendColor || themeColors.success || '#34C759',
            fontSize: isLarge ? typography.fontSize.subtitle : typography.fontSize.body,
            fontWeight: typography.fontWeight.medium,
            marginLeft: spacing.lg,
            textAlign: 'right',
            minWidth: 60,
          }}
        >
          {trend}
        </Text>
      )}
    </View>
  );
};

export default InsightCard; 