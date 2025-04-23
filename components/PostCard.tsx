import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export type PostStatus = 'scheduled' | 'draft' | 'deleted';

type Platform = {
  id: string;
  name: string;
  type: string;
  icon: keyof typeof Ionicons.glyphMap;
};

interface PostAnalytics {
  views: number;
  likes: number;
  comments: number;
}

interface PostCardProps {
  mediaUri?: string;
  caption: string;
  platforms: Platform[];
  date: Date;
  status: PostStatus;
  analytics?: PostAnalytics;
  onPost?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  deletedAt?: Date;
}

const MAX_CAPTION_LENGTH = 100;

export default function PostCard({ 
  mediaUri, 
  caption, 
  platforms, 
  date, 
  status,
  analytics,
  onPost,
  onEdit,
  onDelete,
  onRestore,
  deletedAt,
}: PostCardProps) {
  const truncatedCaption = caption.length > MAX_CAPTION_LENGTH 
    ? `${caption.substring(0, MAX_CAPTION_LENGTH)}...` 
    : caption;

  const renderPlatformIcons = () => {
    return platforms.map((platform, index) => (
      <View 
        key={platform.id} 
        style={[
          styles.platformIcon,
          index > 0 && styles.platformIconOffset
        ]}
      >
        <Ionicons 
          name={platform.icon}
          size={16}
          color="#666"
        />
      </View>
    ));
  };

  const renderStatusText = () => {
    if (status === 'deleted') {
      return (
        <Text style={styles.deletedText}>
          Deleted {format(deletedAt || new Date(), 'MMM d')}
        </Text>
      );
    }

    return (
      <Text style={styles.date}>
        {status === 'draft' ? 'Draft' : format(date, 'MMM d, h:mm a')}
      </Text>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsItem}>
          <Ionicons name="eye-outline" size={16} color="#666" />
          <Text style={styles.analyticsText}>{analytics.views}</Text>
        </View>
        <View style={styles.analyticsItem}>
          <Ionicons name="heart-outline" size={16} color="#666" />
          <Text style={styles.analyticsText}>{analytics.likes}</Text>
        </View>
        <View style={styles.analyticsItem}>
          <Ionicons name="chatbubble-outline" size={16} color="#666" />
          <Text style={styles.analyticsText}>{analytics.comments}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.platformIcons}>
          {renderPlatformIcons()}
        </View>
        {renderStatusText()}
      </View>

      <View style={styles.mediaContainer}>
        {mediaUri ? (
          <Image 
            source={{ uri: mediaUri }} 
            style={styles.media}
            resizeMode="cover"
            onError={() => console.warn(`Failed to load image: ${mediaUri}`)}
            defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' }}
          />
        ) : (
          <View style={[styles.media, styles.mediaPlaceholder]}>
            <Ionicons name="image-outline" size={32} color="#999" />
            <Text style={styles.mediaPlaceholderText}>No Preview</Text>
          </View>
        )}
      </View>

      <Text style={styles.caption} numberOfLines={3}>
        {truncatedCaption}
      </Text>

      <View style={styles.actions}>
        {status === 'deleted' ? (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onRestore}
            accessibilityLabel="Restore Post"
          >
            <Ionicons name="arrow-undo-outline" size={18} color="#007AFF" />
            <Text style={[styles.actionText, styles.restoreText]}>Restore</Text>
          </TouchableOpacity>
        ) : (
          <>
            {onPost && (
              <TouchableOpacity style={styles.actionButton} onPress={onPost}>
                <Ionicons name="paper-plane-outline" size={18} color="#666" />
                <Text style={styles.actionText}>Post Now</Text>
              </TouchableOpacity>
            )}
            {onEdit && (
              <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                <Ionicons name="document-text-outline" size={18} color="#666" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                <Ionicons name="trash-outline" size={18} color="#666" />
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
      {renderAnalytics()}
    </View>
  );
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    width: CARD_WIDTH,
    maxWidth: 500,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  platformIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformIconOffset: {
    marginLeft: -8,
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f9f9f9',
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f9f9f9',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    marginTop: 8,
    fontSize: 15,
    color: '#999',
  },
  caption: {
    fontSize: 15,
    color: '#333',
    padding: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  analyticsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  analyticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  analyticsText: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deletedText: {
    fontSize: 13,
    color: '#999',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F2F7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  restoreText: {
    color: '#007AFF',
  },
  deleteButton: {
    marginLeft: 'auto',
    paddingLeft: 16,
  },
});