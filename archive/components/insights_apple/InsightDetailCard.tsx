import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStyles, ThemeStyles } from '@/hooks/useThemeStyles';
import { InsightTrendIndicator } from './InsightTrendIndicator';
import type { AppleInsightItem } from './types';

interface InsightDetailCardProps {
  item: AppleInsightItem;
}

export const InsightDetailCard: React.FC<InsightDetailCardProps> = ({ item }) => {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();
  const iconColor = item.iconColor || colors.primary;

  // --- Add Value Prefix Logic --- 
  let displayValue = item.value;
  // Basic check: if it starts with a digit and is not explicitly positive, prepend +
  if (displayValue && /^\d/.test(displayValue) && !displayValue.startsWith('+') && !displayValue.startsWith('-')) {
    displayValue = `+${displayValue}`;
  }
  // Note: This assumes negative values already have a minus. 
  // Adjust if needed based on actual data format.

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      ...elevation,
    }]}>
      <View style={styles.leftCol}>
        <MaterialCommunityIcons 
          name={item.icon} 
          size={22} 
          color={iconColor} 
          style={styles.icon}
        />
        <Text 
          style={[styles.label, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.label}
        </Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
        <InsightTrendIndicator 
          value={item.trendValue}
          direction={item.trendDirection}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allow text to shrink if needed
    marginRight: 8,
  },
  rightCol: {
    alignItems: 'flex-end',
    minWidth: 70, // Ensure some minimum space for value/trend
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    flexShrink: 1, // Allow shrinking
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'right',
  },
}); 