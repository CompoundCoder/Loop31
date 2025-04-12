import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsNavigator';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

export default function SettingsMainScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();

  return (
    <SettingsContainer>
      <SettingsSection title="Account">
        <SettingItem
          label="Profile"
          icon="person-outline"
          iconColor="#007AFF"
          onPress={() => navigation.navigate('ProfileSettings')}
        />
        <SettingItem
          label="Account Settings"
          icon="settings-outline"
          iconColor="#5856D6"
          onPress={() => navigation.navigate('AccountSettings')}
        />
        <SettingItem
          label="Notifications"
          icon="notifications-outline"
          iconColor="#FF3B30"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
      </SettingsSection>

      <SettingsSection title="Publishing">
        <SettingItem
          label="Scheduling"
          icon="calendar-outline"
          iconColor="#34C759"
          value="London - Europe"
          onPress={() => navigation.navigate('SchedulingSettings')}
        />
        <SettingItem
          label="Composing"
          icon="create-outline"
          iconColor="#FF9500"
          value="No Shortening"
          onPress={() => navigation.navigate('ComposingSettings')}
        />
      </SettingsSection>

      <SettingsSection title="Subscription">
        <SettingItem
          label="Billing"
          icon="card-outline"
          iconColor="#FF2D55"
          value="Pro Plan"
          onPress={() => navigation.navigate('BillingSettings')}
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingItem
          label="Help Center"
          icon="help-circle-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Contact Support"
          icon="mail-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
        <SettingItem
          label="Terms of Service"
          icon="document-text-outline"
          iconColor="#8E8E93"
          onPress={() => {}}
        />
        <SettingItem
          label="Privacy Policy"
          icon="shield-checkmark-outline"
          iconColor="#5856D6"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="App Info">
        <SettingItem
          label="Version"
          value="1.0.0"
          icon="information-circle-outline"
          iconColor="#8E8E93"
          showChevron={false}
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 