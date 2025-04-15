import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Post {
  caption: string;
  media: string[];
  platforms: string[];
  scheduledDate: string;
}

type RootStackParamList = {
  Schedule: { post: Post };
};

type ScheduleScreenRouteProp = RouteProp<RootStackParamList, 'Schedule'>;

export default function ScheduleScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<ScheduleScreenRouteProp>();
  const { post } = route.params;
  const screenWidth = Dimensions.get('window').width;

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, MMMM d 'at' h:mm a");
  };

  const getPlatformIcon = (platformId: string) => {
    // Extract platform name from ID (assuming format like 'instagram_123')
    const platform = platformId.split('_')[0].toLowerCase();
    
    switch (platform) {
      case 'instagram':
        return 'logo-instagram';
      case 'facebook':
        return 'logo-facebook';
      case 'twitter':
        return 'logo-twitter';
      case 'linkedin':
        return 'logo-linkedin';
      case 'tiktok':
        return 'logo-tiktok';
      default:
        return 'share-social';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Post</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewCard}>
            {post.media.length > 0 && (
              <Image
                source={{ uri: post.media[0] }}
                style={[styles.mediaPreview, { width: screenWidth - 64 }]}
                resizeMode="cover"
              />
            )}
            <Text style={styles.caption} numberOfLines={3}>
              {post.caption}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platforms</Text>
          <View style={styles.platformsContainer}>
            {post.platforms.map((platformId) => (
              <View key={platformId} style={styles.platformBadge}>
                <Ionicons 
                  name={getPlatformIcon(platformId)} 
                  size={20} 
                  color="#666"
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Time</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.timeText}>
              {formatScheduledDate(post.scheduledDate)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => {
            // TODO: Add scheduling logic
            navigation.goBack();
          }}
        >
          <Text style={styles.confirmButtonText}>Confirm Schedule</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mediaPreview: {
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  caption: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
    padding: 12,
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  timeText: {
    fontSize: 15,
    color: '#000',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
}); 