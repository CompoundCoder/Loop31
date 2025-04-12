import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { MediaItem } from '../../lib/types';

interface MediaPickerProps {
  onMediaSelected: (media: MediaItem[]) => void;
  maxItems?: number;
}

export default function MediaPicker({ onMediaSelected, maxItems = 10 }: MediaPickerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const pickMedia = async () => {
    if (mediaItems.length >= maxItems) {
      // TODO: Show error toast
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: maxItems - mediaItems.length,
    });

    if (!result.canceled) {
      const newMedia: MediaItem[] = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        width: asset.width,
        height: asset.height,
      }));

      const updatedMedia = [...mediaItems, ...newMedia];
      setMediaItems(updatedMedia);
      onMediaSelected(updatedMedia);
    }
  };

  const removeMedia = (index: number) => {
    const updatedMedia = mediaItems.filter((_, i) => i !== index);
    setMediaItems(updatedMedia);
    onMediaSelected(updatedMedia);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
        {mediaItems.map((item, index) => (
          <View key={index} style={styles.mediaItem}>
            <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeMedia(index)}
            >
              <Ionicons name="close-circle" size={24} color="white" />
            </TouchableOpacity>
            {item.type === 'video' && (
              <View style={styles.videoIndicator}>
                <Ionicons name="videocam" size={20} color="white" />
              </View>
            )}
          </View>
        ))}
        {mediaItems.length < maxItems && (
          <TouchableOpacity style={styles.addButton} onPress={pickMedia}>
            <Ionicons name="add" size={40} color="#666" />
            <Text style={styles.addButtonText}>Add Media</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  mediaScroll: {
    flexGrow: 0,
  },
  mediaItem: {
    marginRight: 10,
    position: 'relative',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#666',
    marginTop: 5,
    fontSize: 12,
  },
}); 