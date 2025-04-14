import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomActionBarProps {
  onSaveDraft: () => void;
  onSchedule: () => void;
  isValid: boolean;
}

export default function BottomActionBar({ 
  onSaveDraft,
  onSchedule,
  isValid,
}: BottomActionBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={onSaveDraft}
        >
          <Text style={styles.secondaryButtonText}>Save as Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
          onPress={onSchedule}
          disabled={!isValid}
        >
          <Text style={[styles.primaryButtonText, !isValid && styles.primaryButtonTextDisabled]}>
            Schedule Post
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2f95dc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#b4d8f0',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
}); 