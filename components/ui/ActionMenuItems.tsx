import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';

type ActionMenuItem = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
};

type ActionMenuItemsProps = {
  actions: ActionMenuItem[];
  onSelect?: () => void; // Injected by parent
};

export default function ActionMenuItems({ actions, onSelect }: ActionMenuItemsProps) {
  const { colors, borderRadius, elevation } = useThemeStyles();

  const handlePress = (action: ActionMenuItem) => {
    action.onPress();
    onSelect?.();
  };

  return (
    <View style={[styles.menuContainer, { backgroundColor: colors.card, borderRadius: borderRadius.md, ...elevation.md }]}>
      {actions.map((action, index) => (
        <React.Fragment key={action.label}>
          <Pressable style={styles.menuItem} onPress={() => handlePress(action)}>
            {action.icon}
            <Text style={[styles.menuItemText, { color: action.color || colors.text }]}>{action.label}</Text>
          </Pressable>
          {index < actions.length - 1 && <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
  },
}); 