import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import { Post } from '@/data/Post';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  size: 'mini' | 'full';
  showMetrics?: boolean;
  onPress?: () => void;
  onEditPress?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  size,
  showMetrics = false,
  onPress,
  onEditPress,
}) => {
  const theme = useThemeStyles();
  const styles = useStyles(theme, size);

  const imageUri = post.media && post.media.length > 0 ? post.media[0] : null;

  const renderMetrics = () => {
    if (!showMetrics) return null;

    // Mock data for metrics as it's not in the Post model yet
    const views = '1.2k';
    const likes = '34';
    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

    return (
      <View style={styles.metricsContainer}>
        <View style={styles.platformIcons}>
          {post.accountTargets?.map(icon => (
            <Ionicons key={icon} name="logo-twitter" size={16} color={theme.colors.text} style={{ marginRight: theme.spacing.sm }} />
          ))}
        </View>
        <Text style={styles.metricsText}>{`${views} views · ${likes} likes · ${timeAgo}`}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={40} color={theme.colors.border} />
        </View>
      )}

      {post.caption && (
        <Text style={styles.caption} numberOfLines={size === 'mini' ? 2 : 3}>
          {post.caption}
        </Text>
      )}

      {renderMetrics()}

      {onEditPress && (
        <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const useStyles = (theme: ThemeStyles, size: 'mini' | 'full') => {
  const { colors, spacing, borderRadius, typography } = theme;
  const isMini = size === 'mini';
  const cardWidth = isMini ? (Dimensions.get('window').width / 2) - (spacing.md * 1.5) : '100%';

  return StyleSheet.create({
    container: {
      width: cardWidth,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      marginBottom: spacing.lg,
      ...theme.elevation.sm,
    },
    image: {
      width: '100%',
      aspectRatio: isMini ? 1 : 16 / 9,
    },
    imagePlaceholder: {
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    caption: {
      ...typography.body,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: isMini ? 12 : 14,
    },
    metricsContainer: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    platformIcons: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
    },
    metricsText: {
      ...typography.caption,
      color: colors.text + '99',
      fontSize: 12,
    },
    editButton: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      padding: spacing.xs,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: borderRadius.full,
    },
  });
};

export default PostCard; 