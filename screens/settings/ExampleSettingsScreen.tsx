import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';

// Import all settings components via the barrel file
import {
  SettingsAvatarRow,
  SettingsButton,
  SettingsCaption,
  SettingsDivider,
  SettingsDropdown,
  SettingsMultiSelect,
  SettingsRadioGroup,
  SettingsRow,
  SettingsSection,
  SettingsTextInput,
  SettingsToggle,
  SettingsPlanCard,
  SettingsInfoCard,
  SettingsLinkRow,
  SettingsRestoreDefaults,
  SocialMediaAccountRow,
  BrandGroupRow,
  ProFeatureLockRow,
  StorageProgressBar,
} from '@/components/settings';

// Still need the header
import SettingsHeader from '@/components/headers/SettingsHeader';

export default function ExampleSettingsScreen() {
  const { colors, spacing } = useThemeStyles();
  const [isToggled, setIsToggled] = useState(true);
  const [textValue, setTextValue] = useState('Loop Master');
  const [radioValue, setRadioValue] = useState('apple');
  const [multiSelectValues, setMultiSelectValues] = useState(['apple']);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SettingsHeader title="Settings" />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>

        <SettingsSection>
            <SettingsAvatarRow 
                name="Trevor"
                email="trevor@example.com"
                onPress={() => Alert.alert("Avatar pressed")}
            />
        </SettingsSection>

        

        <SettingsSection title="Selection Controls">
          <SettingsRadioGroup
            label="Favorite Fruit"
            options={[
              { label: 'Apple', value: 'apple' },
              { label: 'Banana', value: 'banana' },
              { label: 'Orange', value: 'orange' },
            ]}
            selected={radioValue}
            onSelect={setRadioValue}
          />
          <SettingsDivider />
          <SettingsMultiSelect
            label="Toppings"
            options={[
              { label: 'Lettuce', value: 'lettuce' },
              { label: 'Tomato', value: 'tomato' },
              { label: 'Onion', value: 'onion' },
            ]}
            selectedValues={multiSelectValues}
            onChange={setMultiSelectValues}
          />
        </SettingsSection>

        <SettingsSection title="General">
            <SettingsToggle
                label="Push Notifications"
                value={isToggled}
                onToggle={setIsToggled}
                caption="Receive updates when your posts get activity."
            />
            <SettingsDivider />
            <SettingsDropdown
                label="Language"
                value="English"
                onPress={() => Alert.alert('Dropdown Pressed')}
            />
        </SettingsSection>

        <SettingsSection title="User Profile">
            <SettingsTextInput
                label="Username"
                value={textValue}
                onChangeText={setTextValue}
                description="This is how your name will appear on your profile."
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingsRow
                leftIcon={<Ionicons name="person-circle-outline" size={24} color={colors.accent} />}
                label="Account"
                onPress={() => Alert.alert('Navigate to Account')}
            />
             <View style={[styles.divider, { backgroundColor: colors.border }]} />
             <SettingsRow
                label="Manage Subscription"
                rightText='Pro Plan'
                onPress={() => Alert.alert('Navigate to Subscription')}
            />
        </SettingsSection>

        <SettingsSection title="Actions">
            <SettingsButton
                text="Visit Help Center"
                onPress={() => Alert.alert('Button Pressed')}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingsButton
                text="Log Out"
                variant="danger"
                onPress={() => Alert.alert('Danger Button Pressed')}
            />
        </SettingsSection>
        
        <SettingsSection>
            <SettingsPlanCard
                title="Pro Plan"
                subtitle="Unlock all features"
                badge="Best Value"
                actionLabel="Upgrade"
                onPress={() => console.log('Upgrade pressed')}
            />
        </SettingsSection>
        <SettingsSection>
            <SettingsInfoCard
                iconName="house.fill"
                title="Storage Almost Full"
                subtitle="You have used 8.9 of 10 GB."
            />
        </SettingsSection>
        <SettingsSection>
            <SettingsLinkRow
                label="Privacy Policy"
                url="https://example.com/privacy"
            />
        </SettingsSection>
        <SettingsSection>
            <SettingsRestoreDefaults
                onReset={() => console.log('Resetting to defaults')}
            />
        </SettingsSection>

        <SettingsSection title="Custom Rows & Components">
          <SocialMediaAccountRow
            platform="instagram"
            handle="loopmaster"
            connected={true}
            onPress={() => Alert.alert('Open Account Settings')}
          />
          <SettingsDivider />
          <BrandGroupRow
            name="Real Estate Team"
            postCount={12}
            color="blue"
            onPress={() => Alert.alert('Open Brand Group')}
          />
          <SettingsDivider />
          <ProFeatureLockRow
            label="Advanced Analytics"
            caption="Upgrade to unlock this feature."
            onPress={() => Alert.alert('Prompt Upgrade')}
          />
          <SettingsDivider />
          <StorageProgressBar used={8.9} total={10} />
        </SettingsSection>

        <SettingsCaption text="This is a standalone caption to provide extra context outside of a section." />
        <View style={{ height: 100 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: '#E5E5E5', // Will be replaced by theme
      marginLeft: 16,
  }
}); 