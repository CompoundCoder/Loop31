import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import SimpleButton from '../SimpleButton'; // Assuming SimpleButton exists and is styled
import * as typography from '@/presets/typography';

interface LoopsEmptyStateProps {
  onCreateLoop: () => void;
}

export const LoopsEmptyState: React.FC<LoopsEmptyStateProps> = ({ onCreateLoop }) => {
  const { colors, spacing } = useThemeStyles();

  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      {/* // TODO: This icon might need to be standardized later */}
      <MaterialCommunityIcons 
        name="clipboard-list-outline" 
        size={64} 
        color={colors.border} // Use a subtle color
        style={{ marginBottom: spacing.lg }}
      />
      <Text style={[typography.screenTitle, { color: colors.text, marginBottom: spacing.sm }]}>
        No Loops Yet
      </Text>
      <Text style={[typography.metadataText, { color: colors.text + '99', marginBottom: spacing.xl, textAlign: 'center' }]}>
        Create your first loop to automate content sharing across your platforms.
      </Text>
      <SimpleButton 
        label="Create Loop"
        onPress={onCreateLoop} 
        // TODO: This icon might need to be standardized later
        iconName="add-outline" // Optional icon for the button
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 