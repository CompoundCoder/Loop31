import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { CreateStackParamList } from '../../navigation/CreateNavigator';

type Props = {
  navigation: NativeStackNavigationProp<CreateStackParamList, 'MediaPicker'>;
  route: RouteProp<CreateStackParamList, 'MediaPicker'>;
};

type MediaItem = {
  uri: string;
  type: 'image' | 'video';
};

export default function MediaPickerScreen({ navigation, route }: Props) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newMedia: MediaItem = {
        uri: result.assets[0].uri,
        type: result.assets[0].type === 'video' ? 'video' : 'image',
      };
      setSelectedMedia([...selectedMedia, newMedia]);
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(current => current.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    navigation.navigate('Create', {
      platforms: route.params.platforms,
      media: selectedMedia,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.mediaGrid}>
          {selectedMedia.map((media, index) => (
            <View key={index} style={styles.mediaItem}>
              <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedia(index)}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
              {media.type === 'video' && (
                <View style={styles.videoIndicator}>
                  <Ionicons name="videocam" size={20} color="#fff" />
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={pickImage}>
            <Ionicons name="add" size={40} color="#999" />
            <Text style={styles.addButtonText}>Add Media</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => handleNext()}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { opacity: selectedMedia.length > 0 ? 1 : 0.5 }
          ]}
          onPress={handleNext}
          disabled={selectedMedia.length === 0}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  mediaItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
    position: 'relative',
  },
  mediaPreview: {
    flex: 1,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  addButton: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    borderRadius: 8,
    margin: 4,
  },
  addButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  skipButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 