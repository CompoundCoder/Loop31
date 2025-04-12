import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomActionBar from './create/BottomActionBar';
import { format } from 'date-fns';

type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube';

interface PlatformOption {
  id: SocialPlatform;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  maxCharacters?: number;
}

const PLATFORMS: PlatformOption[] = [
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', maxCharacters: 2200 },
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', maxCharacters: 63206 },
  { id: 'tiktok', name: 'TikTok', icon: 'logo-tiktok', maxCharacters: 2200 },
  { id: 'youtube', name: 'YouTube Shorts', icon: 'logo-youtube', maxCharacters: 100 },
];

export default function CreateScreen() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [caption, setCaption] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date());

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const getCharacterCount = () => {
    if (selectedPlatforms.length === 0) return null;
    const minLimit = Math.min(
      ...selectedPlatforms.map(p => 
        PLATFORMS.find(plat => plat.id === p)?.maxCharacters || Infinity
      )
    );
    return `${caption.length}/${minLimit}`;
  };

  const handleSaveDraft = () => {
    const draft = {
      id: Date.now().toString(),
      platforms: selectedPlatforms,
      caption,
      mediaUri,
      scheduledDate: scheduledDate.toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    console.log('Saved draft:', draft);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
  };

  const handleSchedule = () => {
    if (!selectedPlatforms.length || !caption) return;
    
    console.log('Scheduling post for:', scheduledDate);
    // TODO: Implement actual scheduling
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Media Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Media</Text>
            <TouchableOpacity
              style={styles.mediaUpload}
              onPress={pickImage}
            >
              {mediaUri ? (
                <View style={styles.mediaPreviewContainer}>
                  <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={() => setMediaUri(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Ionicons name="image-outline" size={32} color="#666" />
                  <Text style={styles.uploadText}>Add Photo or Video</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Draft Selector */}
          <TouchableOpacity style={styles.draftSelector} onPress={() => console.log('Open drafts')}>
            <View style={styles.draftSelectorContent}>
              <Ionicons name="document-text-outline" size={22} color="#666" />
              <Text style={styles.draftSelectorText}>Select from drafts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Platform Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share to</Text>
            <View style={styles.platformGrid}>
              {PLATFORMS.map(platform => (
                <TouchableOpacity
                  key={platform.id}
                  style={[
                    styles.platformButton,
                    selectedPlatforms.includes(platform.id) && styles.platformButtonSelected
                  ]}
                  onPress={() => togglePlatform(platform.id)}
                >
                  <Ionicons
                    name={platform.icon}
                    size={24}
                    color={selectedPlatforms.includes(platform.id) ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.platformText,
                      selectedPlatforms.includes(platform.id) && styles.platformTextSelected
                    ]}
                  >
                    {platform.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Caption Input */}
          <View style={styles.section}>
            <View style={styles.captionHeader}>
              <Text style={styles.sectionTitle}>Caption</Text>
              {getCharacterCount() && (
                <Text style={styles.characterCount}>{getCharacterCount()}</Text>
              )}
            </View>
            <TextInput
              style={styles.captionInput}
              multiline
              placeholder="Write a caption..."
              value={caption}
              onChangeText={setCaption}
              placeholderTextColor="#999"
            />
          </View>

          {/* Scheduling Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.scheduleButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.scheduleContent}>
                <Ionicons name="calendar-outline" size={22} color="#666" />
                <Text style={styles.scheduleText}>
                  {format(scheduledDate, 'MMM d, yyyy')} at {format(scheduledDate, 'h:mm a')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <SafeAreaView style={styles.datePickerContent}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Schedule Post</Text>
                <TouchableOpacity 
                  onPress={handleDatePickerDone}
                  style={styles.datePickerDoneButton}
                >
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={scheduledDate}
                  mode="datetime"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  textColor="#333"
                  style={styles.datePickerIOS}
                />
              ) : (
                <DateTimePicker
                  value={scheduledDate}
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      <BottomActionBar
        onSaveDraft={handleSaveDraft}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 12,
    paddingBottom: 90,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 16,
    minWidth: '45%',
  },
  platformButtonSelected: {
    backgroundColor: '#2f95dc',
  },
  platformText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  platformTextSelected: {
    color: '#fff',
  },
  mediaUpload: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f9f9f9',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 15,
    color: '#666',
  },
  mediaPreviewContainer: {
    position: 'relative',
  },
  mediaPreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  characterCount: {
    fontSize: 14,
    color: '#999',
  },
  captionInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  scheduleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Slides up from bottom
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Add padding for iOS home indicator
  },
  datePickerContent: {
    width: '100%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  datePickerDoneButton: {
    padding: 8,
  },
  datePickerDoneText: {
    fontSize: 17,
    color: '#2f95dc',
    fontWeight: '600',
  },
  datePickerIOS: {
    height: 250,
    width: '100%',
  },
  draftSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  draftSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftSelectorText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
}); 