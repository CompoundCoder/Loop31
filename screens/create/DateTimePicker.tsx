import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export default function CustomDateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (value) {
        // Keep the existing time
        newDate.setHours(value.getHours());
        newDate.setMinutes(value.getMinutes());
      }
      setTempDate(newDate);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    
    if (selectedTime) {
      onChange(selectedTime);
    } else if (!value) {
      // If no time was selected and there was no previous value, clear the date
      onChange(null);
    }
  };

  const clearDateTime = () => {
    onChange(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={24} color="#666" />
        <Text style={styles.buttonText}>
          {value
            ? `Scheduled for ${format(value, 'MMM d, yyyy h:mm a')}`
            : 'Schedule Post'}
        </Text>
        {value && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearDateTime}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="inline"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="spinner"
          onChange={handleTimeChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    position: 'relative',
  },
  buttonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
    flex: 1,
  },
  clearButton: {
    padding: 4,
  },
}); 