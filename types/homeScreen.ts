export interface HomeScreenItem {
  id: string;
  type:
    | 'welcome'
    | 'inlinePreNotifications'
    | 'topPostsHeader'
    | 'topPostsLoading'
    | 'topPostsError'
    | 'topPosts'
    | 'feedNotifications'
    | 'insightsHeader'
    | 'insightsLoading'
    | 'insightsError'
    | 'appleInsights';
  title?: string;
  subtitle?: string;
  error?: Error | null;
} 