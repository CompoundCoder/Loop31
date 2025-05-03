import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function LoopDetailScreen() {
  const { loopId } = useLocalSearchParams<{ loopId: string }>();
  const { colors, spacing } = useThemeStyles();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <Stack.Screen options={{ title: `Loop: ${loopId}` }} />
      <Text style={[styles.title, { color: colors.text }]}>Loop Detail Screen</Text>
      <Text style={[styles.loopIdText, { color: colors.text }]}>Loop ID: {loopId}</Text>
      {/* Add more content here later */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loopIdText: {
    fontSize: 16,
  },
}); 