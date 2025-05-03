import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '@/components/ScreenContainer';
import PagerView from 'react-native-pager-view';
import { useThemeStyles } from '@/hooks/useThemeStyles'; // Import theme styles
import SimpleButton from '@/components/SimpleButton'; // Import button

// --- Mock Data Structure ---
interface PackDetailContent {
  id: string;
  title: string;
  overviewImage?: string;
  overviewDescription: string;
  includedItems: string[];
  premiumBenefits: string[];
}

// --- Mock Data ---
const mockPackDetails: Record<string, PackDetailContent> = {
  'dp1': {
    id: 'dp1',
    title: 'New Agent Essentials',
    overviewImage: 'https://via.placeholder.com/400x250/FFA07A/000000?text=Pack+Overview+1',
    overviewDescription: 'Kickstart your career with essential content loops designed for new real estate agents. Build your brand and attract your first clients.',
    includedItems: ['Welcome Series Loop', 'Neighborhood Intro Loop', 'First-Time Buyer Guide Loop', 'Testimonial Request Sequence'],
    premiumBenefits: ['Access to all current & future packs', 'Advanced analytics', 'Priority support'],
  },
  'dp3': { // Example for another non-locked pack
    id: 'dp3',
    title: 'Holiday Cheer',
    overviewImage: 'https://via.placeholder.com/400x250/FFD700/000000?text=Pack+Overview+3',
    overviewDescription: 'Engage your audience during the festive season with heartwarming posts and timely market insights relevant to the holidays.',
    includedItems: ['Festive Greeting Posts', 'End-of-Year Market Summary', 'Charity Event Promotion Loop', 'New Year Planning Tips'],
    premiumBenefits: ['Access to all current & future packs', 'Advanced analytics', 'Priority support'],
  },
  // Add dp2, dp4, dp5 if needed, likely showing only CTA page if locked
};

// --- Default content if pack data not found ---
const defaultPackContent: PackDetailContent = {
  id: 'unknown',
  title: 'Pack Not Found',
  overviewDescription: 'Details for this pack could not be loaded.',
  includedItems: [],
  premiumBenefits: ['Access to all current & future packs', 'Advanced analytics', 'Priority support'],
};

export default function PackDetailScreen() {
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const { colors, spacing, borderRadius } = useThemeStyles(); // Get theme values

  // Select mock data, use default if not found
  const packData = (packId && mockPackDetails[packId]) || defaultPackContent;

  return (
    <ScreenContainer style={styles.screenContainer}> 
      <Stack.Screen 
        options={{
          title: packData.title, // Use fetched title
        }} 
      />
      <PagerView style={styles.pagerView} initialPage={0}>
        {/* --- Page 1: Overview --- */}
        <View style={styles.pageContainer} key="1">
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            {packData.overviewImage && (
              <Image source={{ uri: packData.overviewImage }} style={styles.overviewImage} resizeMode="cover" />
            )}
            <Text style={[styles.descriptionText, { color: colors.text }]}>
              {packData.overviewDescription}
            </Text>
          </ScrollView>
        </View>

        {/* --- Page 2: Contents --- */}
        <View style={styles.pageContainer} key="2">
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <Text style={[styles.listHeader, { color: colors.text }]}>Includes:</Text>
            {packData.includedItems.map((item, index) => (
              <Text key={index} style={[styles.listItem, { color: colors.text }]}>• {item}</Text>
            ))}
          </ScrollView>
        </View>

        {/* --- Page 3: Get Premium --- */}
        <View style={styles.pageContainer} key="3">
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <Text style={[styles.premiumHeader, { color: colors.text }]}>Unlock with Premium</Text>
            <Text style={[styles.premiumSubheader, { color: colors.text, marginBottom: spacing.lg }]}>
              Get this pack and more:
            </Text>
            {packData.premiumBenefits.map((item, index) => (
              <Text key={index} style={[styles.listItem, { color: colors.text }]}>✓ {item}</Text>
            ))}
            <SimpleButton 
              label="Upgrade to Premium"
              onPress={() => { /* TODO: Navigate to subscription screen */ }}
              style={{ marginTop: spacing.xl }}
            />
          </ScrollView>
        </View>
      </PagerView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  // Style for the container view INSIDE PagerView page
  pageContainer: {
     flex: 1,
     // backgroundColor: colors.background, // Use default background
  },
  // Style for ScrollView content padding
  scrollContentContainer: {
      padding: 16, // Use theme spacing.lg?
  },
  overviewImage: {
    width: '100%',
    height: 200, // Adjust height as needed
    borderRadius: 8, // Use theme borderRadius.md?
    marginBottom: 16, // Use theme spacing.lg?
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8, // Use theme spacing.sm?
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4, // Use theme spacing.xs?
  },
  premiumHeader: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  premiumSubheader: {
    fontSize: 16,
    textAlign: 'center',
    // marginBottom applied inline
  },
}); 