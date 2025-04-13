import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export type PostStatus = 'draft' | 'scheduled' | 'sent';

interface Platform {
  id: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  name: string;
}

interface PostAnalytics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagement: number;
}

interface PostCardProps {
  mediaUri: string;
  caption: string;
  platforms: Platform[];
  date: Date;
  status: PostStatus;
  analytics?: PostAnalytics;
  onEdit?: () => void;
  onDelete?: () => void;
  onSchedule?: () => void;
  onShare?: () => void;
}

const MAX_CAPTION_LENGTH = 100;

export default function PostCard({ 
  mediaUri, 
  caption, 
  platforms, 
  date, 
  status,
  analytics,
  onEdit,
  onDelete,
  onSchedule,
  onShare
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
          name={`logo-${platform.type}`}
          size={16}
          color="#666"
        />
      </View>
    ));
  };

  const renderActionButtons = () => {
    switch (status) {
      case 'draft':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onSchedule}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Ionicons name="create-outline" size={20} color="#34C759" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        );
      case 'scheduled':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Ionicons name="create-outline" size={20} color="#34C759" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        );
      case 'sent':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Ionicons name="share-outline" size={20} color="#007AFF" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  const renderAnalytics = () => {
    if (!analytics || status !== 'sent') return null;

    return (
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.impressions.toLocaleString()}</Text>
            <Text style={styles.analyticsLabel}>Impressions</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.likes}</Text>
            <Text style={styles.analyticsLabel}>Likes</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.comments}</Text>
            <Text style={styles.analyticsLabel}>Comments</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.shares}</Text>
            <Text style={styles.analyticsLabel}>Shares</Text>
          </View>
          <View style={styles.analyticsItem}>
            <Text style={styles.analyticsValue}>{analytics.engagement}%</Text>
            <Text style={styles.analyticsLabel}>Engagement</Text>
          </View>
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
        <Text style={styles.date}>
          {status === 'sent' 
            ? `Posted ${format(date, 'MMM d, yyyy')}`
            : status === 'scheduled'
              ? `Scheduled for ${format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm a')}`
              : `Last edited ${format(date, 'MMM d, yyyy')}`
          }
        </Text>
      </View>

      <View style={styles.mediaContainer}>
        <Image 
          source={{ uri: mediaUri }} 
          style={styles.media}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.caption} numberOfLines={3}>
        {truncatedCaption}
      </Text>

      {renderActionButtons()}
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
    maxWidth: 500, // Standard max width for iOS cards
    alignSelf: 'center', // Center the card if screen is wider than maxWidth
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
    gap: 16,
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsItem: {
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