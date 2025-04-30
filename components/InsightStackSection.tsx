import React from 'react';
import { View } from 'react-native';
import InsightCard from './InsightCard';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export interface InsightStackCardData {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendColor?: string;
}

interface InsightStackSectionProps {
  cards: InsightStackCardData[];
}

const InsightStackSection: React.FC<InsightStackSectionProps> = ({ cards }) => {
  const { borderRadius, colors, spacing } = useThemeStyles();
  return (
    <View style={{ width: '100%' }}>
      {cards.map((card, idx) => {
        const isTop = idx === 0;
        const isBottom = idx === cards.length - 1;
        const isSingle = cards.length === 1;
        const cardRadius = {
          borderTopLeftRadius: isTop || isSingle ? borderRadius.lg : 0,
          borderTopRightRadius: isTop || isSingle ? borderRadius.lg : 0,
          borderBottomLeftRadius: isBottom || isSingle ? borderRadius.lg : 0,
          borderBottomRightRadius: isBottom || isSingle ? borderRadius.lg : 0,
        };
        const cardShadow = isTop || isSingle
          ? {
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }
          : {};
        return (
          <React.Fragment key={card.label}>
            <InsightCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              trend={card.trend}
              trendColor={card.trendColor}
              isLarge={idx === 0}
              style={{
                ...cardRadius,
                ...cardShadow,
                backgroundColor: colors.card,
                marginBottom: 0,
                borderBottomWidth: isBottom ? 0 : 0,
              }}
            />
            {/* Divider between cards, except after last card */}
            {idx < cards.length - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginLeft: spacing.lg,
                  marginRight: spacing.lg,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default InsightStackSection; 