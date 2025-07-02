import ConnectedAccountsScreen from '@/screens/settings/ConnectedAccountsScreen';
import { Stack } from 'expo-router';

export default function ConnectedAccountsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ConnectedAccountsScreen />
    </>
  );
} 