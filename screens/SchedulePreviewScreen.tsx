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
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Post {
  caption: string;
  media: string[];
  platforms: string[];
  scheduledDate: string;
}

interface ScheduledPost extends Post {
  id: string;
}

interface Section {
  title: string;
  data: ScheduledPost[];
}

type RootStackParamList = {
  SchedulePreview: { post: Post };
};

type SchedulePreviewScreenRouteProp = RouteProp<RootStackParamList, 'SchedulePreview'>;

export default function SchedulePreviewScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<SchedulePreviewScreenRouteProp>();
  const { post } = route.params;
  const screenWidth = Dimensions.get('window').width;

  // Mock data for demonstration
  const mockScheduledPosts: Section[] = [
    {
      title: 'Today',
      data: [{
        ...post,
        id: '1',
        scheduledDate: new Date().toISOString()
      }]
    },
    {
      title: 'Tomorrow',
      data: [{
        ...post,
        id: '2',
        scheduledDate: addDays(new Date(), 1).toISOString()
      }]
    },
    {
      title: format(addDays(new Date(), 2), 'MMM d'),
      data: [{
        ...post,
        id: '3',
        scheduledDate: addDays(new Date(), 2).toISOString()
      }]
    }
  ];

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  const renderPostCard = ({ item }: { item: ScheduledPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postTime}>{formatScheduledDate(item.scheduledDate)}</Text>
        <View style={styles.platformIcons}>
          {item.platforms.map((platformId) => (
            <View key={platformId} style={styles.platformIcon}>
              <Ionicons 
                name={getPlatformIcon(platformId)} 
                size={16} 
                color="#666"
              />
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.postContent}>
        {item.media.length > 0 && (
          <Image
            source={{ uri: item.media[0] }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.postCaption} numberOfLines={2}>
          {item.caption}
        </Text>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const getPlatformIcon = (platformId: string) => {
    const platform = platformId.split('_')[0].toLowerCase();
    switch (platform) {
      case 'instagram': return 'logo-instagram';
      case 'facebook': return 'logo-facebook';
      case 'twitter': return 'logo-twitter';
      case 'linkedin': return 'logo-linkedin';
      case 'tiktok': return 'logo-tiktok';
      default: return 'share-social';
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

      <View style={styles.calendarContainer}>
        <Text style={styles.calendarPlaceholder}>Calendar Component</Text>
      </View>

      <SectionList
        sections={mockScheduledPosts}
        renderItem={renderPostCard}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
  calendarContainer: {
    height: 300,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarPlaceholder: {
    fontSize: 17,
    color: '#666',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 12,
    backgroundColor: '#f2f2f7',
    marginTop: 8,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  postTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  platformIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  platformIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    padding: 12,
  },
  postImage: {
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  postCaption: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
  },
}); 