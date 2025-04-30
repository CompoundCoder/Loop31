import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import lightTheme from '@/theme/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, style }) => {
  const { colors, spacing } = useThemeStyles();
  const { typography } = lightTheme;
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.fontSize.title,
          fontWeight: typography.fontWeight.bold,
          marginBottom: subtitle ? 2 : 0,
          marginLeft: spacing.md,
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            color: colors.text + 'B3',
            fontSize: typography.fontSize.body,
            fontWeight: typography.fontWeight.regular,
            marginLeft: spacing.md,
            marginBottom: 2,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default SectionHeader; 