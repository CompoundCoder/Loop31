import { View, StyleSheet, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../components/PostCard';
import AnimatedHeader from '../components/AnimatedHeader';
import { useRef } from 'react';
import { Animated } from 'react-native';

type Platform = {
  id: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  name: string;
};

interface ScheduledPost {
  id: string;
  mediaUri: string;
  caption: string;
  platforms: Platform[];
  date: Date;
}

// Mock data for scheduled posts
const MOCK_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: '1',
    mediaUri: 'https://picsum.photos/1000/1000',
    caption: 'Check out our latest vinyl wrap project! 🚗✨ #VinylWrap #CarWrap #Automotive',
    platforms: [
      { id: 'ig1', type: 'instagram', name: 'Brand Main' },
      { id: 'fb1', type: 'facebook', name: 'Brand Page' },
    ],
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  },
  {
    id: '2',
    mediaUri: 'https://picsum.photos/1000/800',
    caption: 'Transform your ride with our premium vinyl wraps. Book your appointment today! 🔥',
    platforms: [
      { id: 'ig1', type: 'instagram', name: 'Brand Main' },
      { id: 'tw1', type: 'twitter', name: '@brandhandle' },
      { id: 'fb1', type: 'facebook', name: 'Brand Page' },
    ],
    date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
  },
];

export default function PostsScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleEdit = (postId: string) => {
    console.log('Edit post:', postId);
  };

  const handleDelete = (postId: string) => {
    console.log('Delete post:', postId);
  };

  const renderPost = ({ item }: { item: ScheduledPost }) => (
    <PostCard
      mediaUri={item.mediaUri}
      caption={item.caption}
      platforms={item.platforms}
      date={item.date}
      status="scheduled"
      onEdit={() => handleEdit(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnimatedHeader 
        title="Schedule" 
        titleStyle={styles.headerTitle}
      />
      <FlatList
        data={MOCK_SCHEDULED_POSTS}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
}); 