import React, { useRef, useEffect } from 'react';
import { View, ViewStyle, StyleProp, Dimensions, Animated, Platform } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useTheme } from '@react-navigation/native';
import SectionTitle from '@/components/SectionTitle';
import PostCard from '@/components/PostCard';
import FadeSlideInView from '@/components/FadeSlideInView';
import { SCREEN_LAYOUT } from '@/constants/layout';
import { Post } from '@/data/Post';
import type { ExtendedTheme } from '@/app/_layout';

// Mock data for top performing posts
const mockTopPosts = [
  new Post({
    id: 'top-1',
    caption: 'Our latest product update is getting amazing engagement! 🚀 The new features have been a huge hit with our users.',
    media: ['https://picsum.photos/800/600?random=1'],
    accountTargets: ['instagram-main', 'linkedin-company'],
    loopFolders: ['product-updates'],
  }),
  new Post({
    id: 'top-2',
    caption: 'Meet Sarah, our incredible lead designer! 👩‍💻 She shares her journey and insights on building successful design teams.',
    media: ['https://picsum.photos/800/600?random=2'],
    accountTargets: ['linkedin-company'],
    loopFolders: ['team-culture'],
  }),
  new Post({
    id: 'top-3',
    caption: 'How we helped TechCorp increase their social engagement by 300% in just 3 months! Check out the full case study 📈',
    media: ['https://picsum.photos/800/600?random=3'],
    accountTargets: ['instagram-main', 'linkedin-company', 'facebook-page'],
    loopFolders: ['customer-stories'],
  }),
];

// Initialize all posts as published with different dates
mockTopPosts.forEach((post, index) => {
  post.markAsPublished();
  // Set published dates: 5 days ago, 1 week ago, 2 weeks ago
  const date = new Date();
  date.setDate(date.getDate() - (index === 0 ? 5 : index === 1 ? 7 : 14));
  post.createdAt = date.toISOString();
});

type TopPerformingPostsSectionProps = {
  /**
   * Optional container style overrides
   */
  style?: StyleProp<ViewStyle>;
};

export default function TopPerformingPostsSection({ 
  style,
}: TopPerformingPostsSectionProps) {
  const { spacing } = useThemeStyles();
  const theme = useTheme() as ExtendedTheme;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<Animated.FlatList>(null);
  const hasScrolled = useRef(false);
  const scrollHintX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Wait 2 seconds, then show the scroll hint
    const timer = setTimeout(() => {
      if (!hasScrolled.current && scrollViewRef.current) {
        // Swipe left hint animation
        Animated.sequence([
          // Swipe left
          Animated.timing(scrollHintX, {
            toValue: -30,
            duration: 900,
            useNativeDriver: true,
          }),
          // Bounce back
          Animated.spring(scrollHintX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 10,
            tension: 50,
          }),
        ]).start();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: true,
      listener: () => {
        hasScrolled.current = true;
      },
    }
  );

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    return (
      <FadeSlideInView index={index}>
        <Animated.View style={{ 
          width: cardWidth,
          marginRight: cardSpacing,
          transform: [{ translateX: scrollHintX }],
        }}>
          <PostCard
            post={item}
            onPress={() => {/* Handle post press */}}
            showLoopBadge={false}
            shadowIntensity={0.1}
          />
        </Animated.View>
      </FadeSlideInView>
    );
  };

  // Calculate dimensions for snap scrolling
  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = SCREEN_LAYOUT.content.horizontalPadding;
  const cardSpacing = spacing.md;
  const cardWidth = screenWidth - (2 * horizontalPadding);

  return (
    <View style={[
      {
        marginBottom: SCREEN_LAYOUT.content.sectionSpacing,
        marginHorizontal: -horizontalPadding,
      },
      style,
    ]}>
      <Animated.FlatList
        ref={scrollViewRef}
        horizontal
        data={mockTopPosts}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + cardSpacing}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingRight: screenWidth - cardWidth - horizontalPadding,
        }}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
} 