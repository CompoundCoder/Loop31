import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions, TouchableOpacity, Switch, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useLoops, type Loop } from '@/context/LoopsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import FeaturedPostCard from '@/components/loops/FeaturedPostCard';
import MiniPostCard from '@/components/loops/MiniPostCard';
import LoopEditMenu from '@/components/loops/LoopEditMenu';
import { SCREEN_LAYOUT, LAYOUT } from '@/constants/layout';
import PostCardS from '@/components/loops/PostCardS';
import { PostEditMenu as NewPostEditMenu } from '../../components/posts/PostEditMenu';

// Import mock data source
// import { MOCK_POST_DATA } from '@/data/mockPosts';

// Define and EXPORT placeholder Post type - using previewImageUrl
export interface Post {
  id: string;
  previewImageUrl?: string; // Changed from imageUrl
  caption: string;
  postCount?: number; 
}

// Extend Loop type - using Post interface with previewImageUrl
interface LoopWithPosts extends Loop {
  posts?: Post[];
}

const { width: screenWidth } = Dimensions.get('window');

// Helper function to format schedule text
const formatScheduleText = (schedule?: string): string => {
  if (!schedule) {
    return 'Not scheduled';
  }

  const scheduleLowerCase = schedule.toLowerCase();

  if (scheduleLowerCase === 'auto') {
    return 'Posts automatically';
  }
  if (scheduleLowerCase === 'weekly') {
    return 'Posts 1x per week';
  }
  if (scheduleLowerCase === 'bi-weekly' || scheduleLowerCase === 'biweekly') {
    return 'Posts bi-weekly (every 2 weeks)';
  }
  if (scheduleLowerCase === 'monthly') {
    return 'Posts monthly';
  }

  // Handle day-specific schedules like "Every Tuesday" or "Mon, Wed, Fri"
  const days = schedule.match(/(mon|tue|wed|thu|fri|sat|sun)/gi);
  if (days && days.length > 0) {
    const dayCount = days.length;
    const dayString = days.join(', ');
    if (scheduleLowerCase.includes('every') && dayCount === 1) {
      return `Posts every ${dayString} (1x per week)`;
    }
    return `Posts ${dayString} (${dayCount}x per week)`;
  }
  
  // Fallback for unhandled formats
  return `Posts: ${schedule}`; 
};

// Re-add inline MOCK_POST_DATA definition
const MOCK_POST_DATA: Post[] = [
  { id: 'p1', previewImageUrl: 'https://picsum.photos/seed/tech/400/300', caption: 'Tech Insights: A very deep dive into the latest technological advancements and how they are reshaping our daily lives across various sectors globally.', postCount: 12 },
  { id: 'p2', previewImageUrl: 'https://picsum.photos/seed/science/400/300', caption: 'Science Wonders: Exploring the most fascinating discoveries in the world of science this week, from outer space to microscopic organisms.', postCount: 5 },
  { id: 'p3', previewImageUrl: 'https://picsum.photos/seed/nature/400/300', caption: 'Nature Hike through the vast wilderness, discovering hidden trails and breathtaking landscapes. This journey was truly unforgettable and full of adventure.', postCount: 3 }, 
  { id: 'p4', previewImageUrl: 'https://picsum.photos/seed/food/400/300', caption: 'New Recipe: A delicious and easy-to-make dish for the whole family.', postCount: 22 },
  { id: 'p5', previewImageUrl: 'https://picsum.photos/seed/retro/400/300', caption: 'Retro Tech Revival: Taking a nostalgic look back at some classic gadgets and gizmos from the past decades that still hold a special place in our hearts.', postCount: 0 },
  { id: 'p6', previewImageUrl: 'https://picsum.photos/seed/space/400/300', caption: 'Outer Space (400x300)', postCount: 7 }, // Use consistent dimensions
];

// Define styles outside component, accepting themeStyles object
const createStyles = (theme: ThemeStyles) => {
  // Destructure most, but access theme.elevation directly if linter is picky
  const { colors, spacing, borderRadius } = theme; 
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      // padding is now applied dynamically in component
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loopTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    shadowWrapper: {
      ...(theme.elevation as object), // ACCESS theme.elevation directly
    },
    metadataCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      overflow: 'hidden',
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    colorIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.sm,
    },
    metadataText: {
      fontSize: 14,
      color: colors.text + '99', 
    },
    scheduleTextContainer: {
      position: 'relative',
      marginRight: spacing.sm,
      flexShrink: 1,
    },
    switch: {
      transform: Platform.OS === 'ios' ? [] : [],
      marginRight: spacing.sm, 
    },
    editButton: {
      padding: spacing.xs, 
    },
    sectionPlaceholder: {
      // Basic styling for placeholder sections
    },
    gridItemStyle: {
      width: '48%', // For 2 columns with ~1% margin on each side
      marginBottom: spacing.md, // ADD marginBottom here
    },
  });
};

export default function LoopDetailScreen() {
  const { loopId } = useLocalSearchParams<{ loopId: string }>();
  const { state, dispatch } = useLoops();
  const themeStyles = useThemeStyles();
  const { colors, spacing, borderRadius, typography } = themeStyles;
  const router = useRouter();
  
  const [isEditMenuVisible, setIsEditMenuVisible] = useState(false);
  const [isLoopEditMenuVisible, setIsLoopEditMenuVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  console.log('Current editingPost state:', editingPost);
  const [loopPosts, setLoopPosts] = useState<Post[]>(MOCK_POST_DATA);

  // State for the NEW PostEditMenu (from components/posts/)
  const [selectedPostForNewModal, setSelectedPostForNewModal] = useState<Post | null>(null);
  const [isPostEditMenuVisible, setIsPostEditMenuVisible] = useState(false);

  const styles = useMemo(() => createStyles(themeStyles), [themeStyles]);

  // Log relevant theme values for debugging shadows and typography
  // console.log('[LoopDetailScreen] Debug Theme:');
  // console.log('  colors.card:', colors.card);
  // console.log('  colors.background:', colors.background);
  // console.log('  elevation style object:', JSON.stringify(themeStyles.elevation));
  // console.log('  typography exists:', !!typography); // Check if typography is now available

  // console.log(`[LoopDetailScreen] Received loopId: ${loopId}`);

  const loopFromContext = state.loops.find((l) => l.id === loopId);
  // console.log('[LoopDetailScreen] loopFromContext:', loopFromContext ? loopFromContext.id : 'Not Found');

  if (!loopFromContext) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.text }}>Loop not found.</Text>
        <Stack.Screen options={{ title: 'Loop Not Found', headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.primary }} />
      </View>
    );
  }
  // Cast to LoopWithPosts to use the posts array - replace with actual Loop structure
  const loop = loopFromContext as LoopWithPosts; 

  // Use the loopPosts state variable for displaying posts
  const postsForDisplay = loopPosts; 
  // console.log('[LoopDetailScreen] postsForDisplay (from loopPosts state count):', postsForDisplay.length);

  const featuredPost = postsForDisplay.length > 0 ? postsForDisplay[0] : null;
  // console.log('[LoopDetailScreen] featuredPost (ID and previewImageUrl):', featuredPost ? `${featuredPost.id} - ${featuredPost.previewImageUrl}` : 'null');
  
  const gridPosts = postsForDisplay.length > 1 ? postsForDisplay.slice(1) : [];
  // console.log('[LoopDetailScreen] gridPosts count:', gridPosts.length);

  // Post Edit Handlers (New)
  const handleEditPost = (post: Post) => {
    console.log('Opening edit menu for post:', post.id);
    console.log('Post selected:', post);
    setEditingPost(post);
  };

  // Handler for the toggle switch
  const handleToggleActive = (newValue: boolean) => {
    if (!loop) return; // Guard clause
    console.log(`Toggling loop ${loop.id} active status to: ${newValue}`);
    dispatch({ type: 'TOGGLE_ACTIVE', payload: { loopId: loop.id, isActive: newValue } });
    // Optional: Add haptics or confirmation
  };

  // Handler for the edit button (placeholder)
  const handleEditPress = () => {
    if (!loop) return;
    console.log('Edit button pressed - Loop ID:', loop.id);
    setIsEditMenuVisible(true);
  };

  // ADDED: Handler to close the edit menu
  const handleCloseEditMenu = () => {
    console.log('[LoopDetailScreen] handleCloseEditMenu triggered.');
    setIsEditMenuVisible(false);
  };

  // MODIFIED: Handler for saving changes from the edit menu
  const handleSaveEditMenu = (updatedData: { id: string; title?: string; color?: string; schedule?: string }) => {
    console.log('[LoopDetailScreen] handleSaveEditMenu triggered with data:', updatedData);
    if (!loop) return; 
    const { id: _, ...otherUpdates } = updatedData; 
    console.log('[LoopDetailScreen] Dispatching UPDATE_LOOP with payload:', { id: loop.id, ...otherUpdates });
    dispatch({ 
      type: 'UPDATE_LOOP', 
      payload: { 
        id: loop.id, // Use authoritative id from the screen context
        ...otherUpdates // Spread only the other properties
      } 
    });
    // REMOVED: setIsEditMenuVisible(false); 
    // The modal should not close on save; only on explicit close actions (swipe, backdrop, etc.)
  };

  // Log state values before rendering
  // console.log('[LoopDetailScreen] Render check:', { 
  //   loopId,
  //   loopExists: !!loop, 
  //   typographyExists: !!typography, // Check typography from themeStyles
  //   isEditMenuVisible 
  // });

  // Add a log to see the loop title just before rendering
  // console.log(`[LoopDetailScreen] Rendering with loop title: ${loop?.title}`);

  // Handler for the NEW PostEditMenu (from components/posts/)
  const handleOpenPostEditMenu = (post: Post) => {
    console.log('Opening NEW PostEditMenu for post:', post.id);
    setSelectedPostForNewModal(post);
    setIsPostEditMenuVisible(true);
  };

  // *** NEW: Handler for live caption updates from PostEditMenu ***
  const handlePostCaptionChange = (postId: string, newCaption: string) => {
    console.log(`[LoopDetailScreen] Updating caption for post ${postId}: "${newCaption.substring(0, 30)}..."`);
    setLoopPosts(currentPosts =>
      currentPosts.map(p =>
        p.id === postId ? { ...p, caption: newCaption } : p
      )
    );
  };

  // Define renderItem for the FlatList grid
  const renderGridItem = ({ item }: { item: Post }) => (
    <View style={styles.gridItemStyle}>
      <PostCardS
        post={item}
        variant="mini"
        onPress={() => handleOpenPostEditMenu(item)} // Use NEW handler
      />
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { 
        paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding, 
        paddingTop: spacing.lg,
        paddingBottom: spacing.xxl + spacing.md
      }]}
    >
      <Stack.Screen 
        options={{
          title: 'Loop Details',
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          headerBackTitle: 'Back'
        }} 
      />

      {/* Metadata Card with Shadow Wrapper */}
      <View style={[styles.shadowWrapper, { marginBottom: spacing.lg }]}>
        <View style={styles.metadataCard}>
          <LinearGradient
            colors={[(loop.color || colors.border) + '66', (loop.color || colors.border) + '14']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill} 
            pointerEvents="none" 
          />
          <Text style={[styles.loopTitle, { color: colors.text, marginBottom: spacing.sm }]}>
            {loop.title}
          </Text>
          <View style={styles.metadataRow}>
            <View style={styles.scheduleTextContainer}>
              <Text style={styles.metadataText} numberOfLines={1} ellipsizeMode="tail">
                {formatScheduleText(loop.schedule)}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Switch
              value={loop.isActive}
              onValueChange={handleToggleActive}
              trackColor={{ false: colors.border, true: loop.color || colors.accent }}
              thumbColor={Platform.OS === 'android' ? colors.background : ''}
              ios_backgroundColor={colors.border}
              style={styles.switch}
            />
            <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Conditional Rendering: Posts or Empty State */} 
      {postsForDisplay.length > 0 ? (
        <>
          {/* Featured Post ("Next Up") */} 
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: spacing.sm }}>Next Up</Text> 
          <View style={{ marginBottom: spacing.lg }}> 
            {/* Remove outer TouchableOpacity, pass onPress to PostCardS */}
            <PostCardS 
              post={featuredPost!} 
              variant="featured" 
              onPress={() => handleOpenPostEditMenu(featuredPost!)} // Pass onPress here
            /> 
          </View>

          {/* Grid Section */} 
          {gridPosts.length > 0 && (
            <>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: spacing.sm }}>In This Loop ({gridPosts.length})</Text> 
              {/* Replace manual grid mapping with FlatList */}
              <FlatList
                data={gridPosts}
                renderItem={renderGridItem} // Use a renderItem function
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false} // Disable inner scrolling
                columnWrapperStyle={{
                  justifyContent: 'space-between', // Space out columns
                }}
                // Ensure FlatList takes necessary height within ScrollView
                // (Usually automatic with scrollEnabled={false})
              />
            </>
          )}
        </>
      ) : (
        // Empty State when no posts exist at all 
        <View style={[styles.sectionPlaceholder, { backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' }]}> 
          <Text style={{ color: colors.text }}>No posts in this loop yet.</Text> 
        </View>
      )}

      {/* --- Add Test Button --- */}
      <TouchableOpacity 
        style={{ marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.primary, borderRadius: borderRadius.sm }} 
        onPress={() => setEditingPost(MOCK_POST_DATA[0])} // Use first mock post for testing
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Open Edit Menu Manually</Text>
      </TouchableOpacity>

      {/* --- Modals --- */}

      {/* Loop Edit Menu (Existing) */}
      {/* Always render Modal wrapper if isEditMenuVisible is true, allow LoopEditMenu to handle potentially null loop prop internally */}
      <LoopEditMenu
        isVisible={isEditMenuVisible}
        onClose={handleCloseEditMenu} 
        loop={loop} // Pass loop directly, LoopEditMenu should handle if it's initially null/undefined
        onSave={handleSaveEditMenu} 
        typography={typography}
      />

      {/* NEW Post Edit Menu (from components/posts/PostEditMenu.tsx) */}
      <NewPostEditMenu
        isVisible={isPostEditMenuVisible}
        post={selectedPostForNewModal}
        onClose={() => setIsPostEditMenuVisible(false)}
        onCaptionChange={handlePostCaptionChange}
      />

    </ScrollView>
  );
} 