import React, { useState, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Switch, StyleSheet, Alert, Image, Platform, Animated, Modal, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Loop as BaseLoop } from '../types/Loop';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider
} from 'react-native-popup-menu';
import { SearchBar } from '../components/SearchBar';
import { useSearch } from '../hooks/useSearch';

interface Schedule {
  type: 'weekly' | 'interval';
  daysOfWeek?: string[];
  intervalDays?: number;
}

interface Post {
  id: string;
  mediaUri: string;
  caption: string;
  createdAt: string;
}

interface Loop extends BaseLoop {
  isActive: boolean;
  color: string;
  isPinned: boolean;
  posts: Post[];
  schedule: Schedule;
  nextPostIndex: number;
}

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type SortOption = 'name' | 'newest';

interface PreviewPost extends Post {
  index: number;
}

export default function LoopsScreen() {
  const navigation = useNavigation<Navigation>();
  const [loops, setLoops] = useState<Loop[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [selectedLoop, setSelectedLoop] = useState<Loop | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [previewPosts, setPreviewPosts] = useState<PreviewPost[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const searchBarHeight = useRef(new Animated.Value(0)).current;
  const searchAnimating = useRef(false);
  const SEARCH_BAR_HEIGHT = 52;

  const { searchQuery, isSearching, filteredItems, handleSearch } = useSearch({
    items: loops,
    searchableFields: ['name'],
    debounceMs: 250
  });

  const toggleSearch = useCallback(() => {
    if (searchAnimating.current) return;
    searchAnimating.current = true;
    
    const toValue = isSearchVisible ? 0 : SEARCH_BAR_HEIGHT;
    setIsSearchVisible(!isSearchVisible);
    
    Animated.timing(searchBarHeight, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      searchAnimating.current = false;
    });
  }, [isSearchVisible, searchBarHeight]);

  useFocusEffect(
    useCallback(() => {
      loadLoops();
    }, [])
  );

  const loadLoops = async () => {
    try {
      const stored = await AsyncStorage.getItem('loops');
      const parsed = stored ? JSON.parse(stored) : [];
      setLoops(parsed);
    } catch (e) {
      console.error('Error loading loops:', e);
    }
  };

  const handleToggleLoop = async (loopId: string) => {
    const updated = loops.map(loop =>
      loop.id === loopId ? { ...loop, isActive: !loop.isActive } : loop
    );
    setLoops(updated);
    await AsyncStorage.setItem('loops', JSON.stringify(updated));
  };

  const handleDeleteLoop = async (loop: Loop) => {
    setShowOptions(false);
    Alert.alert('Delete Loop', `Delete "${loop.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = loops.filter(l => l.id !== loop.id);
          setLoops(updated);
          await AsyncStorage.setItem('loops', JSON.stringify(updated));
        },
      },
    ]);
  };

  const handleDuplicateLoop = async (loop: Loop) => {
    const copy = {
      ...loop,
      id: Date.now().toString(),
      name: loop.name + ' (Copy)',
      isPinned: false,
      createdAt: new Date(),
    };
    const updated = [...loops, copy];
    setLoops(updated);
    await AsyncStorage.setItem('loops', JSON.stringify(updated));
    setShowOptions(false);
  };

  const getColorWithOpacity = (color: string | undefined, isActive: boolean) => {
    const defaultColor = '#E5E5EA';
    const hexColor = color || defaultColor;
    
    // Convert hex to RGB and apply opacity
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${isActive ? 0.15 : 0.08})`; // 15% or 8% opacity based on active state
  };

  const handleTogglePin = async (loop: Loop) => {
    const updated = loops.map(l =>
      l.id === loop.id ? { ...l, isPinned: !l.isPinned } : l
    );
    setLoops(updated);
    await AsyncStorage.setItem('loops', JSON.stringify(updated));
  };

  const handleLongPress = useCallback((loop: Loop) => {
    if (loop.posts.length === 0) return;
    
    const previewItems = loop.posts
      .slice(0, 3)
      .map((post, index) => ({ ...post, index }));
    
    setPreviewPosts(previewItems);
    setShowPreview(true);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Loops',
      headerTitleAlign: 'left',
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setSortOption(prev => (prev === 'name' ? 'newest' : 'name'))}
          >
            <Ionicons name="swap-vertical-outline" size={18} color="#666" />
            <Text style={styles.headerButtonText}>
              {sortOption === 'name' ? 'A–Z' : 'Newest'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleSearch}
          >
            <Ionicons 
              name={isSearchVisible ? "close-outline" : "search-outline"} 
              size={22} 
              color="#666" 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePostScreen', { mode: 'loop', loopId: '' })}
            style={styles.headerButton}
          >
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, sortOption, isSearchVisible]);

  const sortedLoops = useMemo(() => {
    const itemsToSort = isSearching ? filteredItems : loops;
    
    // Always keep pinned items at the top
    const pinned = itemsToSort.filter(l => l.isPinned);
    const others = itemsToSort.filter(l => !l.isPinned);

    // Sort pinned items by the current sort option
    const sortedPinned = [...pinned].sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Sort unpinned items with boost factors
    const sortedOthers = [...others].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Add score based on activity
      if (a.isActive) scoreA += 2;
      if (b.isActive) scoreB += 2;

      // Add score based on number of posts
      scoreA += Math.min(a.posts.length / 10, 1); // Cap at 1 point
      scoreB += Math.min(b.posts.length / 10, 1);

      // Apply base sorting
      if (sortOption === 'name') {
        return scoreB === scoreA 
          ? a.name.localeCompare(b.name)
          : scoreB - scoreA;
      }
      
      return scoreB === scoreA
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : scoreB - scoreA;
    });

    // Always return pinned items first
    return [...sortedPinned, ...sortedOthers];
  }, [loops, sortOption, isSearching, filteredItems]);

  const getScheduledDaysCount = (schedule: Schedule): number => {
    if (schedule.type === 'weekly') {
      return schedule.daysOfWeek?.length || 0;
    }
    return schedule.intervalDays || 0;
  };

  const getLoopWarning = (loop: Loop): { show: boolean; message: string } => {
    if (loop.posts.length === 0) {
      return { show: true, message: 'This loop is empty' };
    }
    
    const scheduledDays = getScheduledDaysCount(loop.schedule);
    if (loop.posts.length < scheduledDays) {
      return { 
        show: true, 
        message: `This loop will run out of posts soon (${loop.posts.length}/${scheduledDays} posts)`
      };
    }
    
    return { show: false, message: '' };
  };

  const renderLoop = ({ item }: { item: Loop }) => {
    const warning = getLoopWarning(item);
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('LoopDetailScreen', { loop: item })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.8}
        style={styles.loopCardContainer}
      >
        <View style={[
          styles.loopCard,
          { backgroundColor: getColorWithOpacity(item.color, item.isActive) },
          styles.cardShadow
        ]}>
          {/* Preview Image */}
          <View style={styles.previewWrapper}>
            <View style={styles.previewContainer}>
              {item.posts && item.posts.length > 0 && item.posts[0].mediaUri ? (
                <Image
                  source={{ uri: item.posts[0].mediaUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.emptyPreview}>
                  <Ionicons name="images-outline" size={24} color="#999" />
                  <Text style={styles.emptyPreviewText}>No Preview</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.loopContent}>
            <View style={styles.loopHeader}>
              <View style={styles.titleContainer}>
                <Text style={[
                  styles.loopName,
                  !item.isActive && styles.inactiveText
                ]}>{item.name}</Text>
                {item.isPinned && (
                  <Ionicons name="pin" size={16} color="#666" style={styles.pinIcon} />
                )}
                {warning.show && (
                  <TouchableOpacity
                    onPress={() => Alert.alert('Loop Warning', warning.message)}
                    style={styles.warningIcon}
                  >
                    <Ionicons name="alert-circle-outline" size={18} color="#FF9500" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.rightSide}>
                <Switch
                  value={item.isActive}
                  onValueChange={() => handleToggleLoop(item.id)}
                  trackColor={{ false: '#E5E5EA', true: '#E8F2FF' }}
                  thumbColor={item.isActive ? '#007AFF' : '#FFF'}
                />
                <Menu>
                  <MenuTrigger>
                    <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                  </MenuTrigger>
                  <MenuOptions customStyles={menuCustomStyles}>
                    <MenuOption onSelect={() => navigation.navigate('CreateLoopScreen', { loop: item })}>
                      <View style={styles.menuOption}>
                        <Ionicons name="create-outline" size={20} color="#007AFF" />
                        <Text style={styles.menuOptionText}>Edit Loop</Text>
                      </View>
                    </MenuOption>
                    <MenuOption onSelect={() => handleDuplicateLoop(item)}>
                      <View style={styles.menuOption}>
                        <Ionicons name="copy-outline" size={20} color="#007AFF" />
                        <Text style={styles.menuOptionText}>Duplicate Loop</Text>
                      </View>
                    </MenuOption>
                    <MenuOption onSelect={() => handleTogglePin(item)}>
                      <View style={styles.menuOption}>
                        <Ionicons 
                          name={item.isPinned ? "pin-outline" : "pin"} 
                          size={20} 
                          color="#007AFF" 
                        />
                        <Text style={styles.menuOptionText}>
                          {item.isPinned ? 'Unpin Loop' : 'Pin Loop'}
                        </Text>
                      </View>
                    </MenuOption>
                    <MenuOption onSelect={() => handleDeleteLoop(item)}>
                      <View style={styles.menuOption}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        <Text style={[styles.menuOptionText, { color: '#FF3B30' }]}>
                          Delete Loop
                        </Text>
                      </View>
                    </MenuOption>
                  </MenuOptions>
                </Menu>
              </View>
            </View>
            <Text style={[
              styles.scheduleText,
              !item.isActive && styles.inactiveText
            ]}>
              {item.schedule.type === 'weekly'
                ? `Every ${item.schedule.daysOfWeek?.join(', ')}`
                : `Every ${item.schedule.intervalDays} days`}
            </Text>
            <Text style={[
              styles.statusText,
              !item.isActive && styles.inactiveText
            ]}>
              {item.posts.length > 0 ? `${item.posts.length} posts` : 'Empty'} ·{' '}
              {item.isActive ? 'Active' : 'Paused'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MenuProvider>
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClose={toggleSearch}
          animatedHeight={searchBarHeight}
          placeholder="Search loops..."
        />
        <FlatList
          data={sortedLoops}
          renderItem={renderLoop}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isSearching ? 'No matches found' : 'No loops created yet'}
              </Text>
            </View>
          }
          contentInsetAdjustmentBehavior="automatic"
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateLoopScreen', { loop: undefined })}
        >
          <Ionicons name="add-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <Modal
          visible={showPreview}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPreview(false)}
        >
          <Pressable
            style={styles.previewOverlay}
            onPress={() => setShowPreview(false)}
          >
            <View style={styles.previewModal}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Recent Posts</Text>
                <TouchableOpacity onPress={() => setShowPreview(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.previewGrid}>
                {previewPosts.map((post) => (
                  <View key={post.id} style={styles.previewItem}>
                    <Image
                      source={{ uri: post.mediaUri }}
                      style={styles.previewItemImage}
                      resizeMode="cover"
                    />
                    <Text numberOfLines={2} style={styles.previewCaption}>
                      {post.caption}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        </Modal>
      </View>
    </MenuProvider>
  );
}

const menuCustomStyles = {
  optionsContainer: {
    borderRadius: 12,
    padding: 4,
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.95)',
      android: '#fff'
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    width: 180,
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  headerButtonText: {
    fontSize: 13,
    color: '#666',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginLeft: 6,
  },
  loopCardContainer: { 
    alignItems: 'center', 
    marginBottom: 12 
  },
  loopCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 600,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loopHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  rightSide: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  scheduleText: { 
    fontSize: 13, 
    color: '#666', 
    marginTop: 8 
  },
  statusText: { 
    fontSize: 13, 
    color: '#999', 
    marginTop: 4 
  },
  inactiveText: {
    opacity: 0.6
  },
  emptyContainer: { 
    paddingTop: 40, 
    alignItems: 'center' 
  },
  emptyText: { 
    color: '#999' 
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  previewWrapper: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  emptyPreview: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPreviewText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  loopContent: {
    flex: 1,
    padding: 16,
  },
  loopName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  menuOptionText: {
    fontSize: 15,
    color: '#007AFF',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxWidth: 400,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewItem: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '30%',
  },
  previewItemImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 6,
    marginBottom: 4,
  },
  previewCaption: {
    fontSize: 12,
    color: '#666',
  },
  warningIcon: {
    marginLeft: 6,
    opacity: 0.8,
  },
});
