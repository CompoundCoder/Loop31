import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';
import ProfileSettingsScreen from '../screens/settings/ProfileSettingsScreen';
import AccountSettingsScreen from '../screens/settings/AccountSettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import SchedulingSettingsScreen from '../screens/settings/SchedulingSettingsScreen';
import ComposingSettingsScreen from '../screens/settings/ComposingSettingsScreen';
import BillingSettingsScreen from '../screens/settings/BillingSettingsScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ProfileSettings: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  SchedulingSettings: undefined;
  ComposingSettings: undefined;
  BillingSettings: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
        headerBackTitle: ' ',
      }}
    >
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsMainScreen}
        options={{ 
          title: 'Settings',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen 
        name="ProfileSettings" 
        component={ProfileSettingsScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="AccountSettings" 
        component={AccountSettingsScreen}
        options={{ title: 'Account' }}
      />
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="SchedulingSettings" 
        component={SchedulingSettingsScreen}
        options={{ title: 'Scheduling' }}
      />
      <Stack.Screen 
        name="ComposingSettings" 
        component={ComposingSettingsScreen}
        options={{ title: 'Composing' }}
      />
      <Stack.Screen 
        name="BillingSettings" 
        component={BillingSettingsScreen}
        options={{ title: 'Billing' }}
      />
    </Stack.Navigator>
  );
} 