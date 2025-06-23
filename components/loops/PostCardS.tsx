import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Pressable } from 'react-native';
import Reanimated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import * as typography from '@/presets/typography';
import { ImageSourcePropType } from 'react-native';
import { PostDisplayData } from '@/app/(loops)/[loopId]';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export interface Post {
  id: string;
  imageSource?: ImageSourcePropType;
  caption: string;
}

export interface PostCardSProps {
  post: PostDisplayData;
  variant?: 'featured' | 'mini';
  cardWidth?: number;
  onLongPress?: (post: PostDisplayData) => void;
  isBeingDragged?: boolean;
  onPress?: () => void;
}

const PLACEHOLDER_COLORS = ['#E07A5F', '#81B29A', '#A5A58D', '#B0A8B9', '#F2CC8F'];
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

const { width: screenWidth } = Dimensions.get('window');

const PostCardS: React.FC<PostCardSProps> = React.memo(({
  post,
  variant = 'featured',
  cardWidth,
  onLongPress,
  isBeingDragged,
  onPress,
}) => {
  const themeStyles = useThemeStyles();
  const styles = React.useMemo(() => createStyles(themeStyles, variant, cardWidth), [themeStyles, variant, cardWidth]);

  if (!post) return null;

  const colorIndex = simpleHash(post.id) % PLACEHOLDER_COLORS.length;
  const placeholderColor = PLACEHOLDER_COLORS[colorIndex];

  const dragAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: isBeingDragged ? withTiming(0.7) : withTiming(1),
      transform: [{ scale: isBeingDragged ? withTiming(1.03) : withTiming(1) }],
    };
  });

  const content = (
    <View style={styles.cardContainer}>
      <View style={[styles.imageContainer, { backgroundColor: themeStyles.colors.background }]}>
        {post.imageSource && typeof post.imageSource === 'object' && 'uri' in post.imageSource && post.imageSource.uri ? (
          <Image
            source={post.imageSource}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons name="image-off-outline" size={32} color={themeStyles.colors.tabInactive} />
          </View>
        )}
      </View>
      {post.caption && variant === 'featured' && (
        <View style={styles.captionContainer}>
          <Text style={typography.captionSmall} numberOfLines={2} ellipsizeMode="tail">
            {post.caption}
          </Text>
        </View>
      )}
      {post.caption && variant === 'mini' && (
        <View style={styles.miniCaptionContainer}>
          <Text style={typography.captionSmall} numberOfLines={2} ellipsizeMode="tail">
            {post.caption}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Reanimated.View style={[styles.shadowWrapper, dragAnimatedStyle]}>
      <TouchableOpacity onPress={onPress} onLongPress={() => onLongPress?.(post)} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    </Reanimated.View>
  );
});

const createStyles = (theme: ThemeStyles, variant: 'featured' | 'mini', cardWidth?: number) => {
  const { colors, spacing, borderRadius, elevation } = theme;
  const baseCardWidth = variant === 'mini' && cardWidth ? cardWidth : screenWidth - (spacing.md * 2);

  return StyleSheet.create({
    shadowWrapper: {
      ...(variant === 'featured'
        ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
          }
        : elevation),
      width: '100%',
    },
    cardContainer: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      width: '100%',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    container: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 7/5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    textContainer: {
      padding: 12,
    },
    captionContainer: { 
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md, 
      minHeight: (18 * 2) + (spacing.sm * 2),
    },
    miniCaptionContainer: { 
      paddingHorizontal: spacing.xs,
      paddingVertical: 4,
      alignItems: 'center',
      width: '100%',
      minHeight: 32,
      justifyContent: 'center',
    },
    featuredIndicator: {
      position: 'absolute',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }
  });
};

export default PostCardS; 