import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Switch, StyleSheet, Text, ScrollView, Platform, Animated as RNAnimated, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TestPostCardMini from '../../components/test-PostCardMini';
import { spacing } from '../../theme/theme';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SCREEN_LAYOUT } from '@/constants/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useLoops, type Loop as ContextLoop, type PostDisplayData } from '@/context/LoopsContext';
import { useFadeIn } from '@/hooks/useFadeIn';
import { useEditLoopPopup } from '@/hooks/useEditLoopPopup';
import EditLoopPopup from '@/components/loops/EditLoopPopup';
import PostCardS from '@/components/loops/PostCardS';
import HeaderActionButton from '@/components/HeaderActionButton';
import CreatePostPopup from '@/components/posts/CreatePostPopup';
import EditPostPopup from '@/components/posts/EditPostPopup';
import { Modalize } from 'react-native-modalize';

const touchableMinHeight = 44;

export const options = {
    headerShown: false,
    tabBarStyle: { display: 'none' },
};

export default function LoopDetailsScreen() {
  const { colors, typography, spacing: themeSpacing } = useThemeStyles();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { loopId } = useLocalSearchParams<{ loopId: string }>();
  const { state, dispatch } = useLoops();
  const { opacityStyle: upNextOpacityStyle } = useFadeIn();

  const [isPostPopupVisible, setIsPostPopupVisible] = useState(false);
  const [isEditPostVisible, setIsEditPostVisible] = useState(false);
  const [selectedPostToEdit, setSelectedPostToEdit] = useState<PostDisplayData | null>(null);
  const loop: ContextLoop | undefined = state.loops.find(l => l.id === loopId);

  const postOptionsModalRef = useRef<Modalize>(null);

  const [isActive, setIsActive] = useState(loop?.isActive ?? false);
  const [posts, setPosts] = useState<PostDisplayData[]>(loop?.posts ?? []);
  const { isEditPopupVisible, loopToEdit, openEditPopup, closeEditPopup } = useEditLoopPopup();

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
    headerRightContainer: {
      position: 'absolute',
      right: SCREEN_LAYOUT.content.horizontalPadding,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
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
    modalHeader: {
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 22,
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      minHeight: 44,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      width: '100%',
    },
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
        <RNAnimated.View style={[{ paddingVertical: themeSpacing.sm }, upNextOpacityStyle]}>
          <PostCardS 
            post={posts[0]} 
            variant="featured" 
            onLongPress={() => handlePostOptions(posts[0])}
          />
        </RNAnimated.View>
      </View>
    );
  };

  const handleEditPost = (post: PostDisplayData) => {
    setSelectedPostToEdit(post);
    setIsEditPostVisible(true);
    postOptionsModalRef.current?.close();
  };

  const handleCloseEditPost = () => {
    setIsEditPostVisible(false);
    setSelectedPostToEdit(null);
  };

  const handlePostOptions = (post: PostDisplayData) => {
    setSelectedPostToEdit(post);
    postOptionsModalRef.current?.open();
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
          <View style={styles.headerRightContainer}>
            <HeaderActionButton 
              iconName="add"
              onPress={() => setIsPostPopupVisible(true)}
              accessibilityLabel="Create Post"
            />
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
                    onPress={() => openEditPopup(loop)} 
                    style={styles.optionsButton}
                  >
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.tabInactive} />
                  </TouchableOpacity>
                </View>
              </View>
              {renderUpNext()}
              <View style={styles.queueTitleSection}>
                <Text style={styles.sectionTitle}>
                  Queue ({Math.max(0, posts.length - 1)})
                </Text>
              </View>
            </View>
            {posts.slice(1).map((item) => (
              <TestPostCardMini
                key={item.id}
                image={item.imageSource}
                caption={item.caption}
                onPress={() => console.log(`Pressed ${item.id}`)}
                onLongPress={() => handlePostOptions(item)}
              />
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
      <EditLoopPopup
        visible={isEditPopupVisible}
        onClose={closeEditPopup}
        onSaveSuccess={closeEditPopup}
        loop={loopToEdit}
      />
      <CreatePostPopup
        isVisible={isPostPopupVisible}
        onClose={() => setIsPostPopupVisible(false)}
        loopId={loop.id}
      />
      {selectedPostToEdit && (
        <EditPostPopup
          isVisible={isEditPostVisible}
          post={selectedPostToEdit}
          loopId={loop.id}
          onClose={handleCloseEditPost}
        />
      )}
      <Modalize
        ref={postOptionsModalRef}
        adjustToContentHeight
        modalStyle={{ backgroundColor: colors.card }}
        handleStyle={{ backgroundColor: colors.border }}
        handlePosition="inside"
        HeaderComponent={
          selectedPostToEdit && (
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
              <Text style={[styles.modalTitle, { color: colors.text }]}>Post Options</Text>
            </View>
          )
        }
      >
        {selectedPostToEdit && (
          <View style={{ paddingVertical: spacing.sm, paddingBottom: spacing.sm }}>
            <Pressable
              style={({ pressed }) => [
                styles.modalOption,
                { backgroundColor: pressed ? colors.border + '33' : 'transparent' }
              ]}
              onPress={() => {
                // Move to top handler
                const idx = posts.findIndex(p => p.id === selectedPostToEdit.id);
                if (idx > 0) { // Allow moving if not already the Up Next post
                  const updatedPosts = [...posts];
                  const [moved] = updatedPosts.splice(idx, 1);
                  // Insert at index 0 to make it the Up Next post
                  updatedPosts.unshift(moved);
                  dispatch({ type: 'UPDATE_LOOP_POSTS', payload: { loopId: loop.id, newPosts: updatedPosts } });
                }
                setSelectedPostToEdit(null);
                postOptionsModalRef.current?.close();
              }}
              disabled={posts.findIndex(p => p.id === selectedPostToEdit.id) === 0}
            >
              <Ionicons 
                name="arrow-up-circle-outline" 
                size={24} 
                color={posts.findIndex(p => p.id === selectedPostToEdit.id) === 0 ? colors.tabInactive : colors.text} 
                style={{ marginRight: spacing.lg }} 
              />
              <Text 
                style={{ 
                  color: posts.findIndex(p => p.id === selectedPostToEdit.id) === 0 ? colors.tabInactive : colors.text, 
                  fontSize: 16, 
                  fontWeight: '500' 
                }}
              >
                Move To Up Next
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modalOption,
                { backgroundColor: pressed ? colors.border + '33' : 'transparent' }
              ]}
              onPress={() => handleEditPost(selectedPostToEdit)}
            >
              <Ionicons name="create-outline" size={24} color={colors.text} style={{ marginRight: spacing.lg }} />
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>Edit Post</Text>
            </Pressable>
            <View style={[styles.separator, { backgroundColor: colors.border, marginVertical: 8 }]} />
            <Pressable
              style={({ pressed }) => [
                styles.modalOption,
                { backgroundColor: pressed ? colors.border + '33' : 'transparent' }
              ]}
              onPress={() => {
                // Delete handler
                Alert.alert(
                  'Delete Post',
                  'Are you sure you want to delete this post?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => {
                      // Remove post from queue
                      const updatedPosts = posts.filter(p => p.id !== selectedPostToEdit.id);
                      dispatch({ type: 'UPDATE_LOOP_POSTS', payload: { loopId: loop.id, newPosts: updatedPosts } });
                      setSelectedPostToEdit(null);
                      postOptionsModalRef.current?.close();
                    }}
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" style={{ marginRight: spacing.lg }} />
              <Text style={{ color: '#FF3B30', fontSize: 16, fontWeight: '500' }}>Delete</Text>
            </Pressable>
          </View>
        )}
      </Modalize>
    </>
  );
}
