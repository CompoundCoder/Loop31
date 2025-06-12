import { useMemo } from 'react';
import type { HomeScreenItem } from '@/types/homeScreen';

interface UseHomeScreenSectionsProps {
  hasInlinePre: boolean;
  hasMainFeed: boolean;
}

export const useHomeScreenSections = ({
  hasInlinePre,
  hasMainFeed,
}: UseHomeScreenSectionsProps): HomeScreenItem[] => {
  const listData = useMemo(() => {
    const items: HomeScreenItem[] = [];

    // 1. Welcome Message
    items.push({ id: 'welcome', type: 'welcome' });

    // 2. Inline Pre Notifications
    if (hasInlinePre) {
      items.push({ id: 'inlinePreNotifications', type: 'inlinePreNotifications' });
    }

    // 3. Top Posts Section
    items.push({
      id: 'topPostsHeader',
      type: 'topPostsHeader',
      title: 'Top Performing Posts',
      subtitle: 'Your best content this week'
    });
    items.push({ id: 'topPosts', type: 'topPosts' });

    // 4. Main Feed Notifications
    if (hasMainFeed) {
      items.push({ id: 'feedNotifications', type: 'feedNotifications' });
    }

    // 5. Insights Section
    items.push({
      id: 'insightsHeader',
      type: 'insightsHeader',
      title: 'Quick Insights',
      subtitle: 'Stay inspired, check out your latest results'
    });
    items.push({ id: 'appleInsights', type: 'appleInsights' });

    return items;
  }, [hasInlinePre, hasMainFeed]);

  return listData;
}; 