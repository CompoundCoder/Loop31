import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, Switch, StyleSheet, Text, ScrollView, Platform, Animated as RNAnimated, Alert, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { SCREEN_LAYOUT } from '@/constants/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useLoops, type Loop as ContextLoop } from '@/context/LoopsContext';
import { useFadeIn } from '@/hooks/useFadeIn';
//import { useEditLoopPopup } from '@/hooks/useEditLoopPopup';
import EditLoopPopup from '@/components/loops/EditLoopPopup';
import PostCardS from '@/components/loops/PostCardS';
import HeaderActionButton from '@/components/HeaderActionButton';
// TODO: Refactor to use the new PostMenus component after full testing
import PostMenus, { type PostFormData } from '@/components/posts/PostMenus';
import { Modalize } from 'react-native-modalize';
import { MOCK_POSTS, type Post } from '@/data/mockPosts';
import { getLoopPostCount } from '@/utils/loopHelpers';
import { getFrequencyLabel } from '@/constants/loopFrequencies';
import * as Haptics from 'expo-haptics';
import { appIcons } from '@/presets/icons';
import * as typographyPresets from '@/presets/typography';
import { CircleButton } from '@/components/common/CircleButton';
import { getButtonPresets } from '@/presets/buttons';
import { addPostToRecentlyDeleted } from '@/data/recentlyDeleted';
import { ImageSourcePropType } from 'react-native';
import { BottomSheetMenu, MenuItem } from '@/components/ui/BottomSheetMenu';
import { v4 as uuidv4 } from 'uuid';
import { duplicateLoopAndLinkPosts } from '@/logic/loopManager';

export interface PostDisplayData {
  id: string;
  caption: string;
  imageSource: ImageSourcePropType;
}

const touchableMinHeight = 44;

export const options = {
    headerShown: false,
    tabBarStyle: { display: 'none' },
};

export default function LoopDetailsScreen() {
  const { colors, typography, spacing: themeSpacing, borderRadius } = useThemeStyles();
  const theme = useThemeStyles();
  const buttonPresets = getButtonPresets(theme);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const { loopId } = useLocalSearchParams<{ loopId: string }>();
  const { state, dispatch } = useLoops();
  const { opacityStyle: upNextOpacityStyle } = useFadeIn();

  const [isPostFormVisible, setIsPostFormVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostDisplayData | null>(null);
  const loop: ContextLoop | undefined = state.loops.find(l => l.id === loopId);

  // Force re-render when MOCK_POSTS is mutated
  const [postDataVersion, setPostDataVersion] = useState(0);

  const [isEditLoopPopupVisible, setIsEditLoopPopupVisible] = useState(false);
  const [loopToEdit, setLoopToEdit] = useState<ContextLoop | null>(null);

  const postOptionsModalRef = useRef<Modalize>(null);
  const loopActionsModalRef = useRef<Modalize>(null);
  const postActionsMenuRef = useRef<Modalize>(null);

  const handleDuplicateLoop = () => {
    if (!loop) return;
    const newLoop = duplicateLoopAndLinkPosts(loop, MOCK_POSTS);
    dispatch({ type: 'ADD_LOOP', payload: newLoop });
    loopActionsModalRef.current?.close();
  };

  // Get active posts for this specific loop
  const activePosts: PostDisplayData[] = useMemo(() => {
    if (!loopId) return [];
    const filteredPosts = MOCK_POSTS.filter(
      p => p.loopFolders?.includes(loopId) && !p.deletedAt
    );
    return filteredPosts.map(p => ({
      id: p.id,
      caption: p.caption,
      imageSource: { uri: p.imageUrl },
    }));
  }, [loopId, postDataVersion]);

  // Get deleted posts for this specific loop
  const deletedPosts: Post[] = useMemo(() => {
    if (!loopId) return [];
    return MOCK_POSTS.filter(
      p => p.deletedAt && p.deletedFromLoopId === loopId
    );
  }, [loopId, postDataVersion]);

  const [posts, setPosts] = useState(activePosts);
  
  useEffect(() => {
    setPosts(activePosts);
  }, [activePosts]);

  const [isActive, setIsActive] = useState(loop?.isActive ?? false);
  //const { isEditPopupVisible, loopToEdit, openEditPopup, closeEditPopup } = useEditLoopPopup();

  const handleCreatePost = () => {
    setSelectedPost(null);
    setIsPostFormVisible(true);
  };

  const handlePostLongPress = (post: PostDisplayData) => {
    setSelectedPost(post);
    postActionsMenuRef.current?.open();
  };

  const handleEditPost = (postToEdit: PostDisplayData) => {
    const postInStore = MOCK_POSTS.find(p => p.id === postToEdit.id);
    
    // If the post isn't found or has no loop folders, edit normally.
    if (!postInStore || !postInStore.loopFolders) {
        setSelectedPost(postToEdit);
        setIsPostFormVisible(true);
        postActionsMenuRef.current?.close();
        return;
    }

    // Fork-on-edit logic: fork if the post is linked to more than one loop.
    if (postInStore.loopFolders.length > 1) {
      // 1. Create a forked copy
      const forkedPost: Post = {
        ...postInStore,
        id: uuidv4(),
        forkedFromId: postInStore.id,
        loopFolders: [loopId], // Belongs only to this new loop
      };

      // 2. Update original post's loop folders to remove the current loop
      postInStore.loopFolders = postInStore.loopFolders.filter(
        folderId => folderId !== loopId
      );

      // 3. Add forked post to the main data source
      MOCK_POSTS.unshift(forkedPost);

      // 4. Update local state to display the new forked post instead of the old one
      const forkedPostForDisplay: PostDisplayData = {
        id: forkedPost.id,
        caption: forkedPost.caption,
        imageSource: { uri: forkedPost.imageUrl },
      };
      
      setPosts(currentPosts => 
        currentPosts.map(p => p.id === postInStore.id ? forkedPostForDisplay : p)
      );
      
      // 5. Set the *newly forked post* as selected and open the editor
      setSelectedPost(forkedPostForDisplay);
      setIsPostFormVisible(true);
      postActionsMenuRef.current?.close();

    } else {
      // Default behavior: just open the editor for the selected post
      setSelectedPost(postToEdit);
      setIsPostFormVisible(true);
      postActionsMenuRef.current?.close();
    }
  };

  const handleSavePost = (data: PostFormData) => {
    if (selectedPost) { // Editing existing post
      const postToUpdate = MOCK_POSTS.find(p => p.id === selectedPost.id);
      if (postToUpdate) {
        postToUpdate.caption = data.caption;
        if (data.imageSource && typeof data.imageSource === 'object' && 'uri' in data.imageSource && data.imageSource.uri) {
          postToUpdate.imageUrl = data.imageSource.uri;
        }
      }
    } else { // Creating new post
      const newPostForDisplay: PostDisplayData = {
        id: `post-${Date.now()}-${Math.random()}`,
        caption: data.caption,
        imageSource: data.imageSource!,
      };

      // Also update the mock data source if needed
      const newPostForMock: Post = {
        id: newPostForDisplay.id,
        caption: newPostForDisplay.caption,
        imageUrl: (newPostForDisplay.imageSource as any)?.uri || '',
        platforms: ['twitter'],
        loopFolders: [loopId].filter(Boolean) as string[],
      };
      MOCK_POSTS.unshift(newPostForMock);

      setPosts(currentPosts => [newPostForDisplay, ...currentPosts]);
    }
    setIsPostFormVisible(false);
    setSelectedPost(null);
    setPostDataVersion(v => v + 1); // Force refresh
  };

  useEffect(() => {
    if (loop) {
      setIsActive(loop.isActive);
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
      paddingLeft: SCREEN_LAYOUT.content.horizontalPadding,
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
      justifyContent: 'center',
      width: 36,
      height: 36,
      borderRadius: 18,
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
    subtitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      opacity: 0.7,
    },
    subtitleIcon: {
      marginRight: 6,
    },
    subtitleSeparator: {
      marginHorizontal: 8,
      fontSize: 16,
      color: colors.text,
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
    deletedSection: {
      marginTop: 40,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: 24,
    },
    deletedItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    deletedItemText: {
      color: colors.text,
      flex: 1,
      marginRight: 16,
    },
    deletedItemActions: {
      flexDirection: 'row',
    },
    deletedButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: borderRadius.sm,
    },
    deletedButtonText: {
      fontWeight: '600',
    }
  }); 

  const handleToggleIsActive = (newIsActiveValue: boolean) => {
    setIsActive(newIsActiveValue);
    if (loop?.id) {
      dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId: loop.id, isActive: newIsActiveValue } });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const renderUpNext = () => {
    if (posts.length === 0) return null;

    return (
      <View style={{ marginBottom: themeSpacing.sm }}>
        <Text style={typographyPresets.sectionTitle}>Up Next</Text>
        <RNAnimated.View style={[{ paddingVertical: themeSpacing.sm }, upNextOpacityStyle]}>
          <PostCardS 
            post={posts[0]} 
            variant="featured" 
            onLongPress={() => handlePostLongPress(posts[0])}
          />
        </RNAnimated.View>
      </View>
    );
  };

  const handlePostOptions = (post: PostDisplayData) => {
    setSelectedPost(post);
    postOptionsModalRef.current?.open();
  };

  const renderPostQueue = () => {
    const queuedPosts = posts.slice(1);
    if (queuedPosts.length === 0) return null;

    return (
      <View>
        <Text style={typographyPresets.sectionTitle}>Queue</Text>
        {queuedPosts.map(post => (
          <PostCardS
            key={post.id}
            post={post}
            variant="featured"
            onLongPress={() => handlePostLongPress(post)}
          />
        ))}
      </View>
    );
  };

  const onUpdatePosts = (newPosts: Post[]) => {
    const newDisplayPosts: PostDisplayData[] = newPosts.map(p => ({
      id: p.id,
      caption: p.caption,
      imageSource: { uri: p.imageUrl },
    }));
    // Assuming you have a reducer action to update posts for a loop
    // dispatch({ type: 'UPDATE_LOOP_POSTS', payload: { loopId: loop.id, newPosts: newDisplayPosts } });
    setPosts(newDisplayPosts);
  };

  const handleDeleteLoop = () => {
    if (!loop) return;
    Alert.alert(
      'Delete Loop',
      `Are you sure you want to delete the "${loop.title}" loop? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => loopActionsModalRef.current?.close() },
        { text: 'Delete', style: 'destructive', onPress: () => {
          dispatch({ type: 'DELETE', payload: loop.id });
          navigation.goBack();
        }}
      ]
    );
  };

  const handleMoveToUpNext = () => {
    if (!selectedPost) return;

    const postIndex = posts.findIndex(p => p.id === selectedPost.id);
    if (postIndex > 0) { // Only move if it's not already at the top
        const newPosts = [...posts];
        const [movedPost] = newPosts.splice(postIndex, 1);
        newPosts.unshift(movedPost);
        setPosts(newPosts);
    }

    postActionsMenuRef.current?.close();
  };

  const handleDeletePost = () => {
    if (!selectedPost) return;

    const postInStore = MOCK_POSTS.find(p => p.id === selectedPost.id);

    if (!postInStore) {
      // Post not found in the main store, cannot proceed.
      console.error("Attempted to delete a post that doesn't exist in the main store.");
      postActionsMenuRef.current?.close();
      return;
    }

    if (postInStore.loopFolders && postInStore.loopFolders.length > 1) {
      // The post is in multiple loops, so just unlink it from this one.
      postInStore.loopFolders = postInStore.loopFolders.filter(id => id !== loopId);
    } else {
      // This is the last loop it's in, so soft-delete it.
      postInStore.deletedAt = new Date().toISOString();
      postInStore.deletedFromLoopId = loopId;
      postInStore.loopFolders = [];
    }

    setPostDataVersion(v => v + 1); // Trigger re-render of active/deleted lists
    postActionsMenuRef.current?.close();
  };

  const handleRestorePost = (postId: string) => {
    const postIndex = MOCK_POSTS.findIndex(p => p.id === postId);
    if (postIndex > -1) {
      const post = MOCK_POSTS[postIndex];
      if (post.deletedFromLoopId) {
        post.loopFolders = [...(post.loopFolders || []), post.deletedFromLoopId];
      }
      post.deletedAt = null;
      post.deletedFromLoopId = null;
      setPostDataVersion(v => v + 1);
    }
  };

  const handlePermanentDeletePost = (postId: string) => {
    const postIndex = MOCK_POSTS.findIndex(p => p.id === postId);
    if (postIndex > -1) {
      MOCK_POSTS.splice(postIndex, 1);
      setPostDataVersion(v => v + 1);
    }
  };

  if (!loop) {
    return (
      <View style={styles.centeredFeedback}>
        <Text style={styles.feedbackText}>Loop not found.</Text>
      </View>
    );
  }

  const postCount = getLoopPostCount(loop.id, MOCK_POSTS);

  const loopMenuSections: MenuItem[][] = [
    [
      {
        label: 'Edit Loop',
        icon: <MaterialCommunityIcons name={appIcons.actions.edit.name as any} size={24} color={colors.text} />,
        onPress: () => {
          loopActionsModalRef.current?.close();
          setLoopToEdit(loop);
          setIsEditLoopPopupVisible(true);
        },
      },
      {
        label: 'Duplicate Loop',
        icon: <MaterialCommunityIcons name={appIcons.actions.duplicate.name as any} size={24} color={colors.text} />,
        onPress: handleDuplicateLoop,
      },
    ],
    [
      {
        label: 'Delete Loop',
        icon: <MaterialCommunityIcons name={appIcons.actions.delete.name as any} size={24} color={colors.error} />,
        onPress: handleDeleteLoop,
        destructive: true,
      },
    ],
  ];

  const postMenuItems: MenuItem[][] = selectedPost
  ? [
      [
        {
          label: 'Move to Up Next',
          icon: <MaterialCommunityIcons name={appIcons.actions.moveToUpNext.name as any} size={24} color={posts.findIndex(p => p.id === selectedPost.id) === 0 ? colors.tabInactive : colors.text} />,
          onPress: handleMoveToUpNext,
          disabled: posts.findIndex(p => p.id === selectedPost.id) === 0,
        },
        {
          label: 'Edit Post',
          icon: <MaterialCommunityIcons name={appIcons.actions.edit.name as any} size={24} color={colors.text} />,
          onPress: () => {
            console.log('Edit', selectedPost.id);
            postActionsMenuRef.current?.close();
            handleEditPost(selectedPost);
          },
        },
        {
          label: 'Duplicate Post',
          icon: <MaterialCommunityIcons name={appIcons.actions.duplicate.name as any} size={24} color={colors.text} />,
          onPress: () => {
            console.log('Duplicate', selectedPost.id);
            const originalPost = MOCK_POSTS.find(p => p.id === selectedPost.id);
            if (originalPost) {
              const newPost: Post = {
                ...originalPost,
                id: uuidv4(),
              };
              MOCK_POSTS.unshift(newPost); // Add to mock data source

              const newPostForDisplay: PostDisplayData = {
                id: newPost.id,
                caption: newPost.caption,
                imageSource: { uri: newPost.imageUrl },
              };

              const originalPostIndex = posts.findIndex(p => p.id === selectedPost.id);
              const newPosts = [...posts];
              newPosts.splice(originalPostIndex + 1, 0, newPostForDisplay);
              setPosts(newPosts);
            }
            postActionsMenuRef.current?.close();
          },
        },
      ],
      [
        {
          label: 'Delete Post',
          icon: <MaterialCommunityIcons name={appIcons.actions.delete.name as any} size={24} color={colors.error} />,
          onPress: () => {
            console.log('Delete', selectedPost.id);

            postActionsMenuRef.current?.close();
            Alert.alert(
              'Delete Post',
              'Are you sure you want to delete this post?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: handleDeletePost,
                },
              ]
            );
          },
          destructive: true,
        },
      ],
    ]
  : [];

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.fixedHeaderContainer}>
          <View style={styles.backButtonContainer}> 
            <CircleButton 
              preset={buttonPresets.back}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
            />
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={typographyPresets.pageHeaderTitle}>Loop Details</Text>
          </View>
          <View style={styles.headerRightContainer}>
            <CircleButton
              preset={buttonPresets.add}
              onPress={handleCreatePost}
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
                  <Text style={typographyPresets.screenTitle} numberOfLines={1}>{loop?.title ?? 'Loop'}</Text>
                  
                  <View style={styles.subtitleContainer}>
                    <MaterialCommunityIcons name={appIcons.content.post.name as any} size={14} color={colors.text} style={styles.subtitleIcon} />
                    <Text style={typographyPresets.metadataText}>{postCount} Posts</Text>
                    <Text style={typographyPresets.metadataText}>•</Text>
                    <Ionicons name={appIcons.status.schedule.name as any} size={14} color={colors.text} style={styles.subtitleIcon} />
                    <Text style={typographyPresets.metadataText}>{getFrequencyLabel(loop?.frequency)}</Text>
                  </View>
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
                    onPress={() => loopActionsModalRef.current?.open()}
                    style={styles.optionsButton}
                  >
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.tabInactive} />
                  </TouchableOpacity>
                </View>
              </View>
              {renderUpNext()}
            </View>
            {renderPostQueue()}

            {deletedPosts.length > 0 && (
              <View style={styles.deletedSection}>
                <Text style={typographyPresets.sectionTitle}>Recently Deleted</Text>
                {deletedPosts.map(post => (
                  <View key={post.id} style={styles.deletedItem}>
                    <Text style={styles.deletedItemText} numberOfLines={1}>{post.caption}</Text>
                    <View style={styles.deletedItemActions}>
                      <Pressable onPress={() => handleRestorePost(post.id)} style={[styles.deletedButton, { backgroundColor: colors.accent + '20' }]}>
                        <Text style={[styles.deletedButtonText, { color: colors.accent }]}>Restore</Text>
                      </Pressable>
                      <Pressable onPress={() => handlePermanentDeletePost(post.id)} style={[styles.deletedButton, { backgroundColor: colors.error + '20', marginLeft: 8 }]}>
                        <Text style={[styles.deletedButtonText, { color: colors.error }]}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
      <EditLoopPopup
        visible={isEditLoopPopupVisible}
        onClose={() => setIsEditLoopPopupVisible(false)}
        onSaveSuccess={() => setIsEditLoopPopupVisible(false)}
        loop={loopToEdit}
      />
      <PostMenus
        isVisible={isPostFormVisible}
        onClose={() => setIsPostFormVisible(false)}
        onSave={handleSavePost}
        post={selectedPost}
      />
      <Modalize
        ref={postOptionsModalRef}
        adjustToContentHeight
        modalStyle={{ backgroundColor: colors.card }}
        handleStyle={{ backgroundColor: colors.border }}
        handlePosition="inside"
        HeaderComponent={
          selectedPost && (
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
              <Text style={[styles.modalTitle, { color: colors.text }]}>Post Options</Text>
            </View>
          )
        }
      >
        {selectedPost && (
          <View style={{ padding: spacing.lg }}>
            <Pressable
              style={({ pressed }) => [
                styles.modalOption,
                { backgroundColor: pressed ? colors.border + '33' : 'transparent' }
              ]}
              onPress={() => {
                // Move to top handler
                const idx = posts.findIndex(p => p.id === selectedPost.id);
                if (idx > 0) { // Allow moving if not already the Up Next post
                  const updatedPosts = [...posts];
                  const [moved] = updatedPosts.splice(idx, 1);
                  // Insert at index 0 to make it the Up Next post
                  updatedPosts.unshift(moved);
                  setPosts(updatedPosts); // Use local state update
                }
                setSelectedPost(null);
                postOptionsModalRef.current?.close();
              }}
              disabled={posts.findIndex(p => p.id === selectedPost.id) === 0}
            >
              <Ionicons 
                name={appIcons.actions.moveToUpNext.name as any} 
                size={24} 
                color={posts.findIndex(p => p.id === selectedPost.id) === 0 ? colors.tabInactive : colors.text} 
                style={{ marginRight: spacing.md }} 
              />
              <Text 
                style={{ 
                  color: posts.findIndex(p => p.id === selectedPost.id) === 0 ? colors.tabInactive : colors.text, 
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
              onPress={() => handleEditPost(selectedPost)}
            >
              <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.text} style={{ marginRight: spacing.md }} />
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>Edit Post</Text>
            </Pressable>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <Pressable
              style={({ pressed }) => [
                styles.modalOption,
                { backgroundColor: pressed ? colors.border + '33' : 'transparent' }
              ]}
              onPress={() => {
                handleDeletePost();
                postOptionsModalRef.current?.close();
              }}
            >
              <MaterialCommunityIcons name="delete-outline" size={24} color={colors.error} style={{ marginRight: spacing.md }}/>
              <Text style={{ fontSize: 16, color: colors.error }}>Delete Post</Text>
            </Pressable>
          </View>
        )}
      </Modalize>
      <BottomSheetMenu
        modalRef={loopActionsModalRef}
        menuTitle="Options"
        sections={loopMenuSections}
      />
      <BottomSheetMenu
        modalRef={postActionsMenuRef}
        menuTitle="Options"
        sections={postMenuItems}
      />
    </>
  );
}
