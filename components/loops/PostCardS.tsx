import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Reanimated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';

export interface Post {
  id: string;
  previewImageUrl?: string;
  caption: string;
}

export interface PostCardSProps {
  post: Post;
  variant?: 'featured' | 'mini';
  cardWidth?: number;
  onLongPress?: () => void;
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
      {post.previewImageUrl ? (
        <Image source={{ uri: post.previewImageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: placeholderColor }]} />
      )}
      {post.caption && variant === 'featured' && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText} numberOfLines={2} ellipsizeMode="tail">
            {post.caption}
          </Text>
        </View>
      )}
      {post.caption && variant === 'mini' && (
        <View style={styles.miniCaptionContainer}>
          <Text style={styles.miniCaptionText} numberOfLines={2} ellipsizeMode="tail">
            {post.caption}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Reanimated.View style={[styles.shadowWrapper, dragAnimatedStyle]}>
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.9}>
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
      ...(elevation as object),
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
    image: {
      width: '100%',
      aspectRatio: variant === 'featured' ? 7 / 5 : 5 / 4,
      flexShrink: 0,
    },
    imagePlaceholder: {
      width: '100%',
      aspectRatio: variant === 'featured' ? 7 / 5 : 5 / 4,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    captionContainer: { 
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md, 
      minHeight: (18 * 2) + (spacing.sm * 2),
    },
    captionText: { 
      color: colors.text,
      fontSize: 14,
      lineHeight: 18,
      textAlign: 'left',
    },
    miniCaptionContainer: { 
      paddingHorizontal: spacing.xs,
      paddingVertical: 4,
      alignItems: 'center',
      width: '100%',
      minHeight: 32,
      justifyContent: 'center',
    },
    miniCaptionText: { 
      color: colors.text,
      fontSize: 12,
      lineHeight: 16,
      textAlign: 'center',
    },
  });
};

export default PostCardS; 