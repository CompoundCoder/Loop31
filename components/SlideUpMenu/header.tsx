import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MenuHeaderProps } from './types';
import { useThemeStyles, type ThemeStyles } from '../../hooks/useThemeStyles';
import { appIcons } from '@/presets/icons';

const MenuHeader: React.FC<MenuHeaderProps> = ({ title, onClose, onSave, showSaveButton }) => {
  const theme = useThemeStyles() as ThemeStyles;

  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md, // Corrected: m to md
      paddingTop: theme.spacing.md,      // Corrected: m to md
      paddingBottom: theme.spacing.sm,   // Corrected: s to sm
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      // Top border radius is handled by the main menuSheet style in index.tsx
    },
    titleText: {
      fontSize: theme.typography.fontSize.title, // Corrected: title3 to fontSize.title
      fontWeight: theme.typography.fontWeight.bold, // Corrected: title3 to fontWeight.bold
      color: theme.colors.text,
      textAlign: 'center',
      flex: 1,
      marginHorizontal: theme.spacing.sm, // Corrected: s to sm
    },
    button: {
      padding: theme.spacing.sm,          // Corrected: s to sm
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 44, // Apple HIG touch target size
      minHeight: 44, // Apple HIG touch target size
    },
    closeButtonIcon: {
      // No specific styles needed if Ionicons is centered by button styles
    },
    saveButtonText: {
      fontSize: theme.typography.fontSize.body, // Corrected: callout to fontSize.body
      fontWeight: theme.typography.fontWeight.medium, // Corrected: callout to fontWeight.medium
      color: theme.colors.primary,
      // fontWeight: '600', // fontWeight is now from theme
    },
    placeholder: {
      width: 44, // Match button minWidth for balance
      height: 44, // Match button minHeight
    },
  });

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onClose} style={styles.button} accessibilityLabel="Close menu" accessibilityRole="button">
        <Ionicons name={appIcons.navigation.close.name as any} size={26} color={theme.colors.text} style={styles.closeButtonIcon} />
      </TouchableOpacity>
      <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
      {showSaveButton && typeof onSave === 'function' ? (
        <TouchableOpacity onPress={onSave} style={styles.button} accessibilityLabel="Save" accessibilityRole="button">
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      ) : (
        // Render a placeholder only if showSaveButton is true but onSave is not a function (edge case)
        // Or, more commonly, if showSaveButton is false.
        // This ensures the title remains centered.
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

export default MenuHeader;
