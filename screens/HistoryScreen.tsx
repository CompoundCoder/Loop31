import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Dimensions, Modal, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

// Enhanced mock data with more metrics
const MOCK_POSTS = [
  {
    id: '1',
    content: 'Check out our latest product launch! 🚀 #innovation #tech',
    mediaUrl: 'https://picsum.photos/400/300',
    publishedAt: '2024-04-10T15:30:00Z',
    platforms: ['instagram', 'facebook'],
    folder: 'Product Launches',
    metrics: {
      likes: 2450,
      comments: 230,
      shares: 120,
      impressions: 28900
    }
  },
  {
    id: '2',
    content: 'Behind the scenes at our annual team meetup! 🎉',
    mediaUrl: 'https://picsum.photos/400/300',
    publishedAt: '2024-04-09T12:00:00Z',
    platforms: ['instagram'],
    folder: 'Team Culture',
    metrics: {
      likes: 1890,
      comments: 450,
      shares: 80,
      impressions: 15670
    }
  },
  {
    id: '3',
    content: 'New tutorial dropping tomorrow! Stay tuned 📱',
    mediaUrl: 'https://picsum.photos/400/300',
    publishedAt: '2024-04-08T18:15:00Z',
    platforms: ['tiktok', 'instagram'],
    folder: 'Educational',
    metrics: {
      likes: 12450,
      comments: 890,
      shares: 1560,
      impressions: 156700
    }
  },
  // Add more mock posts with different dates for grouping
  {
    id: '4',
    content: 'Tips for better productivity in 2024! 💪',
    mediaUrl: 'https://picsum.photos/400/300',
    publishedAt: '2024-04-03T14:20:00Z',
    platforms: ['linkedin', 'twitter'],
    folder: 'Tips & Tricks',
    metrics: {
      likes: 780,
      comments: 234,
      shares: 567,
      impressions: 23400
    }
  }
];

interface Post {
  id: string;
  content: string;
  mediaUrl: string;
  publishedAt: string;
  platforms: string[];
  folder?: string;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
  };
}

interface PostGroup {
  title: string;
  data: Post[];
}

function getHighlightMetric(metrics: Post['metrics']) {
  const values = [
    { label: 'likes', value: metrics.likes },
    { label: 'comments', value: metrics.comments },
    { label: 'shares', value: metrics.shares },
    { label: 'impressions', value: metrics.impressions }
  ];
  return values.reduce((max, current) => 
    current.value > max.value ? current : max
  );
}

function formatMetricNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function CompactPostCard({ post, onPress }: { post: Post; onPress: () => void }) {
  const highlight = getHighlightMetric(post.metrics);
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2; // 16px padding on sides + 16px gap

  return (
    <TouchableOpacity 
      style={[styles.compactCard, { width: cardWidth }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.compactImageContainer}>
        <Image 
          source={{ uri: post.mediaUrl }} 
          style={styles.compactImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.compactGradient}
        >
          <View style={styles.compactMetric}>
            <Ionicons 
              name={highlight.label === 'impressions' ? 'eye-outline' : 
                    highlight.label === 'shares' ? 'share-outline' :
                    highlight.label === 'comments' ? 'chatbubble-outline' : 
                    'heart-outline'} 
              size={14} 
              color="#fff" 
            />
            <Text style={styles.compactMetricText}>
              {formatMetricNumber(highlight.value)}
            </Text>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.compactContent}>
        <Text style={styles.compactCaption} numberOfLines={1}>
          {post.content}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function WeekSection({ group, onPostPress, isLatestWeek }: { 
  group: PostGroup; 
  onPostPress: (post: Post) => void;
  isLatestWeek?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(!isLatestWeek);
  const animatedHeight = useRef(new Animated.Value(isLatestWeek ? 1 : 0)).current;

  const toggleCollapse = () => {
    Animated.timing(animatedHeight, {
      toValue: isCollapsed ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsCollapsed(!isCollapsed);
  };

  // Get unique platforms used in this week's posts
  const platforms = Array.from(new Set(
    group.data.flatMap(post => post.platforms)
  ));

  return (
    <View style={styles.weekSection}>
      <TouchableOpacity 
        style={styles.weekHeader} 
        onPress={toggleCollapse}
        activeOpacity={0.7}
      >
        <View style={styles.weekHeaderLeft}>
          <Text style={styles.weekTitle}>{group.title}</Text>
          <View style={styles.weekPlatforms}>
            {platforms.map((platform) => (
              <View key={platform} style={styles.weekPlatformIcon}>
                <Ionicons 
                  name={platform === 'instagram' ? 'logo-instagram' :
                        platform === 'facebook' ? 'logo-facebook' :
                        platform === 'twitter' ? 'logo-twitter' :
                        platform === 'linkedin' ? 'logo-linkedin' :
                        platform === 'tiktok' ? 'logo-tiktok' :
                        'share-social'} 
                  size={12} 
                  color="#666" 
                />
              </View>
            ))}
          </View>
        </View>
        <Ionicons 
          name={isCollapsed ? 'chevron-down' : 'chevron-up'} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>

      <Animated.View style={[
        styles.postsGrid,
        {
          maxHeight: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000]
          }),
          opacity: animatedHeight
        }
      ]}>
        {group.data.map((post) => (
          <CompactPostCard
            key={post.id}
            post={post}
            onPress={() => onPostPress(post)}
          />
        ))}
      </Animated.View>
    </View>
  );
}

function PostDetailModal({ post, visible, onClose }: { 
  post: Post; 
  visible: boolean; 
  onClose: () => void;
}) {
  const [imageAspectRatio, setImageAspectRatio] = useState(1);

  // Get image dimensions when component mounts
  useEffect(() => {
    if (post.mediaUrl) {
      Image.getSize(post.mediaUrl, (width, height) => {
        setImageAspectRatio(width / height);
      }, (error) => {
        console.log('Error getting image size:', error);
        setImageAspectRatio(1); // Fallback to square if error
      });
    }
  }, [post.mediaUrl]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
        <View style={styles.modalInnerContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.modalBackButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Post Details</Text>
            <View style={styles.modalBackButton} />
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.contentCard}>
              <View style={styles.mediaWrapper}>
                <Image 
                  source={{ uri: post.mediaUrl }} 
                  style={[styles.modalImage, { aspectRatio: imageAspectRatio }]}
                  resizeMode="cover"
                />
              </View>
              
              <View style={styles.detailsContainer}>
                <View style={styles.platformsContainer}>
                  {post.platforms.map((platform) => (
                    <View key={platform} style={styles.platformBadge}>
                      <Ionicons 
                        name={platform === 'instagram' ? 'logo-instagram' :
                              platform === 'facebook' ? 'logo-facebook' :
                              platform === 'twitter' ? 'logo-twitter' :
                              platform === 'linkedin' ? 'logo-linkedin' :
                              platform === 'tiktok' ? 'logo-tiktok' :
                              'share-social'} 
                        size={16} 
                        color="#666" 
                      />
                    </View>
                  ))}
                </View>

                {post.folder && (
                  <View style={styles.folderContainer}>
                    <Ionicons name="folder-outline" size={16} color="#666" />
                    <Text style={styles.folderText}>{post.folder}</Text>
                  </View>
                )}

                <Text style={styles.modalCaption}>{post.content}</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Ionicons name="heart-outline" size={20} color="#666" />
                    <Text style={styles.statValue}>
                      {formatMetricNumber(post.metrics.likes)}
                    </Text>
                    <Text style={styles.statLabel}>Likes</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="chatbubble-outline" size={20} color="#666" />
                    <Text style={styles.statValue}>
                      {formatMetricNumber(post.metrics.comments)}
                    </Text>
                    <Text style={styles.statLabel}>Comments</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="share-outline" size={20} color="#666" />
                    <Text style={styles.statValue}>
                      {formatMetricNumber(post.metrics.shares)}
                    </Text>
                    <Text style={styles.statLabel}>Shares</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={20} color="#666" />
                    <Text style={styles.statValue}>
                      {formatMetricNumber(post.metrics.impressions)}
                    </Text>
                    <Text style={styles.statLabel}>Impressions</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity 
              style={styles.repostButtonFull}
              activeOpacity={0.8}
            >
              <Text style={styles.repostButtonText}>Repost</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

type SortOption = 'recent' | 'popular';
type FilterOption = 'all' | 'instagram' | 'facebook' | 'twitter' | 'tiktok';

interface DropdownOption {
  label: string;
  value: string;
  icon?: string;
}

function DropdownMenu({ 
  visible, 
  options, 
  selectedValue, 
  onSelect,
  onClose,
  style,
}: { 
  visible: boolean;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  style?: any;
}) {
  if (!visible) return null;

  return (
    <>
      <TouchableOpacity 
        style={styles.dropdownOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      />
      <View style={[styles.dropdownMenu, style]}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.dropdownMenuItem,
              selectedValue === option.value && styles.dropdownMenuItemSelected
            ]}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            {option.icon && (
              <View style={styles.dropdownMenuIcon}>
                <Ionicons name={option.icon as any} size={16} color={selectedValue === option.value ? '#007AFF' : '#666'} />
              </View>
            )}
            <Text style={[
              styles.dropdownMenuText,
              selectedValue === option.value && styles.dropdownMenuTextSelected
            ]}>
              {option.label}
            </Text>
            {selectedValue === option.value && (
              <Ionicons name="checkmark" size={16} color="#007AFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function DropdownButton({ 
  label, 
  value, 
  options, 
  isOpen,
  onPress,
  dropdownStyle,
}: { 
  label: string;
  value: string;
  options: DropdownOption[];
  isOpen: boolean;
  onPress: () => void;
  dropdownStyle?: any;
}) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        style={[
          styles.dropdownButton,
          isOpen && styles.dropdownButtonActive
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          <Text style={styles.dropdownLabel}>{label}</Text>
          <View style={styles.dropdownValue}>
            {selectedOption?.icon && (
              <Ionicons name={selectedOption.icon as any} size={16} color="#666" />
            )}
            <Text style={styles.dropdownValueText}>
              {selectedOption?.label || 'Select'}
            </Text>
            <Ionicons 
              name={isOpen ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color="#666" 
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function PublishedScreen() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [openDropdown, setOpenDropdown] = useState<'sort' | 'filter' | null>(null);

  const sortOptions: DropdownOption[] = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Most Popular', value: 'popular' },
  ];

  const filterOptions: DropdownOption[] = [
    { label: 'All Platforms', value: 'all' },
    { label: 'Instagram', value: 'instagram', icon: 'logo-instagram' },
    { label: 'Facebook', value: 'facebook', icon: 'logo-facebook' },
    { label: 'Twitter', value: 'twitter', icon: 'logo-twitter' },
    { label: 'TikTok', value: 'tiktok', icon: 'logo-tiktok' },
  ];

  const sortPosts = (posts: Post[]): Post[] => {
    switch (sortBy) {
      case 'popular':
        return [...posts].sort((a, b) => {
          const engagementA = a.metrics.likes + a.metrics.comments + a.metrics.shares;
          const engagementB = b.metrics.likes + b.metrics.comments + b.metrics.shares;
          return engagementB - engagementA;
        });
      default:
        return [...posts].sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
    }
  };

  const filterPosts = (posts: Post[]): Post[] => {
    if (filterBy === 'all') return posts;
    return posts.filter(post => post.platforms.includes(filterBy));
  };

  const groupPostsByWeek = (posts: Post[]): PostGroup[] => {
    const filteredPosts = filterPosts(posts);
    const sortedPosts = sortPosts(filteredPosts);

    const grouped = sortedPosts.reduce((groups: { [key: string]: Post[] }, post) => {
      const date = new Date(post.publishedAt);
      const weekStart = startOfWeek(date);
      const weekKey = weekStart.toISOString();
      
      if (!groups[weekKey]) {
        groups[weekKey] = [];
      }
      groups[weekKey].push(post);
      return groups;
    }, {});

    return Object.entries(grouped).map(([weekKey, posts]) => {
      const weekStart = new Date(weekKey);
      const weekEnd = endOfWeek(weekStart);
      return {
        title: `${format(weekStart, 'MMM d')}–${format(weekEnd, 'MMM d, yyyy')}`,
        data: posts
      };
    }).sort((a, b) => 
      new Date(b.data[0].publishedAt).getTime() - 
      new Date(a.data[0].publishedAt).getTime()
    );
  };

  const groupedPosts = groupPostsByWeek(MOCK_POSTS);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Published</Text>
      </View>

      <View style={styles.filtersContainer}>
        <DropdownButton
          label="Sort by"
          value={sortBy}
          options={sortOptions}
          isOpen={openDropdown === 'sort'}
          onPress={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
        />
        <DropdownButton
          label="Filter by"
          value={filterBy}
          options={filterOptions}
          isOpen={openDropdown === 'filter'}
          onPress={() => setOpenDropdown(openDropdown === 'filter' ? null : 'filter')}
        />

        <DropdownMenu
          visible={openDropdown === 'sort'}
          options={sortOptions}
          selectedValue={sortBy}
          onSelect={(value) => setSortBy(value as SortOption)}
          onClose={() => setOpenDropdown(null)}
          style={styles.sortDropdownPosition}
        />

        <DropdownMenu
          visible={openDropdown === 'filter'}
          options={filterOptions}
          selectedValue={filterBy}
          onSelect={(value) => setFilterBy(value as FilterOption)}
          onClose={() => setOpenDropdown(null)}
          style={styles.filterDropdownPosition}
        />
      </View>

      <FlatList
        data={groupedPosts}
        renderItem={({ item, index }) => (
          <WeekSection
            group={item}
            onPostPress={setSelectedPost}
            isLatestWeek={index === 0}
          />
        )}
        keyExtractor={item => item.title}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          visible={true}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  weekSection: {
    marginBottom: 24,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  weekHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  weekPlatforms: {
    flexDirection: 'row',
    gap: 4,
  },
  weekPlatformIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    overflow: 'hidden',
  },
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  compactImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  compactImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  compactGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    justifyContent: 'flex-end',
    padding: 8,
  },
  compactContent: {
    padding: 8,
  },
  compactCaption: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  compactMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactMetricText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalInnerContainer: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingHorizontal: 4,
  },
  modalBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 44,
  },
  modalContent: {
    flex: 1,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mediaWrapper: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: undefined,
  },
  detailsContainer: {
    padding: 16,
  },
  platformsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  platformBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  folderText: {
    fontSize: 14,
    color: '#666',
  },
  modalCaption: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  bottomButtonContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    padding: 16,
  },
  repostButtonFull: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  repostButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    zIndex: 2,
  },
  dropdownContainer: {
    flex: 1,
    zIndex: 1,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dropdownButtonActive: {
    borderColor: '#007AFF',
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  dropdownMenuItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  dropdownMenuIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenuText: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  dropdownMenuTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  sortDropdownPosition: {
    left: 16,
    width: '45%',
  },
  filterDropdownPosition: {
    right: 16,
    width: '45%',
  },
  dropdownContent: {
    gap: 4,
  },
  dropdownLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  dropdownValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownValueText: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
}); 