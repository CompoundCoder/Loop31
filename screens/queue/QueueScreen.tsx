import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type QueuedPost = {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime: Date;
  media?: { uri: string; type: 'image' | 'video' }[];
};

const MOCK_POSTS: QueuedPost[] = [
  {
    id: '1',
    content: 'Excited to announce our latest feature release! #ProductUpdate',
    platforms: ['twitter', 'linkedin'],
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    media: [{ uri: 'https://picsum.photos/200', type: 'image' }],
  },
  {
    id: '2',
    content: 'Check out our new office space! 🏢 #StartupLife',
    platforms: ['instagram', 'facebook'],
    scheduledTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    media: [{ uri: 'https://picsum.photos/201', type: 'image' }],
  },
];

export default function QueueScreen() {
  const [posts, setPosts] = useState<QueuedPost[]>(MOCK_POSTS);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const deletePost = (id: string) => {
    setPosts(current => current.filter(post => post.id !== id));
  };

  const editPost = (id: string) => {
    // Navigate to edit screen
  };

  const renderPost = (post: QueuedPost) => (
    <View key={post.id} style={styles.postCard}>
      {post.media && post.media.length > 0 && (
        <Image source={{ uri: post.media[0].uri }} style={styles.mediaPreview} />
      )}
      <View style={styles.postContent}>
        <Text style={styles.postText} numberOfLines={2}>
          {post.content}
        </Text>
        <View style={styles.postMeta}>
          <View style={styles.platformIcons}>
            {post.platforms.map(platform => (
              <Ionicons
                key={platform}
                name={`logo-${platform}`}
                size={16}
                color="#666"
                style={styles.platformIcon}
              />
            ))}
          </View>
          <Text style={styles.scheduleTime}>
            {format(post.scheduledTime, 'MMM d, h:mm a')}
          </Text>
        </View>
      </View>
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => editPost(post.id)}
        >
          <Ionicons name="pencil" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deletePost(post.id)}
        >
          <Ionicons name="trash" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, view === 'list' && styles.toggleActive]}
          onPress={() => setView('list')}
        >
          <Ionicons
            name="list"
            size={20}
            color={view === 'list' ? '#fff' : '#666'}
          />
          <Text
            style={[
              styles.toggleText,
              view === 'list' && styles.toggleTextActive,
            ]}
          >
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            view === 'calendar' && styles.toggleActive,
          ]}
          onPress={() => setView('calendar')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={view === 'calendar' ? '#fff' : '#666'}
          />
          <Text
            style={[
              styles.toggleText,
              view === 'calendar' && styles.toggleTextActive,
            ]}
          >
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Queue List */}
      <ScrollView style={styles.queueList}>
        {posts.map(renderPost)}
      </ScrollView>

      {/* Add Post Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  toggleActive: {
    backgroundColor: '#2f95dc',
  },
  toggleText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  queueList: {
    flex: 1,
  },
  postCard: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mediaPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  postContent: {
    flex: 1,
    marginRight: 12,
  },
  postText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformIcons: {
    flexDirection: 'row',
  },
  platformIcon: {
    marginRight: 8,
  },
  scheduleTime: {
    fontSize: 12,
    color: '#666',
  },
  postActions: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2f95dc',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 