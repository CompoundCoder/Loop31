import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Switch, StyleSheet, Text, ScrollView, Platform, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TestPostCardMini from '../../components/test-PostCardMini';
import { spacing } from '../../theme/theme';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Animated, { useAnimatedStyle, withTiming, Easing, useSharedValue } from 'react-native-reanimated';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SCREEN_LAYOUT } from '@/constants/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useLoops, type Loop as ContextLoop, type PostDisplayData } from '@/context/LoopsContext';
import LoopEditMenu from '@/components/loops/LoopEditMenu';

// Define LocalPostData interface (mock post structure for the list)
// interface LocalPostData {
//   id: string;
//   caption: string;
//   imageSource: ImageSourcePropType;
// }

const TEMP_COLORS = {
  screenContentContainer: 'rgba(255, 0, 0, 0)',
  backButton: 'rgba(0, 255, 0, 0)',
  titleOptions: 'rgba(0, 0, 255, 0)',
  queueTitle: 'rgba(0, 255, 255, 0)',
  cardListContainer: 'rgba(200, 100, 0, 0)',
  safeAreaContainer: 'rgba(128, 0, 128, 0)',
  renderItemOuter: 'rgba(255, 166, 0, 0)',
  renderItemTransform: 'rgba(255, 192, 203, 0)',
};

const touchableMinHeight = 44;

export const options = {
    headerShown: false,
    tabBarStyle: { display: 'none' },
  };

// Define the item renderer as a separate, memoized component
const MemoizedQueueItem = React.memo(({ item, drag, isActive: itemIsActive }: RenderItemParams<PostDisplayData>) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (itemIsActive) {
      scale.value = withTiming(1.06, { duration: 120 });
    } else {
      scale.value = withTiming(1.0, { duration: 160, easing: Easing.out(Easing.exp) });
    }
  }, [itemIsActive, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={{ flex: 1, overflow: 'visible', backgroundColor: TEMP_COLORS.renderItemOuter }}>
      <Animated.View style={[
        animatedStyle, 
        { backgroundColor: TEMP_COLORS.renderItemTransform, paddingVertical: spacing.xs }
      ]}>
        <TestPostCardMini
          image={item.imageSource}
          caption={item.caption}
          onPress={() => console.log(`Pressed ${item.id}`)}
          drag={drag} 
          isActive={itemIsActive} 
        />
      </Animated.View>
    </View>
  );
});

export default function LoopDetailsScreen() {
  const { colors, typography } = useThemeStyles();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { loopId } = useLocalSearchParams<{ loopId: string }>();
  const { state, dispatch } = useLoops();

  const loop: ContextLoop | undefined = state.loops.find(l => l.id === loopId);

  const [isActive, setIsActive] = useState(loop?.isActive ?? false);
  const [posts, setPosts] = useState<PostDisplayData[]>(loop?.posts ?? []); // Use loop.posts here

  const [scrollEnabled, setScrollEnabled] = useState(true); 
  const [isEditMenuVisible, setIsEditMenuVisible] = useState(false);

  useEffect(() => {
    if (loop) {
      console.log('Loop data updated for ID:', loopId, loop.title);
      setIsActive(loop.isActive);
      setPosts(loop.posts); // Update posts when loop data changes
    } else {
      console.log('Loop not found in context for ID:', loopId);
      setPosts([]); // Clear posts if loop is not found
    }
  }, [loop, loopId]);

  // Use loop.color for the gradient, provide a fallback if loop or loop.color is undefined
  const gradientStartColor = loop?.color ?? colors.accent; 
  const gradientEndColor = colors.background;

  // Use the memoized component for renderItem
  const renderQueueItem = useCallback((props: RenderItemParams<PostDisplayData>) => {
    return <MemoizedQueueItem {...props} />;
  }, []);

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.card,
    },
    pageContentWrapper: { 
      flex: 1,
    },
    fixedHeaderContainer: { 
      backgroundColor: colors.card, 
      paddingLeft: spacing.sm,
      paddingRight: SCREEN_LAYOUT.content.horizontalPadding,
      height: 50, 
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'none',
    },
    headerTitleText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    listHeaderContentContainer: { 
      paddingTop: 16, 
    },
    flatListContent: {
      paddingBottom: insets.bottom + 75,
      paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
    },
    backButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: touchableMinHeight,
      paddingVertical: 0, 
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8, 
    },
    backButtonIconIos: {
      marginRight: Platform.OS === 'ios' ? 4 : 0, 
    },
    backButtonText: {
      fontSize: 17,
      color: colors.accent,
    },
    titleOptionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 12, 
      marginTop: 12,
      paddingVertical: 4, 
    },
    titleSubtitleContainer: {
      flexShrink: 1, 
      marginRight: 16, 
    },
    titleText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitleText: {
      fontSize: 15,
      color: colors.text,
      opacity: 0.7,
      marginTop: 2,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    switchStyle: {
      transform: Platform.OS === 'ios' ? [] : [],
    },
    optionsButton: {
      padding: 0, 
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    queueTitleSection: { 
      marginTop: 12, 
      overflow: 'visible', 
    },
    centeredFeedback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    feedbackText: { fontSize: 18, color: colors.text, textAlign: 'center' },
  }); 

  if (!loop) {
    return (
      <View style={styles.centeredFeedback}>
        <Text style={styles.feedbackText}>Loop not found.</Text>
      </View>
    );
  }

  const handleToggleIsActive = (newIsActiveValue: boolean) => {
    setIsActive(newIsActiveValue); // Update local state immediately
    if (loop?.id) { // Ensure loop and loop.id are defined
      dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId: loop.id, isActive: newIsActiveValue } });
      console.log('Loop active state toggled to:', newIsActiveValue, 'for loop:', loop.id);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.fixedHeaderContainer}>
          <View style={styles.backButtonContainer}> 
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={colors.accent} style={styles.backButtonIconIos} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Loop Details</Text>
          </View>
        </View>
        <View style={styles.pageContentWrapper}>
          <LinearGradient
            colors={[gradientStartColor + '13', gradientEndColor + '14']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.34, y: 0.5}}
            style={StyleSheet.absoluteFillObject}
          />
          <DraggableFlatList
            data={posts} // Use posts state here
            keyExtractor={(item) => item.id}
            renderItem={renderQueueItem}
            onDragBegin={() => setScrollEnabled(false)}
            onDragEnd={({ data }) => {
              requestAnimationFrame(() => { // Delay state updates
                setPosts(data); 
                if (loopId) { 
                  dispatch({ type: 'UPDATE_LOOP_POSTS', payload: { loopId, newPosts: data } });
                }
              });
              setScrollEnabled(true);
            }}
            scrollEnabled={scrollEnabled}
            removeClippedSubviews={false}
            contentContainerStyle={styles.flatListContent} 
            ListHeaderComponent={
              <View style={styles.listHeaderContentContainer}> 
                <View style={styles.titleOptionsRow}>
                  <View style={styles.titleSubtitleContainer}>
                    <Text style={styles.titleText}>{loop.title}</Text> 
                    <Text style={styles.subtitleText}>Posts {loop.schedule}</Text>
                  </View>
                  <View style={styles.actionsContainer}>
                    <Switch
                      value={isActive} 
                      onValueChange={handleToggleIsActive} 
                      trackColor={{ true: loop?.color ? loop.color : '#34C759AA', false: '#E9E9EA' }}
                      thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                      ios_backgroundColor="#E9E9EA"
                      style={styles.switchStyle} 
                    />
                    <TouchableOpacity 
                      onPress={() => setIsEditMenuVisible(true)} 
                      style={styles.optionsButton}
                    >
                      <Ionicons name="ellipsis-vertical" size={24} color={colors.tabInactive} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.queueTitleSection}>
                  <Text style={styles.sectionTitle}>
                    Queue ({posts.length})
                  </Text>
                </View>
              </View>
            }
          />
          {loop && (
            <LoopEditMenu
              isVisible={isEditMenuVisible}
              onClose={() => setIsEditMenuVisible(false)}
              loop={loop} 
              onSave={(updatedData) => { 
                if (loop) { 
                  dispatch({
                    type: 'UPDATE_LOOP',
                    payload: {
                      ...updatedData, // Spread updatedData first
                      id: loop.id,     // Ensure loop.id takes precedence
                    },
                  });
                  console.log('✅ Dispatched UPDATE_LOOP with:', updatedData);
                }
              }}
              typography={typography} 
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
} 