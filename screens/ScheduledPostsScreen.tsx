import { View, StyleSheet, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../components/PostCard';
import AnimatedHeader from '../components/AnimatedHeader';
import { useRef, useState, useCallback } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Platform {
  id: string;
  type: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ScheduledPost {
  id: string;
  caption: string;
  media: string[];
  platforms: string[];
  scheduledDate: string;
  createdAt: string;
}

function getPlatformMeta(id: string): Platform {
  const platformKey = id.slice(0, 2).toLowerCase(); // "ig", "fb", etc.
  switch (platformKey) {
    case 'ig':
      return { id, type: 'instagram', name: 'Instagram', icon: 'logo-instagram' };
    case 'fb':
      return { id, type: 'facebook', name: 'Facebook', icon: 'logo-facebook' };
    case 'tw':
      return { id, type: 'twitter', name: 'Twitter', icon: 'logo-twitter' };
    case 'li':
      return { id, type: 'linkedin', name: 'LinkedIn', icon: 'logo-linkedin' };
    case 'tt':
      return { id, type: 'tiktok', name: 'TikTok', icon: 'logo-tiktok' };
    default:
      return { id, type: 'unknown', name: 'Unknown', icon: 'share-social' };
  }
}

const getPlatformIconName = (id: string): keyof typeof Ionicons.glyphMap => {
  const base = id.split('_')[0]; // Extracts "ig" from "ig1"
  switch (base) {
    case 'ig':
      return 'logo-instagram';
    case 'fb':
      return 'logo-facebook';
    case 'tw':
      return 'logo-twitter';
    case 'tt':
      return 'logo-tiktok';
    case 'li':
      return 'logo-linkedin';
    default:
      return 'share-social';
  }
};

const getPlatformType = (id: string): string => {
  const base = id.split('_')[0];
  switch (base) {
    case 'ig':
      return 'instagram';
    case 'fb':
      return 'facebook';
    case 'tw':
      return 'twitter';
    case 'tt':
      return 'tiktok';
    case 'li':
      return 'linkedin';
    default:
      return 'other';
  }
};

const getPlatformName = (id: string): string => {
  const base = id.split('_')[0];
  switch (base) {
    case 'ig':
      return 'Instagram';
    case 'fb':
      return 'Facebook';
    case 'tw':
      return 'Twitter';
    case 'tt':
      return 'TikTok';
    case 'li':
      return 'LinkedIn';
    default:
      return 'Other';
  }
};

export default function ScheduledPostsScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      console.log('Loading posts from AsyncStorage...');
      setIsLoading(true);
      setError(null);
      
      const postsJson = await AsyncStorage.getItem('scheduled_posts');
      console.log('Posts from storage:', postsJson);
      
      if (postsJson) {
        const loadedPosts = JSON.parse(postsJson);
        console.log('Parsed posts:', loadedPosts);
        setPosts(loadedPosts);
      } else {
        console.log('No posts found in storage');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, loading posts...');
      loadPosts();
    }, [loadPosts])
  );

  const handleEdit = (postId: string) => {
    console.log('Edit post:', postId);
  };

  const handleDelete = async (postId: string) => {
    try {
      console.log('Deleting post:', postId);
      setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
      
      const updatedPosts = posts.filter(post => post.id !== postId);
      await AsyncStorage.setItem('scheduled_posts', JSON.stringify(updatedPosts));
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      loadPosts();
    }
  };

  const handlePost = (postId: string) => {
    console.log('Post now:', postId);
  };

  const renderPost = ({ item }: { item: ScheduledPost }) => {
    console.log('Rendering post:', item.id);
    const platformObjects = item.platforms.map(getPlatformMeta);

    return (
      <PostCard
        mediaUri={item.media[0] || ''}
        caption={item.caption}
        platforms={platformObjects}
        date={new Date(item.scheduledDate)}
        status="scheduled"
        onPost={() => handlePost(item.id)}
        onEdit={() => handleEdit(item.id)}
        onDelete={() => handleDelete(item.id)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No scheduled posts yet</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnimatedHeader 
        title="Schedule" 
        titleStyle={styles.headerTitle}
      />
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={renderEmptyState()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  headerTitle: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 60,
    paddingHorizontal: 0,
    paddingBottom: 90,
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 