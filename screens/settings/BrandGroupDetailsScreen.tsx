import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';
import { useAccounts } from '../../context/AccountContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { SettingsStackParamList } from '../../navigation/SettingsNavigator';
import { Ionicons } from '@expo/vector-icons';

type BrandGroupDetailsScreenNavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  'BrandGroupDetails'
>;

type BrandGroupDetailsScreenRouteProp = RouteProp<
  SettingsStackParamList,
  'BrandGroupDetails'
>;

const GROUP_NAME_LIMIT = 30;

export default function BrandGroupDetailsScreen() {
  const navigation = useNavigation<BrandGroupDetailsScreenNavigationProp>();
  const route = useRoute<BrandGroupDetailsScreenRouteProp>();
  const { accounts, brandGroups, updateGroup, deleteGroup, toggleAccountInGroup } = useAccounts();
  const group = brandGroups.find(g => g.id === route.params.groupId);
  
  const [groupName, setGroupName] = useState(group?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(group?.accounts || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setSelectedAccounts(group.accounts);
    }
  }, [group]);

  useEffect(() => {
    const hasNameChanged = group && groupName !== group.name;
    const hasAccountsChanged = group && JSON.stringify(selectedAccounts) !== JSON.stringify(group.accounts);
    setHasChanges(Boolean(hasNameChanged || hasAccountsChanged));
  }, [groupName, selectedAccounts, group]);

  if (!group) return null;

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }

    if (selectedAccounts.length === 0) {
      Alert.alert('Error', 'Group must have at least one account');
      return;
    }

    setIsSaving(true);
    try {
      await updateGroup(group.id, {
        name: groupName.trim(),
        accounts: selectedAccounts,
      });
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    Alert.alert(
      'Remove from Group',
      `Are you sure you want to remove ${account.name} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleToggleAccount(accountId)
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This will remove the group from all scheduled posts and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGroup(group.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleToggleAccount = (accountId: string) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <View style={styles.titleWrapper}>
          {isEditing ? (
            <>
              <View style={styles.editingContainer}>
                <TextInput
                  style={styles.titleInput}
                  value={groupName}
                  onChangeText={setGroupName}
                  autoFocus
                  maxLength={GROUP_NAME_LIMIT}
                />
                <TouchableOpacity 
                  onPress={() => setIsEditing(false)}
                  style={styles.doneButton}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{groupName}</Text>
              <TouchableOpacity 
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={20} color="#007AFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderAccountSelector = () => (
    <Modal
      visible={showAccountSelector}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Account</Text>
          <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
            <Text style={styles.modalCloseButton}>Done</Text>
          </TouchableOpacity>
        </View>
        <SettingsContainer>
          <SettingsSection title="Available Accounts">
            {accounts
              .filter(account => !selectedAccounts.includes(account.id))
              .map(account => (
                <SettingItem
                  key={account.id}
                  label={account.name}
                  icon={account.platform.toLowerCase() === 'twitter' ? 'logo-twitter' :
                        account.platform.toLowerCase() === 'facebook' ? 'logo-facebook' :
                        account.platform.toLowerCase() === 'instagram' ? 'logo-instagram' :
                        account.platform.toLowerCase() === 'linkedin' ? 'logo-linkedin' :
                        'share-outline'}
                  onPress={() => {
                    handleToggleAccount(account.id);
                    setShowAccountSelector(false);
                  }}
                />
              ))}
          </SettingsSection>
        </SettingsContainer>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
      >
        {renderHeader()}
        
        <SettingsContainer>
          <SettingsSection title="Connected Accounts">
            {accounts
              .filter(account => selectedAccounts.includes(account.id))
              .map(account => (
                <SettingItem
                  key={account.id}
                  label={account.name}
                  icon={account.platform.toLowerCase() === 'twitter' ? 'logo-twitter' :
                        account.platform.toLowerCase() === 'facebook' ? 'logo-facebook' :
                        account.platform.toLowerCase() === 'instagram' ? 'logo-instagram' :
                        account.platform.toLowerCase() === 'linkedin' ? 'logo-linkedin' :
                        'share-outline'}
                  onPress={() => {}}
                  rightElement={
                    <TouchableOpacity
                      onPress={() => handleRemoveAccount(account.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="close" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  }
                />
            ))}
            
            <SettingItem
              label="Add Account"
              icon="add-circle-outline"
              onPress={() => setShowAccountSelector(true)}
            />
          </SettingsSection>
        </SettingsContainer>
      </KeyboardAwareScrollView>

      {renderAccountSelector()}

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Group</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || isSaving) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 40,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 200,
    padding: 0,
  },
  editButton: {
    position: 'absolute',
    right: -30,
    padding: 4,
  },
  doneButton: {
    marginLeft: 8,
    padding: 4,
  },
  doneButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A2A2A2',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalCloseButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 