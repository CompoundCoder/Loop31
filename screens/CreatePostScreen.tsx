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
import { RootStackParamList } from '../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';

interface Post {
  id: string;
  mediaUri: string;
  caption: string;
  createdAt: string;
}

interface Loop {
  id: string;
  name: string;
  isActive: boolean;
  color: string;
  posts: Post[];
}

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePostScreen'>;

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

export default function CreatePostScreen({ navigation, route }: Props) {
  const { mode, loopId, existingPost } = route.params;
  const [caption, setCaption] = useState(existingPost?.caption || '');
  const [originalCaption, setOriginalCaption] = useState<string | null>(null);
  const [mediaUri, setMediaUri] = useState(existingPost?.mediaUri || '');
  const [selectedLoopIds, setSelectedLoopIds] = useState<string[]>(
    loopId ? [loopId] : []
  );
  const [availableLoops, setAvailableLoops] = useState<Loop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isEditing = !!existingPost;

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

  const handleSave = async () => {
    if (!mediaUri) {
      Alert.alert('Error', 'Please select a media file');
      return;
    }

    try {
      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      const newPost = {
        id: existingPost?.id || Date.now().toString(),
        mediaUri,
        caption,
        createdAt: existingPost?.createdAt || new Date().toISOString(),
      };

      const updatedLoops = loops.map(loop => {
        if (selectedLoopIds.includes(loop.id)) {
          if (isEditing) {
            // If editing, replace the existing post
            return {
              ...loop,
              posts: loop.posts.map(post => 
                post.id === existingPost.id ? newPost : post
              ),
            };
          } else {
            // If creating new, append to posts array
            return {
              ...loop,
              posts: [...loop.posts, newPost],
            };
          }
        }
        return loop;
      });

      await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving post:', error);
      Alert.alert('Error', 'Failed to save post. Please try again.');
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

      <ScrollView style={styles.content}>
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

        {!loopId && availableLoops.length > 0 && (
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
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Save Changes' : 'Create Post'}
          </Text>
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
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
}); 