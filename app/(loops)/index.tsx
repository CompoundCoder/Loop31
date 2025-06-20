import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useRouter, useNavigation } from 'expo-router';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

import AnimatedHeader from '@/components/AnimatedHeader';
import ScreenContainer from '@/components/ScreenContainer';
import { LoopCard } from '@/components/loops/LoopCard';
import LoopListSectionHeader from '@/components/loops/LoopListSectionHeader';
import CreateLoopPopup from '@/components/loops/CreateLoopPopup';
import EditLoopPopup from '@/components/loops/EditLoopPopup';
import { CircleButton } from '@/components/common/CircleButton';
import { getButtonPresets } from '@/presets/buttons';

import { Modalize } from 'react-native-modalize';
import { LoopActionsModalContent } from '@/components/modals/LoopActionsModalContent';
import { LoopsEmptyState } from '@/components/loops/LoopsEmptyState';
import { useLoops, type Loop } from '@/context/LoopsContext';
import { useEditLoopPopup } from '@/hooks/useEditLoopPopup';
import { getLoopPostCount } from '@/utils/loopHelpers';
import { MOCK_POSTS } from '@/data/mockPosts';
import { duplicateLoop as duplicateLoopUtil } from '@/logic/loopManager';
import { addLoopToRecentlyDeleted } from '@/data/recentlyDeleted';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList) as any;

export type LoopsStackParamList = {
  '[loopId]': { loopId: string };
};

type LoopSection = {
  title: string;
  data: (Loop & { postCount: number })[];
};

export default function LoopsScreen() {
  const theme = useThemeStyles();
  const { colors, spacing } = theme;
  const buttonPresets = getButtonPresets(theme);
  const { state, dispatch } = useLoops();
  const { loops } = state;
  
  const [isCreateLoopVisible, setCreateLoopVisible] = useState(false);
  const { loopToEdit, isEditPopupVisible, openEditPopup, closeEditPopup } = useEditLoopPopup();
  
  const scrollY = useSharedValue(0);
  const modalRef = useRef<Modalize>(null);
  const [selectedLoop, setSelectedLoop] = useState<Loop | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<LoopsStackParamList>>();
  
  const handleScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const showCreateLoopForm = useCallback(() => setCreateLoopVisible(true), []);

  const handleLongPress = (loop: Loop) => {
    setSelectedLoop(loop);
    modalRef.current?.open();
  };
  
  const handleCloseMenu = () => {
    modalRef.current?.close();
  };

  const handlePin = (loopId: string) => dispatch({ type: 'PIN', payload: loopId });
  const handleUnpin = (loopId: string) => dispatch({ type: 'UNPIN', payload: loopId });
  const handleDelete = (loop: Loop) => {
    Alert.alert(
      'Delete Loop',
      'Are you sure you want to delete this loop?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            await addLoopToRecentlyDeleted(loop);
            dispatch({ type: 'DELETE', payload: loop.id });
            handleCloseMenu();
          } 
        },
      ]
    );
  };
  
  const handleEdit = (loop: Loop) => {
    openEditPopup(loop);
    modalRef.current?.close();
  };

  const handleDuplicate = (loop: Loop) => {
    const newLoop = duplicateLoopUtil(loop);
    dispatch({ type: 'ADD_LOOP', payload: newLoop });
    modalRef.current?.close();
  };

  const sections = useMemo(() => {
    const loopsWithPostCounts = loops.map(loop => ({
      ...loop,
      postCount: getLoopPostCount(loop.id, MOCK_POSTS),
    }));

    const pinnedLoops = loopsWithPostCounts.filter(loop => loop.isPinned);
    const otherLoops = loopsWithPostCounts.filter(loop => !loop.isPinned);

    const sectionsData = [];
    if (pinnedLoops.length > 0) {
      sectionsData.push({ title: 'Pinned', data: pinnedLoops });
    }
    if (otherLoops.length > 0) {
      sectionsData.push({ title: 'Loops', data: otherLoops });
    }
    return sectionsData;
  }, [loops]);
  
  const renderItem = ({ item }: { item: Loop & { postCount: number } }) => (
    <View style={{ marginBottom: spacing.md }}>
      <LoopCard
        loop={item}
        isPinned={item.isPinned}
        onPress={() => navigation.navigate('[loopId]', { loopId: item.id })}
        onLongPress={() => handleLongPress(item)}
        onToggleActive={(loopId, isActive) => dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId, isActive } })}
      />
    </View>
  );

  if (loops.length === 0) {
    return <LoopsEmptyState onCreateLoop={showCreateLoopForm} />;
  }

  const HEADER_HEIGHT = 100;

  return (
    <ScreenContainer>
      <AnimatedHeader 
        title="Loops" 
        scrollY={scrollY} 
        actionButton={
          <CircleButton 
            preset={buttonPresets.addDark} 
            onPress={showCreateLoopForm} 
            accessibilityLabel="Create new loop" 
          />
        }
      />
      
      <AnimatedSectionList
        sections={sections as LoopSection[]}
        renderItem={renderItem}
        keyExtractor={(item: Loop) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }: { section: LoopSection }) => <LoopListSectionHeader title={title} />}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingHorizontal: 24 }}
      />

      <Modalize ref={modalRef} adjustToContentHeight onClosed={() => setSelectedLoop(null)}>
        {selectedLoop && (
          <LoopActionsModalContent
            loopId={selectedLoop.id}
            loopTitle={selectedLoop.title}
            isPinned={selectedLoop.isPinned}
            onPin={() => { handlePin(selectedLoop.id); handleCloseMenu(); }}
            onUnpin={() => { handleUnpin(selectedLoop.id); handleCloseMenu(); }}
            onEdit={() => handleEdit(selectedLoop)}
            onDuplicate={() => handleDuplicate(selectedLoop)}
            onDelete={() => handleDelete(selectedLoop)}
            onClose={handleCloseMenu}
          />
        )}
      </Modalize>
      
      <CreateLoopPopup
        visible={isCreateLoopVisible}
        onClose={() => setCreateLoopVisible(false)}
        onSaveSuccess={() => setCreateLoopVisible(false)}
      />
      
      <EditLoopPopup
        visible={isEditPopupVisible}
        onClose={closeEditPopup}
        onSaveSuccess={closeEditPopup}
        loop={loopToEdit}
      />
    </ScreenContainer>
  );
}
