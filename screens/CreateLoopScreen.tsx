import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Loop } from '../types/Loop';

const COLORS = [
  '#FF9500',  // Orange
  '#34C759',  // Green
  '#5856D6',  // Purple
  '#007AFF',  // Blue
  '#FF2D55',  // Pink
  '#AF52DE',  // Magenta
  '#5AC8FA',  // Light Blue
  '#FF3B30',  // Red
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Props = NativeStackScreenProps<RootStackParamList, 'CreateLoopScreen'>;

export default function CreateLoopScreen({ navigation, route }: Props) {
  const editingLoop = route.params?.loop;
  const isEditing = !!editingLoop;

  const [name, setName] = useState(editingLoop?.name || '');
  const [selectedColor, setSelectedColor] = useState(editingLoop?.color || COLORS[0]);
  const [scheduleType, setScheduleType] = useState<'weekly' | 'interval'>(
    editingLoop?.schedule.type || 'weekly'
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    editingLoop?.schedule.daysOfWeek || []
  );
  const [intervalDays, setIntervalDays] = useState(
    editingLoop?.schedule.intervalDays?.toString() || '7'
  );
  const [postTime, setPostTime] = useState<Date>(() => {
    if (editingLoop?.schedule.postTime) {
      const [hours, minutes] = editingLoop.schedule.postTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date;
    }
    const date = new Date();
    date.setHours(10, 0); // Default to 10:00 AM
    return date;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mediaSettings, setMediaSettings] = useState(editingLoop?.mediaSettings || {
    shuffle: true,
    avoidRecent: true,
    preferImages: false,
  });

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPostTime(selectedDate);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a loop name');
      return;
    }

    if (scheduleType === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    if (scheduleType === 'interval' && (!intervalDays || parseInt(intervalDays) < 1)) {
      Alert.alert('Error', 'Please enter a valid interval (minimum 1 day)');
      return;
    }

    try {
      const loopData: Loop = {
        id: editingLoop?.id || Date.now().toString(),
        name: name.trim(),
        color: selectedColor,
        isActive: editingLoop?.isActive ?? true,
        isPinned: editingLoop?.isPinned ?? false,
        schedule: {
          type: scheduleType,
          ...(scheduleType === 'weekly' 
            ? { daysOfWeek: selectedDays }
            : { intervalDays: parseInt(intervalDays) }
          ),
          postTime: format(postTime, 'HH:mm'),
        },
        posts: editingLoop?.posts || [],
        nextPostIndex: editingLoop?.nextPostIndex || 0,
        mediaSettings,
      };

      const loopsJson = await AsyncStorage.getItem('loops');
      const loops: Loop[] = loopsJson ? JSON.parse(loopsJson) : [];
      
      if (isEditing) {
        const updatedLoops = loops.map(l => 
          l.id === editingLoop.id ? loopData : l
        );
        await AsyncStorage.setItem('loops', JSON.stringify(updatedLoops));
      } else {
        await AsyncStorage.setItem('loops', JSON.stringify([...loops, loopData]));
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving loop:', error);
      Alert.alert('Error', 'Failed to save loop. Please try again.');
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(current =>
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
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
          {isEditing ? 'Edit Loop' : 'Create New Loop'}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loop Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter loop name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorGrid}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Type</Text>
          <View style={styles.scheduleTypeContainer}>
            <TouchableOpacity
              style={[
                styles.scheduleTypeButton,
                scheduleType === 'weekly' && styles.scheduleTypeButtonSelected,
              ]}
              onPress={() => setScheduleType('weekly')}
            >
              <Text style={[
                styles.scheduleTypeText,
                scheduleType === 'weekly' && styles.scheduleTypeTextSelected,
              ]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.scheduleTypeButton,
                scheduleType === 'interval' && styles.scheduleTypeButtonSelected,
              ]}
              onPress={() => setScheduleType('interval')}
            >
              <Text style={[
                styles.scheduleTypeText,
                scheduleType === 'interval' && styles.scheduleTypeTextSelected,
              ]}>Interval</Text>
            </TouchableOpacity>
          </View>
        </View>

        {scheduleType === 'weekly' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Days</Text>
            <View style={styles.daysContainer}>
              {DAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(day) && styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedDays.includes(day) && styles.dayButtonTextSelected,
                  ]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interval (Days)</Text>
            <TextInput
              style={styles.input}
              value={intervalDays}
              onChangeText={text => setIntervalDays(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Enter number of days"
              placeholderTextColor="#999"
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posting Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.timeButtonText}>
              {format(postTime, 'h:mm a')}
            </Text>
          </TouchableOpacity>
        </View>

        {(showTimePicker || Platform.OS === 'ios') && (
          <DateTimePicker
            value={postTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media Preferences</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Shuffle Posts Randomly</Text>
            <Switch
              value={mediaSettings.shuffle}
              onValueChange={(value) => setMediaSettings(prev => ({ ...prev, shuffle: value }))}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Avoid Repeating Recent Posts</Text>
            <Switch
              value={mediaSettings.avoidRecent}
              onValueChange={(value) => setMediaSettings(prev => ({ ...prev, avoidRecent: value }))}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Prefer Posts with Images</Text>
            <Switch
              value={mediaSettings.preferImages}
              onValueChange={(value) => setMediaSettings(prev => ({ ...prev, preferImages: value }))}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Save Changes' : 'Create Loop'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 16,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scheduleTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleTypeButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleTypeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  scheduleTypeText: {
    fontSize: 15,
    color: '#666',
  },
  scheduleTypeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 15,
    color: '#666',
  },
  dayButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  timeButtonText: {
    fontSize: 15,
    color: '#000',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
}); 