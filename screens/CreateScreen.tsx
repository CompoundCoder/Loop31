import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform as RNPlatform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { nanoid } from 'nanoid';
import MediaPicker from './create/MediaPicker';
import PlatformSelector from './create/PlatformSelector';
import DateTimePicker from './create/DateTimePicker';
import { Platform, MediaItem, Post } from '../lib/types';
import { format } from 'date-fns';
import { storageService } from '../lib/services/storage';
import { useNavigation } from '@react-navigation/native';

export default function CreateScreen() {
  const navigation = useNavigation();
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePost = async () => {
    if (!caption || selectedPlatforms.length === 0) {
      Alert.alert('Error', 'Please enter a caption and select at least one platform');
      return;
    }

    try {
      setIsSubmitting(true);

      const newPost: Post = {
        id: nanoid(),
        content: caption,
        platforms: selectedPlatforms,
        media: mediaItems,
        scheduledTime: scheduledDate || new Date(),
        status: scheduledDate ? 'scheduled' : 'draft',
        hashtags: extractHashtags(caption),
        mentions: extractMentions(caption),
        links: [],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      };

      await storageService.savePost(newPost);
      Alert.alert(
        'Success',
        scheduledDate ? 'Post scheduled successfully' : 'Post saved as draft',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w]+/g;
    return (text.match(hashtagRegex) || []).map(tag => tag.slice(1));
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@[\w]+/g;
    return (text.match(mentionRegex) || []).map(mention => mention.slice(1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <MediaPicker
            onMediaSelected={setMediaItems}
            maxItems={10}
          />
          
          <PlatformSelector
            selectedPlatforms={selectedPlatforms}
            onPlatformsChange={setSelectedPlatforms}
          />

          <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Write your caption..."
              multiline
              value={caption}
              onChangeText={setCaption}
              maxLength={2200} // Instagram's limit
            />
            <Text style={styles.characterCount}>
              {caption.length}/2200
            </Text>
          </View>

          <DateTimePicker
            value={scheduledDate}
            onChange={setScheduledDate}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!caption || selectedPlatforms.length === 0) && styles.createButtonDisabled,
            ]}
            onPress={handleCreatePost}
            disabled={!caption || selectedPlatforms.length === 0 || isSubmitting}
          >
            <Text style={styles.createButtonText}>
              {isSubmitting ? 'Saving...' : (scheduledDate ? 'Schedule Post' : 'Save as Draft')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  captionContainer: {
    marginVertical: 10,
  },
  captionInput: {
    minHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  scheduleButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  createButton: {
    backgroundColor: '#2f95dc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 