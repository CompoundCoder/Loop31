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
import { useThemeStyles } from '@/hooks/useThemeStyles';
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
  showLoopBadge = true,
}: PostCardProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const { elevation } = useThemeStyles();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const renderMedia = () => {
    const hasValidMedia = post.media?.length > 0 && post.media[0];
    // const mediaContainerHeight = 170; // Remove fixed height

    if (!hasValidMedia) {
      return (
        // Use aspectRatio for placeholder
        <View style={[styles.placeholderMedia, { 
            backgroundColor: theme.colors.border, 
            borderTopLeftRadius: cardBorderRadius, 
            borderTopRightRadius: cardBorderRadius, 
            // height: mediaContainerHeight, // Removed fixed height
            aspectRatio: 7 / 5, // <-- Set 7:5 aspect ratio
            width: '100%', 
        }]}> 
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
      // Re-add aspectRatio, remove fixed height
      <View style={{ 
          position: 'relative', 
          aspectRatio: 7 / 5, // <-- Set 7:5 aspect ratio
          // height: mediaContainerHeight, // Removed fixed height
          width: '100%', 
          overflow: 'hidden', 
          borderTopLeftRadius: cardBorderRadius, 
          borderTopRightRadius: cardBorderRadius 
      }}>
        <Image
          source={{ uri: post.media[0] }}
          style={[
            styles.mediaImage,
            {
              // Keep radii, width/height 100% to fill container
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
    // Remove height constraints from Animated.View and Pressable
    <Animated.View style={{ opacity }}> 
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [
          styles.container, // Ensure flexDirection: column is still set here if needed (default)
          {
            borderRadius: cardBorderRadius,
            backgroundColor: cardBackground,
            opacity: pressed ? 0.85 : 1,
            // height: '100%', // Removed fixed height
          },
          elevation,
          containerStyle,
        ]}
        disabled={isLoading}
      >
        {renderMedia()}

        {/* Remove fixed height from content area */}
        <View style={styles.contentArea}>
          {/* Apply fixed height to caption Text */}
          <Text 
            style={[
              styles.caption,
              { 
                color: theme.colors.text,
                height: 66, // <-- Apply fixed height (lineHeight * 3)
              },
              captionStyle
            ]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {post.caption}
          </Text>

          {/* Metadata row will now sit naturally below caption */}
          <View style={styles.metadataRow}>
            <Text style={[
              styles.dateText,
              {
                color: theme.dark ? theme.colors.border : theme.colors.text + '99',
              },
              dateStyle
            ]}>
              {formatDate(post.createdAt, post.status)}
            </Text>

            <View style={styles.platformIconsContainer}>
              {post.accountTargets?.map(platform => (
                <MaterialCommunityIcons
                  key={platform}
                  name={(PLATFORM_ICONS[platform] || 'help-circle') as any} 
                  size={16}
                  color={theme.dark ? theme.colors.border : theme.colors.text + '99'}
                  style={{ marginLeft: theme.spacing.xs }}
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
    overflow: 'hidden',
    // flexDirection: 'column', // Keep if needed, or remove if default is fine
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
    marginBottom: 8, // Keep margin below caption area before metadata
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
  contentArea: {
    padding: 12, 
    // Remove justifyContent, height is determined by content now
    // justifyContent: 'space-between', 
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 8, // This margin might now be handled by caption's marginBottom
  },
  dateText: {
    fontSize: 14,
    opacity: 0.65,
    fontWeight: '400',
  },
  platformIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 