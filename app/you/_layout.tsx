import { Stack } from 'expo-router';

export default function YouTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="AccountInfoScreen" />
      <Stack.Screen name="NotificationSettingsScreen" />
      <Stack.Screen name="PreferencesScreen" />
      <Stack.Screen name="HelpScreen" />
      <Stack.Screen name="AboutScreen" />
    </Stack>
  );
}