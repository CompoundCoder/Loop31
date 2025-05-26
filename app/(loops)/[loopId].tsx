import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Switch, StyleSheet, Text, ScrollView, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TestPostCardMini from '../../components/test-PostCardMini';
import { spacing } from '../../theme/theme';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SCREEN_LAYOUT } from '@/constants/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useLoops, type Loop as ContextLoop, type PostDisplayData } from '@/context/LoopsContext';
import LoopEditMenu from '@/components/loops/LoopEditMenu';
import PostCardS from '@/components/loops/PostCardS';
import { useFadeIn } from '@/hooks/useFadeIn';

const touchableMinHeight = 44;

export const options = {
    headerShown: false,
    tabBarStyle: { display: 'none' },
};

export default function LoopDetailsScreen() {
  const { colors, typography, spacing: themeSpacing } = useThemeStyles();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { loopId } = useLocalSearchParams<{ loopId: string }>();
  const { state, dispatch } = useLoops();
  const { opacityStyle: upNextOpacityStyle } = useFadeIn();

  const loop: ContextLoop | undefined = state.loops.find(l => l.id === loopId);

  const [isActive, setIsActive] = useState(loop?.isActive ?? false);
  const [posts, setPosts] = useState<PostDisplayData[]>(loop?.posts ?? []);
  const [isEditMenuVisible, setIsEditMenuVisible] = useState(false);

  useEffect(() => {
    if (loop) {
      setIsActive(loop.isActive);
      setPosts(loop.posts);
    } else {
      setPosts([]);
    }
  }, [loop, loopId]);

  const gradientStartColor = loop?.color ?? colors.accent; 
  const gradientEndColor = colors.background;

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
    flatListContent: {
      paddingBottom: insets.bottom + 75,
      paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
    },
    listHeaderContentContainer: { 
      paddingTop: 16, 
      //backgroundColor: 'rgba(255, 0, 0, 0.3)',
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
      marginBottom: 33, 
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
      marginBottom: themeSpacing.md,
      //backgroundColor: 'blue',
    },
    queueTitleSection: { 
      marginTop: 16, 
      overflow: 'visible', 
      //backgroundColor: 'red',
    },
    centeredFeedback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    feedbackText: { fontSize: 18, color: colors.text, textAlign: 'center' },
  }); 

  const handleToggleIsActive = (newIsActiveValue: boolean) => {
    setIsActive(newIsActiveValue);
    if (loop?.id) {
      dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId: loop.id, isActive: newIsActiveValue } });
    }
  };

  const renderUpNext = () => {
    if (posts.length === 0) {
      return null;
    }
    return (
      <View style={{ marginBottom: themeSpacing.sm }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: themeSpacing.sm }}>
          Up Next
        </Text>
        <Animated.View style={[{ paddingVertical: themeSpacing.sm }, upNextOpacityStyle]}>
          <PostCardS post={posts[0]} variant="featured" />
        </Animated.View>
      </View>
    );
  };

  if (!loop) {
    return (
      <View style={styles.centeredFeedback}>
        <Text style={styles.feedbackText}>Loop not found.</Text>
      </View>
    );
  }

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
          <ScrollView contentContainerStyle={styles.flatListContent}>
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
              {renderUpNext()}
              <View style={styles.queueTitleSection}>
                <Text style={styles.sectionTitle}>
                  Queue ({posts.length})
                </Text>
              </View>
            </View>
            {posts.map((item) => (
              <TestPostCardMini
                key={item.id}
                image={item.imageSource}
                caption={item.caption}
                onPress={() => console.log(`Pressed ${item.id}`)}
              />
            ))}
          </ScrollView>
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
                      ...updatedData,
                      id: loop.id,
                    },
                  });
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
