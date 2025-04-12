import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Temporary mock data
const MOCK_POSTS = [
  {
    id: '1',
    content: 'Check out our latest product launch! 🚀 #innovation #tech',
    mediaUrl: 'https://picsum.photos/400/300',
    publishedAt: '2024-04-10T15:30:00Z',
    platform: 'instagram',
    metrics: {
      likes: 245,
      comments: 23,
      shares: 12,
      reach: 2890
    }
  },
  {
    id: '2',
    content: 'Behind the scenes at our annual team meetup! 🎉',
    mediaUrl: 'https://picsum.photos/400/300',
    publishedAt: '2024-04-09T12:00:00Z',
    platform: 'facebook',
    metrics: {
      likes: 189,
      comments: 45,
      shares: 8,
      reach: 1567
    }
  },
  {
    id: '3',
    content: 'New tutorial dropping tomorrow! Stay tuned 📱',
    mediaUrl: 'https://picsum.photos/400/300',
    publishedAt: '2024-04-08T18:15:00Z',
    platform: 'tiktok',
    metrics: {
      likes: 1245,
      comments: 89,
      shares: 156,
      reach: 15670
    }
  }
];

interface PostMetricsProps {
  platform: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

function PostMetrics({ platform, metrics }: PostMetricsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <View style={styles.metricsContainer}>
      <View style={styles.metricItem}>
        <Ionicons name="heart-outline" size={16} color="#666" />
        <Text style={styles.metricNumber}>{formatNumber(metrics.likes)}</Text>
      </View>
      <View style={styles.metricItem}>
        <Ionicons name="chatbubble-outline" size={16} color="#666" />
        <Text style={styles.metricNumber}>{formatNumber(metrics.comments)}</Text>
      </View>
      <View style={styles.metricItem}>
        <Ionicons name="share-outline" size={16} color="#666" />
        <Text style={styles.metricNumber}>{formatNumber(metrics.shares)}</Text>
      </View>
      <View style={styles.metricItem}>
        <Ionicons name="eye-outline" size={16} color="#666" />
        <Text style={styles.metricNumber}>{formatNumber(metrics.reach)}</Text>
      </View>
    </View>
  );
}

function PostCard({ post }: { post: typeof MOCK_POSTS[0] }) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'logo-instagram';
      case 'facebook':
        return 'logo-facebook';
      case 'tiktok':
        return 'logo-tiktok';
      default:
        return 'share-social';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name={getPlatformIcon(post.platform)} size={20} color="#666" />
          <Text style={styles.timestamp}>
            {format(new Date(post.publishedAt), 'MMM d, h:mm a')}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {post.mediaUrl && (
        <Image source={{ uri: post.mediaUrl }} style={styles.postImage} />
      )}

      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>

      <PostMetrics platform={post.platform} metrics={post.metrics} />
    </View>
  );
}

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_POSTS}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    padding: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricNumber: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
}); 