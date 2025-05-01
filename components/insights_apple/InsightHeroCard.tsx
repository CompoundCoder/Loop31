import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { InsightTrendIndicator } from './InsightTrendIndicator';
import type { AppleInsightItem } from './types';

interface InsightHeroCardProps {
  item: AppleInsightItem;
}

export const InsightHeroCard: React.FC<InsightHeroCardProps> = ({ item }) => {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();
  const iconColor = item.iconColor || colors.primary;

  // Remove trendPercentage extraction as data is now clean
  // const trendPercentage = item.trendValue?.split(' ')[0];

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
      borderRadius: borderRadius.lg, 
      padding: spacing.lg,
      ...elevation, 
    }]}>
      {/* Row for Main Content and Summary */}
      <View style={styles.contentRow}>
        {/* Left Column: Icon, Value, Label+Trend */}
        <View style={styles.mainContentCol}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={item.icon} 
              size={28} 
              color={iconColor} 
            />
          </View>
          {/* Value --- WRAP IN VIEW --- */}
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
          </View>
          {/* Label and Trend Row */}
          <View style={styles.labelTrendRow}>
            <Text style={[styles.label, { color: colors.text + 'AA' }]}>{item.label}</Text>
            {item.trendValue && ( // Check for trendValue directly
              <InsightTrendIndicator 
                value={item.trendValue} // Use cleaned value directly
                direction={item.trendDirection}
              />
            )}
          </View>
        </View>

        {/* Right Column: Centered Summary Sentence --- UNCOMMENT --- */}
        <View style={styles.summaryCol}>
          {item.summarySentence && (
            <Text style={[styles.summary, { color: colors.text + 'B3' }]}>
              {item.summarySentence}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
  },
  mainContentCol: {
    flex: 1,
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 8,
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  valueContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  labelTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
    lineHeight: 18,
  },
  summary: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    textAlign: 'center',
  },
}); 