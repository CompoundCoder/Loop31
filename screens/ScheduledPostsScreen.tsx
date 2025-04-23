import { View, StyleSheet, FlatList, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../components/PostCard';
import AnimatedHeader from '../components/AnimatedHeader';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { publishPost } from '../utils/postPublisher';
import type { Loop, Post } from '../types/Loop';

type RootStackParamList = {
  CreatePostScreen: {
    mode: 'schedule' | 'loop';
    post?: ScheduledPost;
    existingPost?: {
      id: string;
      caption: string;
      mediaUri: string;
      createdAt: string;
      scheduledDate: string;
      platforms: string[];
    };
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
  mediaUri: string;
  platforms: string[];
  scheduledDate: string;
  createdAt: string;
}

interface DeletedPost extends ScheduledPost {
  deletedAt: string;
  originType: 'scheduled' | 'draft';
  source?: 'scheduledDrafts';
}

const DELETED_POSTS_KEY = 'deletedPosts';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const filterExpiredPosts = (posts: DeletedPost[]): DeletedPost[] => {
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
  return posts.filter(post => {
    const deletedAt = new Date(post.deletedAt);
    return deletedAt > thirtyDaysAgo;
  });
};

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
  const [showDrafts, setShowDrafts] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [deletedPosts, setDeletedPosts] = useState<DeletedPost[]>([]);

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (showTrash) {
        const deletedPostsJson = await AsyncStorage.getItem(DELETED_POSTS_KEY);
        let loadedPosts: DeletedPost[] = deletedPostsJson ? JSON.parse(deletedPostsJson) : [];
        
        // Filter out expired posts
        const validPosts = filterExpiredPosts(loadedPosts);
        
        // If we filtered any posts, update storage
        if (validPosts.length !== loadedPosts.length) {
          await AsyncStorage.setItem(DELETED_POSTS_KEY, JSON.stringify(validPosts));
          loadedPosts = validPosts;
        }
        
        setDeletedPosts(loadedPosts);
      } else {
        const storageKey = showDrafts ? 'scheduledDrafts' : 'scheduledPosts';
        const postsJson = await AsyncStorage.getItem(storageKey);
        const loadedPosts = postsJson ? JSON.parse(postsJson) : [];
        setPosts(Array.isArray(loadedPosts) ? loadedPosts : []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [showDrafts, showTrash]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const handleMoveToTrash = async (post: ScheduledPost) => {
    try {
      // Create deleted post entry with metadata
      const deletedPost: DeletedPost = {
        ...post,
        deletedAt: new Date().toISOString(),
        originType: showDrafts ? 'draft' : 'scheduled',
        ...(showDrafts && { source: 'scheduledDrafts' })
      };

      // Add to deleted posts
      const deletedPostsJson = await AsyncStorage.getItem(DELETED_POSTS_KEY);
      const existingDeletedPosts: DeletedPost[] = deletedPostsJson ? JSON.parse(deletedPostsJson) : [];
      
      // Filter out any expired posts while we're here
      const validDeletedPosts = filterExpiredPosts(existingDeletedPosts);
      
      // Add new deleted post and save
      await AsyncStorage.setItem(
        DELETED_POSTS_KEY, 
        JSON.stringify([...validDeletedPosts, deletedPost])
      );

      // Remove from original list
      const updatedPosts = posts.filter(p => p.id !== post.id);
      const storageKey = showDrafts ? 'scheduledDrafts' : 'scheduledPosts';
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedPosts));
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error moving post to trash:', error);
      Alert.alert('Error', 'Failed to move post to trash');
    }
  };

  const handleRestore = async (post: DeletedPost) => {
    try {
      // Remove from deleted posts
      const updatedDeletedPosts = deletedPosts.filter(p => p.id !== post.id);
      await AsyncStorage.setItem(DELETED_POSTS_KEY, JSON.stringify(updatedDeletedPosts));
      setDeletedPosts(updatedDeletedPosts);

      // Extract restoration data
      const { deletedAt, originType, source, ...restoredPost } = post;

      // Restore to original location
      const storageKey = originType === 'draft' ? 'scheduledDrafts' : 'scheduledPosts';
      const currentPostsJson = await AsyncStorage.getItem(storageKey);
      const currentPosts: ScheduledPost[] = currentPostsJson ? JSON.parse(currentPostsJson) : [];
      
      // Check for duplicates
      const isDuplicate = currentPosts.some(p => p.id === restoredPost.id);
      if (!isDuplicate) {
        await AsyncStorage.setItem(storageKey, JSON.stringify([...currentPosts, restoredPost]));
      }

      // Refresh the screen
      loadPosts();
    } catch (error) {
      console.error('Error restoring post:', error);
      Alert.alert('Error', 'Failed to restore post');
    }
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      'Move to Trash?',
      'This will not permanently delete the post.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Move to Trash',
          style: 'destructive',
          onPress: () => {
            const post = posts.find(p => p.id === postId);
            if (post) {
              handleMoveToTrash(post);
            }
          }
        }
      ]
    );
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

  const handleEdit = (post: ScheduledPost) => {
    navigation.navigate('CreatePostScreen', {
      mode: 'schedule',
      existingPost: {
        id: post.id,
        caption: post.caption,
        mediaUri: post.mediaUri,
        createdAt: post.createdAt,
        scheduledDate: post.scheduledDate,
        platforms: post.platforms || []
      }
    });
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      'Delete All',
      'Are you sure you want to permanently delete all items in trash? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(DELETED_POSTS_KEY, JSON.stringify([]));
              setDeletedPosts([]);
            } catch (error) {
              console.error('Error clearing trash:', error);
              Alert.alert('Error', 'Failed to clear trash');
            }
          }
        }
      ]
    );
  };

  const renderPost = ({ item }: { item: ScheduledPost | DeletedPost }) => {
    const platformObjects = (item.platforms || []).map(getPlatformMeta);
    const isValidMediaUri = item.mediaUri && 
      (item.mediaUri.startsWith('file://') || 
       item.mediaUri.startsWith('http://') || 
       item.mediaUri.startsWith('https://') ||
       item.mediaUri.startsWith('data:image/'));

    return (
      <PostCard
        mediaUri={isValidMediaUri ? item.mediaUri : ''}
        caption={item.caption}
        platforms={platformObjects}
        date={item.scheduledDate ? new Date(item.scheduledDate) : new Date()}
        status={showTrash ? 'deleted' : (showDrafts ? 'draft' : 'scheduled')}
        onPost={!showTrash && !showDrafts ? () => handlePost(item.id) : undefined}
        onEdit={!showTrash ? () => handleEdit(item) : undefined}
        onDelete={!showTrash ? () => handleDelete(item.id) : undefined}
        onRestore={showTrash ? () => handleRestore(item as DeletedPost) : undefined}
        deletedAt={'deletedAt' in item ? new Date(item.deletedAt) : undefined}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={
          showTrash ? "trash-outline" :
          showDrafts ? "document-text-outline" : 
          "calendar-outline"
        } 
        size={32} 
        color="#666" 
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyText}>
        {showTrash ? 'No items in trash' :
         showDrafts ? 'No drafts' : 
         'No scheduled posts'}
      </Text>
      {showTrash && (
        <Text style={styles.emptySubtext}>
          Posts are automatically deleted after 30 days
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Posts</Text>
        {showTrash ? (
          deletedPosts.length > 0 && (
            <TouchableOpacity
              style={styles.deleteAllButton}
              onPress={handleDeleteAll}
            >
              <Text style={styles.deleteAllText}>Delete All</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity 
            onPress={() => navigation.navigate('CreatePostScreen', { mode: 'schedule' })}
          >
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            !showDrafts && !showTrash && styles.tabButtonActive,
            styles.mainTab
          ]}
          onPress={() => {
            setShowDrafts(false);
            setShowTrash(false);
          }}
        >
          <Text style={[
            styles.tabButtonText,
            !showDrafts && !showTrash && styles.tabButtonTextActive
          ]}>Scheduled</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            showDrafts && styles.tabButtonActive,
            styles.mainTab
          ]}
          onPress={() => {
            setShowDrafts(true);
            setShowTrash(false);
          }}
        >
          <Text style={[
            styles.tabButtonText,
            showDrafts && styles.tabButtonTextActive
          ]}>Drafts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            showTrash && styles.tabButtonActive,
            styles.trashTab
          ]}
          onPress={() => {
            setShowDrafts(false);
            setShowTrash(true);
          }}
        >
          <Ionicons 
            name="trash-outline" 
            size={18} 
            color={showTrash ? '#fff' : '#666'} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={showTrash ? deletedPosts : posts}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTab: {
    flex: 0.4,
  },
  trashTab: {
    flex: 0.2,
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 32,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  deleteAllButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  deleteAllText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
}); 