import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { format } from 'date-fns';

// Temporary mock data
const MOCK_DRAFTS = [
  {
    id: '1',
    caption: 'This is a test draft post',
    mediaUri: 'https://picsum.photos/400/300',
    createdAt: '2024-04-11T10:30:00Z',
    platforms: ['instagram', 'facebook'],
    creator: 'Trevor Powers', // This should come from user context/auth
  },
  {
    id: '2',
    caption: 'Another draft waiting to be scheduled',
    mediaUri: 'https://picsum.photos/400/300',
    createdAt: '2024-04-10T15:45:00Z',
    platforms: ['tiktok'],
    creator: 'Trevor Powers',
  },
];

interface DraftCardProps {
  draft: typeof MOCK_DRAFTS[0];
  onEdit: () => void;
  onDelete: () => void;
  onSchedule: () => void;
}

function DraftCard({ draft, onEdit, onDelete, onSchedule }: DraftCardProps) {
  return (
    <View style={styles.draftCard}>
      <View style={styles.draftHeader}>
        <View style={styles.draftInfo}>
          <Text style={styles.draftCreator}>{draft.creator}</Text>
          <Text style={styles.draftDate}>
            {format(new Date(draft.createdAt), 'MMM d, yyyy • h:mm a')}
          </Text>
        </View>
      </View>

      <Text style={styles.draftCaption}>{draft.caption}</Text>

      {draft.mediaUri && (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: draft.mediaUri }} style={styles.mediaPreview} />
          <View style={styles.playButton}>
            <Ionicons name="play" size={40} color="#fff" />
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.scheduleButton]} onPress={onSchedule}>
          <Text style={styles.scheduleButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface DraftsScreenProps {
  onClose: () => void;
  onEditDraft: (draft: typeof MOCK_DRAFTS[0]) => void;
}

export default function DraftsScreen({ onClose, onEditDraft }: DraftsScreenProps) {
  const [activeTab, setActiveTab] = useState<'drafts' | 'awaiting'>('drafts');
  
  const handleDeleteDraft = (draftId: string) => {
    // TODO: Move to trash instead of deleting
    console.log('Move to trash:', draftId);
  };

  const handleEditDraft = (draft: typeof MOCK_DRAFTS[0]) => {
    onEditDraft(draft);
    onClose();
  };

  const handleScheduleDraft = (draftId: string) => {
    console.log('Schedule draft:', draftId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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

      {/* Draft List */}
      <FlatList
        data={activeTab === 'drafts' ? MOCK_DRAFTS : []}
        renderItem={({ item }) => (
          <DraftCard
            draft={item}
            onDelete={() => handleDeleteDraft(item.id)}
            onEdit={() => handleEditDraft(item)}
            onSchedule={() => handleScheduleDraft(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.draftList}
      />
    </View>
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
    paddingTop: 16,
    paddingBottom: 8,
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
    marginLeft: -8,
  },
  headerRight: {
    width: 40, // Balance the close button
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2f95dc',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  tabCount: {
    color: '#666',
  },
  draftList: {
    padding: 16,
  },
  draftCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  draftHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  draftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftCreator: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  draftDate: {
    fontSize: 14,
    color: '#666',
  },
  draftCaption: {
    fontSize: 16,
    color: '#333',
    padding: 12,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#f9f9f9',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    marginRight: 8,
  },
  editButton: {
    marginHorizontal: 8,
  },
  scheduleButton: {
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontSize: 15,
  },
  editButtonText: {
    color: '#2f95dc',
    fontSize: 15,
  },
  scheduleButtonText: {
    color: '#2f95dc',
    fontSize: 15,
  },
}); 