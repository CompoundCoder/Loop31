import React from 'react';
import { Stack } from 'expo-router';
import { LoopsProvider } from '@/context/LoopsContext';

// This layout defines the stack navigator for screens related to loops.
// It also provides the LoopsContext to these screens.
export default function LoopsStackLayout() {
  return (
    <LoopsProvider>
      {/* The Stack navigator automatically discovers screens (index, [loopId], create) 
          in this directory group. We don't need explicit Stack.Screen components here.
          Screen options can be configured globally via screenOptions prop
          or individually in each screen file. */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Remove all <Stack.Screen ... /> components */}
      </Stack>
    </LoopsProvider>
  );
} 