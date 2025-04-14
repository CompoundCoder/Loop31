import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CreateStackParamList } from '../../navigation/CreateNavigator';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../navigation/BottomTabNavigator';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompositeNavigationProp } from '@react-navigation/native';

type ScheduleScreenNavigationProp = CompositeNavigationProp<
  NativeStackScreenProps<CreateStackParamList, 'Schedule'>['navigation'],
  BottomTabNavigationProp<RootTabParamList>
>;

type Props = NativeStackScreenProps<CreateStackParamList, 'Schedule'>;

const getPlatformIcon = (platformId: string): keyof typeof Ionicons.glyphMap => {
  // Extract platform type from ID (assuming format like 'ig1', 'fb1', etc.)
  const platformType = platformId.replace(/[0-9]/g, '').toLowerCase();
  
  switch (platformType) {
    case 'ig':
      return 'logo-instagram';
    case 'fb':
      return 'logo-facebook';
    case 'tw':
      return 'logo-twitter';
    case 'tt':
      return 'logo-tiktok';
    case 'li':
      return 'logo-linkedin';
    default:
      return 'share-social';
  }
};

export default function ScheduleScreen() {
  const navigation = useNavigation<ScheduleScreenNavigationProp>();
  const route = useRoute<Props['route']>();
  const { platforms, media, content } = route.params;
  const [scheduledDate, setScheduledDate] = useState(new Date());

  const handleConfirmSchedule = async () => {
    try {
      // Get existing scheduled posts
      const scheduledJson = await AsyncStorage.getItem('scheduled_posts');
      const scheduledPosts = scheduledJson ? JSON.parse(scheduledJson) : [];
      
      // Create new scheduled post
      const newPost = {
        id: Date.now().toString(),
        platforms,
        media,
        content,
        scheduledDate: scheduledDate.toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };
      
      // Add to scheduled posts array
      scheduledPosts.unshift(newPost);
      
      // Save back to storage
      await AsyncStorage.setItem('scheduled_posts', JSON.stringify(scheduledPosts));
      
      // Show success message
      Alert.alert(
        'Success',
        'Post scheduled successfully!',
        [{ 
          text: 'OK',
          onPress: () => {
            // First go back to clear the create stack
            navigation.goBack();
            // Then switch to the Posts tab
            navigation.navigate('Posts');
          }
        }]
      );
    } catch (error) {
      console.error('Error scheduling post:', error);
      Alert.alert(
        'Error',
        'Failed to schedule post. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platforms</Text>
          <View style={styles.platformList}>
            {platforms.map((platform, index) => (
              <View key={index} style={styles.platformChip}>
                <Ionicons 
                  name={getPlatformIcon(platform)}
                  size={20}
                  color="#666"
                />
                <Text style={styles.platformName}>{platform}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule For</Text>
          <DateTimePicker
            value={scheduledDate}
            mode="datetime"
            display="spinner"
            onChange={(event, date) => date && setScheduledDate(date)}
            minimumDate={new Date()}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Preview</Text>
          <Text style={styles.contentPreview}>{content}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleConfirmSchedule}
        >
          <Text style={styles.scheduleButtonText}>Confirm Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  platformList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  platformName: {
    marginLeft: 6,
    fontSize: 15,
    color: '#333',
  },
  contentPreview: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: '#2f95dc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 