import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import lightTheme from '@/theme/theme';

interface InsightMetricProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  color?: string;
}

const InsightMetric: React.FC<InsightMetricProps> = ({ label, value, icon, trend, color }) => {
  const { spacing, colors } = useThemeStyles();
  const themeColors = lightTheme.colors;
  const trendColor = trend === 'up' ? themeColors.success : trend === 'down' ? themeColors.error : colors.text;
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
        {icon && <View style={{ marginRight: spacing.xs }}>{icon}</View>}
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: color || colors.text,
          }}
        >
          {value}
        </Text>
        {trend && (
          <Ionicons
            name={trend === 'up' ? 'arrow-up' : 'arrow-down'}
            size={18}
            color={trendColor}
            style={{ marginLeft: spacing.xs }}
          />
        )}
      </View>
      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          opacity: 0.7,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default InsightMetric; 