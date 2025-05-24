import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

// Replace MOCK_POSTS_INITIAL with MOCK_POSTS and new data using require()
const MOCK_POSTS = [
  { id: '1', title: 'Cozy Kitten Corner', image: require('../assets/images/posts/post-1.jpg') },
  { id: '2', title: 'Abstract Mountain View', image: require('../assets/images/posts/post-2.jpg') },
  { id: '3', title: 'Local Image 3', image: require('../assets/images/posts/post-3.jpg') },
  { id: '4', title: 'Local Image 4', image: require('../assets/images/posts/post-4.jpg') },
  { id: '5', title: 'Local Image 5', image: require('../assets/images/posts/post-5.jpg') },
  { id: '6', title: 'Local Image 6', image: require('../assets/images/posts/post-6.jpg') },
  { id: '7', title: 'Local Image 7', image: require('../assets/images/posts/post-7.jpg') },
  { id: '8', title: 'Local Image 8', image: require('../assets/images/posts/post-8.jpg') },
  { id: '9', title: 'Local Image 9', image: require('../assets/images/posts/post-9.jpg') },
  { id: '10', title: 'Local Image 10', image: require('../assets/images/posts/post-10.jpg') },
  { id: '11', title: 'Local Image 11', image: require('../assets/images/posts/post-11.jpg') },
  { id: '12', title: 'Local Image 12', image: require('../assets/images/posts/post-12.jpg') },
  { id: '13', title: 'Local Image 13', image: require('../assets/images/posts/post-13.jpg') },
  { id: '14', title: 'Local Image 14', image: require('../assets/images/posts/post-14.jpg') },
  { id: '15', title: 'Local Image 15', image: require('../assets/images/posts/post-15.jpg') },
  { id: '16', title: 'Local Image 16', image: require('../assets/images/posts/post-16.jpg') },
  { id: '17', title: 'Local Image 17', image: require('../assets/images/posts/post-17.jpg') },
  { id: '18', title: 'Local Image 18', image: require('../assets/images/posts/post-18.jpg') },
  { id: '19', title: 'Local Image 19', image: require('../assets/images/posts/post-19.jpg') },
  { id: '20', title: 'Local Image 20', image: require('../assets/images/posts/post-20.jpg') },
];

// Update SourcePost interface for require() output (number)
interface SourcePost {
  id: string;
  title: string;
  image: number; // require() returns a number (resource ID)
}

// Update PostCardDisplayProps for require() output (number)
interface PostCardDisplayProps {
  id: string;
  title: string;
  image: number; // Image is now a number and mandatory
}

// Calculate card width and image height based on screen dimensions and padding
const SCREEN_PADDING = 16;
const CARD_MARGIN_BOTTOM = 16;
const cardWidth = screenWidth - SCREEN_PADDING * 2;
const imageHeight = cardWidth * (9 / 16); // For 16:9 aspect ratio
const CARD_TITLE_PADDING = 12;
const CARD_TITLE_FONT_SIZE = 18;
const approximateTitleHeight = CARD_TITLE_FONT_SIZE * 1.5 * 2 + CARD_TITLE_PADDING * 2;
const ESTIMATED_ITEM_HEIGHT = imageHeight + approximateTitleHeight + CARD_MARGIN_BOTTOM;

const transformSourcePosts = (sourcePosts: SourcePost[]): PostCardDisplayProps[] => {
  console.log('[TestGridScreen] Calculating imageHeight:', imageHeight); 
  return sourcePosts.map(sp => {
    console.log(`[TestGridScreen] transformSourcePosts - ID: ${sp.id}, Title: ${sp.title}, Image Resource ID: ${sp.image}`);
    return {
      id: sp.id,
      title: sp.title || 'Untitled Post', 
      image: sp.image, // Pass through the numeric image resource ID
    };
  });
};

const PostCard = ({ item }: { item: PostCardDisplayProps }) => {
  // Remove URI-specific state and logic (error, setError, hasValidURI)
  // The `error` state and `onError` prop for <Image> are typically for network images.
  // Local assets loaded with require() are part of the bundle; if missing, it's usually a build or bundling error.

  useEffect(() => {
    console.log(
      `[TestGridScreen] PostCard rendering - ID: ${item.id}, Title: ${
        item.title?.slice(0, 20)
      }..., Image Resource ID: ${item.image}` // Log resource ID
    );
    // Dependencies updated to reflect that item.image is now a number directly from require()
    // and error state is removed.
  }, [item.id, item.title, item.image]);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {/* Render Image directly using the numeric resource ID from require() */}
        {/* The fallback <Text> is removed as MOCK_POSTS ensures all items have an image */}
        {/* and PostCardDisplayProps.image is now a non-optional number. */}
        <Image source={item.image} style={styles.image} />
        </View>
      {/* Title container now also includes the drag handle */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>
        {/* Drag handle moved inside titleContainer and styled as per new requirement */}
        <View style={styles.dragHandleContainer}>
          <Ionicons name="reorder-three-outline" size={20} color="#999" />
      </View>
      </View>
    </View>
  );
};

export default function TestGridScreen() {
  // Update useState to use the new MOCK_POSTS
  const [posts, setPosts] = useState<PostCardDisplayProps[]>(transformSourcePosts(MOCK_POSTS));

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PostCardDisplayProps>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.cardWrapper, // Use a wrapper for the card itself to apply drag styles
            {
              opacity: isActive ? 0.95 : 1,
              transform: [{ scale: isActive ? 0.97 : 1 }],
            },
          ]}
        >
          <PostCard item={item} />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <DraggableFlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => setPosts(data)}
          ListHeaderComponent={<Text style={styles.headerText}>My Awesome Feed (Draggable)</Text>}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: SCREEN_PADDING,
    paddingBottom: SCREEN_PADDING * 2,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1E21',
    marginBottom: SCREEN_PADDING * 1.5,
  },
  cardWrapper: { // Style for the TouchableOpacity wrapper
    marginBottom: CARD_MARGIN_BOTTOM,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    // marginBottom: CARD_MARGIN_BOTTOM, // Moved to cardWrapper
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  image: {
    width: '100%',
    height: imageHeight,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#e0e0e0', // Light gray fallback background
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures Image corners are clipped if they don't match
  },
  fallbackText: {
    color: '#999', // A bit lighter than the previous fallback text
    fontSize: 16,
    fontStyle: 'italic', // Added italic style
  },
  titleContainer: {
    padding: CARD_TITLE_PADDING,
  },
  titleText: {
    fontSize: CARD_TITLE_FONT_SIZE,
    fontWeight: '600',
    color: '#1C1E21',
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});