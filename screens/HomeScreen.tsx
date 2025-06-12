import * as React from 'react';
import { RefreshControl } from 'react-native';
import Reanimated, {
  Layout,
  Easing,
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import ScreenContainer from '@/components/ScreenContainer';
import AnimatedHeader, { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';
import { SCREEN_LAYOUT } from '@/constants/layout';
import { useHomeScreenNotifications } from '@/hooks/useHomeScreenNotifications';
import { useHomeScreenSections } from '@/hooks/useHomeScreenSections';
import { renderHomeScreenItem } from '@/components/home/HomeScreenItemRenderer';
import type { HomeScreenItem } from '@/types/homeScreen';

export default function HomeScreen() {
  const { colors, spacing } = useThemeStyles();
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    notifications,
    hasInlinePre,
    hasMainFeed,
    handleInlineDismiss
  } = useHomeScreenNotifications();

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Mock refresh
  }, []);

  // --- Generate data for FlatList --- 
  const listData = useHomeScreenSections({ hasInlinePre, hasMainFeed });

  // --- Define renderItem function for FlatList --- 
  const renderItem = React.useCallback(({ item }: { item: HomeScreenItem }) => {
    return renderHomeScreenItem({
      item,
      notifications,
      spacing,
      colors,
      handleInlineDismiss,
    });
  }, [spacing, notifications, handleInlineDismiss, colors]);

  // --- Create Reanimated scroll handler ---
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <ScreenContainer>
      <AnimatedHeader
        title="Home"
        scrollY={scrollY}
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
 