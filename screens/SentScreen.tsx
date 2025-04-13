import { View, StyleSheet, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostCard from '../components/PostCard';
import { Ionicons } from '@expo/vector-icons';
import AnimatedHeader from '../components/AnimatedHeader';
import { useRef } from 'react';
import { Animated } from 'react-native';

type Platform = {
  id: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  name: string;
};

interface PostAnalytics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagement: number;
}

interface SentPost {
  id: string;
  mediaUri: string;
  caption: string;
  platforms: Platform[];
  date: Date;
  analytics: PostAnalytics;
}

// Mock data for sent posts
const MOCK_SENT_POSTS: SentPost[] = [
  {
    id: '1',
    mediaUri: 'https://picsum.photos/800/1000',
    caption: 'Another stunning transformation complete! Swipe to see the before and after. 🎨 #VinylWrap #CarCustomization',
    platforms: [
      { id: 'ig1', type: 'instagram', name: 'Brand Main' },
      { id: 'fb1', type: 'facebook', name: 'Brand Page' },
    ],
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    analytics: {
      likes: 245,
      comments: 12,
      shares: 5,
      impressions: 2890,
      engagement: 9.1
    }
  },
  {
    id: '2',
    mediaUri: 'https://picsum.photos/900/900',
    caption: 'Matte black everything! This sleek finish is turning heads. 🖤 #MattBlack #VinylWrap',
    platforms: [
      { id: 'ig1', type: 'instagram', name: 'Brand Main' },
      { id: 'tw1', type: 'twitter', name: '@brandhandle' },
    ],
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    analytics: {
      likes: 189,
      comments: 8,
      shares: 3,
      impressions: 2500,
      engagement: 8.5
    }
  },
];

export default function SentScreen() {
  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const renderPost = ({ item }: { item: SentPost }) => (
    <View style={styles.postContainer}>
      <PostCard
        mediaUri={item.mediaUri}
        caption={item.caption}
        platforms={item.platforms}
        date={item.date}
        status="sent"
        onShare={() => handleShare(item.id)}
        analytics={item.analytics}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnimatedHeader 
        title="Posts" 
        titleStyle={styles.headerTitle}
      />
      <FlatList
        data={MOCK_SENT_POSTS}
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
    paddingHorizontal: 16,
    paddingBottom: 90,
    backgroundColor: '#fff',
  },
  postContainer: {
    marginBottom: 16,
  },
  analyticsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  analyticsItem: {
    flex: 1,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
}); 