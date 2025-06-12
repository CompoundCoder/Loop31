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
import { Post, MOCK_POSTS } from '@/data/mockPosts';
import type { ExtendedTheme } from '@/app/_layout';

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
    const adaptedPostData: any = {
      id: item.id,
      caption: item.caption,
      imageUrl: item.imageUrl, 
      media: item.imageUrl ? [item.imageUrl] : [], 
      platforms: item.platforms, 
      scheduledDate: null,
      scheduledTimeOfDay: null,
      accountTargets: [],
      loopFolders: [],
      status: 'draft' as ('draft' | 'scheduled' | 'published' | 'deleted'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: null,
      stats: { views: 0, likes: 0, comments: 0 }, 
      markAsPublished: () => { console.warn('Attempted to call dummy markAsPublished'); },
      markAsDraft: () => { console.warn('Attempted to call dummy markAsDraft'); },
      _updateTimestamp: () => { console.warn('Attempted to call DUMMY _updateTimestamp'); },
      updateCaption: (_caption: string) => { console.warn('Attempted to call dummy updateCaption'); },
      addMedia: (_mediaUri: string) => { console.warn('Attempted to call dummy addMedia'); },
      removeMedia: (_mediaUri: string) => { console.warn('Attempted to call dummy removeMedia'); },
      addAccountTarget: (_target: string) => { console.warn('Attempted to call dummy addAccountTarget'); },
      removeAccountTarget: (_target: string) => { console.warn('Attempted to call dummy removeAccountTarget'); },
      schedule: null,
      toJSON: () => { 
        console.warn('Attempted to call dummy toJSON'); 
        return { 
          id: item.id, 
          caption: item.caption, 
          imageUrl: item.imageUrl, 
          platforms: item.platforms 
        };
      }, 
    };

    return (
      <FadeSlideInView index={index}>
        <Reanimated.View style={[
          hintAnimatedStyle,
          { 
            width: cardWidth,
            marginRight: cardSpacing,
          }
        ]}>
          {/* Pass the adapted data structure to PostCard */}
          <PostCard
            post={adaptedPostData} // <-- Use adapted data
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
        data={MOCK_POSTS}
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