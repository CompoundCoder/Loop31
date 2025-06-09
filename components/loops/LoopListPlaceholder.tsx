import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { LAYOUT } from '@/constants/layout'; // For marginBottom and screen padding

// Single Placeholder Item (visual structure from LoopListSection)
const PlaceholderItem = () => {
  const { colors, spacing, borderRadius } = useThemeStyles();
  return (
    <View style={[
      styles.loopCardPlaceholder,
      {
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: LAYOUT.content.cardSpacing, // Use constant for consistency
      }
    ]}>
      <View style={styles.loopHeaderPlaceholder}>
        <View style={[
          styles.loopColorIndicatorPlaceholder,
          { backgroundColor: colors.border, borderRadius: borderRadius.full } // Use border for placeholder color
        ]} />
        <View style={[
          styles.loopTitlePlaceholder,
          { backgroundColor: colors.border, borderRadius: borderRadius.sm }
        ]} />
      </View>
      <View style={[
        styles.loopStatsPlaceholder,
        {
          backgroundColor: colors.border,
          borderRadius: borderRadius.sm,
          marginTop: spacing.md,
        }
      ]} />
    </View>
  );
};

export interface LoopListPlaceholderProps {
  count?: number;
}

export const LoopListPlaceholder: React.FC<LoopListPlaceholderProps> = ({ count = 3 }) => {
  const { spacing } = useThemeStyles(); // Get spacing for paddingTop
  return (
    <View style={[
      styles.container,
      { 
        paddingHorizontal: LAYOUT.screen.horizontalPadding, 
        paddingTop: spacing.lg, // Use spacing.lg from theme
      }
    ]}>
      {Array.from({ length: count }).map((_, index) => (
        <PlaceholderItem key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal and paddingTop are now applied dynamically
  },
  loopCardPlaceholder: {
    borderWidth: 1,
  },
  loopHeaderPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loopColorIndicatorPlaceholder: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  loopTitlePlaceholder: {
    height: 24,
    width: 160,
    opacity: 0.5,
  },
  loopStatsPlaceholder: {
    height: 16,
    width: 120,
    opacity: 0.5,
  },
});

export default LoopListPlaceholder; 