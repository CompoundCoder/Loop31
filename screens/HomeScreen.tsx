import React, { useState, useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, Easing, Text } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useTheme } from '@react-navigation/native';
import type { ExtendedTheme } from '@/app/_layout';
import ScreenContainer from '@/components/ScreenContainer';
import AnimatedHeader, { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';
import SimpleButton from '@/components/SimpleButton';
import SectionTitle from '@/components/SectionTitle';
import MetricCard from '@/components/MetricCard';
import ReminderCard from '@/components/ReminderCard';
import WelcomeMessage from '@/components/WelcomeMessage';
import FadeSlideInView from '@/components/FadeSlideInView';
import TopPerformingPostsSection from '../components/home/TopPerformingPostsSection';
import { ScrollContainer } from '@/components/containers';
import { SCREEN_LAYOUT } from '@/constants/layout';
import { QUICK_INSIGHTS } from '@/data/mockInsights';
import HeaderActionButton from '@/components/HeaderActionButton';
import AnimatedCard from '@/components/AnimatedCard';
import InsightsSection from '@/components/insights/InsightsSection';
import InsightsCard from '@/components/insights/InsightsCard';
import InsightMetric from '@/components/insights/InsightMetric';
import { Ionicons, Feather } from '@expo/vector-icons';
import lightTheme from '@/theme/theme';
import QuickInsightsSection from '@/components/QuickInsightsSection';
import InsightStackSection from '@/components/InsightStackSection';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SectionHeader from '@/components/SectionHeader';

const generateId = () => Math.random().toString(36).substring(2, 10);

// Mock data for insights
const INSIGHTS = [
  {
    label: 'Followers',
    value: '1,234',
    icon: <Ionicons name="people-outline" size={20} color="#008AFF" />,
    trend: 'up' as 'up',
    color: '#008AFF',
  },
  {
    label: 'Engagement',
    value: '567',
    icon: <Ionicons name="chatbubble-ellipses-outline" size={20} color="#34C759" />,
    trend: 'down' as 'down',
    color: '#34C759',
  },
  {
    label: 'Growth',
    value: '+12%',
    icon: <Ionicons name="trending-up-outline" size={20} color="#FF9500" />,
    trend: 'up' as 'up',
    color: '#FF9500',
  },
];

export default function HomeScreen() {
  const { colors, spacing, borderRadius } = useThemeStyles();
  const theme = useTheme() as unknown as ExtendedTheme;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [collapseLast, setCollapseLast] = useState(false);

  // Centralized analytics data (mock, ready for API integration)
  const analytics = {
    growthPercent: 12.6,
    newLikes: 142,
    newFollowers: 89,
    newComments: 24,
    newDMs: 7,
  };

  // Reminders array state
  const [reminders, setReminders] = useState([
    {
      id: generateId(),
      title: 'Time to Post!',
      message: "You haven't posted in 3 days. Stay active for better reach.",
      icon: 'clock-alert-outline',
      accentColor: theme.colors.accent,
      actionLabel: 'Schedule a post',
    },
    {
      id: generateId(),
      title: 'Try a New Loop',
      message: 'Loops help you organize your content. Create one now!',
      icon: 'repeat',
      accentColor: '#4ECDC4',
      actionLabel: 'Create Loop',
    },
    {
      id: generateId(),
      title: 'Check Your Analytics',
      message: 'See how your posts are performing this week.',
      icon: 'chart-bar',
      accentColor: '#2196F3',
      actionLabel: 'View Analytics',
    },
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Mock refresh
  };

  const handleHeaderActionPress = () => {
    setMenuVisible(prev => !prev);
  };

  // Dismiss handler for each card
  const handleDismissReminder = (id: string) => {
    if (reminders.length === 1) {
      setCollapseLast(true);
    } else {
      setDismissing(true);
    }
  };

  const handleCardAnimationEnd = (id: string) => {
    setReminders(reminders => reminders.filter(r => r.id !== id));
    setDismissing(false);
    setCollapseLast(false);
  };

  const themeColors = lightTheme.colors;

  // Modular insight cards data
  const insightCards = [
    {
      icon: <MaterialCommunityIcons name="sprout" size={28} color="#34C759" />,
      label: 'Growth',
      value: '+12.6%',
      trend: '+12.6%',
      trendColor: themeColors.success || '#34C759',
    },
    {
      icon: <MaterialCommunityIcons name="account-plus-outline" size={22} color="#008AFF" />,
      label: 'New Followers',
      value: '89',
      trend: '+5.4%',
      trendColor: themeColors.success || '#34C759',
    },
    {
      icon: <MaterialCommunityIcons name="eye-outline" size={22} color="#FF6B6B" />,
      label: 'Reach',
      value: '12.8K',
      trend: '+9.1%',
      trendColor: themeColors.success || '#34C759',
    },
    {
      icon: <MaterialCommunityIcons name="heart-outline" size={22} color="#FF69B4" />,
      label: 'Likes',
      value: '324',
      trend: '+2.3%',
      trendColor: themeColors.success || '#34C759',
    },
    {
      icon: <MaterialCommunityIcons name="comment-outline" size={22} color="#3B82F6" />,
      label: 'Comments',
      value: '87',
      trend: '-0.8%',
      trendColor: colors.text + '99',
    },
    {
      icon: <Feather name="send" size={22} color="#A259FF" />,
      label: 'DMs',
      value: '14',
      trend: '+1.2%',
      trendColor: themeColors.success || '#34C759',
    },
  ];

  return (
    <ScreenContainer>
      <AnimatedHeader
        title="Home"
        scrollY={scrollY}
        menuVisible={menuVisible}
        onMenuVisibleChange={setMenuVisible}
        actionButton={<HeaderActionButton iconName="add-outline" onPress={handleHeaderActionPress} />}
      />
      <ScrollContainer
        scrollY={scrollY}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{
          paddingTop: MINI_HEADER_HEIGHT + 16,
          paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
        }}
      >
        {/* Welcome Message */}
        <View style={{ marginBottom: SCREEN_LAYOUT.content.sectionSpacing }}>
          <FadeSlideInView index={0}>
            <WelcomeMessage />
          </FadeSlideInView>
        </View>

        {/* Reminders (Single card, collapse only on last) */}
        <View style={{ marginBottom: SCREEN_LAYOUT.content.sectionSpacing, minHeight: 1 }}>
          <FadeSlideInView index={1}>
            {reminders.length > 0 && (
              <AnimatedCard
                visible={!(dismissing || collapseLast)}
                onDismiss={() => handleCardAnimationEnd(reminders[0].id)}
                duration={400}
                collapse={collapseLast}
              >
                <ReminderCard
                  key={reminders[0].id}
                  title={reminders[0].title}
                  message={reminders[0].message}
                  icon={reminders[0].icon as any}
                  accentColor={reminders[0].accentColor}
                  actionLabel={reminders[0].actionLabel}
                  onPress={() => {/* Handle schedule action */}}
                  onDismiss={() => handleDismissReminder(reminders[0].id)}
                />
              </AnimatedCard>
            )}
          </FadeSlideInView>
        </View>

        {/* Top Performing Posts */}
        <SectionHeader title="Top Performing Posts" subtitle="Your best content this week" />
        <TopPerformingPostsSection />

        {/* Quick Insights (modular stack) */}
        <SectionHeader title="Quick Insights" subtitle="Stay inspired, check out your latest results" />
        <InsightStackSection cards={insightCards} />
      </ScrollContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topPostContainer: {
    overflow: 'hidden',
  },
});
 