import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreateStackParamList } from '../../navigation/CreateNavigator';

type Props = {
  navigation: NativeStackNavigationProp<CreateStackParamList, 'CreateMain'>;
};

export default function CreateScreen({ navigation }: Props) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

  const handleNext = () => {
    if (selectedPlatforms.length === 0) {
      navigation.navigate('PlatformSelect');
    } else if (content.trim()) {
      navigation.navigate('Schedule', {
        platforms: selectedPlatforms,
        media: selectedMedia,
        content: content.trim(),
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        {/* Platform Selection */}
        <TouchableOpacity
          style={styles.platformSelector}
          onPress={() => navigation.navigate('PlatformSelect')}
        >
          {selectedPlatforms.length === 0 ? (
            <View style={styles.platformPrompt}>
              <Ionicons name="add-circle-outline" size={24} color="#2f95dc" />
              <Text style={styles.platformPromptText}>Select Platforms</Text>
            </View>
          ) : (
            <View style={styles.selectedPlatforms}>
              {selectedPlatforms.map(platform => (
                <View key={platform} style={styles.platformChip}>
                  <Ionicons 
                    name={`logo-${platform.toLowerCase()}`} 
                    size={18} 
                    color="#666" 
                  />
                  <Text style={styles.platformChipText}>
                    {platform}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Media Preview */}
        <TouchableOpacity
          style={styles.mediaSelector}
          onPress={() => navigation.navigate('MediaPicker', { platforms: selectedPlatforms })}
        >
          <Ionicons name="image-outline" size={24} color="#2f95dc" />
          <Text style={styles.mediaSelectorText}>Add Photos or Video</Text>
        </TouchableOpacity>

        {/* Content Input */}
        <TextInput
          style={styles.contentInput}
          multiline
          placeholder="What would you like to share?"
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
        />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="save-outline" size={24} color="#666" />
          <Text style={styles.actionButtonText}>Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.nextButton,
            { opacity: content.trim() ? 1 : 0.5 }
          ]}
          onPress={handleNext}
          disabled={!content.trim()}
        >
          <Text style={styles.nextButtonText}>
            {selectedPlatforms.length === 0 ? 'Select Platforms' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  platformSelector: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  platformPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformPromptText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2f95dc',
  },
  selectedPlatforms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  platformChipText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  mediaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mediaSelectorText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2f95dc',
  },
  contentInput: {
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    backgroundColor: '#2f95dc',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 