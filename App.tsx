import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { AccountProvider } from './context/AccountContext';
import { NotificationsProvider } from './context/NotificationsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AccountProvider>
        <NotificationsProvider>
          <NavigationContainer>
            <BottomTabNavigator />
          </NavigationContainer>
        </NotificationsProvider>
      </AccountProvider>
    </SafeAreaProvider>
  );
}
