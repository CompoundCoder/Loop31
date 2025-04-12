import { View, Text, StyleSheet } from 'react-native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

export default function BillingSettingsScreen() {
  return (
    <SettingsContainer>
      <View style={styles.planHeader}>
        <Text style={styles.planName}>Pro Plan</Text>
        <Text style={styles.planPrice}>$15/month</Text>
        <Text style={styles.planStatus}>Active • Renews on May 1, 2024</Text>
      </View>

      <SettingsSection title="Subscription">
        <SettingItem
          label="Change Plan"
          icon="swap-horizontal-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="View Plans"
          icon="pricetag-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
        <SettingItem
          label="Cancel Subscription"
          icon="close-circle-outline"
          iconColor="#FF3B30"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Payment Method">
        <SettingItem
          label="Credit Card"
          value="••••4242"
          icon="card-outline"
          iconColor="#5856D6"
          onPress={() => {}}
        />
        <SettingItem
          label="Billing Address"
          value="Edit address"
          icon="location-outline"
          iconColor="#FF9500"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Billing History">
        <SettingItem
          label="View Invoices"
          icon="document-text-outline"
          iconColor="#8E8E93"
          onPress={() => {}}
        />
        <SettingItem
          label="Download Receipts"
          icon="download-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Additional Options">
        <SettingItem
          label="Tax Information"
          icon="receipt-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Billing Support"
          icon="help-circle-outline"
          iconColor="#FF9500"
          onPress={() => {}}
        />
      </SettingsSection>
    </SettingsContainer>
  );
}

const styles = StyleSheet.create({
  planHeader: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  planName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 34,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  planStatus: {
    fontSize: 15,
    color: '#666',
  },
}); 