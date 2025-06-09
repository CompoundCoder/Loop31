import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Optional: if icon prop is a string name
import { useThemeStyles } from '@/hooks/useThemeStyles';

export interface EmptyStateMessageProps {
  title: string;
  message?: string; // Changed from subtitle to message to match common patterns
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap; // If icon is a string name for MaterialCommunityIcons
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
  title,
  message,
  iconName,
  actionLabel,
  onAction,
}) => {
  const { colors, spacing, typography, borderRadius } = useThemeStyles();

  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      {iconName && (
        <MaterialCommunityIcons
          name={iconName}
          size={48}
          color={colors.tabInactive}
          style={{ marginBottom: spacing.lg }}
        />
      )}
      <Text style={[{ 
        fontSize: typography.fontSize.heading,
        fontWeight: typography.fontWeight.bold,
        color: colors.text, 
        marginBottom: spacing.sm, 
        textAlign: 'center' 
      }]}>
        {title}
      </Text>
      {message && (
        <Text style={[{
          fontSize: typography.fontSize.body,
          color: colors.tabInactive,
          marginBottom: spacing.lg, 
          textAlign: 'center'
        }]}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          style={[{
            backgroundColor: colors.primary,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.md,
          }]}
          onPress={onAction}
        >
          <Text style={[{
            fontSize: typography.fontSize.subtitle,
            fontWeight: typography.fontWeight.medium,
            color: colors.card
          }]}>{actionLabel}</Text>
        </Pressable>
      )}
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

export default EmptyStateMessage; 