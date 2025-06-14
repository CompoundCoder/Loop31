import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { LoopCard } from '@/components/loops/LoopCard';
import { MOCK_POSTS } from '@/data/mockPosts';
import { getLoopPostCount } from '@/utils/loopHelpers';
import type { Loop } from '@/types/loop';

// Temporary mock data for loops, as it seems to be missing.
const MOCK_LOOPS: Loop[] = [
  { id: 'loop-1-tech', title: 'Tech Updates', color: '#4A90E2', postCount: 0, schedule: '', frequency: 'daily_3x', isActive: true },
  { id: 'loop-2-science', title: 'Science Discoveries', color: '#50E3C2', postCount: 0, schedule: '', frequency: 'weekly_1x', isActive: true },
  { id: 'loop-3-general', title: 'General Musings', color: '#B8E986', postCount: 0, schedule: '', frequency: 'weekly_5x', isActive: false },
];

export default function LoopsScreen() {
  const { colors } = useThemeStyles();
  const [loops, setLoops] = useState<Loop[]>(MOCK_LOOPS);

  const loopsWithPostCounts = useMemo(() => {
    return loops.map(loop => ({
      ...loop,
      postCount: getLoopPostCount(loop.id, MOCK_POSTS),
    }));
  }, [loops]);

  const renderItem = ({ item }: { item: Loop }) => (
    <LoopCard loop={item} onPress={() => console.log('Selected loop:', item.id)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={loopsWithPostCounts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
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