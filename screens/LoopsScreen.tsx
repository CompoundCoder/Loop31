import React, { useState, useMemo, useRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { LoopCard } from '@/components/loops/LoopCard';
import { MOCK_POSTS } from '@/data/mockPosts';
import { getLoopPostCount } from '@/utils/loopHelpers';
import type { Loop } from '@/types/loop';
import { Modalize } from 'react-native-modalize';
import { LoopActionsModalContent } from '@/components/modals/LoopActionsModalContent';
import { useLoops } from '@/context/LoopsContext';
import { duplicateLoop } from '@/logic/loopManager';
import { useNavigation } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoopsStackParamList = {
  '(loops)/[loopId]': { loopId: string };
};

type LoopsNavigationProp = NativeStackNavigationProp<LoopsStackParamList>;

export default function LoopsScreen() {
  const { colors } = useThemeStyles();
  const { state, dispatch } = useLoops();
  const { loops } = state;
  const [selectedLoop, setSelectedLoop] = useState<Loop | null>(null);
  const modalizeRef = useRef<Modalize>(null);
  const navigation = useNavigation<LoopsNavigationProp>();

  const handleLongPress = (loop: Loop) => {
    setSelectedLoop(loop);
    modalizeRef.current?.open();
  };

  const handleCloseMenu = () => {
    modalizeRef.current?.close();
    setSelectedLoop(null);
  };

  const handlePin = (loopId: string) => {
    dispatch({ type: 'PIN', payload: loopId });
    handleCloseMenu();
  };
  
  const handleUnpin = (loopId: string) => {
    dispatch({ type: 'UNPIN', payload: loopId });
    handleCloseMenu();
  };

  const handleEdit = (loopId: string) => {
    console.log(`Editing ${loopId}`);
    handleCloseMenu();
  }

  const handleDuplicate = (loopId: string) => {
    const loopToDuplicate = loops.find(l => l.id === loopId);
    if (loopToDuplicate) {
      const newLoop = duplicateLoop(loopToDuplicate);
      dispatch({ type: 'ADD_LOOP', payload: newLoop });
    }
    handleCloseMenu();
  };

  const handleDelete = (loopId: string) => {
    dispatch({ type: 'DELETE', payload: loopId });
    handleCloseMenu();
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
      onPress={() => navigation.navigate('(loops)/[loopId]', { loopId: item.id })}
      onLongPress={() => handleLongPress(item)}
      isPinned={item.isPinned}
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
      <Modalize ref={modalizeRef} adjustToContentHeight onClosed={() => setSelectedLoop(null)}>
        {selectedLoop && (
          <LoopActionsModalContent
            loopId={selectedLoop.id}
            loopTitle={selectedLoop.title}
            isPinned={!!selectedLoop.isPinned}
            onPin={() => handlePin(selectedLoop.id)}
            onUnpin={() => handleUnpin(selectedLoop.id)}
            onEdit={() => handleEdit(selectedLoop.id)}
            onDuplicate={() => handleDuplicate(selectedLoop.id)}
            onDelete={() => handleDelete(selectedLoop.id)}
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