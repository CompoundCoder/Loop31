import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { Post } from '@/data/mockPosts';
import { formatDistanceToNow } from 'date-fns';

type MiniPostCardProps = {
  post: Post;
};

export default function MiniPostCard({ post }: MiniPostCardProps) {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.55;

  // MOCK: createdAt doesn't exist on this Post type, so we fake it.
  const createdAt = new Date();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderRadius: borderRadius.lg, width: cardWidth, ...elevation.md }]}>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={[styles.image, { aspectRatio: 7 / 5, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg }]} />
      )}
      <View style={styles.content}>
        <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2}>{post.caption}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.date, { color: colors.text, opacity: 0.7 }]}>
            {formatDistanceToNow(createdAt, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
    minHeight: 36, // Ensures space for 2 lines
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  date: {
    fontSize: 12,
  },
}); 