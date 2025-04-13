import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, Modal, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomActionBar from './create/BottomActionBar';
import { format } from 'date-fns';
import DraftsScreen from './DraftsScreen';
import PlatformSelectModal from './create/PlatformSelectModal';
import AnimatedHeader from '../components/AnimatedHeader';

// Import SOCIAL_ACCOUNTS from PlatformSelectModal when moving to proper state management
const SOCIAL_ACCOUNTS = [
  { id: 'ig1', platform: 'instagram', name: 'Brand Main', icon: 'logo-instagram' },
  { id: 'ig2', platform: 'instagram', name: 'Brand Secondary', icon: 'logo-instagram' },
  { id: 'fb1', platform: 'facebook', name: 'Brand Page', icon: 'logo-facebook' },
  { id: 'tt1', platform: 'tiktok', name: 'Brand TikTok', icon: 'logo-tiktok' },
  { id: 'tw1', platform: 'twitter', name: '@brandhandle', icon: 'logo-twitter' },
];

// Add mock group data (this would come from settings/backend later)
const PLATFORM_GROUPS = {
  'main-brand': {
    id: 'main-brand',
    name: 'Main Brand',
    accountIds: ['ig1', 'fb1', 'tt1'],
  },
  'secondary-brand': {
    id: 'secondary-brand',
    name: 'Secondary Brand',
    accountIds: ['ig2', 'tw1'],
  },
};

export default function CreateScreen() {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDrafts, setShowDrafts] = useState(false);
  const [showPlatformSelect, setShowPlatformSelect] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const selectedAccounts = SOCIAL_ACCOUNTS.filter(account => 
    selectedAccountIds.includes(account.id)
  );

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
    if (selectedAccountIds.length === 0) return null;
    // You'll need to implement proper character limits based on selected accounts
    return `${caption.length}/2200`;
  };

  const handleSaveDraft = () => {
    const draft = {
      id: Date.now().toString(),
      accountIds: selectedAccountIds,
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
    if (!selectedAccountIds.length || !caption) return;
    console.log('Scheduling post for:', scheduledDate);
  };

  const handleEditDraft = (draft: any) => {
    setCaption(draft.caption);
    setMediaUri(draft.mediaUri);
    setSelectedAccountIds(draft.platforms);
  };

  const isGroupSelection = (selectedIds: string[]) => {
    return Object.values(PLATFORM_GROUPS).some(group => 
      group.accountIds.length === selectedIds.length && 
      group.accountIds.every(id => selectedIds.includes(id))
    );
  };

  const getSelectedGroup = (selectedIds: string[]) => {
    return Object.values(PLATFORM_GROUPS).find(group => 
      group.accountIds.length === selectedIds.length && 
      group.accountIds.every(id => selectedIds.includes(id))
    );
  };

  const renderSelectedPlatforms = () => {
    const group = getSelectedGroup(selectedAccountIds);
    
    if (group) {
      // Render group view with stacked icons
      const accounts = group.accountIds.map(id => 
        SOCIAL_ACCOUNTS.find(acc => acc.id === id)
      ).filter(Boolean);
      
      return (
        <View style={styles.groupDisplay}>
          <View style={styles.groupBubble}>
            <View style={styles.stackedIcons}>
              {accounts.map((account, index) => (
                <View 
                  key={account?.id} 
                  style={[
                    styles.stackedIcon,
                    { 
                      left: index * 16,  // Increased spacing between icons
                    }
                  ]}
                >
                  <Ionicons 
                    name={account?.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color="#2f95dc"
                  />
                </View>
              ))}
            </View>
            <Text style={styles.groupName}>{group.name}</Text>
          </View>
        </View>
      );
    }

    // Render individual platform icons
    return (
      <View style={styles.selectedPlatforms}>
        {selectedAccounts.map(account => (
          <View key={account.id} style={styles.platformIcon}>
            <Ionicons 
              name={account.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color="#2f95dc"
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedHeader 
        title="Create" 
        titleStyle={styles.headerTitle}
      />
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
          <TouchableOpacity 
            style={styles.draftSelector} 
            onPress={() => setShowDrafts(true)}
          >
            <View style={styles.draftSelectorContent}>
              <Ionicons name="document-text-outline" size={22} color="#666" />
              <Text style={styles.draftSelectorText}>Select from drafts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* Share To Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share to</Text>
            <TouchableOpacity 
              style={styles.platformSelector}
              onPress={() => setShowPlatformSelect(true)}
            >
              {selectedAccountIds.length > 0 ? (
                renderSelectedPlatforms()
              ) : (
                <View style={styles.platformSelectorContent}>
                  <Ionicons name="share-social-outline" size={22} color="#666" />
                  <Text style={styles.platformSelectorText}>Select platforms</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
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

      {/* Date Picker Modal */}
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

      {/* Drafts Modal */}
      <Modal
        visible={showDrafts}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <DraftsScreen 
          onClose={() => setShowDrafts(false)}
          onEditDraft={handleEditDraft}
        />
      </Modal>

      {/* Platform Select Modal */}
      <PlatformSelectModal
        visible={showPlatformSelect}
        onClose={() => setShowPlatformSelect(false)}
        selectedAccounts={selectedAccountIds}
        onSelectAccounts={setSelectedAccountIds}
      />

      <BottomActionBar
        onSaveDraft={handleSaveDraft}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 100,
    paddingBottom: 90,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  draftSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  platformSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
    minHeight: 48,
  },
  platformSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformSelectorText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  selectedPlatforms: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,  // Added gap for consistent spacing
  },
  stackedIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    position: 'relative',
    minWidth: 60,  // Increased to accommodate wider spacing
  },
  stackedIcon: {
    width: 32,  // Increased width for hit box
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  groupName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginLeft: 4,  // Reduced margin to bring text closer
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
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
  characterCount: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  headerTitle: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
}); 