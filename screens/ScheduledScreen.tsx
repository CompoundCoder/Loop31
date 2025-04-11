import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Temporary mock data
const MOCK_POSTS = [
  {
    id: '1',
    content: 'Exciting news coming soon! Stay tuned for our latest product launch 🚀',
    platform: 'twitter',
    scheduledTime: '2024-04-12T10:00:00Z',
    image: 'https://picsum.photos/400/300',
  },
  {
    id: '2',
    content: 'Check out our new blog post about social media strategy in 2024',
    platform: 'linkedin',
    scheduledTime: '2024-04-12T14:30:00Z',
    image: 'https://picsum.photos/400/300',
  },
  {
    id: '3',
    content: '✨ Behind the scenes look at our team building the future of social media',
    platform: 'instagram',
    scheduledTime: '2024-04-13T09:00:00Z',
    image: 'https://picsum.photos/400/300',
  },
];

function PostCard({ post }: { post: typeof MOCK_POSTS[0] }) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'logo-twitter';
      case 'linkedin':
        return 'logo-linkedin';
      case 'instagram':
        return 'logo-instagram';
      default:
        return 'share-social';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={getPlatformIcon(post.platform)} size={24} color="#666" />
        <Text style={styles.scheduledTime}>{formatDate(post.scheduledTime)}</Text>
      </View>
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="pencil" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="copy" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ScheduledScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_POSTS}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduledTime: {
    color: '#666',
    fontSize: 14,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    marginLeft: 20,
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2f95dc',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
}); 