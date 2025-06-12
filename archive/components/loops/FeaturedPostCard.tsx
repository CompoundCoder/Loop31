import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';

// Using the placeholder Post type defined in [loopId].tsx for now
// Ideally, this would be a shared type definition
interface Post {
  id: string;
  previewImageUrl?: string;
  caption: string;
  postCount?: number;
}

interface FeaturedPostCardProps {
  post: Post;
}

const PLACEHOLDER_COLORS = ['#E07A5F', '#81B29A', '#A5A58D', '#B0A8B9', '#F2CC8F'];

// Simple hash function to get a number from string for color selection
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const { width: screenWidth } = Dimensions.get('window');

const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({ post }) => {
  const themeStyles = useThemeStyles();
  const styles = createStyles(themeStyles);

  if (!post) return null; 
  
  const colorIndex = simpleHash(post.id) % PLACEHOLDER_COLORS.length;
  const placeholderColor = PLACEHOLDER_COLORS[colorIndex];

  return (
    // Outer shadow view
    <View style={styles.shadowWrapper}>
      {/* Inner content view */}
      <View style={styles.cardContainer}>
        {/* Placeholder View for image */}
        <View style={[styles.imagePlaceholder, { backgroundColor: placeholderColor }]}>
          {/* Placeholder text or icon */}
        </View>

        {/* Caption Section */}
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText} numberOfLines={2} ellipsizeMode="tail">
              {post.caption}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: ThemeStyles) => {
  const { colors, spacing, borderRadius, elevation } = theme; // Ensure elevation is available
  return StyleSheet.create({
    shadowWrapper: { // NEW style for outer shadow view
      ...(elevation as object), // Apply shadow here
      marginBottom: spacing.lg, // Apply margin here instead of inner card
    },
    cardContainer: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      // marginBottom: spacing.lg, // Margin moved to wrapper
      // ...(elevation as object), // Shadow moved to wrapper
      overflow: 'hidden', // RESTORE overflow hidden for clipping content
    },
    image: {
      width: '100%',        
      aspectRatio: 5 / 4,     // Match MiniCard aspect ratio (1.25)
    },
    imagePlaceholder: {
      width: '100%',        
      aspectRatio: 5 / 4,     // Match MiniCard aspect ratio (1.25)
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePlaceholderText: {
      color: 'rgba(0,0,0,0.5)', // Text color for placeholder (if used)
      fontSize: 16,
      fontWeight: 'bold',
    },
    captionContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      minHeight: (18 * 2) + (10 * 2),
    },
    captionText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 18,
      textAlign: 'left',
    },
  });
};

export default FeaturedPostCard; 