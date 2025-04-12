import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialAccount {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'twitter';
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface PlatformGroup {
  id: string;
  name: string;
  accounts: string[]; // Array of account IDs
}

// Mock data - this would come from your settings/backend
const SOCIAL_ACCOUNTS: SocialAccount[] = [
  { id: 'ig1', platform: 'instagram', name: 'Brand Main', icon: 'logo-instagram' },
  { id: 'ig2', platform: 'instagram', name: 'Brand Secondary', icon: 'logo-instagram' },
  { id: 'fb1', platform: 'facebook', name: 'Brand Page', icon: 'logo-facebook' },
  { id: 'tt1', platform: 'tiktok', name: 'Brand TikTok', icon: 'logo-tiktok' },
  { id: 'tw1', platform: 'twitter', name: '@brandhandle', icon: 'logo-twitter' },
];

const PLATFORM_GROUPS: PlatformGroup[] = [
  {
    id: 'main-brand',
    name: 'Main Brand',
    accounts: ['ig1', 'fb1', 'tt1'],
  },
  {
    id: 'all-instagram',
    name: 'All Instagram',
    accounts: ['ig1', 'ig2'],
  },
];

interface PlatformSelectModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAccounts: string[];
  onSelectAccounts: (accountIds: string[]) => void;
}

export default function PlatformSelectModal({
  visible,
  onClose,
  selectedAccounts,
  onSelectAccounts,
}: PlatformSelectModalProps) {
  const toggleAccount = (accountId: string) => {
    const newSelection = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    onSelectAccounts(newSelection);
  };

  const selectGroup = (group: PlatformGroup) => {
    // Add all accounts from the group that aren't already selected
    const newSelection = [...new Set([...selectedAccounts, ...group.accounts])];
    onSelectAccounts(newSelection);
  };

  const isGroupSelected = (group: PlatformGroup) => {
    return group.accounts.every(accountId => selectedAccounts.includes(accountId));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share to</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content}>
          {/* Groups Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Groups</Text>
            <View style={styles.groupList}>
              {PLATFORM_GROUPS.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupButton,
                    isGroupSelected(group) && styles.groupButtonSelected,
                  ]}
                  onPress={() => selectGroup(group)}
                >
                  <Text style={[
                    styles.groupButtonText,
                    isGroupSelected(group) && styles.groupButtonTextSelected,
                  ]}>
                    {group.name}
                  </Text>
                  {isGroupSelected(group) && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Accounts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accounts</Text>
            {SOCIAL_ACCOUNTS.map(account => (
              <TouchableOpacity
                key={account.id}
                style={styles.accountRow}
                onPress={() => toggleAccount(account.id)}
              >
                <View style={styles.accountInfo}>
                  <Ionicons name={account.icon} size={24} color="#666" />
                  <Text style={styles.accountName}>{account.name}</Text>
                </View>
                <View style={[
                  styles.checkbox,
                  selectedAccounts.includes(account.id) && styles.checkboxSelected,
                ]}>
                  {selectedAccounts.includes(account.id) && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 17,
    color: '#2f95dc',
    fontWeight: '500',
  },
  headerRight: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  groupList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  groupButtonSelected: {
    backgroundColor: '#2f95dc',
  },
  groupButtonText: {
    fontSize: 15,
    color: '#666',
    marginRight: 4,
  },
  groupButtonTextSelected: {
    color: '#fff',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2f95dc',
    borderColor: '#2f95dc',
  },
}); 