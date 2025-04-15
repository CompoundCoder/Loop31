import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import * as ImagePicker from 'expo-image-picker';

interface AccountSettings {
  fullName: string;
  email: string;
  username: string;
  jobTitle: string;
  company: string;
  bio: string;
  twoFactorEnabled: boolean;
}

type EditableFields = Exclude<keyof AccountSettings, 'twoFactorEnabled'>;

const FIELD_LIMITS: Record<EditableFields, number> = {
  fullName: 50,
  email: 100,
  username: 30,
  jobTitle: 50,
  company: 50,
  bio: 160,
};

export default function AccountSettingsScreen() {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<AccountSettings>({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    username: '@johndoe',
    jobTitle: 'Marketing Manager',
    company: 'Tech Corp',
    bio: 'Digital marketing specialist with a passion for social media strategy.',
    twoFactorEnabled: false,
  });

  const handleImagePick = async () => {
    try {
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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateField = (field: EditableFields, value: string): boolean => {
    if (!value.trim()) {
      Alert.alert('Error', `${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty`);
      return false;
    }

    if (value.length > FIELD_LIMITS[field]) {
      Alert.alert('Error', `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${FIELD_LIMITS[field]} characters`);
      return false;
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return false;
      }
    }

    if (field === 'username') {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(value)) {
        Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
        return false;
      }
    }

    return true;
  };

  const handleEditField = (field: EditableFields) => {
    Alert.prompt(
      `Edit ${field.charAt(0).toUpperCase() + field.slice(1)}`,
      `Enter your ${field} (max ${FIELD_LIMITS[field]} characters)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (value) => {
            if (value && validateField(field, value)) {
              setSettings(prev => ({
                ...prev,
                [field]: value
              }));
            }
          }
        }
      ],
      'plain-text',
      settings[field].toString()
    );
  };

  const handleToggleSetting = (setting: keyof AccountSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleResetPassword = () => {
    Alert.alert(
      'Reset Password',
      'We will send you an email with instructions to reset your password.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: () => {
            // Implement password reset logic here
            Alert.alert('Success', 'Password reset email sent to your inbox');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Account Data',
      'We will prepare your account data for export. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // Implement data export logic here
            Alert.alert('Success', 'Your data export has been initiated. You will receive an email when it\'s ready.');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion logic here
            Alert.alert('Account Deleted', 'Your account has been successfully deleted');
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        <SettingsContainer>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={handleImagePick} style={styles.photoContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={40} color="#A0A0A0" />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>{settings.fullName}</Text>
            <Text style={styles.profileUsername}>{settings.username}</Text>
          </View>

          <SettingsSection title="Profile Information">
            <SettingItem
              label="Full Name"
              value={settings.fullName}
              onPress={() => handleEditField('fullName')}
              icon="person-outline"
              rightElement="chevron-forward"
            />
            <SettingItem
              label="Email"
              value={settings.email}
              onPress={() => handleEditField('email')}
              icon="mail-outline"
              rightElement="chevron-forward"
            />
            <SettingItem
              label="Username"
              value={settings.username}
              onPress={() => handleEditField('username')}
              icon="at-outline"
              rightElement="chevron-forward"
            />
            <SettingItem
              label="Job Title"
              value={settings.jobTitle}
              onPress={() => handleEditField('jobTitle')}
              icon="briefcase-outline"
              rightElement="chevron-forward"
            />
            <SettingItem
              label="Company"
              value={settings.company}
              onPress={() => handleEditField('company')}
              icon="business-outline"
              rightElement="chevron-forward"
            />
          </SettingsSection>

          <SettingsSection title="Security">
            <SettingItem
              label="Two-Factor Authentication"
              icon="shield-checkmark-outline"
              onPress={() => handleToggleSetting('twoFactorEnabled')}
              rightElement={
                <Switch
                  value={settings.twoFactorEnabled}
                  onValueChange={() => handleToggleSetting('twoFactorEnabled')}
                />
              }
            />
            <SettingItem
              label="Change Password"
              onPress={handleResetPassword}
              icon="key-outline"
              rightElement="chevron-forward"
            />
          </SettingsSection>

          <SettingsSection title="Account Actions">
            <SettingItem
              label="Export Account Data"
              onPress={handleExportData}
              icon="download-outline"
              rightElement="chevron-forward"
            />
            <SettingItem
              label="Delete Account"
              onPress={handleDeleteAccount}
              icon="trash-outline"
              iconColor="#FF3B30"
              labelStyle={styles.deleteText}
            />
          </SettingsSection>
        </SettingsContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#666',
  },
  deleteText: {
    color: '#FF3B30',
  },
}); 