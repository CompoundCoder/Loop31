import React from 'react';
import { View, StyleSheet } from 'react-native';
import CreateLoopPopup from '@/components/CreateLoopPopup';
import ScreenContainer from '@/components/ScreenContainer';

// This is a temporary screen to preview the CreateLoopPopup component.
export default function CreateLoopPopupPreviewScreen() {
  return (
    <ScreenContainer>
      <View style={StyleSheet.absoluteFill}>
        <CreateLoopPopup visible={true} onClose={() => {}} />
      </View>
    </ScreenContainer>
  );
} 