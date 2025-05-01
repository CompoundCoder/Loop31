import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Animated, View, StyleSheet, RefreshControl, ActivityIndicator, Text } from 'react-native';
import Reanimated, {
  FadeIn,
  FadeOut,
  Layout,
  Easing,
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useTheme } from '@react-navigation/native';
import type { ExtendedTheme } from '@/app/_layout';
import ScreenContainer from '@/components/ScreenContainer';
import AnimatedHeader, { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';
import SimpleButton from '@/components/SimpleButton';
import SectionTitle from '@/components/SectionTitle';
import MetricCard from '@/components/MetricCard';
import WelcomeMessage from '@/components/WelcomeMessage';
import FadeSlideInView from '@/components/FadeSlideInView';
import TopPerformingPostsSection from '../components/home/TopPerformingPostsSection';
import { ScrollContainer } from '@/components/containers';
import { SCREEN_LAYOUT } from '@/constants/layout';
import { QUICK_INSIGHTS } from '@/data/mockInsights';
import HeaderActionButton from '@/components/HeaderActionButton';
import InsightsSection from '@/components/insights/InsightsSection';
import InsightsCard from '@/components/insights/InsightsCard';
import InsightMetric from '@/components/insights/InsightMetric';
import { Ionicons, Feather } from '@expo/vector-icons';
import lightTheme from '@/theme/theme';
import QuickInsightsSection from '@/components/QuickInsightsSection';
import InsightStackSection from '@/components/InsightStackSection';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SectionHeader from '@/components/SectionHeader';
import { NotificationStackInline } from '@/components/notifications/NotificationStackInline';
import { NotificationStackFeed } from '@/components/notifications/NotificationStackFeed';
import { useNotifications } from '@/modules/notifications';
import { AppleInsightsSection } from '@/components/insights_apple/AppleInsightsSection';

// --- Define the type for FlatList items --- 
interface HomeScreenItem {
  id: string;
  type: 
    | 'welcome' 
    | 'inlineNotifications' 
    | 'topPostsHeader' 
    | 'topPostsLoading'
    | 'topPostsError'
    | 'topPosts' 
    | 'feedNotifications' 
    | 'insightsHeader' 
    | 'insightsLoading'
    | 'insightsError'
    | 'appleInsights';
  // Optional props for headers/errors
  title?: string; 
  subtitle?: string;
  error?: Error | null;
}

export default function HomeScreen() {
  const { colors, spacing, borderRadius } = useThemeStyles();
  const theme = useTheme() as unknown as ExtendedTheme;
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { notifications, dismissNotification } = useNotifications();

  const handleInlineDismiss = useCallback((id: string) => {
    dismissNotification(id);
  }, [dismissNotification]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Mock refresh
  };

  const handleHeaderActionPress = () => {
    setMenuVisible(prev => !prev);
  };

  // --- Generate data for FlatList --- 
  const listData = useMemo(() => {
    const items: HomeScreenItem[] = [];

    // 1. Welcome Message
    items.push({ id: 'welcome', type: 'welcome' });

    // 2. Inline Notifications (Conditionally)
    const inlineNotifications = notifications.filter(n => n.displayTarget === 'inline');
    if (inlineNotifications.length > 0) {
      items.push({ id: 'inlineNotifications', type: 'inlineNotifications' });
    }

    // 3. Top Posts Section (Header + Content/Loading/Error)
    items.push({ 
      id: 'topPostsHeader', 
      type: 'topPostsHeader', 
      title: 'Top Performing Posts', 
      subtitle: 'Your best content this week' 
    });
    items.push({ id: 'topPosts', type: 'topPosts' });

    // 4. Feed Notifications (Conditionally)
    const feedNotificationsData = notifications.filter(n => n.displayTarget === 'mainFeed');
    if (feedNotificationsData.length > 0) {
      items.push({ id: 'feedNotifications', type: 'feedNotifications' });
    }

    // 5. Insights Section (Header + Content/Loading/Error)
    items.push({ 
      id: 'insightsHeader', 
      type: 'insightsHeader', 
      title: 'Quick Insights', 
      subtitle: 'Stay inspired, check out your latest results' 
    });
    items.push({ id: 'appleInsights', type: 'appleInsights' });

    return items;
  }, [notifications]); // Current dependency

  // --- Define renderItem function for FlatList --- 
  const renderItem = useCallback(({ item }: { item: HomeScreenItem }) => {
    const itemStyle = [{ marginBottom: spacing.lg }];

    switch (item.type) {
      case 'welcome':
        return (
          <View style={itemStyle}>
            <WelcomeMessage />
          </View>
        );
      case 'inlineNotifications':
        return (
          <View style={itemStyle}>
            <NotificationStackInline 
              notifications={notifications} 
              onDismiss={handleInlineDismiss} 
            />
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
            {/* TODO: Add retry button? */}
          </View>
        );
      case 'topPosts':
        return (
          <View style={{ marginBottom: spacing.md }}>
            <TopPerformingPostsSection />
          </View>
        );
      case 'feedNotifications':
        return (
          <View style={itemStyle}>
            <NotificationStackFeed 
              notifications={notifications} 
              onDismiss={handleInlineDismiss} 
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
            {/* TODO: Add retry button? */}
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
  }, [spacing, notifications, handleInlineDismiss, colors.text]);

  // --- Create Reanimated scroll handler ---
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <ScreenContainer>
      <AnimatedHeader
        title="Home"
        scrollY={scrollY}
        menuVisible={menuVisible}
        onMenuVisibleChange={setMenuVisible}
        actionButton={<HeaderActionButton iconName="add-outline" onPress={handleHeaderActionPress} />}
      />
      <Reanimated.FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        itemLayoutAnimation={Layout.duration(450).easing(Easing.inOut(Easing.cubic))}
        onScroll={scrollHandler}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{
          paddingTop: MINI_HEADER_HEIGHT + 16,
          paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
          paddingBottom: spacing.lg,
        }}
        extraData={{ notifications }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // topPostContainer: {
  //   overflow: 'hidden',
  // },
});
 