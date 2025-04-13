import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text } from 'react-native';
import CreateScreen from '../screens/CreateScreen';
import PostsScreen from '../screens/PostsScreen';
import SentScreen from '../screens/SentScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsNavigator from './SettingsNavigator';

export type RootTabParamList = {
  Schedule: undefined;
  Create: undefined;
  Sent: undefined;
  Analytics: undefined;
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
          backgroundColor: '#FF000030',
          borderTopColor: '#0000FF50',
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
              <Ionicons name="calendar-outline" size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>Schedule</Text>
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
        component={SentScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <Ionicons name="checkmark-circle-outline" size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>Posts</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View style={styles.tabItem}>
              <Ionicons name="stats-chart-outline" size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>Analytics</Text>
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
    backgroundColor: '#00FF0030',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    backgroundColor: '#FF00FF30',
  },
  createButtonContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: -30,
    left: 0,
    right: 0,
    backgroundColor: '#FFFF0030',
  },
  createButton: {
    width: 70,
    height: 70,
    backgroundColor: '#00FFFF30',
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
    backgroundColor: '#FFA50030',
  },
}); 