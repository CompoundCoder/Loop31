import { useState } from 'react';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

export default function NotificationSettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [scheduleNotifs, setScheduleNotifs] = useState(true);
  const [failureNotifs, setFailureNotifs] = useState(true);
  const [engagementNotifs, setEngagementNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <SettingsContainer>
      <SettingsSection title="Push Notifications">
        <SettingItem
          label="Enable Push Notifications"
          toggle={pushEnabled}
          onToggle={setPushEnabled}
          icon="notifications-outline"
          iconColor="#FF3B30"
        />
        <SettingItem
          label="Scheduled Posts"
          toggle={scheduleNotifs}
          onToggle={setScheduleNotifs}
          icon="calendar-outline"
          iconColor="#34C759"
        />
        <SettingItem
          label="Failed Posts"
          toggle={failureNotifs}
          onToggle={setFailureNotifs}
          icon="alert-circle-outline"
          iconColor="#FF9500"
        />
        <SettingItem
          label="Engagement Updates"
          toggle={engagementNotifs}
          onToggle={setEngagementNotifs}
          icon="heart-outline"
          iconColor="#FF2D55"
        />
      </SettingsSection>

      <SettingsSection title="Email Notifications">
        <SettingItem
          label="Enable Email Notifications"
          toggle={emailEnabled}
          onToggle={setEmailEnabled}
          icon="mail-outline"
          iconColor="#007AFF"
        />
        <SettingItem
          label="Weekly Analytics Digest"
          toggle={weeklyDigest}
          onToggle={setWeeklyDigest}
          icon="analytics-outline"
          iconColor="#5856D6"
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 