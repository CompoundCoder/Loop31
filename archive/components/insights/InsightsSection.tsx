import React from 'react';
import { View, Text, Platform } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import lightTheme from '@/theme/theme';

interface InsightsSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const fallbackFontFamily = Platform.OS === 'ios' ? 'System' : 'sans-serif';

const InsightsSection: React.FC<InsightsSectionProps> = ({ title = 'Quick Insights', subtitle, children }) => {
  const { spacing } = useThemeStyles();
  const typography = lightTheme.typography;
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {title && (
        <Text
          style={{
            fontSize: typography.fontSize.heading,
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing.xs,
            fontFamily: (typography.fontFamily && typography.fontFamily.bold) || fallbackFontFamily,
          }}
        >
          {title}
        </Text>
      )}
      {subtitle && (
        <Text
          style={{
            fontSize: typography.fontSize.subtitle,
            fontWeight: typography.fontWeight.medium,
            marginBottom: spacing.sm,
            fontFamily: (typography.fontFamily && typography.fontFamily.medium) || fallbackFontFamily,
            opacity: 0.7,
          }}
        >
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
};

export default InsightsSection; 