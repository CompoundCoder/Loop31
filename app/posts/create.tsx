import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import { Stack } from 'expo-router';

export default function CreatePostScreen() {
  return (
    <ScreenContainer>
      {/* Add a Stack Screen to provide a header and back button */}
      <Stack.Screen options={{ title: 'Create Post' }} />
      <View style={styles.container}>
        <Text>Create Post Screen (Placeholder)</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 