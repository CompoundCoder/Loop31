import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Dimensions, Modal, Animated, ScrollView, Platform, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import PostCard from '../components/PostCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getPlatformIconName } from '../utils/platformIcons';

interface PostMetrics {
  likes: number;
  views: number;
  shares: number;
  comments: number;
  impressions: number;
  engagement: number;
}

interface Post {
  id: string;
  content: string;
  mediaUrl: string;
  publishedAt: string;
  platforms: string[];
  folder?: string;
  metrics: PostMetrics;
  source?: 'schedule' | 'loop';
  postedAt: string;
}

interface PostGroup {
  title: string;
  data: Post[];
}

const getMetricIcon = (metricName: keyof PostMetrics): keyof typeof Ionicons.glyphMap => {
  switch (metricName) {
    case 'likes':
      return 'heart-outline';
    case 'views':
      return 'eye-outline';
    case 'shares':
      return 'share-outline';
    case 'comments':
      return 'chatbubble-outline';
    case 'impressions':
      return 'analytics-outline';
    case 'engagement':
      return 'trending-up-outline';
  }
};

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

const VIEW_MODE_STORAGE_KEY = '@published_view_mode';

export type SortOption = 'recent' | 'oldest' | 'popular' | 'engagement' | 'impressions';
export type FilterOption = 'all' | 'instagram' | 'facebook' | 'twitter' | 'linkedin';
export type DropdownType = 'sort' | 'filter';

interface DropdownOption {
  label: string;
  value: SortOption | FilterOption;
  icon: keyof typeof Ionicons.glyphMap;
}

interface DropdownPosition {
  x: number;
  y: number;
  width: number;
  isAbove?: boolean;
}

interface DropdownPositions {
  sort?: DropdownPosition;
  filter?: DropdownPosition;
}

function DropdownMenu({ 
  visible, 
  options, 
  selectedValue, 
  onSelect,
  onClose,
  style,
  anchorPosition,
}: { 
  visible: boolean;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  style?: any;
  anchorPosition?: { x: number; y: number; width: number; isAbove?: boolean };
}) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const dropdownRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const dropdownStyle = {
    ...styles.dropdownMenu,
    ...(anchorPosition && {
      position: 'absolute',
      top: anchorPosition.y,
      left: anchorPosition.x,
      width: anchorPosition.width,
      maxHeight: 250, // Limit maximum height
    }),
    ...style,
  };

  return (
    <>
      {visible && (
        <TouchableOpacity 
          style={[styles.dropdownOverlay, { zIndex: 998 }]} 
          activeOpacity={1} 
          onPress={onClose}
        />
      )}
      <Animated.View 
        ref={dropdownRef}
        style={[
          dropdownStyle,
          { opacity: fadeAnim, zIndex: 999 },
          { transform: [{ 
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [anchorPosition?.isAbove ? 8 : -8, 0]
            })
          }] }
        ]}
      >
        <ScrollView 
          bounces={false} 
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 250 }}
        >
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
        </ScrollView>
      </Animated.View>
    </>
  );
}

function PlatformIcons({ platforms }: { platforms: string[] }) {
  const visiblePlatforms = platforms.slice(0, 3);
  const remainingCount = platforms.length - 3;

  return (
    <View style={styles.platformIconsRow}>
      {visiblePlatforms.map((platform) => (
        <View key={platform} style={styles.platformIcon}>
          <Ionicons 
            name={getPlatformIconName(platform)}
            size={20}
            color="#666"
          />
        </View>
      ))}
      {remainingCount > 0 && (
        <Text style={styles.remainingPlatformsText}>
          +{remainingCount} more
        </Text>
      )}
    </View>
  );
}

function CompactPostCard({ post, onPress, viewMode, sortBy }: { 
  post: Post; 
  onPress: () => void;
  viewMode: 'grid' | 'list';
  sortBy: SortOption;
}) {
  const [fadeAnim] = useState(new Animated.Value(1));
  
  const getMetricForSort = () => {
    switch (sortBy) {
      case 'popular':
        return { 
          icon: 'heart-outline' as const,
          value: post.metrics.likes,
          label: 'likes'
        };
      case 'impressions':
        return { 
          icon: 'eye-outline' as const,
          value: post.metrics.impressions,
          label: 'views'
        };
      case 'engagement':
        const engagement = post.metrics.likes + post.metrics.comments + post.metrics.shares;
        return { 
          icon: 'trending-up-outline' as const,
          value: engagement,
          label: 'engagement'
        };
      default:
        return { 
          icon: 'time-outline' as const,
          value: format(new Date(post.publishedAt), 'MMM d'),
          label: 'date',
          isDate: true
        };
    }
  };

  const metric = getMetricForSort();

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sortBy]);

  const highlight = getHighlightMetric(post.metrics);
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = viewMode === 'grid' 
    ? (screenWidth - 48) / 2 // 16px padding on sides + 16px gap
    : screenWidth - 32; // 16px padding on both sides

  if (viewMode === 'list') {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity 
          style={[styles.listCard, { width: cardWidth }]} 
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.listContent}>
            <Text style={styles.listCaption} numberOfLines={3}>
              {post.content}
            </Text>
            <View style={styles.listMeta}>
              <View style={styles.listPlatforms}>
                {post.platforms.map((platform) => (
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
              <View style={styles.listMetric}>
                <Ionicons name={metric.icon} size={14} color="#666" />
                <Text style={styles.listMetricText}>
                  {metric.isDate ? metric.value : formatMetricNumber(metric.value as number)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
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
              <Ionicons name={metric.icon} size={14} color="#fff" />
              <Text style={styles.compactMetricText}>
                {metric.isDate ? metric.value : formatMetricNumber(metric.value as number)}
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
    </Animated.View>
  );
}

// Safe date parsing utility
const parsePostDate = (dateValue: any): string => {
  if (!dateValue) return new Date().toISOString(); // Fallback to current date

  try {
    // Handle numeric timestamps
    if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
      return new Date(Number(dateValue)).toISOString();
    }
    
    // Handle ISO strings
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toISOString();
  } catch (error) {
    console.warn('Invalid date value:', dateValue);
    return new Date().toISOString(); // Fallback to current date
  }
};

function WeekSection({ group, onPostPress, isLatestWeek, viewMode, sortBy }: { 
  group: PostGroup; 
  onPostPress: (post: Post) => void;
  isLatestWeek?: boolean;
  viewMode: 'grid' | 'list';
  sortBy: SortOption;
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
          <Text style={styles.weekTitle}>
            {group.title || 'Unknown Date'}
          </Text>
          <PlatformIcons platforms={platforms} />
        </View>
        <Ionicons 
          name={isCollapsed ? 'chevron-down' : 'chevron-up'} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>

      <Animated.View style={[
        styles.postsContainer,
        viewMode === 'grid' && styles.postsGrid,
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
            viewMode={viewMode}
            sortBy={sortBy}
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
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (post.mediaUrl) {
      Image.getSize(post.mediaUrl, (width, height) => {
        setImageAspectRatio(width / height);
      }, (error) => {
        console.log('Error getting image size:', error);
        setImageAspectRatio(1);
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
      <View style={[styles.modalContainer, { backgroundColor: '#fff' }]}>
        <View 
          style={[
            styles.modalHeader, 
            { marginTop: insets.top }
          ]}
        >
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
          contentContainerStyle={{ paddingBottom: insets.bottom }}
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
              <PlatformIcons platforms={post.platforms} />

              {post.folder && (
                <View style={styles.folderContainer}>
                  <Ionicons name="folder-outline" size={16} color="#666" />
                  <Text style={styles.folderText}>{post.folder}</Text>
                </View>
              )}

              <Text style={styles.modalCaption}>{post.content}</Text>

              <View style={styles.statsGrid}>
                {Object.entries(post.metrics as PostMetrics).map(([metricName, value], index) => (
                  <View key={index} style={styles.metricRow}>
                    <Ionicons 
                      name={getMetricIcon(metricName as keyof PostMetrics)} 
                      size={24} 
                      color={colors.primary} 
                    />
                    <Text style={styles.metricValue}>{value}</Text>
                    <Text style={styles.metricLabel}>
                      {metricName.charAt(0).toUpperCase() + metricName.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={[
          styles.bottomButtonContainer, 
          { paddingBottom: Math.max(insets.bottom, 16) }
        ]}>
          <TouchableOpacity 
            style={styles.repostButtonFull}
            activeOpacity={0.8}
          >
            <Text style={styles.repostButtonText}>Repost</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function DropdownButton({ 
  label, 
  value, 
  options, 
  isOpen,
  onPress,
  dropdownStyle,
  buttonRef,
}: { 
  label: string;
  value: string;
  options: DropdownOption[];
  isOpen: boolean;
  onPress: () => void;
  dropdownStyle?: any;
  buttonRef: React.RefObject<View>;
}) {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity 
        ref={buttonRef}
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
              <Ionicons 
                name={selectedOption.icon as keyof typeof Ionicons.glyphMap} 
                size={16} 
                color="#666" 
              />
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

export default function PublishedPostsScreen() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [openDropdown, setOpenDropdown] = useState<DropdownType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dropdownPositions, setDropdownPositions] = useState<DropdownPositions>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const sortButtonRef = useRef<View>(null);
  const filterButtonRef = useRef<View>(null);

  const sortOptions: DropdownOption[] = [
    { label: 'Most Recent', value: 'recent', icon: 'time-outline' },
    { label: 'Oldest', value: 'oldest', icon: 'calendar-outline' },
    { label: 'Most Popular', value: 'popular', icon: 'trending-up-outline' },
    { label: 'Most Engagement', value: 'engagement', icon: 'heart-outline' },
  ];

  const filterOptions: DropdownOption[] = [
    { label: 'All Platforms', value: 'all', icon: 'apps-outline' },
    { label: 'Instagram', value: 'instagram', icon: 'logo-instagram' },
    { label: 'Facebook', value: 'facebook', icon: 'logo-facebook' },
    { label: 'Twitter', value: 'twitter', icon: 'logo-twitter' },
    { label: 'LinkedIn', value: 'linkedin', icon: 'logo-linkedin' },
  ];

  const handleSortChange = (value: SortOption) => {
    setSelectedSort(value);
    setOpenDropdown(null);
  };

  const handleFilterChange = (value: FilterOption) => {
    setSelectedFilter(value);
    setOpenDropdown(null);
  };

  const sortPosts = (posts: Post[], sortBy: SortOption) => {
    return [...posts].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'popular':
          return b.metrics.likes - a.metrics.likes;
        case 'engagement':
          return b.metrics.engagement - a.metrics.engagement;
        case 'impressions':
          return b.metrics.impressions - a.metrics.impressions;
        default:
          return 0;
      }
    });
  };

  const filterPosts = (posts: Post[]): Post[] => {
    if (selectedFilter === 'all') return posts;
    return posts.filter(post => post.platforms.includes(selectedFilter));
  };

  const groupPostsByWeek = (posts: Post[]): PostGroup[] => {
    const filteredPosts = filterPosts(posts);
    const sortedPosts = sortPosts(filteredPosts, selectedSort);

    const grouped = sortedPosts.reduce((groups: { [key: string]: Post[] }, post) => {
      try {
        const date = new Date(post.publishedAt);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        const weekStart = startOfWeek(date);
        const weekKey = weekStart.toISOString();
        
        if (!groups[weekKey]) {
          groups[weekKey] = [];
        }
        groups[weekKey].push(post);
      } catch (error) {
        console.warn('Error grouping post by week:', error);
        // Skip posts with invalid dates
      }
      return groups;
    }, {});

    return Object.entries(grouped).map(([weekKey, posts]) => {
      try {
        const weekStart = new Date(weekKey);
        const weekEnd = endOfWeek(weekStart);
        return {
          title: `${format(weekStart, 'MMM d')}–${format(weekEnd, 'MMM d, yyyy')}`,
          data: posts
        };
      } catch (error) {
        console.warn('Error formatting week dates:', error);
        return {
          title: 'Unknown Week',
          data: posts
        };
      }
    }).sort((a, b) => {
      try {
        return new Date(b.data[0].publishedAt).getTime() - 
               new Date(a.data[0].publishedAt).getTime();
      } catch (error) {
        console.warn('Error sorting weeks:', error);
        return 0;
      }
    });
  };

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      const [scheduledJson, loopJson, manualJson] = await Promise.all([
        AsyncStorage.getItem('publishedScheduledPosts'),
        AsyncStorage.getItem('publishedLoopPosts'),
        AsyncStorage.getItem('publishedPosts')
      ]);

      console.log('🔁 Loading posts from all sources');

      const scheduledPosts = scheduledJson ? JSON.parse(scheduledJson) : [];
      const loopPosts = loopJson ? JSON.parse(loopJson) : [];
      const manualPosts = manualJson ? JSON.parse(manualJson) : [];

      // Combine and normalize posts from all sources
      const combinedPosts = [
        ...scheduledPosts.map((post: any) => ({
          ...post,
          content: post.caption || '',
          mediaUrl: post.mediaUri || '',
          publishedAt: parsePostDate(post.postedAt),
          source: 'schedule',
          metrics: {
            likes: 0,
            views: 0,
            shares: 0,
            comments: 0,
            impressions: 0,
            engagement: 0
          }
        })),
        ...loopPosts.map((post: any) => ({
          ...post,
          content: post.caption || '',
          mediaUrl: post.mediaUri || '',
          publishedAt: parsePostDate(post.postedAt),
          source: 'loop',
          metrics: {
            likes: 0,
            views: 0,
            shares: 0,
            comments: 0,
            impressions: 0,
            engagement: 0
          }
        })),
        ...manualPosts.map((post: any) => ({
          ...post,
          content: post.caption || '',
          mediaUrl: post.mediaUri || '',
          publishedAt: parsePostDate(post.postedAt),
          metrics: {
            likes: 0,
            views: 0,
            shares: 0,
            comments: 0,
            impressions: 0,
            engagement: 0
          }
        }))
      ];

      // Sort by postedAt descending, with safe date parsing
      const sortedPosts = combinedPosts.sort((a, b) => {
        try {
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        } catch (error) {
          console.warn('Error sorting dates:', error);
          return 0; // Keep original order if dates are invalid
        }
      });

      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading published posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const groupedPosts = groupPostsByWeek(posts);

  // Load saved view mode preference
  useEffect(() => {
    const loadViewMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (savedMode === 'grid' || savedMode === 'list') {
          setViewMode(savedMode);
        }
      } catch (error) {
        console.log('Error loading view mode:', error);
      }
    };
    loadViewMode();
  }, []);

  const toggleViewMode = async () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    try {
      await AsyncStorage.setItem(VIEW_MODE_STORAGE_KEY, newMode);
    } catch (error) {
      console.log('Error saving view mode:', error);
    }
  };

  const handleDropdownPress = (type: DropdownType, ref: React.RefObject<View>) => {
    if (ref.current) {
      setTimeout(() => {
        ref.current?.measureInWindow((x, y, width, height) => {
          const screenHeight = Dimensions.get('window').height;
          const dropdownHeight = 200;
          const safeAreaOffset = Platform.OS === 'ios' ? 44 : 0; // Account for status bar
          const headerHeight = 44; // Height of your header
          const filtersHeight = 84; // Height of filters container (padding + content)
          
          // Adjust y position to account for header and safe area
          const adjustedY = y - safeAreaOffset - headerHeight;
          
          // Check if dropdown should show above
          const shouldShowAbove = y + height + dropdownHeight > screenHeight - 100;
          
          setDropdownPositions(prev => ({
            ...prev,
            [type]: {
              x,
              y: shouldShowAbove ? adjustedY - dropdownHeight - 4 : adjustedY + height + 4,
              width,
              isAbove: shouldShowAbove
            }
          }));
        });
      }, 50); // Increased timeout to ensure layout is complete
    }
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const renderIcon = (icon: keyof typeof Ionicons.glyphMap) => {
    return <Ionicons name={icon} size={20} color={colors.grey[600]} />;
  };

  const renderSortIcon = (option: DropdownOption) => {
    if (!option.icon) return null;
    return (
      <View style={styles.iconContainer}>
        {renderIcon(option.icon)}
      </View>
    );
  };

  const renderFilterIcon = (option: DropdownOption) => {
    if (!option.icon) return null;
    return (
      <View style={styles.iconContainer}>
        {renderIcon(option.icon)}
      </View>
    );
  };

  const renderMetricValue = (value: number, type: 'number' | 'percentage' = 'number') => {
    if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
  };

  const renderMetricCard = (metrics: PostMetrics | undefined, label: string, iconName: keyof typeof Ionicons.glyphMap) => {
    if (!metrics) return null;
    
    const metricKey = label.toLowerCase() as keyof PostMetrics;
    const value = metrics[metricKey];
    if (value === undefined) return null;
    
    return (
      <View style={styles.metricCard}>
        <Ionicons name={iconName} size={24} color={colors.primary} />
        <Text style={styles.metricValue}>
          {renderMetricValue(value)}
        </Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.headerTitle}>Published</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleViewMode}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} 
              size={22} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <DropdownButton
          label="Sort by"
          value={selectedSort}
          options={sortOptions}
          isOpen={openDropdown === 'sort'}
          onPress={() => handleDropdownPress('sort', sortButtonRef)}
          buttonRef={sortButtonRef}
        />
        <DropdownButton
          label="Filter by"
          value={selectedFilter}
          options={filterOptions}
          isOpen={openDropdown === 'filter'}
          onPress={() => handleDropdownPress('filter', filterButtonRef)}
          buttonRef={filterButtonRef}
        />

        <DropdownMenu
          visible={openDropdown === 'sort'}
          options={sortOptions}
          selectedValue={selectedSort}
          onSelect={(value) => handleSortChange(value as SortOption)}
          onClose={() => setOpenDropdown(null)}
          anchorPosition={dropdownPositions.sort}
        />

        <DropdownMenu
          visible={openDropdown === 'filter'}
          options={filterOptions}
          selectedValue={selectedFilter}
          onSelect={(value) => handleFilterChange(value as FilterOption)}
          onClose={() => setOpenDropdown(null)}
          anchorPosition={dropdownPositions.filter}
        />
      </View>

      <FlatList
        data={groupedPosts}
        renderItem={({ item, index }) => (
          <WeekSection
            group={item}
            onPostPress={setSelectedPost}
            isLatestWeek={index === 0}
            viewMode={viewMode}
            sortBy={selectedSort}
          />
        )}
        keyExtractor={item => item.title}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading posts...' : 'No published posts yet'}
            </Text>
          </View>
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
    zIndex: 1,
    paddingHorizontal: 16,
  },
  headerLeft: {
    width: 32,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
  postsContainer: {
    overflow: 'hidden',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
    zIndex: 1,
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
    backgroundColor: '#f2f2f7',
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
  },
  dropdownMenu: Platform.select({
    ios: {
      position: 'absolute',
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden' as const,
      zIndex: 1000,
    },
    android: {
      position: 'absolute',
      backgroundColor: '#fff',
      borderRadius: 10,
      elevation: 4,
      overflow: 'hidden' as const,
      zIndex: 1000,
    },
  }) as ViewStyle,
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
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  listContent: {
    padding: 12,
  },
  listCaption: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
    marginBottom: 12,
  },
  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listPlatforms: {
    flexDirection: 'row',
    gap: 4,
  },
  listMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listMetricText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  platformIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  platformIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingPlatformsText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
}); 