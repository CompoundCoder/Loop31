import React, { useRef, useEffect, useCallback } from 'react';
import { View, ViewStyle, StyleProp, Dimensions, Platform } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
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

  // Use Reanimated Shared Values
  const scrollX = useSharedValue(0);
  const scrollHintX = useSharedValue(0);
  
  // Ref for the FlatList (Update type)
  const scrollViewRef = useRef<Reanimated.FlatList<Post>>(null);
  const hasScrolled = useRef(false);

  // Function to set hasScrolled on JS thread
  const setHasScrolled = useCallback(() => {
    hasScrolled.current = true;
  }, []);

  // Reanimated Scroll Handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      // Update ref on JS thread using runOnJS
      runOnJS(setHasScrolled)();
    },
  });

  // Hint Animation Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasScrolled.current && scrollViewRef.current) {
        // Use Reanimated sequence
        scrollHintX.value = withSequence(
          withTiming(-30, { duration: 900 }),
          // Use Reanimated v2/v3 spring config
          withSpring(0, { 
            damping: 15, // Adjust damping for desired bounce
            stiffness: 120, // Adjust stiffness for speed
            // mass: 1, // Default is 1, usually fine
          })
        );
      }
    }, 2000);
    return () => clearTimeout(timer);
  // Keep dependencies minimal, scrollHintX changes don't trigger effect
  }, []);

  // Calculate dimensions for snap scrolling
  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = SCREEN_LAYOUT.content.horizontalPadding;
  const cardSpacing = spacing.md;
  const cardWidth = screenWidth - (2 * horizontalPadding);

  // Animated style for the hint
  const hintAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: scrollHintX.value }] };
  });

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    return (
      <FadeSlideInView index={index}>
        <Reanimated.View style={[
          hintAnimatedStyle,
          { 
            width: cardWidth,
            marginRight: cardSpacing,
          }
        ]}>
          <PostCard
            post={item}
            onPress={() => {/* Handle post press */}}
            showLoopBadge={false}
          />
        </Reanimated.View>
      </FadeSlideInView>
    );
  };

  return (
    <View style={[
      {
        marginBottom: SCREEN_LAYOUT.content.sectionSpacing,
        marginHorizontal: -horizontalPadding,
      },
      style,
    ]}>
      <Reanimated.FlatList
        ref={scrollViewRef}
        horizontal
        data={mockTopPosts}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + cardSpacing}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={scrollHandler}
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