import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';

// Placeholder Post type - should be a shared type
interface Post {
  id: string;
  previewImageUrl?: string;
  caption: string;
  postCount?: number;
}

interface MiniPostCardProps {
  post: Post;
  cardWidth: number; // To help with sizing in a grid
}

const PLACEHOLDER_COLORS = ['#E07A5F', '#81B29A', '#A5A58D', '#B0A8B9', '#F2CC8F'];

// Simple hash function (can be moved to a util if used elsewhere)
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return Math.abs(hash);
};

const MiniPostCard: React.FC<MiniPostCardProps> = ({ post, cardWidth }) => {
  const themeStyles = useThemeStyles();
  const styles = createStyles(themeStyles, cardWidth);

  // Determine placeholder color based on post ID
  const colorIndex = simpleHash(post.id) % PLACEHOLDER_COLORS.length;
  const placeholderColor = PLACEHOLDER_COLORS[colorIndex];

  return (
    // Outer shadow view
    <View style={styles.shadowWrapper}>
      {/* Inner content view */}
      <View style={styles.cardContainer}>
        <View style={[styles.imageWrapper, { backgroundColor: placeholderColor }]}>
          {/* --- TEMPORARILY RENDER COLORED PLACEHOLDER INSTEAD OF IMAGE --- */}
           {/* Optionally add text overlay or icon */}
           {/* <Text style={styles.imagePlaceholderText}>ID: {post.id.substring(0,3)}</Text> */}
          
          {/* --- IMAGE RENDERING (COMMENTED OUT) ---
          {post.previewImageUrl ? (
            <Image 
              source={{ uri: post.previewImageUrl }} 
              style={styles.image} 
              resizeMode="cover" 
              // Remove logs as Image is not rendered
              // onError={(error) => { ... }}
              // onLoad={() => { ... }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Img</Text>
            </View>
          )}
           --- END IMAGE RENDERING --- */}
        </View>

        {/* 1-line caption snippet */}
        {post.caption && (
          <Text style={styles.captionText} numberOfLines={2} ellipsizeMode="tail">
            {post.caption}
          </Text>
        )}

        {/* REMOVE Post Count Indicator Start */}
        {/* {typeof post.postCount === 'number' && (
          <View style={styles.postCountBadge}>
            <Text style={styles.postCountText}>{post.postCount}</Text>
          </View>
        )} */}
        {/* REMOVE Post Count Indicator End */}
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeStyles, cardWidth: number) => {
  const { colors, spacing, borderRadius, elevation } = theme; // Ensure elevation is available
  return StyleSheet.create({
    shadowWrapper: {
       ...(elevation as object),
    },
    cardContainer: {
      width: cardWidth,
      backgroundColor: colors.card,
      borderRadius: borderRadius.sm,
      overflow: 'hidden', // Keep overflow hidden for content clipping
      position: 'relative', 
      paddingBottom: spacing.sm,
    },
    imageWrapper: {
      width: '100%',
      height: cardWidth * 0.8, 
      marginBottom: spacing.xs,
      // borderRadius: theme.borderRadius.sm, // REMOVE radius from wrapper
      // overflow: 'hidden', // Not needed here if container handles it
      // backgroundColor set dynamically
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: { // (Currently unused but for future reference)
      flex: 1, 
      // borderRadius: theme.borderRadius.sm, // REMOVE radius from image itself too
    },
    imagePlaceholder: { // (Currently unused)
       // ... no radius needed here either ...
    },
    imagePlaceholderText: {
      color: 'rgba(0,0,0,0.5)', // Text color for placeholder (if used)
      fontSize: 10,
      fontWeight: 'bold',
    },
    captionText: {
      color: colors.text, 
      opacity: 0.6, 
      paddingHorizontal: spacing.sm,
      fontSize: 12,
      lineHeight: 16,
      textAlign: 'left',
      minHeight: 16 * 2,
    },
    // REMOVE postCountBadge style start
    /*
    postCountBadge: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      backgroundColor: colors.accent,
      width: 20, 
      height: 20, 
      borderRadius: 10, 
      justifyContent: 'center',
      alignItems: 'center',
    },
    */
    // REMOVE postCountBadge style end
    // REMOVE postCountText style start
    /*
    postCountText: {
      color: colors.card, 
      fontSize: 9,
      fontWeight: 'bold',
    },
    */
   // REMOVE postCountText style end
  });
};

export default MiniPostCard; 