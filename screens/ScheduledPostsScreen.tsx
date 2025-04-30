import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ListRenderItem,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LAYOUT, SCREEN_LAYOUT } from '@/constants/layout';

import { Post } from '../data/Post';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import AnimatedHeader, { MINI_HEADER_HEIGHT } from '../components/AnimatedHeader';
import ScreenContainer from '@/components/ScreenContainer';
import { FlatContainer } from '@/components/containers';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { ScrollContainer } from '@/components/containers';

// Mock streak data
const MOCK_STREAK = {
  weeksAhead: 3,
  scheduledCount: 12,
  nextPostDate: '2024-03-25T09:00:00Z',
};

function StreakCard() {
  const { colors } = useTheme();
  const { spacing } = useThemeStyles();
  
  return (
    <View style={[styles.streakCard, { 
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    }]}>
      <View style={styles.streakIconContainer}>
        <MaterialCommunityIcons
          name="rocket-launch"
          size={24}
          color="#FF6B6B"
          style={styles.streakIcon}
        />
      </View>
      <View style={styles.streakContent}>
        <Text style={[styles.streakTitle, { color: colors.text }]}>
          Amazing momentum! 🎯
        </Text>
        <Text style={[styles.streakText, { color: colors.text }]}>
          You're {MOCK_STREAK.weeksAhead} weeks ahead with {MOCK_STREAK.scheduledCount} posts ready to go.
          Keep building that consistency!
        </Text>
      </View>
    </View>
  );
}

// Mock data for development
const MOCK_POSTS = [
  {
    id: '1',
    caption: 'Exciting product launch coming soon! 🚀',
    media: ['https://picsum.photos/400/400'],
    accountTargets: ['instagram-main'],
  },
  {
    id: '2',
    caption: 'Behind the scenes look at our team! 👥',
    media: ['https://picsum.photos/400/401'],
    accountTargets: ['linkedin-company'],
  },
  {
    id: '3',
    caption: 'Evening inspiration for our community ✨',
    media: ['https://picsum.photos/400/402'],
    accountTargets: ['instagram-main', 'facebook-page'],
  },
];

// Custom type for our FlatContainer
type AnimatedFlatListProps<T> = React.ComponentProps<typeof FlatContainer> & {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
};

export default function Scheduled() {
  const { colors } = useTheme();
  const { spacing } = useThemeStyles();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Load posts on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPosts(MOCK_POSTS.map(data => new Post(data)));
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, []);

  const renderPost: ListRenderItem<Post> = ({ item: post }) => (
    <View style={{
      marginBottom: 0, // FlatList handles vertical spacing via ItemSeparatorComponent
    }}>
      <PostCard post={post} />
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      iconName="calendar-clock"
      title="No Scheduled Posts Yet!"
      message="Start scheduling your content to build momentum 🚀"
      actionLabel="Create Post"
      onAction={() => {/* Navigation to create post */}}
    />
  );

  const renderHeader = () => (
    posts.length > 0 ? (
      <View style={{ marginTop: spacing.sm }}>
        <StreakCard />
      </View>
    ) : null
  );

  if (loading) {
    return (
      <ScreenContainer>
        <AnimatedHeader 
          title="Scheduled" 
          scrollY={scrollY}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.spinner}
          />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Fetching your scheduled posts...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AnimatedHeader 
        title="Scheduled" 
        scrollY={scrollY}
      />
      <FlatContainer
        {...({
          data: posts,
          renderItem: renderPost,
          ListHeaderComponent: renderHeader,
          keyExtractor: (post: Post) => post.id,
          contentContainerStyle: [
            !posts.length && styles.emptyList,
            { 
              paddingTop: MINI_HEADER_HEIGHT + 16,
              paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
            }
          ],
          ListEmptyComponent: renderEmptyState,
          ItemSeparatorComponent: () => <View style={{ height: SCREEN_LAYOUT.content.listItemSpacing }} />,
          scrollY,
          refreshing,
          onRefresh: handleRefresh,
        } as AnimatedFlatListProps<Post>)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: MINI_HEADER_HEIGHT,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  streakCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
  },
  streakIconContainer: {
    marginRight: 16,
  },
  streakIcon: {
    marginTop: 2,
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
}); 