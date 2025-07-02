import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';

type DropdownMenuItem = {
  label: string;
  value: string;
};

type DropdownMenuItemsProps = {
  options: DropdownMenuItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  onSelect?: () => void; // Injected by parent
};

export default function DropdownMenuItems({ options, selectedValue, onValueChange, onSelect }: DropdownMenuItemsProps) {
  const { colors, borderRadius, elevation } = useThemeStyles();

  const handleSelect = (value: string) => {
    onValueChange(value);
    onSelect?.();
  };

  return (
    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderRadius: borderRadius.md, ...elevation.md }]}>
      {options.map((option, index) => (
        <React.Fragment key={option.value}>
          <Pressable style={styles.menuItem} onPress={() => handleSelect(option.value)}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>{option.label}</Text>
            {selectedValue === option.value && <Ionicons name="checkmark" size={20} color={colors.accent} />}
          </Pressable>
          {index < options.length - 1 && <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
}); 