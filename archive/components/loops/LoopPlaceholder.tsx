import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { LAYOUT } from '@/constants/layout'; // For LAYOUT_CONTENT_CARD_SPACING

interface LoopPlaceholderProps {
  color: string; // Color for the small indicator, typically theme.colors.border
}

const LoopPlaceholder: React.FC<LoopPlaceholderProps> = ({ color }) => {
  const { colors, spacing, borderRadius } = useThemeStyles();

  return (
    <View 
      style={[
        styles.loopCardPlaceholderBase, 
        { 
          backgroundColor: colors.card, 
          borderRadius: borderRadius.lg,
          borderColor: colors.border,
          padding: spacing.lg,
          marginBottom: LAYOUT.content.cardSpacing, // Use imported constant
        }
      ]}
    >
      <View style={styles.loopHeaderPlaceholderContent}>
        <View style={[
          styles.loopColorIndicatorPlaceholder,
          { 
            backgroundColor: color, // Prop for indicator color
            borderRadius: borderRadius.full,
          }
        ]} />
        <View style={[
          styles.loopTitlePlaceholder,
          { 
            backgroundColor: colors.border, // Placeholder elements use border color
            borderRadius: borderRadius.sm,
          }
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

const styles = StyleSheet.create({
  loopCardPlaceholderBase: {
    borderWidth: 1,
  },
  loopHeaderPlaceholderContent: {
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

export default LoopPlaceholder; 