import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedHeader, { MINI_HEADER_HEIGHT } from '../components/AnimatedHeader';
import AnalyticsChart from '../components/AnalyticsChart';
import EmptyState from '../components/EmptyState';
import ScreenContainer from '@/components/ScreenContainer';
import SectionTitle from '@/components/SectionTitle';
import AnimatedText from '@/components/AnimatedText';
import { ScrollContainer } from '@/components/containers';
import { SCREEN_LAYOUT } from '@/constants/layout';
import FadeSlideInView from '@/components/FadeSlideInView';

type ProgressMetric = {
  value: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  comparisonText?: string;
};

// Mock data with encouraging messaging
const MOCK_ANALYTICS = {
  streak: {
    weeks: 5,
    posts: 15,
    averagePerWeek: 3,
    trend: 'up' as const,
  },
  milestones: {
    totalPosts: 108,
    recentMilestone: 100,
    nextMilestone: 150,
    postsToNext: 42,
  },
  topLoop: {
    name: 'Customer Stories',
    recentPosts: 12,
    engagement: 4.2,
    color: '#45B7D1',
    improvement: '23%',
  },
  activity: [
    { week: '2024-01-01', posts: 3 },
    { week: '2024-01-08', posts: 3 },
    { week: '2024-01-15', posts: 4 },
    { week: '2024-01-22', posts: 4 },
    { week: '2024-01-29', posts: 3 },
    { week: '2024-02-05', posts: 4 },
    { week: '2024-02-12', posts: 4 },
    { week: '2024-02-19', posts: 5 },
    { week: '2024-02-26', posts: 4 },
    { week: '2024-03-04', posts: 5 },
    { week: '2024-03-11', posts: 5 },
    { week: '2024-03-18', posts: 5 },
  ],
};

function ProgressCard({ 
  title,
  metric,
  icon,
  color,
  children,
}: {
  title: string;
  metric: ProgressMetric;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={color}
          style={styles.cardIcon}
        />
        <AnimatedText style={[styles.cardTitle, { color: colors.text }]}>
          {title}
        </AnimatedText>
      </View>
      
      <AnimatedText style={[styles.metricValue, { color: colors.text }]}>
        {metric.value}
      </AnimatedText>
      
      <AnimatedText style={[styles.metricDescription, { color: colors.text }]}>
        {metric.description}
      </AnimatedText>

      {metric.comparisonText && (
        <AnimatedText style={[styles.comparisonText, { color: color }]}>
          {metric.comparisonText}
        </AnimatedText>
      )}

      {children}
    </View>
  );
}

export default function Analytics() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Check if we have enough data to show analytics
  const hasAnalytics = MOCK_ANALYTICS.streak.posts > 0 && 
    MOCK_ANALYTICS.activity.length > 0 &&
    MOCK_ANALYTICS.milestones.totalPosts > 0;

  if (!hasAnalytics) {
    return (
      <ScreenContainer>
        <AnimatedHeader 
          title="Analytics" 
          scrollY={scrollY}
        />
        <EmptyState
          iconName="chart-bar"
          title="No Analytics Yet"
          message="Start posting to unlock insights about your growth! 📈"
          actionLabel="Create Post"
          onAction={() => {/* Navigate to create post */}}
        >
          <Text style={[styles.emptyStateHint, { color: colors.text }]}>
            Your first analytics will appear after you start sharing content.
          </Text>
        </EmptyState>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AnimatedHeader 
        title="Analytics" 
        scrollY={scrollY}
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
        {/* Streak Section */}
        <View style={{ marginBottom: SCREEN_LAYOUT.content.listItemSpacing }}>
          <FadeSlideInView index={0}>
            <ProgressCard
              title="Incredible Streak!"
              metric={{
                value: `${MOCK_ANALYTICS.streak.weeks} weeks strong`,
                description: `You've shared ${MOCK_ANALYTICS.streak.posts} amazing posts`,
                comparisonText: "That's your longest streak yet! 🚀",
              }}
              icon="rocket-launch-outline"
              color="#FF6B6B"
            />
          </FadeSlideInView>
        </View>

        {/* Milestone Section */}
        <View style={{ marginBottom: SCREEN_LAYOUT.content.listItemSpacing }}>
          <FadeSlideInView index={1}>
            <ProgressCard
              title="Major Achievement"
              metric={{
                value: "Triple digits! 💯",
                description: `${MOCK_ANALYTICS.milestones.totalPosts} posts and counting`,
                comparisonText: `Only ${MOCK_ANALYTICS.milestones.postsToNext} posts until your next milestone!`,
              }}
              icon="trophy-outline"
              color="#FFD93D"
            />
          </FadeSlideInView>
        </View>

        {/* Activity Chart */}
        <SectionTitle
          title="Posting Activity"
          subtitle="Last 12 weeks"
          withTopMargin={false}
        />
        <View style={{ marginBottom: SCREEN_LAYOUT.content.listItemSpacing }}>
          <FadeSlideInView index={2}>
            <AnalyticsChart data={MOCK_ANALYTICS.activity} />
          </FadeSlideInView>
        </View>

        {/* Top Loop Section */}
        <SectionTitle
          title="Top Performing Loop"
          subtitle="Based on engagement"
          withTopMargin={false}
        />
        <View style={{ marginBottom: SCREEN_LAYOUT.content.listItemSpacing }}>
          <FadeSlideInView index={3}>
            <ProgressCard
              title={MOCK_ANALYTICS.topLoop.name}
              metric={{
                value: `${MOCK_ANALYTICS.topLoop.engagement}x engagement`,
                description: `${MOCK_ANALYTICS.topLoop.recentPosts} posts this month`,
                comparisonText: `${MOCK_ANALYTICS.topLoop.improvement} improvement! 🎯`,
              }}
              icon="trending-up"
              color={MOCK_ANALYTICS.topLoop.color}
            />
          </FadeSlideInView>
        </View>
      </ScrollContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  metricDescription: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartCaption: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateHint: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
}); 