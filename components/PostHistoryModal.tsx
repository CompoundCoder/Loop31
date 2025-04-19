import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Modal from 'react-native-modal';
import { Post } from '../types/Loop';

interface Props {
  post: Post;
  isVisible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const IMAGE_SIZE = Math.min(SCREEN_WIDTH - 32, 300); // Cap image size

export default function PostHistoryModal({ post, isVisible, onClose }: Props) {
  const renderHistoryItem = (item: NonNullable<Post['history']>[number], index: number) => {
    let eventText = '';
    switch (item.event) {
      case 'posted':
        eventText = `Posted ${format(new Date(item.date), 'MMM d, yyyy')} at ${format(new Date(item.date), 'h:mma')} — Loop: ${item.loopName}`;
        break;
      case 'remixed':
        eventText = `Remixed ${format(new Date(item.date), 'MMM d, yyyy')}`;
        break;
      case 'muted':
        eventText = `Muted ${format(new Date(item.date), 'MMM d, yyyy')}`;
        break;
      // TODO: Add future event types (synced, settings changed, etc.)
    }

    return (
      <View key={index} style={styles.historyItem}>
        <View style={styles.timelineDot} />
        {index !== (post.history?.length || 0) - 1 && (
          <View style={styles.timelineLine} />
        )}
        <Text style={styles.historyText}>{eventText}</Text>
      </View>
    );
  };

  if (!post) return null;

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      propagateSwipe
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            {post.mediaUri ? (
              <Image source={{ uri: post.mediaUri }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.noMediaContainer, styles.thumbnail]}>
                <Ionicons name="images-outline" size={40} color="#666" />
                <Text style={styles.noMediaText}>No Preview</Text>
              </View>
            )}
          </View>

          <Text style={styles.caption} numberOfLines={2}>
            {post.caption}
          </Text>

          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Usage History</Text>
            {post.history && post.history.length > 0 ? (
              post.history.map((item, index) => renderHistoryItem(item, index))
            ) : (
              <Text style={styles.emptyHistory}>No usage history available.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: MODAL_HEIGHT,
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
  },
  noMediaContainer: {
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMediaText: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
  },
  caption: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingLeft: 16,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 16,
    marginTop: 6,
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 14,
    width: 2,
    height: 24,
    backgroundColor: '#E5E5EA',
  },
  historyText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  emptyHistory: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
  },
}); 