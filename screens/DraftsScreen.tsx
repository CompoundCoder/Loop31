import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/BottomTabNavigator';
import PostCard from '../components/PostCard';

type DraftsScreenNavigationProp = BottomTabNavigationProp<RootTabParamList>;

type Platform = {
  id: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
  name: string;
};

interface DraftPost {
  id: string;
  mediaUri: string;
  caption: string;
  platforms: Platform[];
  date: Date;
  lastEdited?: Date;
  creator: string;
}

// Mock data for draft posts
const MOCK_DRAFTS: DraftPost[] = [
  {
    id: '1',
    mediaUri: 'https://picsum.photos/800/800',
    caption: 'Working on this amazing chrome delete project. What do you think of the progress so far? #InProgress #VinylWrap',
    platforms: [
      { id: 'ig1', type: 'instagram', name: 'Brand Main' },
    ],
    date: new Date(),
    lastEdited: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    creator: 'John Doe'
  },
  {
    id: '2',
    mediaUri: 'https://picsum.photos/900/1200',
    caption: 'Sneak peek of our latest project! Full reveal coming soon... 👀 #ComingSoon #CarWrap',
    platforms: [
      { id: 'ig1', type: 'instagram', name: 'Brand Main' },
      { id: 'fb1', type: 'facebook', name: 'Brand Page' },
    ],
    date: new Date(),
    lastEdited: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    creator: 'Jane Smith'
  },
];

export default function DraftsScreen() {
  const navigation = useNavigation<DraftsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'drafts' | 'awaiting'>('drafts');
  
  const handleDeleteDraft = (draftId: string) => {
    console.log('Delete draft:', draftId);
  };

  const handleEditDraft = (draft: DraftPost) => {
    console.log('Edit draft:', draft.id);
  };

  const handleScheduleDraft = (draftId: string) => {
    console.log('Schedule draft:', draftId);
  };

  const renderPost = ({ item }: { item: DraftPost }) => (
    <PostCard
      mediaUri={item.mediaUri}
      caption={item.caption}
      platforms={item.platforms}
      date={item.lastEdited || item.date}
      status="draft"
      onEdit={() => handleEditDraft(item)}
      onDelete={() => handleDeleteDraft(item.id)}
      onSchedule={() => handleScheduleDraft(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.navigate('Create')}
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
            <Text style={styles.tabCount}> {MOCK_DRAFTS.length}</Text>
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
        data={activeTab === 'drafts' ? MOCK_DRAFTS : []}
        renderItem={renderPost}
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
}); 