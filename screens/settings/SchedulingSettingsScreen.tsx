import { useState } from 'react';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

export default function SchedulingSettingsScreen() {
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [weekendPosts, setWeekendPosts] = useState(false);
  const [smartQueue, setSmartQueue] = useState(true);
  const [pauseQueue, setPauseQueue] = useState(false);

  return (
    <SettingsContainer>
      <SettingsSection title="Posting Schedule">
        <SettingItem
          label="Time Zone"
          value="London - Europe"
          icon="time-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Posting Times"
          value="4 times per day"
          icon="calendar-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
        <SettingItem
          label="Auto Schedule"
          toggle={autoSchedule}
          onToggle={setAutoSchedule}
          icon="timer-outline"
          iconColor="#5856D6"
        />
        <SettingItem
          label="Weekend Posting"
          toggle={weekendPosts}
          onToggle={setWeekendPosts}
          icon="calendar-number-outline"
          iconColor="#FF9500"
        />
      </SettingsSection>

      <SettingsSection title="Queue Management">
        <SettingItem
          label="Smart Queue"
          toggle={smartQueue}
          onToggle={setSmartQueue}
          icon="analytics-outline"
          iconColor="#FF2D55"
          value="Optimized"
        />
        <SettingItem
          label="Pause Queue"
          toggle={pauseQueue}
          onToggle={setPauseQueue}
          icon="pause-circle-outline"
          iconColor="#FF3B30"
        />
      </SettingsSection>

      <SettingsSection title="Advanced">
        <SettingItem
          label="Shuffle Queue"
          icon="shuffle-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Clear Queue"
          icon="trash-outline"
          iconColor="#FF3B30"
          onPress={() => {}}
        />
        <SettingItem
          label="Export Schedule"
          icon="download-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Platform Specific">
        <SettingItem
          label="Instagram Settings"
          icon="logo-instagram"
          iconColor="#FF2D55"
          onPress={() => {}}
        />
        <SettingItem
          label="Twitter Settings"
          icon="logo-twitter"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Facebook Settings"
          icon="logo-facebook"
          iconColor="#5856D6"
          onPress={() => {}}
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 