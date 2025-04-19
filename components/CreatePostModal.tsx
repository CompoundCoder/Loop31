import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { Post } from '../utils/postPublisher';

// Extend the Post interface with createdAt
export interface ExtendedPost extends Post {
  createdAt: string;
}

interface Account {
  id: string;
  type: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Mock accounts data (to be replaced with real data later)
const ACCOUNTS: Account[] = [
  { id: 'ig_1', type: 'instagram', name: 'Main Instagram', icon: 'logo-instagram' },
  { id: 'fb_1', type: 'facebook', name: 'Facebook Page', icon: 'logo-facebook' },
  { id: 'tw_1', type: 'twitter', name: 'Twitter', icon: 'logo-twitter' },
  { id: 'li_1', type: 'linkedin', name: 'LinkedIn', icon: 'logo-linkedin' },
];

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (post: ExtendedPost) => void;
  post?: ExtendedPost;
}

export default function CreatePostModal({ visible, onClose, onSave, post }: CreatePostModalProps) {
  const [caption, setCaption] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialize form when editing an existing post
  useEffect(() => {
    if (post) {
      setCaption(post.caption);
      setMediaUri(post.mediaUri || post.media?.[0] || null);
      setSelectedAccountIds(post.platforms);
      setScheduledDate(post.scheduledDate ? new Date(post.scheduledDate) : new Date());
    }
  }, [post]);

  const handleSelectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setMediaUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleToggleAccount = (accountId: string) => {
    setSelectedAccountIds(current => 
      current.includes(accountId)
        ? current.filter(id => id !== accountId)
        : [...current, accountId]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  const handleSave = () => {
    if (!caption) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }

    if (selectedAccountIds.length === 0) {
      Alert.alert('Error', 'Please select at least one platform');
      return;
    }

    const newPost: ExtendedPost = {
      id: post?.id || Date.now().toString(),
      caption,
      media: mediaUri ? [mediaUri] : undefined,
      mediaUri: mediaUri || undefined,
      platforms: selectedAccountIds,
      scheduledDate: scheduledDate.toISOString(),
      createdAt: post?.createdAt || new Date().toISOString(),
    };

    onSave(newPost);
    resetForm();
  };

  const resetForm = () => {
    if (!post) {
      setCaption('');
      setMediaUri(null);
      setSelectedAccountIds([]);
      setScheduledDate(new Date());
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {post ? 'Edit Post' : 'Create Post'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView style={styles.content}>
            <TouchableOpacity
              style={styles.mediaContainer}
              onPress={handleSelectImage}
              activeOpacity={0.8}
            >
              {mediaUri ? (
                <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
              ) : (
                <View style={styles.mediaPlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#666" />
                  <Text style={styles.mediaPlaceholderText}>Add Media</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={2200}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Platforms</Text>
              <View style={styles.accountsList}>
                {ACCOUNTS.map(account => (
                  <TouchableOpacity
                    key={account.id}
                    style={[
                      styles.accountItem,
                      selectedAccountIds.includes(account.id) && styles.accountItemSelected
                    ]}
                    onPress={() => handleToggleAccount(account.id)}
                  >
                    <Ionicons
                      name={account.icon}
                      size={24}
                      color={selectedAccountIds.includes(account.id) ? '#007AFF' : '#666'}
                    />
                    <Text
                      style={[
                        styles.accountName,
                        selectedAccountIds.includes(account.id) && styles.accountNameSelected
                      ]}
                    >
                      {account.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={24} color="#666" />
                <Text style={styles.dateButtonText}>
                  {format(scheduledDate, 'MMM d, yyyy h:mm a')}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="datetime"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setScheduledDate(date);
                }}
                minimumDate={new Date()}
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {post ? 'Save Changes' : 'Create Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mediaContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    marginBottom: 16,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mediaPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    marginTop: 8,
    fontSize: 15,
    color: '#666',
  },
  captionInput: {
    minHeight: 100,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  accountsList: {
    gap: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    gap: 12,
  },
  accountItemSelected: {
    backgroundColor: '#E8F2FF',
  },
  accountName: {
    fontSize: 15,
    color: '#666',
  },
  accountNameSelected: {
    color: '#007AFF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 15,
    color: '#666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
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
}); 