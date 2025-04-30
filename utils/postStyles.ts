import { Post } from '@/data/Post';
import type { ExtendedTheme } from '@/app/_layout';

// Mock data for loop colors (in real app, this would come from a Loop service)
export const MOCK_LOOP_COLORS: { [key: string]: string } = {
  'product-updates': '#FF6B6B',
  'team-culture': '#4ECDC4',
  'customer-stories': '#45B7D1',
  'industry-news': '#96CEB4',
  'tips-tutorials': '#FFD93D',
};

type PostCardStyles = {
  backgroundColor: string;
  borderWidth: number;
};

/**
 * Get the background color and border style for a post based on its loop folder
 * @param post The post to get styles for
 * @param theme The current theme
 * @returns Object containing backgroundColor and borderWidth
 */
export const getPostCardStyles = (post: Post, theme: ExtendedTheme): PostCardStyles => {
  // Default styles (system theme)
  const defaultStyles: PostCardStyles = {
    backgroundColor: theme.colors.card,
    borderWidth: 1
  };

  // If no loop folders, return default
  if (!post.loopFolders?.length) {
    return defaultStyles;
  }

  const loopFolder = post.loopFolders[0];
  const loopColor = MOCK_LOOP_COLORS[loopFolder];

  // Development-only detailed warnings
  if (__DEV__) {
    if (!loopFolder) {
      console.warn(
        '🎨 Post Style Warning:\n' +
        'Loop folder array exists but first item is undefined.\n' +
        `Post ID: ${post.id}\n` +
        'Falling back to default system styling.'
      );
      return defaultStyles;
    }

    if (!loopColor) {
      console.warn(
        '🎨 Post Style Warning:\n' +
        `No color defined for loop folder: "${loopFolder}"\n` +
        `Post ID: ${post.id}\n` +
        'Available loop folders: ' + Object.keys(MOCK_LOOP_COLORS).join(', ') + '\n' +
        'Falling back to default system styling.'
      );
      return defaultStyles;
    }
  }

  // Return loop-specific styles
  return {
    backgroundColor: `${loopColor}66`,
    borderWidth: 0
  };
}; 