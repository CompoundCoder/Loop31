import React from 'react';
import { View, Text } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import SettingsAccordion from './SettingsAccordion';
import * as typography from '@/presets/typography';

type FAQ = {
  question: string;
  answer: string;
};

interface FAQSectionProps {
  faqs: FAQ[];
}

const AnswerText = ({ children, color }: { children: string; color: string }) => (
    <Text style={[typography.inputLabel, { color, opacity: 0.9, fontSize: 16 }]}>
        {children}
    </Text>
);

export default function FAQSection({ faqs }: FAQSectionProps) {
  const { colors, spacing, borderRadius } = useThemeStyles();

  return (
    <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg }}>
        <Text style={[typography.sectionTitle, { color: colors.text, opacity: 0.6, textTransform: 'uppercase', fontSize: 14, fontWeight: '600', marginLeft: spacing.md, marginBottom: spacing.sm }]}>
            Frequently Asked Questions
        </Text>
        {faqs.map((faq) => (
            <SettingsAccordion key={faq.question} title={faq.question}>
                <AnswerText color={colors.text}>{faq.answer}</AnswerText>
            </SettingsAccordion>
        ))}
    </View>
  );
} 