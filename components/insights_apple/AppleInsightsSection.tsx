import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { InsightHeroCard } from './InsightHeroCard';
import { InsightDetailCard } from './InsightDetailCard';
import type { AppleInsightItem } from './types';

// Mock data adhering to AppleInsightItem structure
const MOCK_INSIGHTS_DATA: AppleInsightItem[] = [
  {
    id: 'growth',
    type: 'hero',
    icon: 'trending-up',
    iconColor: '#34C759',
    label: 'Weekly Growth',
    value: '+15.2%',
    trendValue: '+3.1%',
    trendDirection: 'up',
    summarySentence: "Keep it up! Your audience is growing.",
  },
  {
    id: 'followers',
    type: 'detail',
    icon: 'account-multiple-outline',
    iconColor: '#007AFF',
    label: 'New Followers',
    value: '89',
    trendValue: '+5',
    trendDirection: 'up',
  },
  {
    id: 'reach',
    type: 'detail',
    icon: 'eye-outline',
    iconColor: '#FF9500',
    label: 'Audience Reach',
    value: '12.8K',
    trendValue: '-1.1K',
    trendDirection: 'down',
  },
   {
    id: 'engagement',
    type: 'detail',
    icon: 'heart-outline',
    iconColor: '#FF2D55',
    label: 'Engagement',
    value: '4.8%',
    trendValue: '+0.2%',
    trendDirection: 'up',
  },
];

export const AppleInsightsSection: React.FC = () => {
  const { spacing } = useThemeStyles();

  return (
    <View style={styles.container}>
      {MOCK_INSIGHTS_DATA.map((item, index) => (
        <View 
          key={item.id} 
          style={{ marginBottom: index === MOCK_INSIGHTS_DATA.length - 1 ? 0 : spacing.md }}
        >
          {item.type === 'hero' ? (
            <InsightHeroCard item={item} />
          ) : (
            <InsightDetailCard item={item} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
}); 