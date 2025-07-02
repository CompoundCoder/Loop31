import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const settingsItems = [
  { id: 'account', title: 'Account Info', icon: 'person-circle-outline' },
  { id: 'notifications', title: 'Notification Settings', icon: 'notifications-outline' },
  { id: 'preferences', title: 'Preferences', icon: 'options-outline' },
  { id: 'help', title: 'Help & Tutorials', icon: 'help-buoy-outline' },
  { id: 'about', title: 'About', icon: 'information-circle-outline' },
];

export default function PersonalSettingsGrid() {
  const { colors, spacing, borderRadius, elevation, typography } = useThemeStyles();
  const router = useRouter();

  const handlePress = (id: string) => {
    if (id === 'account') {
      router.push('/you/AccountInfoScreen');
    } else if (id === 'notifications') {
        router.push('/you/NotificationSettingsScreen');
    } else if (id === 'preferences') {
        router.push('/you/PreferencesScreen');
    } else if (id === 'help') {
        router.push('/you/HelpScreen');
    } else if (id === 'about') {
        router.push('/you/AboutScreen');
    } else {
      console.log(`Navigate to ${id}`);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderRadius: borderRadius.lg, ...elevation.md }]}>
      <Text style={{ fontSize: typography.fontSize.title, fontWeight: '600', color: colors.text, marginBottom: spacing.sm }}>Personal Settings</Text>
      <View style={styles.listContainer}>
        {settingsItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <Pressable
              onPress={() => handlePress(item.id)}
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.border : 'transparent' }]}
            >
              <Ionicons name={item.icon as any} size={24} color={colors.accent} />
              <Text style={{ fontSize: typography.fontSize.body, color: colors.text, marginLeft: spacing.md, flex: 1 }}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />
            </Pressable>
            {index < settingsItems.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  listContainer: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50, // Align with text
  },
}); 