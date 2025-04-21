import { View, StyleSheet, FlatList, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../components/PostCard';
import AnimatedHeader from '../components/AnimatedHeader';
import { useRef, useState, useCallback } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { publishPost } from '../utils/postPublisher';

type RootStackParamList = {
  CreatePostScreen: {
    mode: 'schedule' | 'loop';
    post?: ScheduledPost;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
  const navigation = useNavigation<NavigationProp>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      console.log('Loading posts from AsyncStorage...');
      setIsLoading(true);
      setError(null);
      
      const postsJson = await AsyncStorage.getItem('scheduledPosts');
      console.log('Posts from storage:', postsJson);
      
      const loadedPosts = postsJson ? JSON.parse(postsJson) || [] : [];
      console.log('Parsed posts:', loadedPosts);
      setPosts(Array.isArray(loadedPosts) ? loadedPosts : []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      setError('Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, checking for due posts...');
      loadPosts();
    }, [loadPosts])
  );

  const handleDelete = async (postId: string) => {
    try {
      console.log('Deleting post:', postId);
      const updatedPosts = (posts || []).filter(post => post.id !== postId);
      setPosts(updatedPosts);
      await AsyncStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts));
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      loadPosts();
    }
  };

  const handlePost = async (postId: string) => {
    try {
      console.log('Publishing post:', postId);
      
      const postToPublish = (posts || []).find(post => post.id === postId);
      if (!postToPublish) {
        console.error('Post not found for publishing:', postId);
        return;
      }

      await publishPost(postToPublish);
      
      const updatedPosts = (posts || []).filter(post => post.id !== postId);
      setPosts(updatedPosts);
      await AsyncStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts));
      
      console.log('Post published successfully:', postId);
    } catch (error) {
      console.error('Error publishing post:', error);
      Alert.alert(
        'Error',
        'Failed to publish post. Please try again.',
        [{ text: 'OK' }]
      );
      loadPosts();
    }
  };

  const renderPost = ({ item }: { item: ScheduledPost }) => {
    console.log('Rendering post:', item.id);
    const platformObjects = (item.platforms || []).map(getPlatformMeta);

    return (
      <PostCard
        mediaUri={item.media?.[0] || ''}
        caption={item.caption}
        platforms={platformObjects}
        date={new Date(item.scheduledDate)}
        status="scheduled"
        onPost={() => handlePost(item.id)}
        onEdit={() => navigation.navigate('CreatePostScreen', { 
          mode: 'schedule',
          post: item,
        })}
        onDelete={() => handleDelete(item.id)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No scheduled posts</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Scheduled Posts</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreatePostScreen', { mode: 'schedule' })}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts || []}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 