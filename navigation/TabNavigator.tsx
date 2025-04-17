import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ScheduledPostsScreen from '../screens/ScheduledPostsScreen';
import CreateScreen from '../screens/CreateScreen';
import PublishedPostsScreen from '../screens/PublishedPostsScreen';
import SettingsNavigator from './SettingsNavigator';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2f95dc',
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f0f0f0',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ScheduledPosts"
        component={ScheduledPostsScreen}
        options={{
          title: 'Posting Schedule',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sent"
        component={PublishedPostsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

type RootStackParamList = {
  // ... other screens ...
  SchedulePreview: {
    platforms: string[];
    media: string[];
    content: string;
  };
  // ... rest of existing code ...
}; 