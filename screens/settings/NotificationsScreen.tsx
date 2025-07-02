import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import {
  SettingsSection,
  SettingsToggle,
  SettingsDropdown,
} from '@/components/settings';
import SettingsHeader from '@/components/headers/SettingsHeader';
import { BottomSheetMenu } from '@/components/ui/BottomSheetMenu';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const { colors, spacing } = useThemeStyles();
  const bottomSheetRef = useRef<Modalize>(null);

  const [inactivityReminder, setInactivityReminder] = useState(true);
  const [threshold, setThreshold] = useState('Medium (50+ likes)');
  
  const thresholdOptions = ["Low (10+ likes)", "Medium (50+ likes)", "High (100+ likes)"];

  const handleThresholdSelect = () => {
    bottomSheetRef.current?.open();
  };

  const thresholdMenuItems = [{
    title: 'Select a Threshold',
    items: thresholdOptions.map(option => ({
      label: option,
      onPress: () => {
        setThreshold(option);
        bottomSheetRef.current?.close();
      },
      icon: <Ionicons name={threshold === option ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={threshold === option ? colors.accent : colors.text} />,
    })),
  }];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SettingsHeader title="Notifications" />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
        <SettingsSection title="App Notifications">
          <SettingsDropdown
            label="Notify when a post exceeds"
            value={threshold}
            onPress={handleThresholdSelect}
          />
          <SettingsToggle
            label="Remind me after 3 days of inactivity"
            value={inactivityReminder}
            onToggle={setInactivityReminder}
          />
        </SettingsSection>
      </ScrollView>
       <BottomSheetMenu
        modalRef={bottomSheetRef}
        sections={thresholdMenuItems.map(section => section.items)}
        menuTitle={thresholdMenuItems[0].title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
}); 