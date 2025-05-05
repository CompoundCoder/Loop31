import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops } from '@/context/LoopsContext';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function LoopDetailScreen() {
  const { loopId } = useLocalSearchParams<{ loopId: string }>();
  const { state } = useLoops();
  const { colors, spacing, borderRadius } = useThemeStyles();
  const router = useRouter();

  const loop = state.loops.find((l) => l.id === loopId);

  // Handle loop not found
  if (!loop) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.text }}>Loop not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { padding: spacing.md }]}
    >
      <Stack.Screen 
        options={{
          title: loop.title,
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
        }} 
      />

      <Text style={[styles.title, { color: colors.text }]}>{loop.title}</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: loop.isActive ? colors.success : colors.border }]} />
        <Text style={{ color: colors.text }}>
          {loop.isActive ? 'Active' : 'Inactive'}
        </Text>
      </View>

      <Text style={{ color: colors.text, marginTop: spacing.lg }}>
        Placeholder for description, associated posts, schedule, stats...
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    marginRight: 8,
  },
}); 