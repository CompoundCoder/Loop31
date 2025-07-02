import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import { headerActionRow, iconTextRow } from '@/presets/rows';

type SocialMediaAccountRowProps = {
  platform: 'instagram' | 'twitter' | 'facebook' | 'linkedin';
  handle: string;
  connected: boolean;
  onPress: () => void;
};

const platformIcons = {
  instagram: 'logo-instagram',
  twitter: 'logo-twitter',
  facebook: 'logo-facebook',
  linkedin: 'logo-linkedin',
};

export function SocialMediaAccountRow({ platform, handle, connected, onPress }: SocialMediaAccountRowProps) {
  const { colors, typography, spacing } = useThemeStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        headerActionRow,
        styles.row,
        { 
          backgroundColor: pressed ? colors.subtleButton : 'transparent',
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }
      ]}
    >
      <View style={iconTextRow}>
        <Ionicons name={platformIcons[platform] as any} size={24} color={colors.text} />
        <View style={{ marginLeft: spacing.md }}>
          <Text style={[styles.platformText, { color: colors.text, fontSize: typography.fontSize.body, fontWeight: typography.fontWeight.medium }]}>
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Text>
          <Text style={[styles.handleText, { color: colors.tabInactive, fontSize: typography.fontSize.caption }]}>
            @{handle}
          </Text>
        </View>
      </View>
      <View style={iconTextRow}>
        <Text style={{ color: connected ? colors.success : colors.tabInactive, fontSize: typography.fontSize.body }}>
          {connected ? 'Connected' : 'Disconnected'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.tabInactive} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
  },
  platformText: {
    textTransform: 'capitalize',
  },
  handleText: {
    marginTop: 2,
  },
}); 