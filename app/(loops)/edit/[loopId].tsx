import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Button, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops, type Loop } from '@/context/LoopsContext';
import ScreenContainer from '@/components/ScreenContainer';
import { useTheme } from '@react-navigation/native';
import type { ExtendedTheme } from '@/app/_layout';

export default function EditLoopScreen() {
  const theme = useTheme() as ExtendedTheme;
  const { colors, spacing } = theme;
  const router = useRouter();
  const params = useLocalSearchParams<{ loopId: string }>();
  const { loopId } = params;
  const { state, dispatch } = useLoops();

  // Find the original loop data
  const originalLoop = state.loops.find(l => l.id === loopId);

  // State for form fields (initialize with original data)
  const [title, setTitle] = useState(originalLoop?.title || '');
  const [description, setDescription] = useState(originalLoop?.description || '');
  // Add more state for other editable fields (color, schedule, etc.) later

  const [isSaving, setIsSaving] = useState(false);

  // --- Handle Save ---
  const handleSave = () => {
    if (!originalLoop) return; 

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      Alert.alert('Error', 'Loop title cannot be empty.');
      return;
    }

    setIsSaving(true);
    console.log('[ACTION] Dispatching EDIT_LOOP for ID:', loopId);
    
    // Dispatch the EDIT_LOOP action with updated fields
    dispatch({ 
      type: 'EDIT_LOOP', 
      payload: { 
        id: loopId,
        // Only include fields that have actually changed to minimize updates (optional optimization)
        // For now, just send the current state of the form fields
        updates: { 
          title: trimmedTitle, 
          description: trimmedDescription 
          // Add other fields here as they are added to the form
        } 
      }
    });

    // Navigate back immediately after dispatch (state update should be fast)
    // Remove simulation/placeholder alert
    setIsSaving(false); // Reset saving state
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback if cannot go back (unlikely from edit screen)
      router.replace(`/(loops)/${loopId}`); 
    }
  };

  // --- Handle Not Found ---
  if (!originalLoop) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: 'Loop Not Found' }} />
        <View style={styles.centered}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>Loop not found.</Text>
          <Text 
            style={[styles.goBackText, { color: colors.primary, marginTop: spacing.md }]} 
            onPress={() => router.back()}
          >
            Go Back
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // --- Screen Options ---
  const screenOptions = {
    title: `Edit "${originalLoop.title}"`, // Dynamic title
    headerRight: () => (
      <Button 
        onPress={handleSave} 
        title={isSaving ? "Saving..." : "Save"} 
        disabled={isSaving} 
        color={colors.primary} // Use theme color
      />
    ),
    headerStyle: { backgroundColor: colors.backgroundHeader || colors.card },
    headerTintColor: colors.primary, 
    headerTitleStyle: { color: colors.text }, 
  };

  // --- Render Form ---
  return (
    <ScreenContainer>
      <Stack.Screen options={screenOptions} />
      <ScrollView 
        style={{ backgroundColor: colors.background }} 
        contentContainerStyle={{ padding: spacing.lg }}
        keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside
      >
        <Text style={[styles.label, { color: colors.text + '99' }]}>Title</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter loop title"
          placeholderTextColor={colors.text + '77'}
          editable={!isSaving}
        />

        <Text style={[styles.label, { color: colors.text + '99', marginTop: spacing.lg }]}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add a short description"
          placeholderTextColor={colors.text + '77'}
          multiline
          numberOfLines={4}
          editable={!isSaving}
        />

        {/* Add more form fields here later (Color Picker, Schedule Selector, etc.) */}
        
        {isSaving && <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />}

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '600',
  },
  goBackText: {
    fontSize: 16,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top', // Align text to top for multiline
  },
}); 