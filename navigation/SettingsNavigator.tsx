import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';
import ProfileSettingsScreen from '../screens/settings/ProfileSettingsScreen';
import AccountSettingsScreen from '../screens/settings/AccountSettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import SchedulingSettingsScreen from '../screens/settings/SchedulingSettingsScreen';
import ComposingSettingsScreen from '../screens/settings/ComposingSettingsScreen';
import BillingSettingsScreen from '../screens/settings/BillingSettingsScreen';
import BrandGroupsScreen from '../screens/settings/BrandGroupsScreen';
import ConnectedAccountsScreen from '../screens/settings/ConnectedAccountsScreen';
import SocialAccountDetailsScreen from '../screens/settings/SocialAccountDetailsScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ProfileSettings: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  SchedulingSettings: undefined;
  ComposingSettings: undefined;
  BillingSettings: undefined;
  BrandGroups: undefined;
  ConnectedAccounts: undefined;
  SocialAccountDetails: { accountId: string };
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
        options={{ title: 'Account Settings' }}
      />
      <Stack.Screen 
        name="BrandGroups" 
        component={BrandGroupsScreen}
        options={{ title: 'Brand Groups' }}
      />
      <Stack.Screen 
        name="ConnectedAccounts" 
        component={ConnectedAccountsScreen}
        options={{ title: 'Connected Accounts' }}
      />
      <Stack.Screen 
        name="SocialAccountDetails" 
        component={SocialAccountDetailsScreen}
        options={{ title: 'Account Details' }}
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