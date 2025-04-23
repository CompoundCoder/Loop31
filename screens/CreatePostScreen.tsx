import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';
import { Loop, Post } from '../types/Loop';
import { ScheduledPost } from '../types/Schedule';

interface ScheduledPostWithTarget extends ScheduledPost {
  targetId: string;
  targetType: 'brandGroup' | 'account';
}

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePostScreen'>;

type RouteParams = {
  mode: 'loop' | 'schedule';
  loopId?: string;
  existingPost?: Post | ScheduledPost;
};

interface BrandGroup {
  id: string;
  name: string;
  accounts: string[];
}

interface Account {
  id: string;
  name: string;
  type: string;
  icon: string;
}

type Target = {
  id: string;
  type: 'brandGroup' | 'account';
};

// TODO: Replace with AI paraphrasing API (e.g., Sapling or OpenAI)
const remixCaption = (caption: string): string => {
  // Simple sentence reordering for now
  const sentences = caption.split(/[.!?]+/).filter(s => s.trim());
  const reordered = [...sentences];
  for (let i = reordered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
  }
  return reordered.join('. ').trim() + '.';
};

const TIME_PRESETS = [
  { label: 'Morning', time: '09:00', period: 'AM' },
  { label: 'Noon', time: '12:00', period: 'PM' },
  { label: 'Evening', time: '06:00', period: 'PM' },
];

export default function CreatePostScreen({ navigation, route }: Props) {
  const { mode, loopId, existingPost } = route.params as RouteParams;
  const isEditing = !!existingPost;
  const isScheduleMode = mode === 'schedule';

  // Get default date (tomorrow at noon)
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0);
    return date;
  };

  const [caption, setCaption] = useState(existingPost?.caption || '');
  const [originalCaption, setOriginalCaption] = useState<string | null>(null);
  const [mediaUri, setMediaUri] = useState(existingPost?.mediaUri || '');
  const [selectedLoopIds, setSelectedLoopIds] = useState<string[]>(
    loopId ? [loopId] : []
  );
  const [availableLoops, setAvailableLoops] = useState<Loop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [linkedLoops, setLinkedLoops] = useState<Loop[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (isScheduleMode && existingPost && 'scheduledDate' in existingPost && typeof existingPost.scheduledDate === 'string') {
      return new Date(existingPost.scheduledDate);
    }
    return getDefaultDate();
  });
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [showLoopSelector, setShowLoopSelector] = useState(!isScheduleMode);
  const [brandGroups, setBrandGroups] = useState<BrandGroup[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(
    existingPost && 'targetId' in existingPost && 'targetType' in existingPost
      ? { 
          id: String(existingPost.targetId), 
          type: existingPost.targetType as 'brandGroup' | 'account'
        }
      : null
  );
  const [showTargetSelector, setShowTargetSelector] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? 'Edit Post' : 'Create Post',
    });
  }, [navigation, isEditing]);

  // Load available loops on mount
  useEffect(() => {
    const loadLoops = async () => {
      try {
        const loopsJson = await AsyncStorage.getItem('loops');
        const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
        setAvailableLoops(loops);
      } catch (error) {
        console.error('Error loading loops:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLoops();
  }, []);

  // Load linked loops only in loop mode
  useEffect(() => {
    if (!isScheduleMode && isEditing && (existingPost as Post).linkedLoopIds) {
      loadLinkedLoops();
    }
  }, []);

  const loadLinkedLoops = async () => {
    try {
      const loopsJson = await AsyncStorage.getItem('loops');
      const allLoops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      const linked = allLoops.filter(loop => 
        (existingPost as Post).linkedLoopIds?.includes(loop.id)
      );
      setLinkedLoops(linked);
    } catch (error) {
      console.error('Error loading linked loops:', error);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
    }
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(newDate);
    }
  };

  const handleTimePreset = (hours: number, minutes: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes);
    setSelectedDate(newDate);
  };

  // Load brand groups and accounts
  useEffect(() => {
    const loadTargets = async () => {
      try {
        const [groupsJson, accountsJson] = await Promise.all([
          AsyncStorage.getItem('brandGroups'),
          AsyncStorage.getItem('connectedAccounts')
        ]);
        
        setBrandGroups(groupsJson ? JSON.parse(groupsJson) : []);
        setAccounts(accountsJson ? JSON.parse(accountsJson) : []);
      } catch (error) {
        console.error('Error loading targets:', error);
      }
    };

    if (isScheduleMode) {
      loadTargets();
    }
  }, [isScheduleMode]);

  const handleTargetSelect = (id: string, type: 'brandGroup' | 'account') => {
    setSelectedTarget({ id, type });
    setShowTargetSelector(false);
  };

  const handleSave = async () => {
    if (!caption.trim() && !mediaUri) {
      Alert.alert('Error', 'Please add a caption or media');
      return;
    }

    if (isScheduleMode) {
      if (!selectedTarget) {
        Alert.alert('Error', 'Please select where to post');
        return;
      }

      const now = new Date();
      if (selectedDate <= now) {
        Alert.alert('Error', 'Please select a future date and time');
        return;
      }

      const postData: ScheduledPostWithTarget = {
        id: existingPost?.id || Date.now().toString(),
        caption: caption.trim(),
        mediaUri,
        createdAt: existingPost?.createdAt || new Date().toISOString(),
        scheduledDate: selectedDate.toISOString(),
        targetId: selectedTarget!.id,
        targetType: selectedTarget!.type,
      };

      try {
        const scheduledPostsJson = await AsyncStorage.getItem('scheduledPosts');
        const scheduledPosts: ScheduledPost[] = scheduledPostsJson ? JSON.parse(scheduledPostsJson) : [];

        if (isEditing && existingPost && 'scheduledDate' in existingPost) {
          const updatedPosts = scheduledPosts.map(p => 
            p.id === existingPost.id ? postData : p
          );
          await AsyncStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts));
        } else {
          await AsyncStorage.setItem('scheduledPosts', JSON.stringify([...scheduledPosts, postData]));
        }

        navigation.goBack();
      } catch (error) {
        console.error('Error saving scheduled post:', error);
        Alert.alert('Error', 'Failed to save post. Please try again.');
      }
    } else {
      // Handle loop post save
      try {
        const loopsJson = await AsyncStorage.getItem('loops');
        const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
        
        const currentLoop = loops.find(l => l.id === loopId);
        if (!currentLoop) {
          throw new Error('Loop not found');
        }

        const now = new Date().toISOString();
        const postData: Post = {
          id: existingPost?.id || Date.now().toString(),
          caption: caption.trim(),
          mediaUri,
          createdAt: existingPost?.createdAt || now,
          timesUsed: (existingPost as Post)?.timesUsed || 0,
          linkedLoopIds: ((existingPost as Post)?.linkedLoopIds?.filter(Boolean) as string[]) || [loopId],
        };

        // If editing, update post in all linked loops
        const linkedIds = (existingPost as Post)?.linkedLoopIds;
        if (isEditing && linkedIds && linkedIds.length > 1) {
          Alert.alert(
            'Update All Linked Loops',
            'This post is used in multiple loops. Changes will apply to all loops using this post.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Update All',
                onPress: async () => {
                  const updatedLoops = loops.map(loop => {
                    if (linkedIds.includes(loop.id)) {
                      return {
                        ...loop,
                        posts: loop.posts.map(p => 
                          p.id === existingPost.id ? postData : p
                        ),
                      };
                    }
                    return loop;
                  });
                  await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
                  navigation.goBack();
                },
              },
            ],
          );
          return;
        }

        // Regular save for new post or single-loop edit
        const updatedLoops = loops.map(loop => {
          if (loop.id === loopId) {
            const posts = isEditing ?
              loop.posts.map(p => p.id === existingPost.id ? postData : p) :
              [...loop.posts, postData];
            return { ...loop, posts };
          }
          return loop;
        });

        await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
        navigation.goBack();
      } catch (error) {
        console.error('Error saving post:', error);
        Alert.alert('Error', 'Failed to save post. Please try again.');
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!caption.trim() && !mediaUri) {
      Alert.alert('Error', 'Please add a caption or media');
      return;
    }

    try {
      // Check if this post is already scheduled
      const scheduledPostsJson = await AsyncStorage.getItem('scheduledPosts');
      const scheduledPosts: ScheduledPost[] = scheduledPostsJson ? JSON.parse(scheduledPostsJson) : [];
      
      if (existingPost && scheduledPosts.some(p => p.id === existingPost.id)) {
        Alert.alert('Error', 'Cannot save a scheduled post as draft');
        return;
      }

      const draftData: ScheduledPost = {
        id: existingPost?.id || Date.now().toString(),
        caption: caption.trim(),
        mediaUri,
        createdAt: existingPost?.createdAt || new Date().toISOString(),
        scheduledDate: isScheduleMode ? selectedDate.toISOString() : undefined,
      };

      const draftsJson = await AsyncStorage.getItem('scheduledDrafts');
      const drafts: ScheduledPost[] = draftsJson ? JSON.parse(draftsJson) : [];

      // Check if we're editing an existing draft
      if (existingPost && drafts.some(d => d.id === existingPost.id)) {
        const updatedDrafts = drafts.map(d => 
          d.id === existingPost.id ? draftData : d
        );
        await AsyncStorage.setItem('scheduledDrafts', JSON.stringify(updatedDrafts));
      } else {
        // Add new draft
        await AsyncStorage.setItem('scheduledDrafts', JSON.stringify([...drafts, draftData]));
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    }
  };

  const handleToggleLoop = (loopId: string) => {
    setSelectedLoopIds(prev => {
      if (prev.includes(loopId)) {
        return prev.filter(id => id !== loopId);
      }
      return [...prev, loopId];
    });
  };

  const handleRemix = () => {
    if (!originalCaption) {
      setOriginalCaption(caption); // Store original before first remix
    }
    setCaption(remixCaption(caption));
  };

  const handleUndoRemix = () => {
    if (originalCaption) {
      setCaption(originalCaption);
      setOriginalCaption(null);
    }
  };

  // Reset original caption if user manually edits after remix
  const handleCaptionChange = (text: string) => {
    setCaption(text);
    if (originalCaption && text !== remixCaption(originalCaption)) {
      setOriginalCaption(null);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove',
          style: 'destructive',
          onPress: () => setMediaUri('')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Edit Post' : 'Create Post'}
        </Text>
        <View style={styles.backButton} />
      </View>

      {!isScheduleMode && isEditing && linkedLoops.length > 1 && (
        <View style={styles.linkedLoopsContainer}>
          <View style={styles.linkedLoopsBadge}>
            <Ionicons name="sync" size={16} color="#007AFF" />
            <Text style={styles.linkedLoopsText}>
              Used in {linkedLoops.length} loops
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          <TouchableOpacity 
            style={styles.mediaUpload}
            onPress={pickImage}
          >
            {mediaUri ? (
              <View style={styles.mediaContainer}>
                <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
                <TouchableOpacity
                  style={styles.clearMediaButton}
                  onPress={clearImage}
                >
                  <View style={styles.clearMediaButtonInner}>
                    <Ionicons name="close" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Ionicons name="image-outline" size={32} color="#999" />
                <Text style={styles.mediaPlaceholderText}>
                  {isEditing ? 'Replace Media' : 'Add Media'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.captionHeader}>
            <Text style={styles.sectionTitle}>Caption</Text>
            <View style={styles.remixButtons}>
              {originalCaption && (
                <TouchableOpacity
                  style={styles.undoButton}
                  onPress={handleUndoRemix}
                >
                  <Ionicons name="arrow-undo-outline" size={18} color="#666" />
                  <Text style={styles.undoButtonText}>Undo</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.remixButton}
                onPress={handleRemix}
              >
                <Ionicons name="repeat-outline" size={20} color="#007AFF" />
                <Text style={styles.remixButtonText}>Remix</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={handleCaptionChange}
            placeholder="Write a caption..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        {isScheduleMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Post As</Text>
            <TouchableOpacity
              style={[
                styles.targetSelector,
                showTargetSelector && styles.targetSelectorOpen
              ]}
              onPress={() => setShowTargetSelector(!showTargetSelector)}
            >
              {selectedTarget ? (
                <View style={styles.selectedTarget}>
                  <Ionicons 
                    name={selectedTarget.type === 'brandGroup' ? 'people-outline' : 'person-outline'} 
                    size={20} 
                    color="#666" 
                  />
                  <Text style={styles.selectedTargetText}>
                    {selectedTarget.type === 'brandGroup'
                      ? brandGroups.find(g => g.id === selectedTarget.id)?.name
                      : accounts.find(a => a.id === selectedTarget.id)?.name}
                  </Text>
                </View>
              ) : (
                <Text style={styles.targetPlaceholder}>Select where to post</Text>
              )}
              <Ionicons 
                name={showTargetSelector ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

            {showTargetSelector && (
              <View style={styles.targetOptions}>
                {brandGroups.length > 0 && (
                  <>
                    <Text style={styles.targetGroupLabel}>Brand Groups</Text>
                    {brandGroups.map(group => (
                      <TouchableOpacity
                        key={group.id}
                        style={[
                          styles.targetOption,
                          selectedTarget?.id === group.id && styles.targetOptionSelected
                        ]}
                        onPress={() => handleTargetSelect(group.id, 'brandGroup')}
                      >
                        <View style={styles.targetOptionContent}>
                          <Ionicons name="people" size={20} color="#666" />
                          <Text style={styles.targetOptionText}>{group.name}</Text>
                        </View>
                        {selectedTarget?.id === group.id && (
                          <Ionicons name="checkmark" size={20} color="#007AFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                <Text style={styles.targetGroupLabel}>Connected Accounts</Text>
                {accounts.map(account => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.targetOption,
                      selectedTarget?.id === account.id && styles.targetOptionSelected
                    ]}
                    onPress={() => handleTargetSelect(account.id, 'account')}
                  >
                    <View style={styles.targetOptionContent}>
                      <Ionicons 
                        name={
                          account.type === 'instagram' ? 'logo-instagram' :
                          account.type === 'facebook' ? 'logo-facebook' :
                          account.type === 'twitter' ? 'logo-twitter' :
                          account.type === 'linkedin' ? 'logo-linkedin' :
                          account.type === 'tiktok' ? 'logo-tiktok' :
                          'share-social'
                        } 
                        size={20} 
                        color="#666" 
                      />
                      <Text style={styles.targetOptionText}>{account.name}</Text>
                    </View>
                    {selectedTarget?.id === account.id && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {isScheduleMode && (
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleContainer}>
              <View style={styles.scheduleLabelRow}>
                <Ionicons name="calendar-outline" size={24} color="#666" />
                <Text style={styles.scheduleLabel}>Pick a Date</Text>
              </View>

              {Platform.OS === 'ios' ? (
                <View style={styles.calendarWrapper}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.androidDateButton}
                  onPress={() => setShowAndroidPicker(true)}
                >
                  <Text style={styles.dateDisplay}>
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </Text>
                </TouchableOpacity>
              )}

              {showAndroidPicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              <View style={styles.timeRow}>
                {TIME_PRESETS.map(({ label, time, period }) => {
                  const [hours, minutes] = time.split(':').map(Number);
                  const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : hours;
                  const isSelected = 
                    format(selectedDate, 'HH:mm') === 
                    `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

                  return (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.timeButton,
                        isSelected && styles.timeButtonSelected
                      ]}
                      onPress={() => handleTimePreset(adjustedHours, minutes)}
                    >
                      <Text style={[
                        styles.timeButtonLabel,
                        isSelected && styles.timeButtonLabelSelected
                      ]}>
                        {label}
                      </Text>
                      <Text style={[
                        styles.timeButtonTime,
                        isSelected && styles.timeButtonLabelSelected
                      ]}>
                        {`${time} ${period}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.selectedDateTime}>
                <Text style={styles.selectedDateTimeLabel}>Selected Time:</Text>
                <Text style={styles.selectedDateTimeValue}>
                  {format(selectedDate, 'EEEE, MMMM d')} at {format(selectedDate, 'h:mm a')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {!loopId && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.loopToggleBadge}
              onPress={() => setShowLoopSelector(!showLoopSelector)}
            >
              <Ionicons 
                name={showLoopSelector ? "remove-circle-outline" : "add-circle-outline"} 
                size={18} 
                color="#666" 
              />
              <Text style={styles.loopToggleText}>
                {showLoopSelector ? 'Close Loop Options' : 'Add to Loop'}
              </Text>
            </TouchableOpacity>

            {showLoopSelector && availableLoops.length > 0 && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Loops</Text>
                  <View style={styles.loopsList}>
                    {availableLoops.map(loop => (
                      <TouchableOpacity
                        key={loop.id}
                        style={[
                          styles.loopItem,
                          selectedLoopIds.includes(loop.id) && styles.loopItemSelected
                        ]}
                        onPress={() => handleToggleLoop(loop.id)}
                      >
                        <View style={styles.loopItemLeft}>
                          <View style={[styles.loopColorDot, { backgroundColor: loop.color }]} />
                          <Text
                            style={[
                              styles.loopName,
                              selectedLoopIds.includes(loop.id) && styles.loopNameSelected
                            ]}
                          >
                            {loop.name}
                          </Text>
                        </View>
                        <Ionicons
                          name={selectedLoopIds.includes(loop.id) ? "checkmark-circle" : "checkmark-circle-outline"}
                          size={24}
                          color={selectedLoopIds.includes(loop.id) ? "#007AFF" : "#666"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isScheduleMode ? (
          <View style={styles.footerButtonRow}>
            <TouchableOpacity
              style={styles.draftButton}
              onPress={handleSaveDraft}
              activeOpacity={0.8}
            >
              <Text style={styles.draftButtonText}>Save as Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.scheduleButtonText}>Schedule Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Save Changes' : 'Create Post'}
            </Text>
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  mediaUpload: {
    aspectRatio: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    marginTop: 8,
    fontSize: 15,
    color: '#999',
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },
  loopsList: {
    gap: 12,
  },
  loopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 12,
  },
  loopItemSelected: {
    backgroundColor: '#E8F2FF',
  },
  loopItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loopColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loopName: {
    fontSize: 15,
    color: '#000',
  },
  loopNameSelected: {
    color: '#007AFF',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  footerButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  remixButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  remixButtonText: {
    fontSize: 15,
    color: '#007AFF',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  undoButtonText: {
    fontSize: 13,
    color: '#666',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  clearMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  clearMediaButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedLoopsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  linkedLoopsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  linkedLoopsText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  scheduleSection: {
    padding: 16,
  },
  scheduleContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  scheduleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  scheduleLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  calendarWrapper: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  androidDateButton: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateDisplay: {
    fontSize: 17,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  timeButtonLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
    marginBottom: 4,
  },
  timeButtonTime: {
    fontSize: 13,
    color: '#666',
  },
  timeButtonLabelSelected: {
    color: '#fff',
  },
  selectedDateTime: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 12,
  },
  selectedDateTimeLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  selectedDateTimeValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  loopToggleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 16,
    marginLeft: 16,
    gap: 6,
  },
  loopToggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  targetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
  },
  targetSelectorOpen: {
    marginBottom: 12,
  },
  selectedTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedTargetText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  targetPlaceholder: {
    fontSize: 15,
    color: '#666',
  },
  targetOptions: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 8,
  },
  targetGroupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  targetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  targetOptionSelected: {
    backgroundColor: '#E8F2FF',
  },
  targetOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetOptionText: {
    fontSize: 15,
    color: '#000',
  },
}); 