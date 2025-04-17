import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/BottomTabNavigator';
import PostCard, { PostStatus } from '../components/PostCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DraftsScreenNavigationProp = BottomTabNavigationProp<RootTabParamList>;

type Platform = {
  id: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  name: string;
};

export interface DraftPost {
  id: string;
  mediaUri: string;
  caption: string;
  accountIds: Array<{
    id: string;
    type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
    name: string;
  }>;
  scheduledDate: string;
  createdAt: string;
  status: PostStatus;
}

type DraftsScreenProps = {
  onClose?: () => void;
  onEditDraft?: (draft: DraftPost) => void;
};

export default function DraftsScreen({ onClose, onEditDraft }: DraftsScreenProps) {
  const navigation = useNavigation<DraftsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'drafts' | 'awaiting'>('drafts');
  const [drafts, setDrafts] = useState<DraftPost[]>([]);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const draftsJson = await AsyncStorage.getItem('drafts');
      if (draftsJson) {
        const loadedDrafts = JSON.parse(draftsJson);
        setDrafts(loadedDrafts);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      Alert.alert('Error', 'Failed to load drafts');
    }
  };
  
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Draft',
      'Are you sure you want to delete this draft? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedDrafts = drafts.filter(draft => draft.id !== id);
              await AsyncStorage.setItem('drafts', JSON.stringify(updatedDrafts));
              setDrafts(updatedDrafts);
            } catch (error) {
              console.error('Error deleting draft:', error);
              Alert.alert('Error', 'Failed to delete draft');
            }
          },
        },
      ],
    );
  };

  const handleEdit = (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (draft) {
      if (onEditDraft) {
        onEditDraft(draft);
      } else {
        // If no onEditDraft prop, navigate to Create screen with draft data
        navigation.navigate('Create', {
          draft: {
            caption: draft.caption,
            mediaUri: draft.mediaUri,
            accountIds: draft.accountIds.map(acc => acc.id),
            scheduledDate: draft.scheduledDate,
          }
        });
      }
    }
  };

  const handleSchedule = (id: string) => {
    const draft = drafts.find(d => d.id === id);
    if (draft) {
      navigation.navigate('SchedulePreview', {
        platforms: draft.accountIds.map(acc => acc.id),
        media: draft.mediaUri ? [draft.mediaUri] : [],
        content: draft.caption,
      });
    }
  };

  const renderDraft = ({ item }: { item: DraftPost }) => (
    <View key={item.id} style={styles.postCardContainer}>
      <PostCard
        mediaUri={item.mediaUri || ''}
        caption={item.caption}
        platforms={item.accountIds}
        date={new Date(item.scheduledDate)}
        status="draft"
        onEdit={() => handleEdit(item.id)}
        onDelete={() => handleDelete(item.id)}
        onSchedule={() => handleSchedule(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => onClose ? onClose() : navigation.navigate('Create')}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drafts</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'drafts' && styles.activeTab]}
          onPress={() => setActiveTab('drafts')}
        >
          <Text style={[styles.tabText, activeTab === 'drafts' && styles.activeTabText]}>
            Drafts
            <Text style={styles.tabCount}> {drafts.length}</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'awaiting' && styles.activeTab]}
          onPress={() => setActiveTab('awaiting')}
        >
          <Text style={[styles.tabText, activeTab === 'awaiting' && styles.activeTabText]}>
            Awaiting Approval
            <Text style={styles.tabCount}> 0</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'drafts' ? drafts : []}
        renderItem={renderDraft}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerRight: {
    width: 44, // Match close button width for centering
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  tabCount: {
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  postCardContainer: {
    marginBottom: 16,
  },
}); 