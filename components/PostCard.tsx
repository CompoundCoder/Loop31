import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  Platform,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
  Easing,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Post } from '../data/Post';
import LoopBadge from '../components/LoopBadge';
import type { ExtendedTheme } from '../app/_layout';

// Mock data for loop colors (in real app, this would come from a Loop service)
const MOCK_LOOP_COLORS: { [key: string]: string } = {
  'product-updates': '#FF6B6B',
  'team-culture': '#4ECDC4',
  'customer-stories': '#45B7D1',
  'industry-news': '#96CEB4',
  'tips-tutorials': '#FFD93D',
};

// Platform icon mapping
const PLATFORM_ICONS: { [key: string]: string } = {
  'instagram-main': 'instagram',
  'facebook-page': 'facebook',
  'linkedin-company': 'linkedin',
  'twitter': 'twitter',
  'tiktok': 'music-note', // Using a generic icon for TikTok
};

type PostCardProps = {
  post: Post;
  onPress?: () => void;
  /**
   * Whether to show loading skeleton
   */
  isLoading?: boolean;
  /**
   * Optional container style overrides
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Optional media container style overrides
   */
  mediaStyle?: StyleProp<ViewStyle>;
  /**
   * Optional caption style overrides
   */
  captionStyle?: StyleProp<TextStyle>;
  /**
   * Optional date style overrides
   */
  dateStyle?: StyleProp<TextStyle>;
  /**
   * Optional background color override
   */
  backgroundColor?: string;
  /**
   * Optional border radius override
   */
  borderRadius?: number;
  /**
   * Optional shadow intensity (0-1)
   */
  shadowIntensity?: number;
  /**
   * Whether to show the loop badge (defaults to true)
   */
  showLoopBadge?: boolean;
};

function PostCard({ 
  post, 
  onPress,
  isLoading = false,
  containerStyle,
  mediaStyle,
  captionStyle,
  dateStyle,
  backgroundColor,
  borderRadius,
  shadowIntensity = 0.1,
  showLoopBadge = true,
}: PostCardProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Get elevation/shadow based on platform
  const getElevation = () => Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  });

  const cardBorderRadius = borderRadius || theme.borderRadius.md || 16;
  const cardBackground = backgroundColor || (theme.dark ? '#1C1C1E' : '#FFFFFF');
  // Slightly smaller radius for inner image and border (not needed for full-bleed)
  // const innerRadius = Math.max(cardBorderRadius - 3, 0);
  // Get loop color for label
  const loopLabelColor = post.loopFolders?.[0] ? MOCK_LOOP_COLORS[post.loopFolders[0]] : undefined;
  const loopLabelText = post.loopFolders?.[0] ? post.loopFolders[0].replace(/-/g, ' ') : '';

  // Format the date in a friendly way
  const formatDate = (date: string, status: string) => {
    const postDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const formattedDate = postDate.toLocaleDateString('en-US', options);
    
    if (status === 'published') {
      return `Published ${formattedDate}`;
    } else if (status === 'scheduled') {
      const timeOfDay = post.scheduledTimeOfDay || 'morning';
      return `Scheduled for ${formattedDate} • ${timeOfDay}`;
    }
    return `Draft • ${formattedDate}`;
  };

  // Full-bleed image with 1.91:1 aspect ratio and rounded corners
  const renderMedia = () => {
    const hasValidMedia = post.media?.length > 0 && post.media[0];
    if (!hasValidMedia) {
      return (
        <View style={[styles.placeholderMedia, { backgroundColor: theme.colors.border, borderTopLeftRadius: cardBorderRadius, borderTopRightRadius: cardBorderRadius, aspectRatio: 1.91 }]}> 
          <MaterialCommunityIcons
            name="image-outline"
            size={32}
            color={theme.colors.background}
            style={[styles.placeholderIcon, { marginBottom: theme.spacing.xs }]}
          />
          <Text style={[
            styles.placeholderText, 
            { 
              color: theme.colors.background,
              fontSize: 14,
              fontWeight: '500',
            }
          ]}>
            No Image
          </Text>
        </View>
      );
    }
    return (
      <View style={{ position: 'relative', aspectRatio: 1.91, width: '100%', overflow: 'hidden', borderTopLeftRadius: cardBorderRadius, borderTopRightRadius: cardBorderRadius }}>
        <Image
          source={{ uri: post.media[0] }}
          style={[
            styles.mediaImage,
            {
              borderTopLeftRadius: cardBorderRadius,
              borderTopRightRadius: cardBorderRadius,
              width: '100%',
              height: '100%',
              ...(loopLabelColor ? { opacity: 0.92 } : {}),
            },
          ]}
          resizeMode="cover"
          onError={() => console.warn(`Failed to load image: ${post.media[0]}`)}
        />
        {/* Loop Label Pill */}
        {loopLabelColor && (
          <View
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              backgroundColor: loopLabelColor + 'E6', // 90% opacity
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              alignSelf: 'flex-start',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: '600',
                fontSize: 14,
                letterSpacing: 0.1,
              }}
              numberOfLines={1}
            >
              {loopLabelText}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          {
            opacity: pressed ? 0.9 : 1,
            backgroundColor: cardBackground,
            borderRadius: cardBorderRadius,
            // Subtle Apple-style shadow
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
              },
              android: {
                elevation: 2,
              },
            }),
          },
          containerStyle,
        ]}
        onPress={onPress}
      >
        {/* Full-bleed Media */}
        <View style={{ overflow: 'hidden', borderTopLeftRadius: cardBorderRadius, borderTopRightRadius: cardBorderRadius }}>
          {renderMedia()}
        </View>
        {/* Minimalist Text Section */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 18 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 6,
              letterSpacing: 0.1,
            }}
            numberOfLines={3}
          >
            {post.caption}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                opacity: 0.65,
                fontWeight: '400',
              }}
              numberOfLines={1}
            >
              {formatDate(post.createdAt, post.status)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {post.accountTargets.map((platform, index) => (
                <MaterialCommunityIcons
                  key={platform}
                  name={PLATFORM_ICONS[platform] as any}
                  size={13}
                  color={theme.colors.text}
                  style={{
                    marginLeft: index > 0 ? 8 : 0,
                    opacity: 0.65,
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default PostCard;

const styles = StyleSheet.create({
  container: {
    borderWidth: 0,
    width: '100%',
    overflow: 'hidden',
  },
  mediaContainer: {
    height: 280,
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderMedia: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    opacity: 0.8,
  },
  placeholderText: {},
  loopBadgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  content: {
    width: '100%',
  },
  caption: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    fontWeight: '400',
  },
  platforms: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {},
  // Skeleton styles
  skeletonCaption: {
    height: 66,
    width: '100%',
  },
  skeletonDate: {
    height: 13,
    width: 120,
  },
  skeletonIcon: {
    height: 16,
    width: 16,
  },
}); 