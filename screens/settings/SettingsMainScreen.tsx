import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsNavigator';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useAccounts } from '../../context/AccountContext';
import AnimatedHeader from '../../components/AnimatedHeader';

type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface AnalyticsSettings {
  defaultView: 'all' | 'account' | 'group';
}

export default function SettingsMainScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { accounts, brandGroups } = useAccounts();
  const [analyticsSettings] = useState<AnalyticsSettings>({
    defaultView: 'all'
  });
  const scrollY = useRef(new Animated.Value(0)).current;

  const connectedCount = accounts.filter(a => a.isConnected).length;
  const groupCount = brandGroups.length;

  return (
    <View style={styles.container}>
      <AnimatedHeader 
        title="Settings" 
        titleStyle={styles.headerTitle}
        containerStyle={styles.headerContainer}
      />
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <SettingsContainer style={styles.settingsContainer}>
          <SettingsSection title="Profile & Account" titleStyle={styles.sectionTitle}>
            <SettingItem
              label="Profile Settings"
              icon="person-circle-outline"
              iconColor="#FF3B30"
              labelStyle={styles.itemLabel}
              onPress={() => navigation.navigate('ProfileSettings')}
            />
            <SettingItem
              label="Connected Accounts"
              icon="link-outline"
              iconColor="#34C759"
              labelStyle={styles.itemLabel}
              onPress={() => navigation.navigate('ConnectedAccounts')}
              detail={`${connectedCount} Connected`}
              detailStyle={styles.detailText}
            />
            <SettingItem
              label="Brand Groups"
              icon="folder-outline"
              iconColor="#007AFF"
              labelStyle={styles.itemLabel}
              onPress={() => navigation.navigate('BrandGroups')}
              detail={`${groupCount} Groups`}
              detailStyle={styles.detailText}
            />
          </SettingsSection>

          <SettingsSection title="Preferences" titleStyle={styles.sectionTitle}>
            <SettingItem
              label="Analytics View"
              icon="analytics-outline"
              iconColor="#5856D6"
              labelStyle={styles.itemLabel}
              onPress={() => navigation.navigate('AnalyticsSettings')}
              detail={analyticsSettings.defaultView === 'all' ? 'All Accounts' : 
                analyticsSettings.defaultView === 'group' ? 'By Group' : 'By Account'}
              detailStyle={styles.detailText}
            />
            <SettingItem
              label="Notifications"
              icon="notifications-outline"
              iconColor="#FF9500"
              labelStyle={styles.itemLabel}
              onPress={() => navigation.navigate('NotificationSettings')}
            />
          </SettingsSection>

          <SettingsSection title="Support" titleStyle={styles.sectionTitle}>
            <SettingItem
              label="Help Center"
              icon="help-circle-outline"
              iconColor="#AF52DE"
              labelStyle={styles.itemLabel}
              onPress={() => {}}
            />
            <SettingItem
              label="Contact Support"
              icon="mail-outline"
              iconColor="#FF2D55"
              labelStyle={styles.itemLabel}
              onPress={() => {}}
            />
          </SettingsSection>
        </SettingsContainer>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 17,
    fontWeight: '600',
  },
  itemLabel: {
    color: '#333',
    fontSize: 16,
  },
  detailText: {
    color: '#666',
  },
}); 