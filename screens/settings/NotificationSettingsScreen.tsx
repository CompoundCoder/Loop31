import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import {
  SettingsSection,
  SettingsToggle,
  SettingsDivider,
  SettingsCaption,
} from '@/components/settings';
import SettingsDropdownInline from '@/components/settings/SettingsDropdownInline';
import SettingsHeader from '@/components/headers/SettingsHeader';
import { BottomSheetMenu } from '@/components/ui/BottomSheetMenu';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationSettingsScreen() {
  const { colors, spacing } = useThemeStyles();
  const bottomSheetRef = useRef<Modalize>(null);

  // Original states
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(false);

  // New states for performance notifications
  const [inactivityReminder, setInactivityReminder] = useState(true);
  const [threshold, setThreshold] = useState('Better than usual');
  
  const thresholdOptions = ["Better than usual", "Trending upward", "Exceptionally well"];

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
      <SettingsHeader title="Notification Settings" />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
        
        <SettingsSection title="Notification Channels">
          <SettingsToggle
            label="Push Notifications"
            value={pushEnabled}
            onToggle={setPushEnabled}
            caption="Get notified when your post is shared or a loop completes."
          />
        </SettingsSection>

        <SettingsSection>
            <SettingsToggle
                label="Email Alerts"
                value={emailEnabled}
                onToggle={setEmailEnabled}
                caption="Receive important account updates and reports via email."
            />
            {emailEnabled && (
                <>
                    <SettingsDivider />
                    <SettingsToggle
                        label="Weekly Updates"
                        value={digestEnabled}
                        onToggle={setDigestEnabled}
                        caption="A quick summary of your performance every Monday."
                    />
                </>
            )}
        </SettingsSection>
        
        <SettingsSection title="Performance Notifications">
          <SettingsDropdownInline
            label="When a post performs:"
            value={threshold}
            onChange={setThreshold}
            options={thresholdOptions}
            caption="We'll let you know when your post stands out."
          />
          <SettingsDivider />
          <SettingsToggle
            label="Remind me after 3 days of inactivity"
            value={inactivityReminder}
            onToggle={setInactivityReminder}
          />
        </SettingsSection>

        <SettingsCaption text="We only send notifications when they matter. No spam, ever." />

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