import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

type ViewMode = 'all' | 'account' | 'group';

export default function AnalyticsSettingsScreen() {
  const [defaultView, setDefaultView] = useState<ViewMode>('all');

  const handleViewModeChange = (mode: ViewMode) => {
    setDefaultView(mode);
  };

  return (
    <View style={styles.container}>
      <SettingsContainer>
        <SettingsSection title="Default View">
          <SettingItem
            label="Show All Accounts"
            icon="apps-outline"
            iconColor="#007AFF"
            onPress={() => handleViewModeChange('all')}
            rightElement={defaultView === 'all' ? 'checkmark' : undefined}
          />
          <SettingItem
            label="Group by Brand"
            icon="folder-outline"
            iconColor="#FF9500"
            onPress={() => handleViewModeChange('group')}
            rightElement={defaultView === 'group' ? 'checkmark' : undefined}
          />
          <SettingItem
            label="Individual Accounts"
            icon="person-outline"
            iconColor="#34C759"
            onPress={() => handleViewModeChange('account')}
            rightElement={defaultView === 'account' ? 'checkmark' : undefined}
          />
        </SettingsSection>
      </SettingsContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
}); 