import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { type HomeScreenItem } from '@/types/homeScreen';
import { type NotificationItem } from '@/modules/notifications';
import { SCREEN_LAYOUT } from '@/constants/layout';

// Import components used in the renderer
import WelcomeMessage from '@/components/WelcomeMessage';
import SectionHeader from '@/components/SectionHeader';
import TopPerformingPostsSection from '@/components/home/TopPerformingPostsSection';
import { NotificationStackFeed } from '@/components/notifications/NotificationStackFeed';
import { AppleInsightsSection } from '@/components/insights_apple/AppleInsightsSection';

interface RenderHomeScreenItemProps {
  item: HomeScreenItem;
  notifications: NotificationItem[];
  spacing: { [key: string]: number };
  colors: { text: string };
  handleInlineDismiss: (id: string) => void;
}

export const renderHomeScreenItem = ({
  item,
  notifications,
  spacing,
  colors,
  handleInlineDismiss,
}: RenderHomeScreenItemProps): JSX.Element | null => {
  const itemStyle = [{ marginBottom: spacing.lg }];

  switch (item.type) {
    case 'welcome':
      return (
        <View style={itemStyle}>
          <WelcomeMessage />
        </View>
      );
    case 'topPostsHeader':
      if (!item.title) return null;
      return (
        <View style={{ marginBottom: spacing.sm }}>
          <SectionHeader title={item.title} subtitle={item.subtitle || ''} />
        </View>
      );
    case 'topPostsLoading':
      return (
        <View style={[itemStyle, { alignItems: 'center', justifyContent: 'center', height: 100 }]}>
          <ActivityIndicator />
        </View>
      );
    case 'topPostsError':
      return (
        <View style={itemStyle}>
          <Text style={{ color: colors.text, textAlign: 'center' }}>
            Error loading top posts. {item.error?.message}
          </Text>
        </View>
      );
    case 'topPosts':
      return (
        <View style={{ marginBottom: spacing.md }}>
          <TopPerformingPostsSection />
        </View>
      );
    case 'inlinePreNotifications':
      return (
        <View style={itemStyle}>
          <NotificationStackFeed
            notifications={notifications}
            onDismiss={handleInlineDismiss}
            target="inlinePre"
          />
        </View>
      );
    case 'feedNotifications':
      return (
        <View style={itemStyle}>
          <NotificationStackFeed
            notifications={notifications}
            onDismiss={handleInlineDismiss}
            target="mainFeed"
          />
        </View>
      );
    case 'insightsHeader':
      if (!item.title) return null;
      return (
        <View style={{ marginBottom: spacing.sm }}>
          <SectionHeader title={item.title} subtitle={item.subtitle || ''} />
        </View>
      );
    case 'insightsLoading':
      return (
        <View style={[itemStyle, { alignItems: 'center', justifyContent: 'center', height: 150 }]}>
          <ActivityIndicator />
        </View>
      );
    case 'insightsError':
      return (
        <View style={itemStyle}>
          <Text style={{ color: colors.text, textAlign: 'center' }}>
            Error loading insights. {item.error?.message}
          </Text>
        </View>
      );
    case 'appleInsights':
      return (
        <View>
          <AppleInsightsSection />
        </View>
      );
    default:
      return null;
  }
}; 