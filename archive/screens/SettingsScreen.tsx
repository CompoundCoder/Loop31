import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Animated,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AnimatedHeader, { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';
import ScreenContainer from '@/components/ScreenContainer';
import { ScrollContainer } from '@/components/containers';
import { LAYOUT, SCREEN_LAYOUT } from '@/constants/layout';
import type { ExtendedTheme } from '@/app/_layout';
import FadeSlideInView from '@/components/FadeSlideInView';
import AnimatedText from '@/components/AnimatedText';

// Mock user data
const MOCK_USER = {
  name: 'Trevor',
  profileImage: 'https://picsum.photos/200',
  brandColor: '#4ECDC4',
  connectedAccounts: [
    { platform: 'instagram', username: '@trevor.powers', isActive: true },
    { platform: 'linkedin', username: 'Trevor Powers', isActive: true },
    { platform: 'twitter', username: '@trevorpowers', isActive: false },
  ],
  preferences: {
    notifications: true,
    postingTips: true,
    scheduleReminders: true,
    darkMode: false,
  },
};

type SettingsSectionProps = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  children: React.ReactNode;
};

function SettingsSection({ title, icon, color, children }: SettingsSectionProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  
  return (
    <View style={{ marginBottom: LAYOUT.content.cardSpacing }}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={color}
          style={styles.sectionIcon}
        />
        <AnimatedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {title}
        </AnimatedText>
      </View>
      <View style={[
        styles.sectionContent,
        { 
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
        }
      ]}>
        {children}
      </View>
    </View>
  );
}

type SettingsItemProps = {
  label: string;
  subtitle?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  showArrow?: boolean;
};

function SettingsItem({ label, subtitle, icon, onPress, showArrow = true }: SettingsItemProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  
  return (
    <Pressable
      style={[
        styles.settingsItem,
        { borderColor: theme.colors.border }
      ]}
      onPress={onPress}
    >
      <View style={styles.settingsItemContent}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={22}
            color={theme.colors.text}
            style={styles.settingsItemIcon}
          />
        )}
        <View style={styles.settingsItemText}>
          <AnimatedText style={[styles.settingsItemLabel, { color: theme.colors.text }]}>
            {label}
          </AnimatedText>
          {subtitle && (
            <AnimatedText style={[
              styles.settingsItemSubtitle,
              { 
                color: theme.colors.text,
                opacity: theme.opacity.medium,
              }
            ]}>
              {subtitle}
            </AnimatedText>
          )}
        </View>
        {showArrow && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.colors.text}
            style={[
              styles.settingsItemArrow,
              { opacity: theme.opacity.medium }
            ]}
          />
        )}
      </View>
    </Pressable>
  );
}

export default function Settings() {
  const theme = useTheme() as unknown as ExtendedTheme;
  const [refreshing, setRefreshing] = React.useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <ScreenContainer>
      <AnimatedHeader 
        title="Settings" 
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
        <FadeSlideInView index={0}>
          <View style={[
            styles.profileSection,
            { marginBottom: LAYOUT.content.cardSpacing }
          ]}>
            <Image
              source={{ uri: MOCK_USER.profileImage }}
              style={[
                styles.profileImage,
                { borderRadius: theme.borderRadius.full }
              ]}
            />
            <View style={styles.profileInfo}>
              <AnimatedText style={[styles.greeting, { color: theme.colors.text }]}>
                Hi {MOCK_USER.name} 👋
              </AnimatedText>
              <AnimatedText style={[
                styles.tagline,
                { 
                  color: theme.colors.text,
                  opacity: theme.opacity.medium,
                }
              ]}>
                Ready to grow today?
              </AnimatedText>
            </View>
          </View>
        </FadeSlideInView>

        {/* Brand Settings */}
        <FadeSlideInView index={1}>
          <SettingsSection
            title="Personalize Your Brand"
            icon="palette-outline"
            color="#FF6B6B"
          >
            <SettingsItem
              label="Profile Information"
              subtitle="Update your name and bio"
              icon="account-outline"
              onPress={() => {/* Navigate to profile edit */}}
            />
            <SettingsItem
              label="Brand Colors"
              subtitle="Choose your brand theme"
              icon="palette"
              onPress={() => {/* Navigate to brand colors */}}
            />
            <SettingsItem
              label="App Appearance"
              subtitle="Light or dark mode"
              icon="theme-light-dark"
              onPress={() => {/* Navigate to appearance */}}
            />
          </SettingsSection>
        </FadeSlideInView>

        {/* Account Settings */}
        <FadeSlideInView index={2}>
          <SettingsSection
            title="Connected Accounts"
            icon="link-variant"
            color="#4ECDC4"
          >
            {MOCK_USER.connectedAccounts.map((account, index) => (
              <SettingsItem
                key={account.platform}
                label={account.username}
                subtitle={account.isActive ? 'Connected' : 'Not connected'}
                icon={`${account.platform}` as keyof typeof MaterialCommunityIcons.glyphMap}
                onPress={() => {/* Handle account settings */}}
              />
            ))}
          </SettingsSection>
        </FadeSlideInView>

        {/* Notification Settings */}
        <FadeSlideInView index={3}>
          <SettingsSection
            title="Notifications"
            icon="bell-outline"
            color="#FFD93D"
          >
            <SettingsItem
              label="Push Notifications"
              subtitle={MOCK_USER.preferences.notifications ? 'Enabled' : 'Disabled'}
              icon="bell-ring-outline"
              onPress={() => {/* Toggle notifications */}}
            />
            <SettingsItem
              label="Posting Tips"
              subtitle={MOCK_USER.preferences.postingTips ? 'Enabled' : 'Disabled'}
              icon="lightbulb-outline"
              onPress={() => {/* Toggle posting tips */}}
            />
            <SettingsItem
              label="Schedule Reminders"
              subtitle={MOCK_USER.preferences.scheduleReminders ? 'Enabled' : 'Disabled'}
              icon="clock-outline"
              onPress={() => {/* Toggle schedule reminders */}}
            />
          </SettingsSection>
        </FadeSlideInView>

        {/* Support Section */}
        <FadeSlideInView index={4}>
          <SettingsSection
            title="Help & Support"
            icon="help-circle-outline"
            color="#45B7D1"
          >
            <SettingsItem
              label="Documentation"
              subtitle="Learn how to use Loop"
              icon="book-open-page-variant"
              onPress={() => {/* Navigate to docs */}}
            />
            <SettingsItem
              label="Contact Support"
              subtitle="We're here to help"
              icon="message-text-outline"
              onPress={() => {/* Navigate to support */}}
            />
            <SettingsItem
              label="About Loop"
              subtitle="Version 1.0.0"
              icon="information-outline"
              onPress={() => {/* Show about info */}}
            />
          </SettingsSection>
        </FadeSlideInView>
      </ScrollContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 64,
    height: 64,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsItem: {
    borderBottomWidth: 1,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsItemIcon: {
    marginRight: 16,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingsItemArrow: {
    marginLeft: 8,
  },
}); 