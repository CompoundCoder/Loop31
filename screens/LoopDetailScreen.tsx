import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  FlatList,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { Post, Loop } from '../types/Loop';
import { RootStackParamList } from '../navigation/AppNavigator';
import PostHistoryModal from '../components/PostHistoryModal';
import { checkLoopIntegrity, isPostMuted } from '../utils/loopRotation';

type Props = NativeStackScreenProps<RootStackParamList, 'LoopDetailScreen'>;

const shuffleWords = (caption: string): string => {
  const words = caption.split(' ');
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words.join(' ');
};

const formatWithLineBreaks = (caption: string): string => {
  const sentences = caption.split(/[.!?]+/).filter(s => s.trim());
  return sentences.join('.\n\n').trim() + '.';
};

const checkPostFrequency = (post: Post): boolean => {
  if (!post.timesUsed || !post.lastUsedDate) return false;
  
  const thirtyDaysAgo = subDays(new Date(), 30);
  const lastUsed = new Date(post.lastUsedDate);
  
  return post.timesUsed >= 3 && lastUsed > thirtyDaysAgo;
};

const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return '10AM'; // Default time
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return minutes === 0 ? `${hour}${period}` : `${hour}:${minutes}${period}`;
};

const renderScheduleText = (schedule: Loop['schedule']) => {
  if (!schedule) return 'No schedule set';
  const timeStr = formatTime(schedule.postTime);
  
  let daysText = '';
  if (schedule.type === 'weekly' && schedule.daysOfWeek?.length) {
    daysText = `Every ${schedule.daysOfWeek.join(', ')}`;
  } else if (schedule.type === 'interval' && schedule.intervalDays) {
    daysText = `Every ${schedule.intervalDays} days`;
  }
  
  return (
    <View>
      <Text style={styles.scheduleText}>{daysText}</Text>
      <Text style={[styles.scheduleText, styles.timeText]}>{timeStr}</Text>
    </View>
  );
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

export default function LoopDetailScreen({ navigation, route }: Props) {
  const [loop, setLoop] = useState<Loop>({
    ...route.params.loop,
    nextPostIndex: 0
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [integrityWarning, setIntegrityWarning] = useState<string | null>(null);
  const fadeAnim = useRef<{ [key: string]: Animated.Value }>({});
  const scaleAnim = useRef<{ [key: string]: Animated.Value }>({});

  // Check loop integrity when posts or schedule changes
  useEffect(() => {
    const { hasWarning, message } = checkLoopIntegrity(loop);
    setIntegrityWarning(message || null);
  }, [loop.posts, loop.schedule]);

  // Initialize animation values for posts
  useEffect(() => {
    loop.posts.forEach(post => {
      if (!fadeAnim.current[post.id]) {
        fadeAnim.current[post.id] = new Animated.Value(1);
      }
      if (!scaleAnim.current[post.id]) {
        scaleAnim.current[post.id] = new Animated.Value(1);
      }
    });
  }, [loop.posts]);

  // Reload loop data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadLoop = async () => {
        try {
          const loopsJson = await AsyncStorage.getItem('loops');
          const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
          const updatedLoop = loops.find(l => l.id === loop.id);
          if (updatedLoop) {
            setLoop(updatedLoop);
          }
        } catch (error) {
          console.error('Error loading loop:', error);
        }
      };

      loadLoop();
    }, [])
  );

  const getColorWithOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const handleToggleActive = useCallback(async (newValue: boolean) => {
    try {
      // Load all loops
      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      // Update the specific loop
      const updatedLoops = loops.map(l => 
        l.id === loop.id ? { ...l, isActive: newValue } : l
      );
      
      // Save back to storage
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      
      // Update local state
      setLoop(currentLoop => ({ ...currentLoop, isActive: newValue }));
    } catch (error) {
      console.error('Error toggling loop status:', error);
      Alert.alert(
        'Error',
        'Failed to update loop status. Please try again.'
      );
    }
  }, [loop.id]);

  const animatePostMove = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === loop.posts.length - 1)
    ) {
      return;
    }

    const post = loop.posts[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const swapPost = loop.posts[swapIndex];

    // Fade out both posts
    Animated.parallel([
      Animated.timing(fadeAnim.current[post.id], {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim.current[swapPost.id], {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Perform the move
    await movePost(index, direction);

    // Fade both posts back in
    Animated.parallel([
      Animated.timing(fadeAnim.current[post.id], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim.current[swapPost.id], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const movePost = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === loop.posts.length - 1)
    ) {
      return;
    }

    try {
      const newPosts = [...loop.posts];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newPosts[index], newPosts[swapIndex]] = [newPosts[swapIndex], newPosts[index]];

      // Load all loops
      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      // Update the specific loop
      const updatedLoops = loops.map(l => 
        l.id === loop.id ? { ...l, posts: newPosts } : l
      );
      
      // Save back to storage
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      
      // Update local state
      setLoop(currentLoop => ({ ...currentLoop, posts: newPosts }));
    } catch (error) {
      console.error('Error reordering posts:', error);
      Alert.alert('Error', 'Failed to reorder posts. Please try again.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const loopsJson = await AsyncStorage.getItem('loops');
            const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
            
            const updatedLoops = loops.map(l => {
              if (l.id === loop.id) {
                return {
                  ...l,
                  posts: l.posts.filter(p => p.id !== postId)
                };
              }
              return l;
            });
            
            await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
            setLoop(prev => ({
              ...prev,
              posts: prev.posts.filter(p => p.id !== postId)
            }));
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'Failed to delete post. Please try again.');
          }
        },
      },
    ]);
  };

  const handleDuplicatePost = async (post: Post) => {
    try {
      const newPost = {
        ...post,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      const updatedLoops = loops.map(l => {
        if (l.id === loop.id) {
          return {
            ...l,
            posts: [...l.posts, newPost]
          };
        }
        return l;
      });
      
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      setLoop(prev => ({
        ...prev,
        posts: [...prev.posts, newPost]
      }));
    } catch (error) {
      console.error('Error duplicating post:', error);
      Alert.alert('Error', 'Failed to duplicate post. Please try again.');
    }
  };

  const handleDeleteLoop = async () => {
    Alert.alert(
      'Delete Loop',
      'Are you sure you want to delete this loop? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const loopsJson = await AsyncStorage.getItem('loops');
              const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
              const updatedLoops = loops.filter(l => l.id !== loop.id);
              await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting loop:', error);
              Alert.alert('Error', 'Failed to delete loop. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRemixPost = async (post: Post, useAI: boolean = false) => {
    if (useAI) {
      // AI remixing will be implemented later
      return;
    }

    try {
      const remixedPost: Post = {
        ...post,
        id: Date.now().toString(),
        caption: Math.random() > 0.5 
          ? shuffleWords(post.caption) + ' (Remixed)'
          : formatWithLineBreaks(post.caption) + ' (Remixed)',
        createdAt: new Date().toISOString(),
        timesUsed: 0,
      };

      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      const updatedLoops = loops.map(l => {
        if (l.id === loop.id) {
          return {
            ...l,
            posts: [...l.posts, remixedPost]
          };
        }
        return l;
      });
      
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      setLoop(prev => ({
        ...prev,
        posts: [...prev.posts, remixedPost]
      }));
    } catch (error) {
      console.error('Error remixing post:', error);
      Alert.alert('Error', 'Failed to remix post. Please try again.');
    }
  };

  const handleMutePost = async (post: Post) => {
    try {
      const mutedUntil = new Date();
      mutedUntil.setDate(mutedUntil.getDate() + 3);
      
      const updatedPost = {
        ...post,
        isMuted: true,
        mutedUntil: mutedUntil.toISOString()
      };

      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      const updatedLoops = loops.map(l => {
        if (l.id === loop.id) {
          return {
            ...l,
            posts: l.posts.map(p => p.id === post.id ? updatedPost : p)
          };
        }
        return l;
      });
      
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      setLoop(prev => ({
        ...prev,
        posts: prev.posts.map(p => p.id === post.id ? updatedPost : p)
      }));
    } catch (error) {
      console.error('Error muting post:', error);
      Alert.alert('Error', 'Failed to mute post. Please try again.');
    }
  };

  const handleUnmutePost = async (post: Post) => {
    try {
      const updatedPost = {
        ...post,
        isMuted: false,
        mutedUntil: undefined
      };

      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      const updatedLoops = loops.map(l => {
        if (l.id === loop.id) {
          return {
            ...l,
            posts: l.posts.map(p => p.id === post.id ? updatedPost : p)
          };
        }
        return l;
      });
      
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      setLoop(prev => ({
        ...prev,
        posts: prev.posts.map(p => p.id === post.id ? updatedPost : p)
      }));
    } catch (error) {
      console.error('Error unmuting post:', error);
      Alert.alert('Error', 'Failed to unmute post. Please try again.');
    }
  };

  const handleTogglePostNext = async (post: Post) => {
    try {
      const updatedPost = {
        ...post,
        queueStatus: post.queueStatus === 'pinned' ? ('normal' as const) : ('pinned' as const)
      };

      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      const updatedLoops = loops.map(l => {
        if (l.id === loop.id) {
          // If pinning a post, unpin any other pinned posts
          const updatedPosts = l.posts.map(p => {
            if (p.id === post.id) return updatedPost;
            if (updatedPost.queueStatus === 'pinned' && p.queueStatus === 'pinned') {
              return { ...p, queueStatus: 'normal' as const };
            }
            return p;
          });

          return {
            ...l,
            posts: updatedPosts
          };
        }
        return l;
      });
      
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      setLoop(prev => ({
        ...prev,
        posts: prev.posts.map(p => {
          if (p.id === post.id) return updatedPost;
          if (updatedPost.queueStatus === 'pinned' && p.queueStatus === 'pinned') {
            return { ...p, queueStatus: 'normal' as const };
          }
          return p;
        })
      }));
    } catch (error) {
      console.error('Error updating post queue status:', error);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    }
  };

  const handleMoveToBottom = async (post: Post) => {
    try {
      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      const updatedLoops = loops.map(l => {
        if (l.id === loop.id) {
          const otherPosts = l.posts.filter(p => p.id !== post.id);
          return {
            ...l,
            posts: [...otherPosts, post]
          };
        }
        return l;
      });
      
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      setLoop(prev => {
        const otherPosts = prev.posts.filter(p => p.id !== post.id);
        return {
          ...prev,
          posts: [...otherPosts, post]
        };
      });
    } catch (error) {
      console.error('Error moving post:', error);
      Alert.alert('Error', 'Failed to move post. Please try again.');
    }
  };

  const handleSkipNextRound = async (post: Post) => {
    try {
      const updatedPost = {
        ...post,
        queueStatus: 'skipped' as const
      };

      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      const updatedLoops = loops.map(l => {
        if (l.id === loop.id) {
          return {
            ...l,
            posts: l.posts.map(p => p.id === post.id ? updatedPost : p)
          };
        }
        return l;
      });
      
      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      setLoop(prev => ({
        ...prev,
        posts: prev.posts.map(p => p.id === post.id ? updatedPost : p)
      }));
    } catch (error) {
      console.error('Error skipping post:', error);
      Alert.alert('Error', 'Failed to skip post. Please try again.');
    }
  };

  const renderPost = useCallback(({ item, index }: { item: Post; index: number }) => {
    const isMuted = item.isMuted && item.mutedUntil && new Date(item.mutedUntil) > new Date();
    
    return (
      <Animated.View 
        style={[
          { 
            opacity: fadeAnim.current[item.id] || 1,
            transform: [{ scale: scaleAnim.current[item.id] || 1 }]
          },
          isMuted && styles.mutedPost
        ]}
      >
        <TouchableOpacity
          onPress={() => setSelectedPost(item)}
          style={styles.postCard}
        >
          {item.mediaUri ? (
            <Image
              source={{ uri: item.mediaUri }}
              style={styles.thumbnail}
            />
          ) : (
            <View style={styles.noMediaContainer}>
              <Ionicons name="images-outline" size={24} color="#666" />
              <Text style={styles.noMediaText}>No Preview</Text>
            </View>
          )}
          <View style={styles.postInfo}>
            <Text style={styles.caption} numberOfLines={2}>
              {item.caption}
            </Text>
            {item.queueStatus === 'pinned' && (
              <Text style={styles.queueLabel}>⏫ Next Up</Text>
            )}
            <View style={styles.postMetadata}>
              <Text style={styles.date}>
                Created {format(new Date(item.createdAt), 'MMM d, yyyy')}
              </Text>
              {isMuted && (
                <Text style={styles.mutedText}>
                  Muted until {format(new Date(item.mutedUntil!), 'MMM d')}
                </Text>
              )}
              <View style={styles.usageInfo}>
                <Text style={styles.usageText}>
                  Last used: {item.lastUsedDate ? format(new Date(item.lastUsedDate), 'MMM d') : 'Never'}
                </Text>
                <Text style={styles.usageText}>
                  Used {item.timesUsed || 0} times
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.postActions}>
            {checkPostFrequency(item) && (
              <TouchableOpacity
                onPress={() => Alert.alert(
                  'High Usage Warning',
                  'This post has been used multiple times recently. Consider remixing.'
                )}
                style={styles.warningButton}
              >
                <Ionicons name="warning-outline" size={20} color="#FF9500" />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
              onPress={() => animatePostMove(index, 'up')}
              disabled={index === 0}
            >
              <Ionicons 
                name="chevron-up" 
                size={20} 
                color={index === 0 ? '#ccc' : '#666'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.moveButton, index === loop.posts.length - 1 && styles.moveButtonDisabled]}
              onPress={() => animatePostMove(index, 'down')}
              disabled={index === loop.posts.length - 1}
            >
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={index === loop.posts.length - 1 ? '#ccc' : '#666'} 
              />
            </TouchableOpacity>
            <Menu>
              <MenuTrigger>
                <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
              </MenuTrigger>
              <MenuOptions customStyles={menuCustomStyles}>
                <MenuOption onSelect={() => navigation.navigate('CreatePostScreen', {
                  mode: 'loop',
                  loopId: loop.id,
                  existingPost: item
                })}>
                  <View style={styles.menuOption}>
                    <Ionicons name="create-outline" size={20} color="#007AFF" />
                    <Text style={styles.menuOptionText}>Edit Post</Text>
                  </View>
                </MenuOption>
                <MenuOption onSelect={() => handleTogglePostNext(item)}>
                  <View style={styles.menuOption}>
                    <Ionicons 
                      name={item.queueStatus === 'pinned' ? 'arrow-undo' : 'arrow-up'} 
                      size={20} 
                      color="#007AFF" 
                    />
                    <Text style={styles.menuOptionText}>
                      {item.queueStatus === 'pinned' ? 'Remove Next Up' : 'Post Next'}
                    </Text>
                  </View>
                </MenuOption>
                <MenuOption onSelect={() => isMuted ? handleUnmutePost(item) : handleMutePost(item)}>
                  <View style={styles.menuOption}>
                    <Ionicons 
                      name={isMuted ? 'volume-high-outline' : 'volume-mute-outline'} 
                      size={20} 
                      color="#007AFF" 
                    />
                    <Text style={styles.menuOptionText}>
                      {isMuted ? 'Unmute Post' : 'Mute 3 Days'}
                    </Text>
                  </View>
                </MenuOption>
                <MenuOption onSelect={() => handleDuplicatePost(item)}>
                  <View style={styles.menuOption}>
                    <Ionicons name="copy-outline" size={20} color="#007AFF" />
                    <Text style={styles.menuOptionText}>Duplicate Post</Text>
                  </View>
                </MenuOption>
                <MenuOption onSelect={() => handleDeletePost(item.id)}>
                  <View style={styles.menuOption}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.menuOptionText, { color: '#FF3B30' }]}>Delete Post</Text>
                  </View>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [loop.posts.length, movePost, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { backgroundColor: getColorWithOpacity(loop.color, 0.15) }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>{loop.name}</Text>
            {integrityWarning && (
              <TouchableOpacity
                onPress={() => Alert.alert('Loop Warning', integrityWarning)}
                style={styles.warningIcon}
              >
                <Ionicons name="warning" size={20} color="#FF9500" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerRight}>
            <Switch
              value={loop.isActive}
              onValueChange={handleToggleActive}
              trackColor={{ false: '#E5E5EA', true: '#E8F2FF' }}
              thumbColor={loop.isActive ? '#007AFF' : '#FFF'}
            />
            <Menu>
              <MenuTrigger>
                <Ionicons name="ellipsis-vertical" size={24} color="#000" style={styles.menuTrigger} />
              </MenuTrigger>
              <MenuOptions customStyles={menuCustomStyles}>
                <MenuOption onSelect={() => navigation.navigate('CreateLoopScreen', { loop })}>
                  <View style={styles.menuOption}>
                    <Ionicons name="create-outline" size={20} color="#007AFF" />
                    <Text style={styles.menuOptionText}>Edit Loop</Text>
                  </View>
                </MenuOption>
                <MenuOption onSelect={handleDeleteLoop}>
                  <View style={styles.menuOption}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={[styles.menuOptionText, { color: '#FF3B30' }]}>Delete Loop</Text>
                  </View>
                </MenuOption>
              </MenuOptions>
            </Menu>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('CreatePostScreen', { 
                mode: 'loop',
                loopId: loop.id
              })}
            >
              <Ionicons name="add" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <View style={styles.scheduleInfo}>
              {renderScheduleText(loop.schedule)}
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="images-outline" size={20} color="#666" />
            <Text style={styles.statText}>
              {loop.posts.filter(p => !isPostMuted(p)).length} active / {loop.posts.length} total
            </Text>
          </View>
        </View>
      </View>

      <AnimatedFlatList
        data={loop.posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts in this loop yet</Text>
          </View>
        }
      />

      {selectedPost && (
        <PostHistoryModal
          post={selectedPost}
          isVisible={true}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </View>
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
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  menuTrigger: {
    padding: 4,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  scheduleInfo: {
    flex: 1,
  },
  statText: {
    fontSize: 15,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
    marginRight: 8,
  },
  caption: {
    fontSize: 15,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  postActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  moveButton: {
    padding: 8,
  },
  moveButtonDisabled: {
    opacity: 0.5,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
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
  warningButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF5E6',
  },
  postMetadata: {
    gap: 2,
  },
  usageInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  usageText: {
    fontSize: 13,
    color: '#666',
  },
  scheduleText: {
    fontSize: 14,
    color: '#666',
  },
  timeText: {
    marginTop: 2,
    fontSize: 12,
    color: '#888',
  },
  noMediaContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMediaText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  mutedPost: {
    opacity: 0.6,
  },
  mutedText: {
    fontSize: 13,
    color: '#FF9500',
    marginTop: 2,
  },
  queueLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  warningIcon: {
    marginLeft: 8,
    padding: 4,
  },
}); 