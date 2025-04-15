import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSettingsScreen() {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150');
  const [username, setUsername] = useState('johndoe');
  const [jobTitle, setJobTitle] = useState('Marketing Manager');
  const [company, setCompany] = useState('Tech Corp');
  const [bio, setBio] = useState('Digital marketing professional with a passion for social media strategy and content creation.');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = () => {
    console.log('Saving profile settings:', {
      profileImage,
      username,
      jobTitle,
      company,
      bio,
    });
    setHasUnsavedChanges(false);
    Alert.alert('Success', 'Profile settings saved successfully');
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'username':
        setUsername(value);
        break;
      case 'jobTitle':
        setJobTitle(value);
        break;
      case 'company':
        setCompany(value);
        break;
      case 'bio':
        setBio(value);
        break;
    }
    setHasUnsavedChanges(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
              testID="profile-image"
            />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={handleImagePick}
              testID="change-photo-button"
            >
              <Ionicons name="camera-outline" size={20} color="#007AFF" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.usernameContainer}>
                <Text style={styles.usernamePrefix}>@</Text>
                <TextInput
                  style={[styles.input, styles.usernameInput]}
                  value={username}
                  onChangeText={(text) => handleFieldChange('username', text)}
                  placeholder="username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="username-input"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Job Title</Text>
              <TextInput
                style={styles.input}
                value={jobTitle}
                onChangeText={(text) => handleFieldChange('jobTitle', text)}
                placeholder="Enter your job title"
                testID="job-title-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={(text) => handleFieldChange('company', text)}
                placeholder="Enter your company name"
                testID="company-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={(text) => handleFieldChange('bio', text)}
                placeholder="Write a short bio"
                multiline
                numberOfLines={4}
                testID="bio-input"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !hasUnsavedChanges && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!hasUnsavedChanges}
            testID="save-button"
          >
            <Text style={[
              styles.saveButtonText,
              !hasUnsavedChanges && styles.saveButtonTextDisabled
            ]}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  usernamePrefix: {
    paddingLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  usernameInput: {
    flex: 1,
    borderWidth: 0,
    marginLeft: 0,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#A2A2A2',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    opacity: 0.6,
  },
}); 