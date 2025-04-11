import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import ScheduledScreen from './screens/ScheduledScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import CreateScreen from './screens/CreateScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              switch (route.name) {
                case 'Queue':
                  iconName = focused ? 'calendar' : 'calendar-outline';
                  break;
                case 'Analytics':
                  iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                  break;
                case 'Create':
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                  break;
                case 'History':
                  iconName = focused ? 'time' : 'time-outline';
                  break;
                case 'Settings':
                  iconName = focused ? 'settings' : 'settings-outline';
                  break;
                default:
                  iconName = 'alert-circle';
              }

              return <Ionicons name={iconName as any} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#2f95dc',
            tabBarInactiveTintColor: '#999',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0',
            },
            headerTitleStyle: {
              fontSize: 17,
              fontWeight: '600',
              color: '#333',
            },
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#f0f0f0',
              height: 88,
              paddingBottom: 30,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              marginTop: 4,
            },
          })}
        >
          <Tab.Screen 
            name="Queue" 
            component={ScheduledScreen}
            options={{
              title: 'Content Queue',
            }}
          />
          <Tab.Screen 
            name="Analytics" 
            component={AnalyticsScreen}
            options={{
              title: 'Analytics',
            }}
          />
          <Tab.Screen 
            name="Create" 
            component={CreateScreen}
            options={{
              title: 'Create Post',
            }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen}
            options={{
              title: 'Post History',
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
