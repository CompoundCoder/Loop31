import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import * as Haptics from 'expo-haptics';
import { appIcons } from '@/presets/icons';

// Props for the modal content component
interface LoopActionsModalContentProps {
  loopId: string;
  loopTitle: string;
  isPinned: boolean;
  onPin: (loopId: string) => void;
  onUnpin: (loopId: string) => void;
  onEdit: (loopId: string) => void;
  onDuplicate: (loopId: string) => void;
  onDelete: (loopId: string) => void;
  onClose: () => void; // Callback to close the modal
}

// Reusable Action Button (similar to before)
const ActionButton = ({ icon, label, onPress, color, isDestructive = false }: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap,
  label: string,
  onPress: () => void,
  color?: string,
  isDestructive?: boolean
}) => {
  const { colors, spacing } = useThemeStyles();
  const textColor = isDestructive ? colors.notification : (color || colors.primary);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
        pressed && { backgroundColor: colors.border + '33' }
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={24} color={textColor} style={{ marginRight: spacing.lg }} />
      <Text style={[styles.actionButtonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
};

// Reusable Separator (similar to before, now using theme)
const Separator = () => {
  const { colors } = useThemeStyles();
  return <View style={[styles.separator, { backgroundColor: colors.border }]} />;
}

// The main modal content component
export const LoopActionsModalContent: React.FC<LoopActionsModalContentProps> = ({
  loopId,
  loopTitle,
  isPinned,
  onPin,
  onUnpin,
  onEdit,
  onDuplicate,
  onDelete,
  onClose, // Receive onClose prop
}) => {
  const { colors, spacing } = useThemeStyles();

  // --- Action Handlers --- 
  // Add haptic feedback before calling action prop
  const handlePinPress = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPin(loopId); onClose(); };
  const handleUnpinPress = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onUnpin(loopId); onClose(); };
  const handleEditPress = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onEdit(loopId); onClose(); };
  const handleDuplicatePress = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDuplicate(loopId); onClose(); };
  const handleDeletePress = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDelete(loopId); onClose(); }; // Add confirmation later

  return (
    // Add some padding to the container within the modal
    <View style={[styles.contentContainer, { paddingVertical: spacing.sm, paddingBottom: spacing.sm }]}>

      {/* Optional Title (Can be moved to Modalize header prop later) */}
      {/* <Text style={[styles.title, { color: colors.text, marginBottom: spacing.md }]}>{loopTitle}</Text> */} 

      {/* Pin/Unpin Action */} 
      {isPinned ? (
        <ActionButton icon={appIcons.actions.unpin.name as any} label="Unpin Loop" onPress={handleUnpinPress} />
      ) : (
        <ActionButton icon={appIcons.actions.pin.name as any} label="Pin Loop" onPress={handlePinPress} />
      )}

      {/* Edit Action */} 
      <ActionButton icon={appIcons.actions.edit.name as any} label="Edit Loop" onPress={handleEditPress} />

      {/* Duplicate Action */} 
      <ActionButton icon={appIcons.actions.duplicate.name as any} label="Duplicate Loop" onPress={handleDuplicatePress} />

      {/* --- Separator --- */} 
      <Separator />

      {/* Delete Action */} 
      <ActionButton
        icon={appIcons.actions.delete.name as any}
        label="Delete Loop"
        onPress={handleDeletePress}
        isDestructive={true}
      />

    </View>
  );
};

// Styles (similar to before)
const styles = StyleSheet.create({
  contentContainer: {
    // Container styles
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: 8,
  },
}); 