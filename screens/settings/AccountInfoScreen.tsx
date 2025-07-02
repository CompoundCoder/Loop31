import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Alert, Pressable, Text } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import {
  SettingsSection,
  SettingsAvatarRow,
  SettingsTextInput,
  SettingsDivider,
  SettingsButton,
  SettingsDropdown,
  SettingsMultiSelect,
  SettingsCaption,
  SettingsRow,
} from '@/components/settings';
import SettingsHeader from '@/components/headers/SettingsHeader';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import { BottomSheetMenu } from '@/components/ui/BottomSheetMenu';
import { Modalize } from 'react-native-modalize';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const EDIT_ACTIONS_HEIGHT = 44; // Approx height for the actions row

const roleOptions = ['Agent', 'Broker', 'Assistant', 'Transaction Coordinator', 'Team Lead', 'Appraiser', 'Property Manager', 'Marketer'];
const focusAreaOptions = [
    { label: 'Buyers', value: 'Buyers' },
    { label: 'Sellers', value: 'Sellers' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Residential', value: 'Residential' },
    { label: 'Investors', value: 'Investors' },
];

export default function AccountInfoScreen() {
  const { colors, spacing, borderRadius } = useThemeStyles();
  const bottomSheetRef = useRef<Modalize>(null);

  // Editing state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  
  // Animation shared values
  const emailEditAnimation = useSharedValue(0);
  const usernameEditAnimation = useSharedValue(0);

  // Original values
  const [username, setUsername] = useState('LoopMaster');
  const [email, setEmail] = useState('trevor@loop.com');
  
  // Temp values for editing
  const [tempUsername, setTempUsername] = useState(username);
  const [tempEmail, setTempEmail] = useState(email);

  // Other form state
  const [phone, setPhone] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [role, setRole] = useState('Agent');
  const [brokerage, setBrokerage] = useState('Compass');
  const [focusAreas, setFocusAreas] = useState(['Buyers']);

  useEffect(() => {
    emailEditAnimation.value = withTiming(isEditingEmail ? 1 : 0, { duration: 250 });
  }, [isEditingEmail]);

  useEffect(() => {
    usernameEditAnimation.value = withTiming(isEditingUsername ? 1 : 0, { duration: 250 });
  }, [isEditingUsername]);

  const handleResetPassword = () => Alert.alert('Reset Password', 'A password reset link will be sent to your email.');
  const handleDeleteAccount = () => Alert.alert('Delete Account', 'Are you sure you want to permanently delete your account?');

  // Handlers for Email
  const onSaveEmail = () => {
    setEmail(tempEmail);
    setIsEditingEmail(false);
  };
  const onCancelEmail = () => {
    setTempEmail(email);
    setIsEditingEmail(false);
  };

  // Handlers for Username
  const onSaveUsername = () => {
    setUsername(tempUsername);
    setIsEditingUsername(false);
  };
  const onCancelUsername = () => {
    setTempUsername(username);
    setIsEditingUsername(false);
  };
  
  const handleRoleSelect = () => {
    bottomSheetRef.current?.open();
  };

  const roleMenuItems = [{
    title: 'Select a Role',
    items: roleOptions.map(option => ({
      label: option,
      onPress: () => {
        setRole(option);
        bottomSheetRef.current?.close();
      },
      icon: <Ionicons name={role === option ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={role === option ? colors.accent : colors.text} />,
    })),
  }];

  const emailActionsAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(emailEditAnimation.value, [0, 1], [0, EDIT_ACTIONS_HEIGHT]);
    const opacity = emailEditAnimation.value;
    const translateY = interpolate(emailEditAnimation.value, [0, 1], [10, 0]);
    return { height, opacity, transform: [{ translateY }] };
  });

  const usernameActionsAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(usernameEditAnimation.value, [0, 1], [0, EDIT_ACTIONS_HEIGHT]);
    const opacity = usernameEditAnimation.value;
    const translateY = interpolate(usernameEditAnimation.value, [0, 1], [10, 0]);
    return { height, opacity, transform: [{ translateY }] };
  });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SettingsHeader title="Account Info" />
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
        
        <SettingsSection>
          <SettingsAvatarRow
            name={username}
            email={email}
            pressable={false}
            showArrow={false}
          />
        </SettingsSection>

        <SettingsSection>
            <SettingsRow
                label="Manage Connected Accounts"
                onPress={() => router.push('/you/connected-accounts')}
            />
        </SettingsSection>

        <SettingsSection title="Login Details">
          <SettingsTextInput
            label="Email"
            value={tempEmail}
            onChangeText={(text) => {
              if (!isEditingEmail) setIsEditingEmail(true);
              setTempEmail(text);
            }}
            keyboardType="email-address"
          />
          <Animated.View style={[styles.animatedContainer, emailActionsAnimatedStyle]}>
            <View style={styles.editActionsContainer}>
              <Pressable onPress={onCancelEmail} style={[styles.actionButton, { backgroundColor: colors.subtleButton, borderRadius: borderRadius.sm }]}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onSaveEmail} style={[styles.actionButton, { backgroundColor: colors.accent, borderRadius: borderRadius.sm, marginLeft: spacing.sm }]}>
                <Text style={{ color: colors.buttonAccentText }}>Save</Text>
              </Pressable>
            </View>
          </Animated.View>
          <SettingsDivider />
          <SettingsTextInput
            label="Username"
            value={tempUsername}
            onChangeText={(text) => {
              if (!isEditingUsername) setIsEditingUsername(true);
              setTempUsername(text);
            }}
          />
          <Animated.View style={[styles.animatedContainer, usernameActionsAnimatedStyle]}>
            <View style={styles.editActionsContainer}>
              <Pressable onPress={onCancelUsername} style={[styles.actionButton, { backgroundColor: colors.subtleButton, borderRadius: borderRadius.sm }]}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onSaveUsername} style={[styles.actionButton, { backgroundColor: colors.accent, borderRadius: borderRadius.sm, marginLeft: spacing.sm }]}>
                <Text style={{ color: colors.buttonAccentText }}>Save</Text>
              </Pressable>
            </View>
          </Animated.View>
        </SettingsSection>

        <SettingsSection title="Personal Info">
          <SettingsTextInput
            label="Phone Number"
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
            placeholder="Not set"
            keyboardType="phone-pad"
            maxLength={10}
          />
          <SettingsDivider />
          <SettingsTextInput
            label="Zip Code"
            value={zipCode}
            onChangeText={(text) => setZipCode(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={9}
          />
        </SettingsSection>

        <SettingsSection title="Business Info">
          <SettingsDropdown
            label="Role"
            value={role}
            onPress={handleRoleSelect}
          />
          <SettingsDivider />
          <SettingsTextInput
            label="Team or Brokerage"
            value={brokerage}
            onChangeText={setBrokerage}
          />
          <SettingsDivider />
          <SettingsMultiSelect
            label="Focus Areas"
            options={focusAreaOptions}
            selectedValues={focusAreas}
            onChange={setFocusAreas}
          />
        </SettingsSection>
        
        <SettingsSection title="Security">
          <SettingsButton
            text="Reset Password"
            onPress={handleResetPassword}
          />
          <SettingsDivider />
          <SettingsButton
            text="Delete Account"
            variant="danger"
            onPress={handleDeleteAccount}
          />
        </SettingsSection>
        
        <SettingsCaption text="Your info helps Loop31 personalize content and automate smarter." />
        <View style={{ height: 100 }} />
      </ScrollView>
       <BottomSheetMenu
        modalRef={bottomSheetRef}
        sections={roleMenuItems.map(section => section.items)}
        menuTitle={roleMenuItems[0].title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  animatedContainer: {
    overflow: 'hidden',
  },
  editActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  }
}); 