import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Loop } from '../types/Loop';
import { ScheduledPost } from '../types/Schedule';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePostScreen'>;

type RouteParams = {
  mode: 'schedule';
  caption: string;
  mediaUri: string;
  existingPost?: ScheduledPost;
};

const TIME_PRESETS = [
  { label: 'Morning', time: '09:00', period: 'AM' },
  { label: 'Noon', time: '12:00', period: 'PM' },
  { label: 'Evening', time: '06:00', period: 'PM' },
];

export default function ScheduleDetailsScreen({ navigation, route }: Props) {
  const { caption, mediaUri, existingPost } = route.params as unknown as RouteParams;
  
  // Set default date to tomorrow at noon if no existing post
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0);
    return date;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(
    existingPost?.scheduledDate ? new Date(existingPost.scheduledDate) : getDefaultDate()
  );
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [availableLoops, setAvailableLoops] = useState<Loop[]>([]);
  const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null);

  useEffect(() => {
    loadLoops();
  }, []);

  const loadLoops = async () => {
    try {
      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      setAvailableLoops(loops);
      
      // Select first active loop by default if none selected
      if (!selectedLoopId && loops.length > 0) {
        const activeLoop = loops.find(loop => loop.isActive);
        if (activeLoop) {
          setSelectedLoopId(activeLoop.id);
        }
      }
    } catch (error) {
      console.error('Error loading loops:', error);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidPicker(false);
    }
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(newDate);
    }
  };

  const handleTimePreset = (hours: number, minutes: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes);
    setSelectedDate(newDate);
  };

  const handleSchedule = async () => {
    if (!selectedLoopId) {
      Alert.alert('Error', 'Please select a loop');
      return;
    }

    try {
      const scheduledPost: ScheduledPost = {
        id: existingPost?.id || Date.now().toString(),
        caption,
        mediaUri,
        createdAt: existingPost?.createdAt || new Date().toISOString(),
        scheduledDate: selectedDate.toISOString(),
        loopId: selectedLoopId,
      };

      const postsJson = await AsyncStorage.getItem('scheduledPosts');
      const posts: ScheduledPost[] = postsJson ? JSON.parse(postsJson) : [];

      if (existingPost) {
        // Update existing post
        const updatedPosts = posts.map(p => 
          p.id === existingPost.id ? scheduledPost : p
        );
        await AsyncStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts));
      } else {
        // Add new post
        await AsyncStorage.setItem('scheduledPosts', JSON.stringify([...posts, scheduledPost]));
      }

      navigation.navigate('Main');
    } catch (error) {
      console.error('Error scheduling post:', error);
      Alert.alert('Error', 'Failed to schedule post. Please try again.');
    }
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
        <Text style={styles.title}>Schedule Post</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateDisplay}>
              <View style={styles.dateInfo}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {format(selectedDate, 'EEE, MMM d')}
                </Text>
              </View>
              <Text style={styles.timeText}>
                {format(selectedDate, 'h:mm a')}
              </Text>
            </View>

            {Platform.OS === 'ios' ? (
              <View style={styles.calendarContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.androidCalendarButton}
                  onPress={() => setShowAndroidPicker(true)}
                >
                  <Text style={styles.androidCalendarButtonText}>Open Calendar</Text>
                </TouchableOpacity>
                {showAndroidPicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </>
            )}

            <View style={styles.timePresets}>
              {TIME_PRESETS.map(({ label, time, period }) => {
                const [hours, minutes] = time.split(':').map(Number);
                const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : hours;
                const isSelected = 
                  format(selectedDate, 'HH:mm') === 
                  `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.timePresetButton, isSelected && styles.timePresetButtonSelected]}
                    onPress={() => handleTimePreset(adjustedHours, minutes)}
                  >
                    <Text style={[
                      styles.timePresetButtonText,
                      isSelected && styles.timePresetButtonTextSelected
                    ]}>
                      {label}
                    </Text>
                    <Text style={[
                      styles.timePresetTimeText,
                      isSelected && styles.timePresetButtonTextSelected
                    ]}>
                      {`${time} ${period}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Loop</Text>
          <View style={styles.loopGrid}>
            {availableLoops.map(loop => (
              <TouchableOpacity
                key={loop.id}
                style={[
                  styles.loopChip,
                  selectedLoopId === loop.id && styles.loopChipSelected,
                  { backgroundColor: loop.isActive ? '#F8F8F8' : '#E5E5EA' }
                ]}
                onPress={() => setSelectedLoopId(loop.id)}
                disabled={!loop.isActive}
              >
                <View style={[styles.loopDot, { backgroundColor: loop.color }]} />
                <Text style={[
                  styles.loopName,
                  selectedLoopId === loop.id && styles.loopNameSelected,
                  !loop.isActive && styles.loopNameDisabled
                ]}>
                  {loop.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleSchedule}
        >
          <Text style={styles.scheduleButtonText}>Schedule Post</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingHorizontal: 8,
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
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 17,
    color: '#000',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 15,
    color: '#666',
  },
  calendarContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
  },
  androidCalendarButton: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  androidCalendarButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  timePresets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timePresetButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  timePresetButtonSelected: {
    backgroundColor: '#007AFF',
  },
  timePresetButtonText: {
    fontSize: 15,
    color: '#000',
    marginBottom: 4,
  },
  timePresetTimeText: {
    fontSize: 13,
    color: '#666',
  },
  timePresetButtonTextSelected: {
    color: '#fff',
  },
  loopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  loopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  loopChipSelected: {
    backgroundColor: '#E8F2FF',
  },
  loopDot: {
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
    fontWeight: '500',
  },
  loopNameDisabled: {
    color: '#999',
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
}); 