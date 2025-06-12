import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  SectionList,
  View,
  Text,
  RefreshControl,
  Animated,
  SectionListData,
  SectionListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Post } from '../data/Post';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import AnimatedHeader, { HEADER_TOTAL_HEIGHT, MINI_HEADER_HEIGHT } from '../components/AnimatedHeader';
import SimpleButton from '../components/SimpleButton';
import SectionTitle from '../components/SectionTitle';
import ScreenContainer from '@/components/ScreenContainer';
import { ListContainer, ScrollContainer } from '@/components/containers';
import { LAYOUT, SCREEN_LAYOUT } from '@/constants/layout';
import { useThemeStyles } from '@/hooks/useThemeStyles';

// Create animated version of SectionList
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

type AnimatedSectionListProps = React.ComponentProps<typeof SectionList> & {
  onScroll: (event: any) => void;
};

// Mock milestone data
const MOCK_MILESTONES = {
  totalPosts: 100,
  recentMilestone: {
    count: 100,
    message: "You've published 100 posts! Your story is inspiring! 🎉",
    achieved: true,
  },
  nextMilestone: {
    count: 150,
    postsToGo: 50,
  },
  weeklyStreak: 8,
};

function CelebrationCard() {
  const { colors, spacing } = useThemeStyles();
  
  if (!MOCK_MILESTONES.recentMilestone.achieved) return null;

  return (
    <View style={[
      styles.celebrationCard, 
      { 
        borderColor: colors.border,
        backgroundColor: colors.card,
        marginBottom: SCREEN_LAYOUT.content.sectionSpacing,
      }
    ]}>
      <View style={styles.celebrationContent}>
        <View style={styles.celebrationHeader}>
          <MaterialCommunityIcons
            name="trophy"
            size={28}
            color={colors.primary}
            style={styles.trophyIcon}
          />
          <Text style={[styles.celebrationTitle, { color: colors.text }]}>
            Major Milestone! 🎉
          </Text>
        </View>
        <Text style={[styles.celebrationText, { color: colors.text }]}>
          {MOCK_MILESTONES.recentMilestone.message}
        </Text>
        <Text style={[styles.nextMilestone, { color: colors.primary }]}>
          Next stop: {MOCK_MILESTONES.nextMilestone.count} posts 
          ({MOCK_MILESTONES.nextMilestone.postsToGo} to go!)
        </Text>
        <View style={styles.celebrationActions}>
          <SimpleButton
            label="Share Achievement"
            size="small"
            variant="outline"
            iconName="share"
            onPress={() => {/* Share milestone */}}
          />
        </View>
      </View>
    </View>
  );
}

// Mock data for development
const MOCK_POSTS: Post[] = [
  (() => {
    const post = new Post({
      id: '1',
      caption: 'Product launch was a huge success! 🎉',
      media: ['https://picsum.photos/400/400'],
      accountTargets: ['instagram-main'],
    });
    post.markAsPublished();
    return post;
  })(),
  (() => {
    const post = new Post({
      id: '2',
      caption: 'Meet our amazing team! 👥',
      media: ['https://picsum.photos/400/401'],
      accountTargets: ['linkedin-company'],
    });
    post.markAsPublished();
    return post;
  })(),
  (() => {
    const post = new Post({
      id: '3',
      caption: 'Customer spotlight: Success stories ⭐',
      media: ['https://picsum.photos/400/402'],
      accountTargets: ['instagram-main', 'facebook-page'],
    });
    post.markAsPublished();
    return post;
  })(),
  (() => {
    const post = new Post({
      id: '4',
      caption: 'Industry insights for 2024 📊',
      media: ['https://picsum.photos/400/403'],
      accountTargets: ['linkedin-company'],
    });
    post.markAsPublished();
    return post;
  })(),
];

type Section = {
  title: string;
  subtitle?: string;
  data: Post[];
};

function getFriendlyWeekTitle(date: Date, postsCount: number): { title: string; subtitle?: string } {
  const isCurrentWeek = new Date().getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
  const isLastWeek = new Date().getTime() - date.getTime() < 14 * 24 * 60 * 60 * 1000;

  if (isCurrentWeek) {
    return {
      title: "This Week's Wins ✨",
      subtitle: `${postsCount} amazing posts shared`,
    };
  }

  if (isLastWeek) {
    return {
      title: "Last Week's Impact 💫",
      subtitle: `${postsCount} posts making waves`,
    };
  }

  return {
    title: `Recent Highlights 🌟`,
    subtitle: `${postsCount} posts from ${date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    })}`,
  };
}

function groupPostsByWeek(posts: Post[]): Section[] {
  const grouped = posts.reduce((acc: { [key: string]: Post[] }, post) => {
    const date = new Date(post.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(post);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([weekStart, posts]) => {
      const date = new Date(weekStart);
      const { title, subtitle } = getFriendlyWeekTitle(date, posts.length);

      return {
        title,
        subtitle,
        data: posts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      };
    })
    .sort((a, b) => {
      const dateA = new Date(b.data[0].createdAt);
      const dateB = new Date(a.data[0].createdAt);
      return dateA.getTime() - dateB.getTime();
    });
}

export default function Published() {
  const { colors } = useThemeStyles();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [sections, setSections] = React.useState<Section[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Add initial data load
  useEffect(() => {
    // Simulate initial data fetch
    setTimeout(() => {
      setSections(groupPostsByWeek(MOCK_POSTS));
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setSections(groupPostsByWeek(MOCK_POSTS));
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <SectionTitle
      title={section.title}
      subtitle={section.subtitle}
      withTopMargin={false}
      containerStyle={{ 
        marginBottom: SCREEN_LAYOUT.content.sectionSpacing,
      }}
    />
  );

  const renderPost: SectionListRenderItem<Post, Section> = ({ item }) => (
    <View style={{
      marginBottom: SCREEN_LAYOUT.content.listItemSpacing,
    }}>
      <PostCard post={item} />
    </View>
  );

  const renderHeader = () => (
    sections.length > 0 ? <CelebrationCard /> : null
  );

  const renderEmptyState = () => (
    <EmptyState
      iconName="post"
      title="No Published Posts Yet!"
      message="Start sharing your content with the world 🌎"
      actionLabel="Create Post"
      onAction={() => {/* Navigation to create post */}}
    />
  );

  if (loading) {
    return (
      <ScreenContainer>
        <AnimatedHeader 
          title="Published" 
          scrollY={scrollY}
        />
        <View style={[styles.loadingContainer, { paddingTop: SCREEN_LAYOUT.content.topPadding }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading your published posts...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AnimatedHeader 
        title="Published" 
        scrollY={scrollY}
      />
      <ListContainer
        sections={sections}
        keyExtractor={(item) => (item as Post).id}
        renderItem={renderPost as any}
        renderSectionHeader={renderSectionHeader as any}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          !sections.length && styles.emptyList,
          { 
            paddingTop: MINI_HEADER_HEIGHT + 16,
            paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
          }
        ]}
        stickySectionHeadersEnabled={false}
        scrollY={scrollY}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  celebrationCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  celebrationContent: {
    padding: 16,
  },
  celebrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trophyIcon: {
    marginRight: 8,
  },
  celebrationTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  celebrationText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 8,
  },
  nextMilestone: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  celebrationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}); 