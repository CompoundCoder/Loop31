import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native';
import CreateScreen from '../screens/CreateScreen';
import PostsScreen from '../screens/PostsScreen';
import DraftsScreen from '../screens/DraftsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsNavigator from './SettingsNavigator';

export type RootTabParamList = {
  Schedule: undefined;
  Create: undefined;
  Sent: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f0f0f0',
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Schedule"
        component={PostsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <Ionicons name="list-outline" size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>Posting Schedule</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.createButtonContainer}>
              <View style={styles.createButton}>
                <Ionicons name="create-outline" size={28} color="#007AFF" />
                <Text style={styles.createLabel}>Create</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Sent"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <Ionicons name="checkmark-circle" size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>Sent</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <Ionicons name="settings-outline" size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>Settings</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  createButtonContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: -30,
    left: 0,
    right: 0,
  },
  createButton: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  createLabel: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
}); 