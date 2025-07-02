import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import * as typography from '@/presets/typography';

interface ComingSoonModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function ComingSoonModal({ visible, onDismiss }: ComingSoonModalProps) {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View style={styles.centeredView}>
          <Pressable style={[
            styles.modalView,
            { 
              backgroundColor: colors.card, 
              borderRadius: borderRadius.lg, 
            },
            elevation.lg
          ]}>
            <Text style={[typography.sectionTitle, { color: colors.text }]}>Coming Soon</Text>
            <Text style={[typography.metadataText, { color: colors.text, opacity: 0.8, marginTop: spacing.sm, textAlign: 'center' }]}>
              This feature will be available soon.
            </Text>
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.button,
                { 
                  backgroundColor: pressed ? colors.background : colors.subtleButton,
                  marginTop: spacing.lg,
                  borderRadius: borderRadius.sm,
                }
              ]}
            >
              <Text style={[typography.pageHeaderTitle, { fontSize: 16, color: colors.text }]}>OK</Text>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalView: {
    width: '100%',
    maxWidth: 300,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    alignItems: 'center',
  },
}); 