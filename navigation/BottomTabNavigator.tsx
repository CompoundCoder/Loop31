import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text, Animated } from 'react-native';
import CreateScreen from '../screens/CreateScreen';
import PostsScreen from '../screens/PostsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsNavigator from './SettingsNavigator';
import AnalyticsNavigator from './AnalyticsNavigator';
import { useEffect, useRef } from 'react';

export type RootTabParamList = {
  Schedule: undefined;
  Posts: undefined;
  Create: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const AnimatedCreateButton = ({ focused }: { focused: boolean }) => {
  const colorAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#8E8E93', '#007AFF'],
  });

  return (
    <View style={styles.contentWrapper}>
      <Animated.View style={[styles.createButton, { backgroundColor }]}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Animated.View>
    </View>
  );
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
          height: 84,
          paddingBottom: 30,
          paddingTop: 12,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Schedule"
        component={PostsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
          tabBarLabel: 'Schedule',
        }}
      />
      <Tab.Screen
        name="Posts"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-full-outline" size={24} color={color} />
          ),
          tabBarLabel: 'Posts',
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedCreateButton focused={focused} />
          ),
          tabBarLabel: '',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={24} color={color} />
          ),
          tabBarLabel: 'Analytics',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
}); 