import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import SimpleButton from '../SimpleButton'; // Assuming SimpleButton exists and is styled

interface LoopsEmptyStateProps {
  onCreateLoop: () => void;
}

export const LoopsEmptyState: React.FC<LoopsEmptyStateProps> = ({ onCreateLoop }) => {
  const { colors, spacing } = useThemeStyles();

  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      <MaterialCommunityIcons 
        name="clipboard-list-outline" 
        size={64} 
        color={colors.border} // Use a subtle color
        style={{ marginBottom: spacing.lg }}
      />
      <Text style={[styles.title, { color: colors.text, marginBottom: spacing.sm }]}>
        No Loops Yet
      </Text>
      <Text style={[styles.description, { color: colors.text + '99', marginBottom: spacing.xl }]}>
        Create your first loop to automate content sharing across your platforms.
      </Text>
      <SimpleButton 
        label="Create Loop"
        onPress={onCreateLoop} 
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
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%', // Prevent text from getting too wide
  },
}); 