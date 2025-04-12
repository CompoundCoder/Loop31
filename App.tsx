import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './navigation/TabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountProvider } from './context/AccountContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AccountProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </AccountProvider>
    </SafeAreaProvider>
  );
}
