import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenuProvider } from 'react-native-popup-menu';
import AppNavigator from './navigation/AppNavigator';
import { AccountProvider } from './context/AccountContext';
import { NotificationsProvider } from './context/NotificationsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <MenuProvider>
        <AccountProvider>
          <NotificationsProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </NotificationsProvider>
        </AccountProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}
