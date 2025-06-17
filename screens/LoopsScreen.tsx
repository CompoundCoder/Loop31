import React, { useState, useMemo, useRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { LoopCard } from '@/components/loops/LoopCard';
import { MOCK_POSTS } from '@/data/mockPosts';
import { getLoopPostCount } from '@/utils/loopHelpers';
import type { Loop } from '@/types/loop';
import { Modalize } from 'react-native-modalize';
import { LoopActionsModalContent } from '@/components/modals/LoopActionsModalContent';

// Temporary mock data for loops, as it seems to be missing.
const MOCK_LOOPS: Loop[] = [
  { id: 'loop-1-tech', title: 'Tech Updates', color: '#4A90E2', postCount: 0, schedule: '', frequency: 'daily_3x', isActive: true },
  { id: 'loop-2-science', title: 'Science Discoveries', color: '#50E3C2', postCount: 0, schedule: '', frequency: 'weekly_1x', isActive: true },
  { id: 'loop-3-general', title: 'General Musings', color: '#B8E986', postCount: 0, schedule: '', frequency: 'weekly_5x', isActive: false },
];

export default function LoopsScreen() {
  const { colors } = useThemeStyles();
  const [loops, setLoops] = useState<Loop[]>(MOCK_LOOPS);
  const [selectedLoop, setSelectedLoop] = useState<Loop | null>(null);
  const modalizeRef = useRef<Modalize>(null);

  const handleLongPress = (loop: Loop) => {
    setSelectedLoop(loop);
    modalizeRef.current?.open();
  };

  const handleCloseMenu = () => {
    modalizeRef.current?.close();
  };
  
  // Mock pinned IDs for demonstration
  const [pinnedLoopIds, setPinnedLoopIds] = useState(new Set(['loop-2-science']));

  const handlePin = (loopId: string) => {
    console.log(`Pinning ${loopId}`);
    setPinnedLoopIds(prev => new Set(prev).add(loopId));
  };
  
  const handleUnpin = (loopId: string) => {
    console.log(`Unpinning ${loopId}`);
    setPinnedLoopIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(loopId);
      return newSet;
    });
  };

  const handleEdit = (loopId: string) => console.log(`Editing ${loopId}`);
  const handleDuplicate = (loopId: string) => console.log(`Duplicating ${loopId}`);
  const handleDelete = (loopId: string) => {
    console.log(`Deleting ${loopId}`);
    setLoops(prev => prev.filter(l => l.id !== loopId));
  };

  const loopsWithPostCounts = useMemo(() => {
    return loops.map(loop => ({
      ...loop,
      postCount: getLoopPostCount(loop.id, MOCK_POSTS),
    }));
  }, [loops]);

  const renderItem = ({ item }: { item: Loop }) => (
    <LoopCard 
      loop={item} 
      onPress={() => console.log('Selected loop:', item.id)}
      onLongPress={() => handleLongPress(item)}
    />
  );

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={loopsWithPostCounts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
      <Modalize ref={modalizeRef} adjustToContentHeight>
        {selectedLoop && (
          <LoopActionsModalContent
            loopId={selectedLoop.id}
            loopTitle={selectedLoop.title}
            isPinned={pinnedLoopIds.has(selectedLoop.id)}
            onPin={handlePin}
            onUnpin={handleUnpin}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onClose={handleCloseMenu}
          />
        )}
      </Modalize>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
}); 