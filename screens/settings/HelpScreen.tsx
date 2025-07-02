import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import {
  SettingsSection,
  SettingsButton,
  FAQSection,
} from '@/components/settings';
import SettingsHeader from '@/components/headers/SettingsHeader';

const faqs = [
  {
    question: "What is Loop31?",
    answer: "Loop31 helps automate your recurring social media posts.",
  },
  {
    question: "Can I change my caption tone?",
    answer: "Yes, visit Preferences to enable caption remixing.",
  },
  {
    question: "How do I connect social media accounts?",
    answer: "Go to Account Info → Manage Social Accounts.",
  },
  {
    question: "Is there a Pro version?",
    answer: "Yes! Tap 'Upgrade' from any screen where features are locked.",
  },
  {
    question: "Can I turn off in-app tips?",
    answer: "Yes, that setting is under Preferences.",
  },
];

export default function HelpScreen() {
  const { colors, spacing } = useThemeStyles();

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "This will open a support chat or email composer.");
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SettingsHeader title="Help & Tutorials" />
      <ScrollView>
        <FAQSection faqs={faqs} />
        
        <SettingsSection>
          <SettingsButton
            text="Contact Support"
            onPress={handleContactSupport}
          />
        </SettingsSection>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
}); 