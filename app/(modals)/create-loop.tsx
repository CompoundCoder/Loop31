import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import CreateLoopModal from '@/components/modals/CreateLoopModal';

export default function CreateLoopModalScreen() {
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(loops)');
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        
        <View style={styles.contentContainer}>
          <CreateLoopModal onClose={handleClose} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  flexContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 