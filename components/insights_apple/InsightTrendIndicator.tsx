import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { TrendDirection } from './types';

interface InsightTrendIndicatorProps {
  value?: string;
  direction?: TrendDirection;
}

export const InsightTrendIndicator: React.FC<InsightTrendIndicatorProps> = ({ 
  value,
  direction = 'neutral',
}) => {
  const { colors } = useThemeStyles();

  if (!value) {
    return null; // Don't render if no value is provided
  }

  // Use available theme colors - consider adding semantic colors later
  const trendColor = 
      direction === 'up' ? '#34C759' // Standard Green (Apple)
    : direction === 'down' ? colors.text + '99' // Muted text color for down trend
    : colors.text + '99'; // Muted text color for neutral

  const trendIcon = 
      direction === 'up' ? 'arrow-top-right'
    : direction === 'down' ? 'arrow-bottom-right'
    : null; // No icon for neutral trend

  return (
    <View style={styles.container}>
      {trendIcon && (
        <MaterialCommunityIcons 
          name={trendIcon} 
          size={14} 
          color={trendColor} 
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { color: trendColor }]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 