import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import * as rowPresets from '@/presets/rows';
import * as typographyPresets from '@/presets/typography';

interface SettingsAvatarRowProps {
  name: string;
  email: string;
  avatarUri?: string;
  onPress?: () => void;
  showArrow?: boolean;
  pressable?: boolean;
}

export default function SettingsAvatarRow({
  name,
  email,
  avatarUri,
  onPress,
  showArrow = true,
  pressable = true,
}: SettingsAvatarRowProps) {
  const { colors, spacing } = useThemeStyles();

  const RowContent = () => (
    <>
      <Image
        source={avatarUri ? { uri: avatarUri } : require('@/assets/images/icon.png')}
        style={styles.avatar}
      />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={[typographyPresets.pageHeaderTitle, { color: colors.text }]}>{name}</Text>
        <Text style={[typographyPresets.metadataText, { color: colors.tabInactive, marginTop: 2 }]}>{email}</Text>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5 }} />}
    </>
  );

  if (!pressable) {
    return (
      <View style={[rowPresets.headerActionRow, styles.container, { padding: spacing.md }]}>
        <RowContent />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        rowPresets.headerActionRow,
        styles.container,
        {
          backgroundColor: pressed ? colors.border : 'transparent',
          padding: spacing.md,
        },
      ]}
    >
      <RowContent />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
}); 