import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { MOCK_POSTS } from '@/data/mockPosts';
import MiniPostCard from '@/components/posts/MiniPostCard';
import PostPreviewModal from '@/components/posts/PostPreviewModal';
import { LAYOUT } from '@/constants/layout';
import type { Post } from '@/data/mockPosts';

export default function RecentPostsSection() {
    const { colors, spacing, typography } = useThemeStyles();
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const recentPosts = MOCK_POSTS.slice(0, 5);

    const handleSeeAll = () => console.log('Navigate to all posts');
    const handleAddToLoop = (postId: string) => console.log(`Add ${postId} to a loop`);
    const handleDelete = (postId: string) => console.log(`Delete ${postId}`);

    return (
        <View>
            <View style={[styles.header, { marginBottom: spacing.md }]}>
                <Text style={{ fontSize: typography.fontSize.title, fontWeight: '600', color: colors.text }}>
                    Your Recent Posts
                </Text>
            </View>

            {recentPosts.length === 0 ? (
                <View style={[styles.emptyState]}>
                    <Text style={{color: colors.text}}>No recent posts yet.</Text>
                    <Text style={{color: colors.text, opacity: 0.7, marginTop: spacing.sm}}>Start by creating a new post!</Text>
                </View>
            ) : (
                <FlatList
                    data={recentPosts}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => setSelectedPost(item)}>
                            <MiniPostCard post={item} />
                        </Pressable>
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -LAYOUT.screen.horizontalPadding }}
                    contentContainerStyle={{
                        paddingHorizontal: LAYOUT.screen.horizontalPadding,
                        paddingBottom: spacing.md,
                    }}
                    ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                />
            )}
            <PostPreviewModal 
                post={selectedPost}
                isVisible={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                onAddToLoop={handleAddToLoop}
                onDelete={handleDelete}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyState: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: LAYOUT.screen.horizontalPadding,
    },
}); 