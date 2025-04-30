import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Animated,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ExtendedTheme } from '@/app/_layout';

import AnimatedHeader, { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';
import SectionTitle from '@/components/SectionTitle';
import EmptyState from '@/components/EmptyState';
import SimpleButton from '@/components/SimpleButton';
import ScreenContainer from '@/components/ScreenContainer';
import { ScrollContainer } from '@/components/containers';
import { SCREEN_LAYOUT } from '@/constants/layout';

type YouScreenProps = {
  /**
   * Whether the screen is in a loading state
   */
  isLoading?: boolean;
};

function SettingRow({ 
  icon, 
  label, 
  isPlaceholder = false 
}: { 
  icon: keyof typeof MaterialCommunityIcons.glyphMap; 
  label: string;
  isPlaceholder?: boolean;
}) {
  const theme = useTheme() as unknown as ExtendedTheme;
  
  return (
    <View style={[
      styles.settingRow,
      {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        opacity: isPlaceholder ? 0.5 : 1,
      }
    ]}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={theme.colors.text}
        style={{ marginRight: theme.spacing.md } as any}
      />
      <Text style={[
        styles.settingLabel,
        { color: theme.colors.text }
      ]}>
        {label}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={theme.colors.text}
        style={{ opacity: theme.opacity.medium } as any}
      />
    </View>
  );
}

export default function YouScreen({ isLoading = false }: YouScreenProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <ScreenContainer>
        <AnimatedHeader 
          title="You"
          scrollY={scrollY}
        />
        <EmptyState isLoading />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AnimatedHeader 
        title="You"
        scrollY={scrollY}
      />
      <ScrollContainer
        scrollY={scrollY}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{
          paddingTop: MINI_HEADER_HEIGHT + 16,
          paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
        }}
      >
        {/* Profile Section */}
        <View style={[
          styles.profileSection,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
            ...Platform.select({
              ios: {
                shadowColor: theme.colors.text,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              },
              android: {
                elevation: 4,
              },
            }),
          }
        ]}>
          <View style={styles.profileHeader}>
            <View style={[
              styles.avatarPlaceholder,
              {
                backgroundColor: theme.colors.border,
                borderRadius: theme.borderRadius.full,
              }
            ]} />
            <View style={styles.profileInfo}>
              <View style={[
                styles.namePlaceholder,
                {
                  backgroundColor: theme.colors.border,
                  borderRadius: theme.borderRadius.sm,
                }
              ]} />
              <View style={[
                styles.emailPlaceholder,
                {
                  backgroundColor: theme.colors.border,
                  borderRadius: theme.borderRadius.sm,
                  marginTop: theme.spacing.sm,
                }
              ]} />
            </View>
          </View>
          <SimpleButton
            label="Edit Profile"
            iconName="account-edit"
            size="small"
            variant="outline"
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>

        {/* Account Settings */}
        <SectionTitle
          title="Account"
          withTopMargin={false}
        />
        <View>
          <SettingRow icon="account" label="Profile Settings" isPlaceholder />
          <SettingRow icon="bell" label="Notifications" isPlaceholder />
          <SettingRow icon="shield" label="Privacy & Security" isPlaceholder />
        </View>

        {/* Content Settings */}
        <SectionTitle
          title="Content"
          withTopMargin={false}
        />
        <View>
          <SettingRow icon="folder" label="Default Loop Settings" isPlaceholder />
          <SettingRow icon="clock" label="Posting Schedule" isPlaceholder />
          <SettingRow icon="palette" label="Theme & Appearance" isPlaceholder />
        </View>

        {/* Support & About */}
        <SectionTitle
          title="Support"
          withTopMargin={false}
        />
        <View>
          <SettingRow icon="help-circle" label="Help Center" isPlaceholder />
          <SettingRow icon="information" label="About" isPlaceholder />
          <SettingRow icon="email" label="Contact Support" isPlaceholder />
        </View>

        {/* Account Actions */}
        <View style={[
          styles.accountActions,
          {
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
          }
        ]}>
          <SimpleButton
            label="Sign Out"
            iconName="logout"
            variant="outline"
            textColor={theme.colors.primary}
          />
        </View>
      </ScrollContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    width: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
  },
  namePlaceholder: {
    height: 24,
    width: '60%',
  },
  emailPlaceholder: {
    height: 16,
    width: '80%',
    opacity: 0.7,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  accountActions: {
    alignItems: 'center',
  },
}); 